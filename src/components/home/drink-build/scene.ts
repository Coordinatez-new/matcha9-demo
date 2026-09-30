import {
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Euler,
  Group,
  HalfFloatType,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SpotLight,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type Texture,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  lerp,
  noiseGlsl,
  patch,
  random,
  revolve,
  smooth,
  weldSeam,
  type ProfilePoint,
} from "./helpers";
import { imageSrc } from "@/lib/paths";
import {
  bakeStudioEnvironment,
  bubbleTexture,
  loadStudioEnvironment,
  radialTexture,
  renderStudioEnvironment,
} from "./studio";
import { bakedEnvironment } from "./stills";
import { clamp01, easeIn, easeInOut, easeOut, REVEAL_START, span, stepProgress } from "./timeline";

/**
 * The Pistachio Drip, built in 3D as the guest scrolls: ice drops into a fluted glass, matcha
 * pours from a katakuchi, milk follows, pistachio cream runs down the walls, foam crowns it and
 * roasted pistachio lands on top. Everything is a pure function of the scroll progress, so the
 * build plays backwards as smoothly as forwards.
 *
 * Units are centimetres. The drink group's local y is the height above the foot of the glass.
 * The background is the page's own cream. There are no real-time shadows: a soft decal under the
 * glass stretches as it fills, and the leaf shadows are an image on the page, so the scene stays
 * light enough for laptops and phones. The same scene renders the still frames the page shows
 * first (scripts/render-drink-stills.mjs).
 */

// ── The glass, from the real one at the bar: tall, tapered, fluted, with a thick base ───────
const GLASS_H = 15;
const R_FOOT = 3.45;
const R_RIM = 4.2;
const WALL = 0.2;
const BASE = 1.05;
const RIB_TOP = 12.3;
const RIBS = 44;
const RIB_DEPTH = 0.08;
const COASTER_H = 0.8;

const outerR = (y: number) => R_FOOT + (R_RIM - R_FOOT) * (y / GLASS_H);
const innerR = (y: number) => outerR(y) - WALL;

// ── The drink ─────────────────────────────────────────────────────────────────────────────
const MATCHA_TOP = 4.6; // the deep green layer at the bottom
const MILK_TOP = 13.6; // milk line, just under the foam
const DOME = 1.55; // how far the foam crowns above the rim
const LIP_X = 1.35; // where the katakuchi's lip hangs while it pours
const LIP_Y = 18.6;
const RING_R = 6.2;
const RING_Y = 6.6;

// The key light's direction across the floor, for the shadow decal: away from the light.
const SHADOW_DIR = new Vector3(44, 0, -62).normalize();

const palette = {
  page: new Color("#f5f0ea"),
  shadow: new Color("#4a3c2b"),
  coaster: new Color("#d6cdbd"),
  matchaDeep: new Color("#2b4011"),
  matchaMid: new Color("#4b6720"),
  matchaPour: new Color("#46651c"),
  milk: new Color("#eeebe2"),
  pistachio: new Color("#b5ae57"),
  foam: new Color("#f7f4ee"),
  nutGreen: new Color("#8c9c44"),
  nutPale: new Color("#b8b262"),
  nutSkin: new Color("#6b4540"),
  glaze: new Color("#2e3829"),
  glazeRim: new Color("#6a5741"),
  clay: new Color("#a88d6e"),
  ring: new Color("#9a917d"),
};

/** Flutes: rounded ridges with sharp valleys. Returns the radial offset and its slope. */
function flute(phi: number): [number, number] {
  const u = (phi / (Math.PI * 2)) * RIBS;
  const x = 2 * (u - Math.floor(u)) - 1;
  return [RIB_DEPTH * (1 - x * x), RIB_DEPTH * -2 * x * 2 * (RIBS / (Math.PI * 2))];
}

function glassProfile() {
  const pts: ProfilePoint[] = [];
  const add = (r: number, y: number, rib = 0) => pts.push({ r, y, rib });
  const ribWeight = (y: number) => smooth(0.5, 1.2, y) * (1 - smooth(RIB_TOP - 0.9, RIB_TOP, y));
  add(0, 0);
  add(R_FOOT - 0.55, 0);
  add(R_FOOT - 0.16, 0.035);
  add(R_FOOT - 0.03, 0.17);
  for (let y = 0.4; y < RIB_TOP + 0.2; y += 0.3) add(outerR(y), y, ribWeight(y));
  for (let y = RIB_TOP + 0.6; y < GLASS_H - 0.15; y += 0.7) add(outerR(y), y);
  const rim = outerR(GLASS_H);
  add(rim, GLASS_H - 0.12);
  add(rim - 0.025, GLASS_H - 0.03);
  add(rim - WALL / 2, GLASS_H);
  add(rim - WALL + 0.025, GLASS_H - 0.03);
  add(rim - WALL, GLASS_H - 0.12);
  for (let y = GLASS_H - 0.8; y > BASE + 0.5; y -= 1.6) add(innerR(y), y);
  add(innerR(BASE + 0.45), BASE + 0.45);
  add(innerR(BASE) - 0.12, BASE + 0.06);
  add(innerR(BASE) - 0.55, BASE);
  add(0, BASE - 0.12);
  return pts;
}

/** A closed unit cylinder (radius 1, height 0..1) whose vertex shader fits it into the glass. */
function unitColumn(capRings: number) {
  const pts: ProfilePoint[] = [
    { r: 0, y: 0 },
    { r: 1, y: 0, side: "prev" },
    { r: 1, y: 0, side: "next" },
    { r: 1, y: 0.5 },
    { r: 1, y: 1, side: "prev" },
    { r: 1, y: 1, side: "next" },
  ];
  for (let k = 1; k <= capRings; k++) pts.push({ r: 1 - k / capRings, y: 1 });
  return revolve(pts, 96);
}

