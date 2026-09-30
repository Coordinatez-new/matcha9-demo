import {
  BackSide,
  BoxGeometry,
  CanvasTexture,
  Color,
  CubeUVReflectionMapping,
  DataUtils,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Texture,
  type Material,
  type WebGLRenderer,
} from "three";
import { random } from "./helpers";

/** The drink scene's studio: its reflections and the small textures it paints on canvases. */

/**
 * Reflections for the glass and glaze: a dim room with a tall softbox front left, a strip
 * light behind on the right and a panel overhead. The dark walls are what give clear glass its
 * edges on a pale background, the way a photographer uses black card.
 *
 * Filtering the room into an environment map (PMREM) takes the better part of a second on a
 * phone, so the page loads a baked copy instead (see loadStudioEnvironment); this runs only when
 * that file is missing, and when scripts/render-drink-stills.mjs bakes it.
 */
export function renderStudioEnvironment(renderer: WebGLRenderer, size = 128) {
  const room = new Scene();
  room.add(
    new Mesh(
      new BoxGeometry(80, 50, 80),
      new MeshBasicMaterial({ color: "#3a3731", side: BackSide }),
    ),
  );
  const floor = new Mesh(new PlaneGeometry(80, 80), new MeshBasicMaterial({ color: "#978b79" }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -24.5;
  room.add(floor);
  const panel = (w: number, h: number, at: [number, number, number], strength: number) => {
    const mesh = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({
        color: new Color(strength, strength * 0.97, strength * 0.92),
        side: DoubleSide,
      }),
    );
    mesh.position.set(...at);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  panel(16, 34, [-30, 6, 22], 4.2);
  panel(7, 30, [32, 4, -16], 2.4);
  panel(40, 14, [0, 24, 0], 1.3);
  panel(12, 26, [8, 2, 38], 0.8);
  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(room, 0.02, 0.1, 100, { size });
  pmrem.dispose();
  room.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.geometry.dispose();
      (obj.material as Material).dispose();
    }
  });
  return target;
}

/**
 * The studio's environment map as an 8-bit sRGB image, scaled so its brightest light is 1:
 * what scripts/render-drink-stills.mjs saves for the page to load.
 */
export function bakeStudioEnvironment(renderer: WebGLRenderer) {
  const target = renderStudioEnvironment(renderer);
  const { width, height } = target;
  const half = new Uint16Array(width * height * 4);
  renderer.readRenderTargetPixels(target, 0, 0, width, height, half);
  target.dispose();
  const values = Float32Array.from(half, (h) => DataUtils.fromHalfFloat(h));
  let scale = 0;
  values.forEach((value, i) => {
    if (i % 4 !== 3) scale = Math.max(scale, value);
  });
  const encode = (v: number) => {
    const x = Math.min(Math.max(v / scale, 0), 1);
    return Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055));
  };
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d")!;
  const data = g.createImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    data.data[i * 4] = encode(values[i * 4]!);
    data.data[i * 4 + 1] = encode(values[i * 4 + 1]!);
    data.data[i * 4 + 2] = encode(values[i * 4 + 2]!);
    data.data[i * 4 + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  return { image: canvas.toDataURL("image/png"), scale };
}

/**
 * The baked environment map, ready for the materials: decoded off the main thread and used as it
 * is, with no filtering to do. Its values run 0..1; materials multiply by the baked scale.
 */
export async function loadStudioEnvironment(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const bitmap = await createImageBitmap(await response.blob(), {
    premultiplyAlpha: "none",
    colorSpaceConversion: "none",
  });
  const texture = new Texture(bitmap);
  texture.mapping = CubeUVReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

/** A soft round shadow: under the coaster, and stretched out as the drink's own shadow. */
export function radialTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.38, "rgba(255,255,255,0.85)");
  grad.addColorStop(0.62, "rgba(255,255,255,0.25)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Fine foam bubbles for the crown's bump map. */
export function bubbleTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  const rand = random(5);
  for (let i = 0; i < 600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.6 + rand() ** 3 * 3.2;
    // Bubbles near an edge are drawn again on the far side, so the texture tiles seamlessly.
    const copies: [number, number][] = [[0, 0]];
    if (x < r) copies.push([size, 0]);
    if (x > size - r) copies.push([-size, 0]);
    if (y < r) copies.push([0, size]);
    if (y > size - r) copies.push([0, -size]);
    for (const [dx, dy] of copies) {
      const grad = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      grad.addColorStop(0, "rgba(255,255,255,0.5)");
      grad.addColorStop(0.7, "rgba(255,255,255,0.15)");
      grad.addColorStop(1, "rgba(0,0,0,0.25)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      g.fill();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(6, 2);
  return texture;
}
