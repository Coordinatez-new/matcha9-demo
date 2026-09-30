import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  BufferAttribute,
} from "three";

/**
 * A small 3D chasen (bamboo matcha whisk) that follows the pointer.
 *
 * The model is built from a few lathe and tube geometries in centimetres, with its origin at
 * the bottom of the tines: that point is the cursor's hotspot, so tilting and spinning never
 * move the tip away from where the guest is pointing. Motion is spring-driven, in the spirit
 * of Spline's homepage: the whisk trails the pointer a touch, leans into the direction of
 * travel, settles with a soft overshoot, and whisks when it passes over a drink.
 */

const CANVAS = 132; // CSS px
const PX_PER_CM = 5.1; // the 11 cm whisk ends up about 56 px tall

const bamboo = new Color("#dcc89d");
const bambooLight = new Color("#ead9b2");
const matcha = new Color("#86a04f");

function buildWhisk() {
  const whisk = new Group();

  // Handle: a slightly tapered bamboo tube with a softly rounded top.
  const handleProfile = [
    new Vector2(0.0, 5.5),
    new Vector2(1.08, 5.5),
    new Vector2(1.1, 6.4),
    new Vector2(1.06, 10.55),
    new Vector2(0.98, 10.9),
    new Vector2(0.7, 11.02),
    new Vector2(0.0, 11.02),
  ];
  const handleMaterial = new MeshStandardMaterial({ color: bamboo, roughness: 0.48, metalness: 0 });
  whisk.add(new Mesh(new LatheGeometry(handleProfile, 40), handleMaterial));

  // The bamboo node near the base of the handle.
  const node = new Mesh(
    new TorusGeometry(1.1, 0.07, 8, 48),
    new MeshStandardMaterial({ color: new Color("#c9b284"), roughness: 0.55 }),
  );
  node.rotation.x = Math.PI / 2;
  node.position.y = 6.35;
  whisk.add(node);

  // Dark thread woven where the tines split from the handle.
  const thread = new Mesh(
    new TorusGeometry(1.2, 0.16, 10, 48),
    new MeshStandardMaterial({ color: new Color("#2f2b26"), roughness: 0.85 }),
  );
  thread.rotation.x = Math.PI / 2;
  thread.position.y = 5.2;
  whisk.add(thread);

  // Tines, described in the (radius, height) plane and repeated around the axis.
  const tine = (points: [number, number][], radius: number, tint: boolean) => {
    const curve = new CatmullRomCurve3(points.map(([r, y]) => new Vector3(r, y, 0)));
    const geometry = new TubeGeometry(curve, 28, radius, 4, false);
    // Vertex colours: bamboo along the tine, a breath of matcha green at the curled tips.
    const count = geometry.attributes.position!.count;
    const colors = new Float32Array(count * 3);
    const uv = geometry.attributes.uv!;
    const c = new Color();
    for (let i = 0; i < count; i++) {
      const t = uv.getX(i);
      c.copy(bambooLight).lerp(bamboo, t * 0.6);
      if (tint) c.lerp(matcha, Math.max(0, (t - 0.72) / 0.28) * 0.55);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    return geometry;
  };

  const tineMaterial = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.6,
    metalness: 0,
  });

  const ring = (geometry: TubeGeometry, count: number, offset: number) => {
    const mesh = new InstancedMesh(geometry, tineMaterial, count);
    const m = new Matrix4();
    const q = new Quaternion();
    const axis = new Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      q.setFromAxisAngle(axis, ((i + offset) / count) * Math.PI * 2);
      m.makeRotationFromQuaternion(q);
      mesh.setMatrixAt(i, m);
    }
    return mesh;
  };

  // Outer tines swell into the bulb and curl back in at the tips.
  const outer = tine(
    [
      [1.02, 5.45],
      [1.55, 4.7],
      [2.35, 3.45],
      [2.82, 2.1],
      [2.72, 0.95],
      [2.2, 0.22],
      [1.62, 0.02],
      [1.3, 0.3],
    ],
    0.12,
    true,
  );
  whisk.add(ring(outer, 40, 0));

  // Inner tines gather into a slim cone at the centre.
  const inner = tine(
    [
      [0.72, 5.4],
      [0.82, 4.1],
      [0.62, 2.3],
      [0.32, 0.95],
      [0.12, 0.45],
    ],
    0.1,
    true,
  );
  whisk.add(ring(inner, 20, 0.5));

  return whisk;
}