/** Give the browser a turn between build steps, so building the scene never blocks input. */
function pause() {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (scheduler?.yield) return scheduler.yield();
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

// ── The scene ────────────────────────────────────────────────────────────────────────────

export type AnchorId = "finish" | "foam" | "pistachio" | "milk" | "matcha";

export type Anchors = Record<AnchorId, { x: number; y: number }>;

export type FrameInfo = {
  /** Canvas-pixel positions for the HTML labels. */
  anchors: Anchors;
};

export type Layout = {
  width: number;
  height: number;
  /** Where the glass should stand, in canvas pixels: its centre and the height it may fill. */
  slotX: number;
  slotY: number;
  slotHeight: number;
};

export type SceneOptions = {
  /** Device pixels per CSS pixel to draw at; lowered further if frames run slow. */
  pixelRatio: number;
  /** Resolution of the pass the glass refracts, as a fraction of the canvas. */
  transmissionScale: number;
  onFrame: (info: FrameInfo) => void;
  /** The GPU dropped the context, or frames stayed slow at the lowest resolution. */
  onFail: () => void;
};

export type DrinkScene = {
  /** The build's progress to draw, 0..1 (the page smooths the scroll). */
  setProgress: (p: number) => void;
  setLayout: (layout: Layout) => void;
  setPointer: (x: number, y: number) => void;
  setActive: (active: boolean) => void;
  /** Draw the build at p right now and return the frame as a PNG data URL, with its anchors. */
  snapshot: (p: number, pixelRatio: number) => { image: string; anchors: Anchors };
  /** Render the studio's environment map afresh, as a PNG data URL and its scale. */
  bakeEnvironment: () => { image: string; scale: number };
  destroy: () => void;
};

/**
 * Build the scene in small steps, compile its shaders off the main thread where the browser
 * can, and resolve once the first frame has been drawn. Rejects if WebGL can't be used.
 */
export async function createDrinkScene(
  canvas: HTMLCanvasElement,
  context: WebGL2RenderingContext,
  options: SceneOptions,
): Promise<DrinkScene> {
  const { onFrame, onFail } = options;
  const renderer = new WebGLRenderer({ canvas, context });
  let pixelRatio = options.pixelRatio;
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  // Shader info logs (harmless precision notes from Windows' D3D compiler) only in development.
  renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
  renderer.setClearColor(palette.page);
  renderer.transmissionResolutionScale = options.transmissionScale;

  const scene = new Scene();
  // The baked environment map; filtering one here is the slow path, for when it's missing.
  let environment: Texture;
  let envScale = bakedEnvironment.scale;
  try {
    environment = await loadStudioEnvironment(imageSrc(bakedEnvironment.src));
  } catch {
    environment = renderStudioEnvironment(renderer).texture;
    envScale = 1;
  }
  const time = { value: 0 };
  const disposables: { dispose: () => void }[] = [environment];
  const lit = <M extends MeshStandardMaterial>(material: M, intensity: number) => {
    material.envMap = environment;
    material.envMapIntensity = intensity * envScale;
    return material;
  };
  await pause();

  // ── Studio: a stone coaster on the page, with soft shadows under it ──────────────────────
  const soft = radialTexture();
  disposables.push(soft);
  const contact = new Mesh(
    new PlaneGeometry(16, 16),
    new MeshBasicMaterial({
      map: soft,
      color: palette.shadow,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.02;
  scene.add(contact);

  // The drink's own shadow, cast away from the key light: faint for the empty glass, longer and
  // deeper as it fills.
  const castMaterial = new MeshBasicMaterial({
    map: soft,
    color: palette.shadow,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const cast = new Mesh(new PlaneGeometry(1, 1), castMaterial);
  cast.rotation.set(-Math.PI / 2, 0, Math.atan2(-SHADOW_DIR.x, -SHADOW_DIR.z));
  cast.position.y = 0.015;
  scene.add(cast);

  const coaster = new Mesh(
    revolve(
      [
        { r: 0, y: 0 },
        { r: 6.1, y: 0 },
        { r: 6.35, y: 0.12 },
        { r: 6.42, y: 0.4 },
        { r: 6.35, y: COASTER_H - 0.1 },
        { r: 6.1, y: COASTER_H },
        { r: 0, y: COASTER_H },
      ],
      128,
    ),
    patch(
      lit(new MeshStandardMaterial({ color: palette.coaster, roughness: 0.88 }), 0.7),
      "m9-stone",
      {},
      (shader) => {
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vStone;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvStone = position;");
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", `#include <common>\nvarying vec3 vStone;\n${noiseGlsl}`)
          .replace(
            "#include <color_fragment>",
            `#include <color_fragment>
            float grain = m9fbm(vStone * 1.7);
            float fleck = step(0.83, m9noise(vStone * 9.0));
            diffuseColor.rgb *= 0.92 + 0.12 * grain - 0.08 * fleck;`,
          );
      },
    ),
  );
  scene.add(coaster);

  // Light: a warm key high on the left, a sky fill and a cool rim from behind that picks out
  // the edges of the glass.
  const key = new SpotLight(new Color("#fff3e2"), 3.4, 0, 0.42, 0.9, 0);
  key.position.set(-44, 80, 62);
  key.target.position.set(0, 7, -14);
  scene.add(key, key.target);
  scene.add(new HemisphereLight(new Color("#fff8ee"), new Color("#cfc3b0"), 0.55));
  const rim = new DirectionalLight(new Color("#eef2ff"), 1.1);
  rim.position.set(30, 22, -40);
  scene.add(rim);
  await pause();

  // ── The drink ──────────────────────────────────────────────────────────────────────────
  const drink = new Group();
  drink.position.y = COASTER_H;
  scene.add(drink);

  const glass = new Mesh(
    revolve(glassProfile(), RIBS * 6, flute),
    lit(
      new MeshPhysicalMaterial({
        color: new Color("#ffffff"),
        metalness: 0,
        roughness: 0.03,
        transmission: 1,
        thickness: 0.5,
        ior: 1.5,
        attenuationColor: new Color("#e6eee0"),
        attenuationDistance: 12,
        specularIntensity: 1,
        side: DoubleSide,
      }),
      1.2,
    ),
  );
  glass.renderOrder = 2;
  drink.add(glass);
  await pause();

  // Liquid: one column that the vertex shader fits to the glass between the base and the
  // current level. Colour comes from the layers: matcha settled at the bottom, milk above,
  // marbling into each other once the milk goes in.
  const liquidUniforms = {
    uBase: { value: BASE - 0.05 },
    uLevel: { value: BASE },
    uR0: { value: R_FOOT - WALL - 0.04 },
    uTaper: { value: (R_RIM - R_FOOT) / GLASS_H },
    uRipple: { value: 0 },
    uRippleAt: { value: [0, 0] as [number, number] },
    uMatchaTop: { value: 0 },
    uMarble: { value: 0 },
    uTime: time,
    uMatchaDeep: { value: palette.matchaDeep },
    uMatchaMid: { value: palette.matchaMid },
    uMilk: { value: palette.milk },
  };
  const liquid = new Mesh(
    unitColumn(28),
    patch(
      lit(new MeshStandardMaterial({ roughness: 0.34 }), 0.55),
      "m9-liquid",
      liquidUniforms,
      (shader) => {
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            /* glsl */ `#include <common>
            uniform float uBase;
            uniform float uLevel;
            uniform float uR0;
            uniform float uTaper;
            uniform float uRipple;
            uniform vec2 uRippleAt;
            uniform float uTime;
            varying vec3 vDrink;`,
          )
          .replace(
            "#include <beginnormal_vertex>",
            /* glsl */ `
            vec3 objectNormal = vec3(normal);
            float m9h = mix(uBase, uLevel, position.y);
            float m9r = uR0 + uTaper * m9h;
            vec3 m9Pos = vec3(position.x * m9r, m9h, position.z * m9r);
            if (position.y > 0.999 && normal.y > 0.5) {
              vec2 q = m9Pos.xz - uRippleAt;
              float d = length(q);
              float w = exp(-d * 0.55);
              float ph = d * 4.2 - uTime * 9.0;
              m9Pos.y += uRipple * sin(ph) * w + 0.07 * smoothstep(0.8, 1.0, length(position.xz));
              float slope = uRipple * w * (cos(ph) * 4.2 - sin(ph) * 0.55);
              vec2 g = d > 1e-4 ? q / d * slope : vec2(0.0);
              objectNormal = normalize(vec3(-g.x, 1.0, -g.y));
            }`,
          )
          .replace("#include <begin_vertex>", "vec3 transformed = m9Pos;\nvDrink = m9Pos;");
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            /* glsl */ `#include <common>
            uniform float uMatchaTop;
            uniform float uMarble;
            uniform float uTime;
            uniform vec3 uMatchaDeep;
            uniform vec3 uMatchaMid;
            uniform vec3 uMilk;
            varying vec3 vDrink;
            ${noiseGlsl}
            vec3 m9DrinkColor(vec3 p) {
              float n = m9fbm(p * vec3(0.45, 0.24, 0.45) + vec3(0.0, -uTime * 0.02, 0.0));
              float boundary = uMatchaTop + (n - 0.5) * 2.6 * uMarble;
              float soft = 0.18 + uMarble * 0.3;
              float t = smoothstep(boundary - soft, boundary + soft, p.y);
              vec3 matcha = mix(uMatchaDeep, uMatchaMid, smoothstep(uMatchaTop - 3.4, uMatchaTop + 0.3, p.y));
              vec3 col = mix(matcha, uMilk, t);
              // Veins of matcha drawn up into the milk, as on the real drink.
              float v = m9fbm(p * vec3(0.8, 0.13, 0.8) + 11.0);
              float reach = 1.0 - smoothstep(boundary, boundary + 7.5 * uMarble + 0.01, p.y);
              float veins = smoothstep(0.5, 0.6, v) * reach * uMarble;
              col = mix(col, mix(uMatchaMid, uMilk, 0.4), veins * t);
              return col;
            }`,
          )
          .replace(
            "#include <color_fragment>",
            "#include <color_fragment>\ndiffuseColor.rgb = m9DrinkColor(vDrink);",
          );
      },
    ),
  );
  drink.add(liquid);

  // Pistachio cream on the inside of the glass: a ring at the rim and thin drips running down.
  const dripUniforms = { uDrip: { value: 0 }, uBand: { value: 0 } };
  const dripShell = new Mesh(
    revolve(
      Array.from({ length: 24 }, (_, i) => {
        const y = lerp(2.2, GLASS_H - 0.1, i / 23);
        return { r: innerR(y) - 0.012, y };
      }),
      256,
    ),
    patch(
      lit(
        new MeshStandardMaterial({
          color: palette.pistachio,
          roughness: 0.3,
          alphaTest: 0.5,
          alphaToCoverage: true,
        }),
        0.8,
      ),
      "m9-drips",
      dripUniforms,
      (shader) => {
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vShell;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvShell = position;");
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            /* glsl */ `#include <common>
            uniform float uDrip;
            uniform float uBand;
            varying vec3 vShell;
            ${noiseGlsl}
            float m9Drips(vec3 p, out float body) {
              float n = 38.0;
              float u = (atan(p.x, p.z) / 6.2831853 + 0.5) * n;
              float cell = floor(u);
              float h1 = m9hash(vec3(cell, 1.0, 3.0));
              float h2 = m9hash(vec3(cell, 7.0, 1.0));
              float h3 = m9hash(vec3(cell, 4.0, 9.0));
              float top = ${(GLASS_H - 0.55).toFixed(2)};
              float grow = clamp((uDrip - h3 * 0.45) / 0.55, 0.0, 1.0);
              float len = mix(1.2, 10.5, h1 * h1 * h1) * grow * step(0.18, h2);
              float tip = top - len;
              float cellWidth = 6.2831853 * length(p.xz) / n;
              float x = (fract(u) - 0.5 + (h2 - 0.5) * 0.5) * cellWidth + sin(p.y * 0.8 + h1 * 6.0) * 0.06;
              float w = mix(0.05, 0.15, h2 * h2) * (1.0 + 0.7 * smoothstep(tip + 0.5, tip, p.y));
              float d = length(vec2(x, p.y - clamp(p.y, tip, top))) - w;
              float drip = len > 0.01 ? smoothstep(0.02, -0.02, d) : 0.0;
              float edge = top - 0.55 + (m9fbm(vec3(p.xz * 1.1, 2.0)) - 0.5) * 0.7;
              float band = smoothstep(edge, edge + 0.06, p.y) * step(0.5, uBand);
              body = clamp(-d / max(w, 0.01), 0.0, 1.0);
              return max(drip, band * smoothstep(0.0, 0.2, uBand));
            }`,
          )
          .replace(
            "#include <alphatest_fragment>",
            /* glsl */ `float m9Body;
            float m9Mask = m9Drips(vShell, m9Body);
            diffuseColor.a = m9Mask;
            diffuseColor.rgb *= 0.82 + 0.18 * m9Body;
            #include <alphatest_fragment>`,
          );
      },
    ),
  );
  dripShell.visible = false;
  drink.add(dripShell);
  await pause();

  // Ice: five cubes that fall in one after another and stack up.
  const iceGeometry = new RoundedBoxGeometry(2.25, 2.15, 2.25, 4, 0.42);
  {
    const pos = iceGeometry.attributes.position!;
    const rand = random(3);
    const jitter = new Map<string, [number, number, number]>();
    for (let i = 0; i < pos.count; i++) {
      const k = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
      if (!jitter.has(k)) jitter.set(k, [rand() - 0.5, rand() - 0.5, rand() - 0.5]);
      const [a, b, c] = jitter.get(k)!;
      pos.setXYZ(i, pos.getX(i) + a * 0.06, pos.getY(i) + b * 0.06, pos.getZ(i) + c * 0.06);
    }
  }
  // Ice is drawn opaque so the glass can refract it (the glass only sees opaque things through
  // its walls). Its body is the backdrop as seen through clear ice, cooler and darker at the
  // edges; the highlights come from the studio's reflections.
  const iceMaterial = patch(
    lit(new MeshStandardMaterial({ color: new Color("#000000"), roughness: 0.05 }), 1.6),
    "m9-ice",
    { uBackdrop: { value: palette.page }, uIce: { value: new Color("#c4d4d8") } },
    (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vIce;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvIce = position;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>\nuniform vec3 uBackdrop;\nuniform vec3 uIce;\nvarying vec3 vIce;\n${noiseGlsl}`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          /* glsl */ `#include <emissivemap_fragment>
          float facing = abs(dot(normalize(vNormal), normalize(vViewPosition)));
          float edge = pow(1.0 - facing, 1.5);
          float cloud = m9fbm(vIce * 1.4 + 3.0);
          vec3 body = mix(uBackdrop * 0.95, uIce, 0.12 + 0.6 * edge);
          totalEmissiveRadiance = body * (0.95 + 0.1 * cloud);`,
        );
    },
  );
  const iceRest: { at: [number, number, number]; rot: [number, number, number] }[] = [
    { at: [-0.95, BASE + 1.2, 0.35], rot: [0.08, 0.5, 0.04] },
    { at: [1.0, BASE + 1.25, -0.4], rot: [-0.06, -0.3, 0.1] },
    { at: [0.15, BASE + 3.35, 0.45], rot: [0.32, 0.9, 0.2] },
    { at: [-0.75, BASE + 5.4, -0.45], rot: [-0.2, 0.2, 0.36] },
    { at: [0.8, BASE + 7.25, 0.25], rot: [0.26, -0.6, -0.18] },
  ];
  const ice = iceRest.map(() => {
    const cube = new Mesh(iceGeometry, iceMaterial);
    cube.renderOrder = 1;
    cube.visible = false;
    drink.add(cube);
    return cube;
  });

  // Streams: matcha from the katakuchi, then milk and foam from above.
  const makeStream = (color: Color, radius: number, roughness: number) => {
    const uniforms = {
      uTop: { value: 30 },
      uBottom: { value: 30 },
      uSource: { value: 30 },
      uRadius: { value: radius },
      uAt: { value: [0, 0] as [number, number] },
      uWobble: { value: 0.016 },
      uTime: time,
    };
    const geometry = new CylinderGeometry(1, 1, 1, 24, 64);
    geometry.translate(0, 0.5, 0);
    const mesh = new Mesh(
      geometry,
      patch(
        lit(new MeshStandardMaterial({ color, roughness }), 0.8),
        "m9-stream",
        uniforms,
        (shader) => {
          shader.vertexShader = shader.vertexShader
            .replace(
              "#include <common>",
              /* glsl */ `#include <common>
              uniform float uTop;
              uniform float uBottom;
              uniform float uSource;
              uniform float uRadius;
              uniform vec2 uAt;
              uniform float uWobble;
              uniform float uTime;`,
            )
            .replace(
              "#include <begin_vertex>",
              /* glsl */ `
              float s = position.y;
              float y = mix(uBottom, uTop, s);
              float fallen = max(uSource - y, 0.0);
              float len = max(uTop - uBottom, 0.001);
              float r = uRadius * inversesqrt(1.0 + fallen * 0.16);
              r *= sqrt(clamp(s * len / (uRadius * 1.4), 0.0, 1.0)) * sqrt(clamp((1.0 - s) * len / (uRadius * 1.4), 0.0, 1.0));
              vec2 sway = vec2(sin(y * 0.9 + uTime * 5.0), cos(y * 0.7 + uTime * 4.3)) * uWobble * min(fallen, 6.0);
              vec3 transformed = vec3(uAt.x + position.x * r + sway.x, y, uAt.y + position.z * r + sway.y);`,
            );
        },
      ),
    );
    mesh.visible = false;
    mesh.frustumCulled = false;
    drink.add(mesh);
    return { mesh, uniforms };
  };
  const matchaStream = makeStream(palette.matchaPour, 0.3, 0.2);
  const milkStream = makeStream(palette.milk, 0.34, 0.22);
  const foamStream = makeStream(palette.foam, 0.6, 0.8);
  await pause();

  // Foam: fills the top of the glass and crowns just above the rim.
  const bubbles = bubbleTexture();
  disposables.push(bubbles);
  const foamBase = MILK_TOP - 0.25;
  const foam = new Mesh(
    revolve(
      [
        { r: 0, y: 0 },
        { r: innerR(foamBase) - 0.04, y: 0, side: "prev" },
        { r: innerR(foamBase) - 0.04, y: 0, side: "next" },
        { r: innerR(GLASS_H) - 0.03, y: GLASS_H - foamBase },
        { r: innerR(GLASS_H) - 0.12, y: GLASS_H - foamBase + 0.32 },
        { r: 3.45, y: GLASS_H - foamBase + 0.78 },
        { r: 2.75, y: GLASS_H - foamBase + 1.12 },
        { r: 1.75, y: GLASS_H - foamBase + 1.38 },
        { r: 0.8, y: GLASS_H - foamBase + DOME - 0.03 },
        { r: 0, y: GLASS_H - foamBase + DOME },
      ],
      128,
    ),
    lit(
      new MeshStandardMaterial({
        color: palette.foam,
        roughness: 0.92,
        bumpMap: bubbles,
        bumpScale: 2.2,
      }),
      0.9,
    ),
  );
  foam.position.y = foamBase;
  foam.visible = false;
  drink.add(foam);
  const foamTopAt = (r: number) => {
    // The crown's height at radius r, from the profile above.
    const pts: [number, number][] = [
      [0, DOME],
      [0.8, DOME - 0.03],
      [1.75, 1.38],
      [2.75, 1.12],
      [3.45, 0.78],
    ];
    for (let i = 1; i < pts.length; i++) {
      const [r0, y0] = pts[i - 1]!;
      const [r1, y1] = pts[i]!;
      if (r <= r1) return GLASS_H + lerp(y0, y1, (r - r0) / (r1 - r0));
    }
    return GLASS_H + 0.78;
  };

  // Roasted pistachio: crushed pieces that land on the foam, a few of them skin-on.
  const nutGeometry = new IcosahedronGeometry(0.3, 1);
  {
    const pos = nutGeometry.attributes.position!;
    const rand = random(11);
    const moved = new Map<string, number>();
    for (let i = 0; i < pos.count; i++) {
      const k = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
      if (!moved.has(k)) moved.set(k, 0.72 + rand() * 0.5);
      const s = moved.get(k)!;
      pos.setXYZ(i, pos.getX(i) * s * 1.15, pos.getY(i) * s * 0.7, pos.getZ(i) * s);
    }
    nutGeometry.computeVertexNormals();
  }
  const nutMaterial = lit(new MeshStandardMaterial({ roughness: 0.66, flatShading: true }), 0.6);
  const NUTS = 17;
  const nuts = new InstancedMesh(nutGeometry, nutMaterial, NUTS);
  const nutPlan = (() => {
    const rand = random(21);
    return Array.from({ length: NUTS }, (_, i) => {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 2.1;
      const skin = rand() < 0.3;
      const color = skin
        ? palette.nutSkin.clone().lerp(palette.nutGreen, 0.2)
        : palette.nutGreen.clone().lerp(palette.nutPale, rand() * 0.7);
      nuts.setColorAt(i, color);
      return {
        rest: new Vector3(Math.sin(a) * r, foamTopAt(r) + 0.1, Math.cos(a) * r),
        rot: new Euler(rand() * 3, rand() * 3, rand() * 3),
        spin: new Vector3(rand() * 9 - 4.5, rand() * 9 - 4.5, rand() * 9 - 4.5),
        scale: 0.8 + rand() * 0.55,
        delay: (i / NUTS) * 0.62 + rand() * 0.08,
        drift: new Vector3(rand() - 0.5, 0, rand() - 0.5).multiplyScalar(2.4),
      };
    });
  })();
  nuts.visible = false;
  drink.add(nuts);
  await pause();

  // The katakuchi: a lipped pouring bowl in a deep moss glaze, tipping in from above.
  const bowl = new Group();
  {
    const profile: ProfilePoint[] = [
      { r: 0, y: 0.32 },
      { r: 2.35, y: 0.32 },
      { r: 2.45, y: 0.05 },
      { r: 2.75, y: 0 },
      { r: 2.9, y: 0.45 },
      { r: 3.7, y: 1.15 },
      { r: 4.45, y: 2.3 },
      { r: 4.92, y: 3.7 },
      { r: 5.05, y: 5.05 },
      { r: 4.98, y: 5.3 },
      { r: 4.8, y: 5.32 },
      { r: 4.68, y: 5.05 },
      { r: 4.5, y: 3.65 },
      { r: 4.0, y: 2.35 },
      { r: 3.15, y: 1.45 },
      { r: 1.7, y: 0.98 },
      { r: 0, y: 0.9 },
    ];
    const geometry = revolve(profile, 160);
    // Pull a pouring lip out of the rim.
    const pos = geometry.attributes.position!;
    const spout = -Math.PI / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      if (y < 3.4) continue;
      const phi = Math.atan2(x, z);
      const dphi = Math.atan2(Math.sin(phi - spout), Math.cos(phi - spout));
      if (Math.abs(dphi) > 0.62) continue;
      const k = (1 - (dphi / 0.62) ** 2) ** 2 * ((y - 3.4) / 1.9) ** 2;
      const r = Math.hypot(x, z) + 1.25 * k;
      pos.setXYZ(i, Math.sin(phi) * r, y + 0.28 * k, Math.cos(phi) * r);
    }
    geometry.computeVertexNormals();
    weldSeam(geometry, profile.length, 161);
    const mesh = new Mesh(
      geometry,
      patch(
        lit(new MeshStandardMaterial({ color: palette.glaze, roughness: 0.24 }), 1.2),
        "m9-glaze",
        { uClay: { value: palette.clay }, uRim: { value: palette.glazeRim } },
        (shader) => {
          shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nvarying vec3 vBowl;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvBowl = position;");
          shader.fragmentShader = shader.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>\nuniform vec3 uClay;\nuniform vec3 uRim;\nvarying vec3 vBowl;\n${noiseGlsl}`,
            )
            .replace(
              "#include <color_fragment>",
              /* glsl */ `#include <color_fragment>
              float glazed = smoothstep(0.42, 0.62, vBowl.y);
              float rimTone = smoothstep(4.85, 5.3, vBowl.y);
              diffuseColor.rgb = mix(uClay, diffuseColor.rgb, glazed);
              diffuseColor.rgb = mix(diffuseColor.rgb, uRim, rimTone * 0.75);
              diffuseColor.rgb *= 0.9 + 0.2 * m9noise(vBowl * 5.0);
              diffuseColor.rgb *= 1.0 - 0.35 * step(0.86, m9noise(vBowl * 13.0)) * glazed;`,
            )
            .replace(
              "#include <roughnessmap_fragment>",
              "#include <roughnessmap_fragment>\nroughnessFactor = mix(0.92, roughnessFactor, smoothstep(0.42, 0.62, vBowl.y));",
            );
        },
      ),
    );
    bowl.add(mesh);
  }
  bowl.scale.setScalar(0.82);
  bowl.visible = false;
  drink.add(bowl);
  // The lip, in the bowl's own space: where the matcha leaves it.
  const lipLocal = new Vector3(-5.05 - 1.2, 5.55, 0).multiplyScalar(0.82);

  // The reveal: a fine ring around the glass with a few pieces of pistachio riding it.
  const ringUniforms = { uArc: { value: 0 } };
  const ring = new Mesh(
    new TorusGeometry(RING_R, 0.02, 6, 320),
    patch(new MeshBasicMaterial({ color: palette.ring }), "m9-ring", ringUniforms, (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vAngle;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvAngle = atan(position.y, position.x);",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uArc;\nvarying float vAngle;",
        )
        .replace(
          "#include <clipping_planes_fragment>",
          "#include <clipping_planes_fragment>\nif (fract((vAngle + 1.9) / 6.2831853) > uArc) discard;",
        );
    }),
  );
  const ringTilt = new Group();
  ringTilt.position.y = RING_Y;
  ringTilt.rotation.set(Math.PI / 2 - 0.2, 0, 0.08);
  ringTilt.add(ring);
  ringTilt.visible = false;
  drink.add(ringTilt);
  const RIDERS = 6;
  const riders = new InstancedMesh(nutGeometry, nutMaterial, RIDERS);
  for (let i = 0; i < RIDERS; i++) {
    riders.setColorAt(i, i % 3 === 1 ? palette.nutSkin : palette.nutGreen);
  }
  riders.visible = false;
  ringTilt.add(riders);

  // ── Camera ─────────────────────────────────────────────────────────────────────────────
  const camera = new PerspectiveCamera(20, 1, 5, 800);
  const layout: Layout = { width: 1, height: 1, slotX: 0.5, slotY: 0.5, slotHeight: 1 };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

  // ── State ──────────────────────────────────────────────────────────────────────────────
  let shown = 0;
  let active = true;
  let frame = 0;
  let last = performance.now();
  let slowFrames = 0;
  let destroyed = false;
  let failed = false;
  let ready = false;
  let running = false; // whether the previous frame came from the loop, for timing
  const m = new Matrix4();
  const q = new Quaternion();
  const e = new Euler();
  const v = new Vector3();
  const sc = new Vector3();
  const anchors = {} as Anchors;

  function apply(p: number, t: number) {
    // Ice ─────────────────────────────────────────────────────────────
    const pIce = stepProgress(p, "ice");
    ice.forEach((cube, i) => {
      const rest = iceRest[i]!;
      const local = span(pIce, i * 0.15, i * 0.15 + 0.34);
      cube.visible = local > 0;
      if (!cube.visible) return;
      const fall = clamp01(local / 0.72);
      const settle = clamp01((local - 0.72) / 0.28);
      const startY = 27 + i * 1.5;
      const y =
        lerp(startY, rest.at[1], easeIn(fall)) + Math.sin(settle * Math.PI) * 0.45 * (1 - settle);
      const drift = 1 - easeOut(fall);
      cube.position.set(rest.at[0] + drift * (i % 2 ? -0.6 : 0.6), y, rest.at[2] + drift * 0.3);
      const spin = (1 - easeOut(clamp01(local))) * (2.2 + i * 0.4);
      cube.rotation.set(rest.rot[0] + spin, rest.rot[1] + spin * 0.7, rest.rot[2] - spin * 0.4);
    });

    // Matcha from the katakuchi ─────────────────────────────────────────
    const pM = stepProgress(p, "matcha");
    const enter = easeInOut(span(pM, 0, 0.24));
    const leave = easeInOut(span(pM, 0.86, 1));
    const tilt = easeInOut(span(pM, 0.14, 0.34)) * (1 - easeInOut(span(pM, 0.8, 0.94)));
    bowl.visible = enter > 0 && leave < 1;
    if (bowl.visible) {
      // Tip it towards the glass, turned a little away from the camera so its shape reads.
      bowl.rotation.set(-0.32, 0.22, 0.1 + tilt * 1.0);
      // Keep the lip over the glass while the bowl tips, so the stream falls straight in.
      v.copy(lipLocal).applyEuler(bowl.rotation);
      const away = 1 - enter + leave;
      bowl.position.set(LIP_X - v.x + away * 16, LIP_Y - v.y + away * 9, -v.z);
    }
    const matchaHead = span(pM, 0.3, 0.4);
    const matchaTail = span(pM, 0.76, 0.86);
    const matchaFill = easeInOut(span(pM, 0.36, 0.84));
    const matchaLevel = lerp(BASE, MATCHA_TOP, matchaFill);

    // Milk ──────────────────────────────────────────────────────────────
    const pMilk = stepProgress(p, "milk");
    const milkFill = easeInOut(span(pMilk, 0.08, 0.88));
    const level = lerp(matchaLevel, MILK_TOP, milkFill);
    liquidUniforms.uLevel.value = level;
    liquidUniforms.uMatchaTop.value = matchaLevel;
    liquidUniforms.uMarble.value = easeOut(span(p, 0.38, 0.62));
    liquid.visible = level > BASE + 0.02;

    const setStream = (
      stream: ReturnType<typeof makeStream>,
      head: number,
      tail: number,
      source: number,
      at: [number, number],
      surface: number,
    ) => {
      const on = head > 0 && tail < 1;
      stream.mesh.visible = on;
      if (!on) return;
      stream.uniforms.uSource.value = source;
      stream.uniforms.uTop.value = lerp(source, surface, easeIn(tail));
      stream.uniforms.uBottom.value = lerp(source, surface - 0.4, easeIn(head));
      stream.uniforms.uAt.value = at;
    };
    const milkHead = span(pMilk, 0, 0.1);
    const milkTail = span(pMilk, 0.84, 0.96);
    setStream(matchaStream, matchaHead, matchaTail, LIP_Y, [LIP_X, 0], matchaLevel);
    setStream(milkStream, milkHead, milkTail, 34, [-0.55, 0.2], level);

    // Ripples where a stream meets the surface.
    const pouringMatcha = matchaHead >= 1 && matchaTail < 1;
    const pouringMilk = milkHead >= 1 && milkTail < 1;
    liquidUniforms.uRipple.value = pouringMatcha || pouringMilk ? 0.06 : 0;
    liquidUniforms.uRippleAt.value = pouringMatcha ? [LIP_X, 0] : [-0.55, 0.2];

    // Pistachio cream ────────────────────────────────────────────────────
    const pP = stepProgress(p, "pistachio");
    dripUniforms.uBand.value = easeOut(span(pP, 0, 0.35));
    dripUniforms.uDrip.value = easeInOut(span(pP, 0.12, 1));
    dripShell.visible = pP > 0;

    // Foam ────────────────────────────────────────────────────────────────
    const pF = stepProgress(p, "foam");
    const grow = easeInOut(span(pF, 0.08, 0.9));
    foam.visible = grow > 0;
    foam.scale.set(1, Math.max(grow, 0.02), 1);
    setStream(
      foamStream,
      span(pF, 0, 0.1),
      span(pF, 0.8, 0.94),
      36,
      [0, 0],
      lerp(foamBase, GLASS_H + DOME, grow),
    );

    // The drink's shadow grows with what's in the glass.
    const filled = clamp01((level - BASE) / (MILK_TOP - BASE));
    const height = level - BASE + grow * DOME * 1.5;
    const length = 4 + height * 0.95;
    castMaterial.opacity = 0.08 + 0.34 * filled + 0.04 * grow;
    cast.scale.set(9, length, 1);
    cast.position.set(SHADOW_DIR.x * (length / 2 - 1), 0.015, SHADOW_DIR.z * (length / 2 - 1));

    // Roasted pistachio ────────────────────────────────────────────────────
    const pN = stepProgress(p, "finish");
    nuts.visible = pN > 0;
    nutPlan.forEach((nut, i) => {
      const local = span(pN, nut.delay, nut.delay + 0.3);
      if (local <= 0) {
        m.makeScale(0, 0, 0);
        nuts.setMatrixAt(i, m);
        return;
      }
      const fall = clamp01(local / 0.8);
      const settle = clamp01((local - 0.8) / 0.2);
      const drift = 1 - easeOut(fall);
      v.set(
        nut.rest.x + nut.drift.x * drift,
        lerp(nut.rest.y + 14, nut.rest.y, easeIn(fall)) +
          Math.sin(settle * Math.PI) * 0.18 * (1 - settle),
        nut.rest.z + nut.drift.z * drift,
      );
      const tumble = 1 - easeOut(fall);
      e.set(
        nut.rot.x + nut.spin.x * tumble,
        nut.rot.y + nut.spin.y * tumble,
        nut.rot.z + nut.spin.z * tumble,
      );
      q.setFromEuler(e);
      sc.setScalar(nut.scale);
      m.compose(v, q, sc);
      nuts.setMatrixAt(i, m);
    });
    nuts.instanceMatrix.needsUpdate = true;

    // Reveal ──────────────────────────────────────────────────────────────
    const pR = span(p, REVEAL_START, 1);
    ringUniforms.uArc.value = easeInOut(span(pR, 0.05, 0.6));
    ringTilt.visible = pR > 0.05;
    riders.visible = pR > 0.2;
    if (riders.visible) {
      const show = easeOut(span(pR, 0.2, 0.7));
      for (let i = 0; i < RIDERS; i++) {
        const a = (i / RIDERS) * Math.PI * 2 + t * 0.22 + 0.4;
        v.set(Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0);
        e.set(t * 0.7 + i, t * 0.5 + i * 2, i);
        q.setFromEuler(e);
        sc.setScalar(show * (0.9 + (i % 3) * 0.2));
        m.compose(v, q, sc);
        riders.setMatrixAt(i, m);
      }
      riders.instanceMatrix.needsUpdate = true;
    }

    // Camera: a slow push in while it's built and a turn around the glass at the end. It holds
    // its height, so the still frames (rendered from this) line up when they crossfade.
    const turn = easeInOut(pR);
    const azimuth = turn * 0.42 + pointer.sx * 0.05;
    const elevation = 0.1 + pointer.sy * 0.03;
    const frameHeight = lerp(21.5, 20.5, easeInOut(span(p, 0, REVEAL_START)));
    const lookY = 9.3;
    const fovRad = (camera.fov * Math.PI) / 180;
    const distance =
      (frameHeight / (2 * Math.tan(fovRad / 2))) * (layout.height / Math.max(layout.slotHeight, 1));
    camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      lookY + Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    );
    camera.lookAt(0, lookY, 0);
    return azimuth;
  }

  const front = new Vector3();
  function project(id: AnchorId, local: Vector3) {
    v.copy(local);
    drink.localToWorld(v);
    v.project(camera);
    anchors[id] = { x: ((v.x + 1) / 2) * layout.width, y: ((1 - v.y) / 2) * layout.height };
  }
  function projectAnchors(azimuth: number) {
    const onFront = (y: number, inset = 0) =>
      front.set(
        Math.sin(azimuth) * (innerR(y) - inset),
        y,
        Math.cos(azimuth) * (innerR(y) - inset),
      );
    project("finish", front.set(0, GLASS_H + DOME + 1.3, 0));
    project("foam", onFront(GLASS_H + 0.55, 0.2));
    project("pistachio", onFront(GLASS_H - 2.2));
    project("milk", onFront(9.4));
    project("matcha", onFront(2.9));
  }

  function fail() {
    if (failed) return;
    failed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    onFail();
  }

  /** Draw one frame. Returns whether anything is still moving, i.e. whether to keep going. */
  function render(now: number) {
    const gap = (now - last) / 1000;
    last = now;
    const t = now / 1000;
    time.value = t;
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-Math.min(gap, 0.25) * 3));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-Math.min(gap, 0.25) * 3));
    const azimuth = apply(shown, t);
    renderer.render(scene, camera);
    projectAnchors(azimuth);
    onFrame({ anchors });

    // Adapt to slower machines: drop the pixel ratio while frames keep running long (the first
    // frame after a rest doesn't count), and give up on the 3D if even that doesn't help.
    if (running && gap > 0.034) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 24) {
      slowFrames = 0;
      if (pixelRatio <= 1) {
        fail();
        return false;
      }
      pixelRatio = Math.max(1, pixelRatio - 0.25);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(layout.width, layout.height, false);
    }

    const settling =
      Math.abs(pointer.x - pointer.sx) > 1e-3 || Math.abs(pointer.y - pointer.sy) > 1e-3;
    const flowing =
      matchaStream.mesh.visible ||
      milkStream.mesh.visible ||
      foamStream.mesh.visible ||
      riders.visible;
    return settling || flowing;
  }

  // Frames are drawn only while something moves: scrolling, the pointer, a pour or the ring.
  function loop(now: number) {
    frame = 0;
    if (!active || failed) return;
    running = render(now);
    if (running) frame = requestAnimationFrame(loop);
  }

  function wake() {
    if (frame || !active || !ready || failed) return;
    last = performance.now();
    running = false;
    frame = requestAnimationFrame(loop);
  }

  function resize(next: Layout) {
    Object.assign(layout, next);
    renderer.setSize(next.width, next.height, false);
    camera.aspect = next.width / Math.max(next.height, 1);
    // Shift the frame so the glass stands in its slot rather than dead centre.
    camera.setViewOffset(
      next.width,
      next.height,
      next.width / 2 - next.slotX,
      next.height / 2 - next.slotY,
      next.width,
      next.height,
    );
    camera.updateProjectionMatrix();
  }

  const onContextLost = (event: Event) => {
    event.preventDefault();
    fail();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  function destroy() {
    destroyed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.removeEventListener("webglcontextlost", onContextLost);
    scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((mat) =>
          mat.dispose(),
        );
      }
    });
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
  }

  // Compile every shader before the first frame, one part at a time. Each part needs two
  // versions: one for the screen and one for the pass the glass refracts (drawn to a texture,
  // without tone mapping). Where the browser compiles in parallel, this all happens off the main
  // thread; elsewhere each part is its own short task.
  const parts: Mesh[] = [];
  scene.traverse((obj) => {
    if (obj instanceof Mesh) parts.push(obj);
  });
  const refracted = new WebGLRenderTarget(4, 4, { type: HalfFloatType });
  for (const part of parts) {
    renderer.compile(part, camera, scene);
    if (!part.material || !(part.material as MeshPhysicalMaterial).transmission) {
      renderer.setRenderTarget(refracted);
      renderer.compile(part, camera, scene);
      renderer.setRenderTarget(null);
    }
    await pause();
    if (destroyed) break;
  }
  refracted.dispose();
  await renderer.compileAsync(scene, camera);
  if (destroyed) throw new Error("destroyed");

  ready = true;
  return {
    setProgress(p) {
      shown = clamp01(p);
      wake();
    },
    setLayout(next) {
      resize(next);
      wake();
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
      wake();
    },
    setActive(next) {
      active = next;
      if (next) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    snapshot(p, ratio) {
      renderer.setPixelRatio(ratio);
      renderer.setSize(layout.width, layout.height, false);
      time.value = 0;
      const azimuth = apply(p, 0);
      renderer.render(scene, camera);
      const image = canvas.toDataURL("image/png");
      projectAnchors(azimuth);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(layout.width, layout.height, false);
      shown = p;
      return { image, anchors: { ...anchors } };
    },
    bakeEnvironment: () => bakeStudioEnvironment(renderer),
    destroy,
  };
}
