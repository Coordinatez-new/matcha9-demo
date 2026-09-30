import {
  BackSide,
  BoxGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  type Material,
  type Texture,
  type WebGLRenderer,
} from "three";
import { random } from "./helpers";

/** The drink scene's studio: its reflections and the small textures it paints on canvases. */

/**
 * Reflections for the glass and glaze: a dim room with a tall softbox front left, a strip
 * light behind on the right and a panel overhead. The dark walls are what give clear glass its
 * edges on a pale background, the way a photographer uses black card.
 */
export function studioEnvironment(renderer: WebGLRenderer): Texture {
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
  const texture = pmrem.fromScene(room, 0.02).texture;
  pmrem.dispose();
  room.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.geometry.dispose();
      (obj.material as Material).dispose();
    }
  });
  return texture;
}

/** A soft round shadow for under the coaster. */
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

/** One leaf, as an alpha mask for the shadow casters. */
export function leafMask() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 128;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#fff";
  g.beginPath();
  g.moveTo(32, 126);
  g.bezierCurveTo(2, 96, 4, 34, 32, 2);
  g.bezierCurveTo(60, 34, 62, 96, 32, 126);
  g.fill();
  return new CanvasTexture(canvas);
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
  for (let i = 0; i < 900; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.6 + rand() ** 3 * 3.2;
    for (const [dx, dy] of [
      [0, 0],
      [size, 0],
      [-size, 0],
      [0, size],
      [0, -size],
    ] as const) {
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