type Mode = "idle" | "link" | "whisk" | "text";

export type WhiskHandle = { destroy: () => void };

export function mountWhisk(): WhiskHandle | null {
  const canvas = document.createElement("canvas");
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: true,
    });
  } catch {
    return null; // No WebGL, or only a software renderer: keep the normal cursor.
  }
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  if (
    info &&
    /swiftshader|llvmpipe|softpipe|software|basic render/i.test(
      String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)),
    )
  ) {
    renderer.dispose();
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(CANVAS, CANVAS, false);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  Object.assign(canvas.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${CANVAS}px`,
    height: `${CANVAS}px`,
    pointerEvents: "none",
    zIndex: "100",
    opacity: "0",
    transition: "opacity 300ms ease",
    willChange: "transform",
  } satisfies Partial<CSSStyleDeclaration>);
  canvas.setAttribute("aria-hidden", "true");

  // The exact hotspot: a small dot that never lags, so clicks stay precise.
  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  dot.className = "m9-cursor-dot";

  const scene = new Scene();
  scene.add(new HemisphereLight(new Color("#fff4e3"), new Color("#8e927c"), 1.35));
  const key = new DirectionalLight(new Color("#fff1dc"), 2.3);
  key.position.set(-6, 10, 12);
  scene.add(key);
  const rim = new DirectionalLight(new Color("#dfe8c8"), 1.4);
  rim.position.set(8, 4, -10);
  scene.add(rim);

  const pivot = new Group(); // rotates around the tip
  const whisk = buildWhisk();
  pivot.add(whisk);
  scene.add(pivot);

  // Frame the scene so the tip (world origin) sits low-left in the canvas and the whisk rises
  // up and to the right, clear of whatever is being pointed at.
  const fov = 24;
  const heightCm = CANVAS / PX_PER_CM;
  const distance = heightCm / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
  const camera = new PerspectiveCamera(fov, 1, 1, distance * 3);
  const tipX = 40;
  const tipY = CANVAS - 34;
  const look = new Vector3((CANVAS / 2 - tipX) / PX_PER_CM, (tipY - CANVAS / 2) / PX_PER_CM, 0);
  camera.position.set(look.x, look.y + 1.2, distance);
  camera.lookAt(look);
  camera.updateMatrixWorld();
  const tipOnCanvas = new Vector3(0, 0, 0).project(camera);
  const hotspot = {
    x: ((tipOnCanvas.x + 1) / 2) * CANVAS,
    y: ((1 - tipOnCanvas.y) / 2) * CANVAS,
  };

  document.body.append(canvas, dot);
  document.documentElement.classList.add("m9-whisk");

  // ── Motion ───────────────────────────────────────────────────────────────
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const posX = { value: pointer.x, velocity: 0 };
  const posY = { value: pointer.y, velocity: 0 };
  const leanZ = { value: 0, velocity: 0 };
  const leanX = { value: 0, velocity: 0 };
  let spin = 0;
  let scale = 1;
  let press = 0;
  let shake = 0; // 0..1, eases in while whisking over a drink
  let mode: Mode = "idle";
  let visible = false;
  let seen = false;
  let last = performance.now();
  let frame = 0;
  let running = false;

  const baseTilt = -0.52; // handle leaning right, like a pen in the hand

  const interactive =
    'a, button, [role="button"], [role="switch"], summary, label, select, input[type="checkbox"], input[type="radio"]';
  const textField =
    'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';

  const setMode = (target: EventTarget | null) => {
    const el = target instanceof Element ? target : null;
    // The nearest interactive (or explicitly marked) element decides: a "+" button inside a
    // drink card is a button, the card's photo link is marked data-cursor="whisk".
    const hit = el?.closest(`${interactive}, [data-cursor]`);
    const next: Mode = !el
      ? "idle"
      : el.closest(textField)
        ? "text"
        : !hit
          ? "idle"
          : hit.getAttribute("data-cursor") === "whisk"
            ? "whisk"
            : "link";
    if (next !== mode) {
      mode = next;
      dot.dataset.mode = next;
    }
  };

  const show = (on: boolean) => {
    visible = on;
    const hidden = !on || mode === "text";
    canvas.style.opacity = hidden ? "0" : "1";
    dot.style.opacity = hidden ? "0" : "1";
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (!seen) {
      // First sighting: start at the pointer instead of flying in from the centre.
      seen = true;
      posX.value = pointer.x;
      posY.value = pointer.y;
    }
    setMode(e.target);
    show(true);
    dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    wake();
  };
  const onDown = () => {
    press = 1;
    dot.dataset.pressed = "true";
    wake();
  };
  const onUp = () => {
    dot.dataset.pressed = "false";
  };
  const onLeave = (e: MouseEvent) => {
    if (!e.relatedTarget) show(false);
  };
  const onVisibility = () => {
    if (document.visibilityState !== "visible") show(false);
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  document.addEventListener("mouseout", onLeave);
  document.addEventListener("visibilitychange", onVisibility);

  /** Advance a damped spring towards its target by one frame. */
  const step = (
    s: { value: number; velocity: number },
    target: number,
    k: number,
    c: number,
    dt: number,
  ) => {
    s.velocity += (k * (target - s.value) - c * s.velocity) * dt;
    s.value += s.velocity * dt;
  };

  function tick(now: number) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const t = now / 1000;

    // Follow: a slightly under-damped spring, so it glides and settles with a soft overshoot.
    step(posX, pointer.x, 190, 21, dt);
    step(posY, pointer.y, 190, 21, dt);

    // Lean into the motion like a brush dragged across paper; wobble back when it stops.
    shake += ((mode === "whisk" ? 1 : 0) - shake) * Math.min(1, dt * 6);
    const whisking = Math.sin(t * 17) * 0.16 * shake;
    const targetZ = Math.max(-0.42, Math.min(0.42, -posX.velocity * 0.0007)) + whisking;
    const targetX = Math.max(-0.3, Math.min(0.3, posY.velocity * 0.0005));
    step(leanZ, targetZ, 150, 13, dt);
    step(leanX, targetX, 150, 13, dt);

    // Spin on its own axis: slowly at rest, faster with speed or while whisking.
    const speed = Math.hypot(posX.velocity, posY.velocity);
    spin += dt * (0.35 + Math.min(speed * 0.004, 5) + (mode === "whisk" ? 4 : 0));

    const targetScale = mode === "link" ? 1.12 : mode === "whisk" ? 1.08 : 1;
    scale += (targetScale - scale) * Math.min(1, dt * 10);
    press = Math.max(0, press - dt * 4);

    pivot.rotation.set(
      0.22 + leanX.value,
      0,
      baseTilt + leanZ.value + (mode === "link" ? 0.18 : 0),
    );
    whisk.rotation.y = spin;
    const squash = 1 - press * 0.12;
    pivot.scale.set(scale * (1 + press * 0.05), scale * squash, scale * (1 + press * 0.05));

    // Whisking over a drink: a quick side-to-side stroke, the way matcha is whisked in a bowl.
    const stroke = Math.sin(t * 18) * 2.5 * shake;
    const dip = press * 4;
    canvas.style.transform = `translate3d(${posX.value - hotspot.x + stroke}px, ${posY.value - hotspot.y + dip}px, 0)`;
    renderer.render(scene, camera);

    const settled =
      Math.abs(pointer.x - posX.value) < 0.2 &&
      Math.abs(pointer.y - posY.value) < 0.2 &&
      speed < 1 &&
      Math.abs(leanZ.velocity) < 0.002 &&
      press === 0 &&
      mode !== "whisk";
    // Keep a gentle idle spin going while visible; stop entirely when hidden.
    if (!visible && settled) {
      running = false;
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (running) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  const onContextLost = (e: Event) => {
    e.preventDefault();
    destroy();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  function destroy() {
    cancelAnimationFrame(frame);
    running = false;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    document.removeEventListener("mouseout", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    document.documentElement.classList.remove("m9-whisk");
    scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => m.dispose());
      }
    });
    renderer.dispose();
    canvas.remove();
    dot.remove();
  }

  return { destroy };
}
