import {
  BufferGeometry,
  Float32BufferAttribute,
  type Material,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { clamp01 } from "./timeline";

/** Geometry, maths and shader-patching helpers for the drink scene. */

export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Small deterministic PRNG, so every visit builds the same drink. */
export function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type ProfilePoint = {
  r: number;
  y: number;
  /** 0..1: how much of the flute pattern this ring carries. */
  rib?: number;
  /** For hard edges: take the normal from only the previous or the next segment. */
  side?: "prev" | "next";
};

/**
 * Spin a (radius, height) profile around the y axis, like LatheGeometry, but with analytic
 * normals (no seam) and, given a flute function, flutes on the rings that ask for them.
 */
export function revolve(
  profile: ProfilePoint[],
  segments: number,
  flute?: (phi: number) => [number, number],
) {
  const rows = profile.length;
  const cols = segments + 1;
  const position = new Float32Array(rows * cols * 3);
  const normal = new Float32Array(rows * cols * 3);
  const uv = new Float32Array(rows * cols * 2);

  const segmentNormal = (a: ProfilePoint, b: ProfilePoint): [number, number] | null => {
    const tr = b.r - a.r;
    const ty = b.y - a.y;
    const len = Math.hypot(tr, ty);
    return len < 1e-6 ? null : [ty / len, -tr / len];
  };
  const normals2d = profile.map((p, i) => {
    const prev = i > 0 ? segmentNormal(profile[i - 1]!, p) : null;
    const next = i < rows - 1 ? segmentNormal(p, profile[i + 1]!) : null;
    const use = p.side === "prev" ? [prev] : p.side === "next" ? [next] : [prev, next];
    let nr = 0;
    let ny = 0;
    for (const n of use) {
      if (n) {
        nr += n[0];
        ny += n[1];
      }
    }
    const len = Math.hypot(nr, ny) || 1;
    return [nr / len, ny / len] as const;
  });
  const arc = [0];
  for (let i = 1; i < rows; i++) {
    const a = profile[i - 1]!;
    const b = profile[i]!;
    arc.push(arc[i - 1]! + Math.hypot(b.r - a.r, b.y - a.y));
  }
  const total = arc[rows - 1] || 1;

  for (let i = 0; i < rows; i++) {
    const p = profile[i]!;
    const [nr, ny] = normals2d[i]!;
    for (let j = 0; j < cols; j++) {
      const phi = (j / segments) * Math.PI * 2;
      const s = Math.sin(phi);
      const c = Math.cos(phi);
      let r = p.r;
      let nt = 0;
      if (flute && p.rib) {
        const [d, dd] = flute(phi);
        r += p.rib * d;
        nt = r > 1e-4 ? (-p.rib * dd) / r : 0;
      }
      const nx = nr * s + nt * c;
      const nz = nr * c - nt * s;
      const len = Math.hypot(nx, ny, nz) || 1;
      const k = i * cols + j;
      position[k * 3] = r * s;
      position[k * 3 + 1] = p.y;
      position[k * 3 + 2] = r * c;
      normal[k * 3] = nx / len;
      normal[k * 3 + 1] = ny / len;
      normal[k * 3 + 2] = nz / len;
      uv[k * 2] = j / segments;
      uv[k * 2 + 1] = arc[i]! / total;
    }
  }

  const index: number[] = [];
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const d = a + cols;
      const c = d + 1;
      index.push(a, b, d, c, d, b);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setIndex(index);
  geometry.setAttribute("position", new Float32BufferAttribute(position, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normal, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  return geometry;
}

/** Average the normals of the duplicated first and last columns of a revolved mesh. */
export function weldSeam(geometry: BufferGeometry, rows: number, cols: number) {
  const n = geometry.attributes.normal!;
  for (let i = 0; i < rows; i++) {
    const a = i * cols;
    const b = a + cols - 1;
    const x = n.getX(a) + n.getX(b);
    const y = n.getY(a) + n.getY(b);
    const z = n.getZ(a) + n.getZ(b);
    const len = Math.hypot(x, y, z) || 1;
    n.setXYZ(a, x / len, y / len, z / len);
    n.setXYZ(b, x / len, y / len, z / len);
  }
  n.needsUpdate = true;
}

/** Value noise and fbm for the liquid, stone, ice and glaze shaders. */
export const noiseGlsl = /* glsl */ `
  float m9hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float m9noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(m9hash(i), m9hash(i + vec3(1, 0, 0)), f.x),
          mix(m9hash(i + vec3(0, 1, 0)), m9hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(m9hash(i + vec3(0, 0, 1)), m9hash(i + vec3(1, 0, 1)), f.x),
          mix(m9hash(i + vec3(0, 1, 1)), m9hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float m9fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * m9noise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }
`;

export type Uniforms = Record<string, { value: unknown }>;

/** Patch a built-in material's shaders, keeping its lighting, shadows and tone mapping. */
export function patch<M extends Material>(
  material: M,
  key: string,
  uniforms: Uniforms,
  edit: (shader: WebGLProgramParametersWithUniforms) => void,
) {
  material.customProgramCacheKey = () => key;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    edit(shader);
  };
  return material;
}
