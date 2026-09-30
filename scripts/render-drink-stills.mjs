// Renders the home page's still frames from the live 3D scene: the build at each keyframe,
// cropped to the frames' box, plus the scene's baked environment map and the leaf-shadow
// overlay. The page shows the frames first, and for good on devices that don't get the 3D.
// Rerun after changing the scene:
//
//   npm run dev:pages            (in one terminal)
//   node scripts/render-drink-stills.mjs [http://localhost:3000]
//
// Needs Chrome with a GPU (set CHROME_PATH if it isn't in the usual place).
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const url = process.argv[2] ?? "http://localhost:3000/";
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const outDir = join(root, "public", "images", "drink-build");
const dataFile = join(root, "src", "components", "home", "drink-build", "stills.ts");
const keyframes = [0, 0.18, 0.28, 0.36, 0.52, 0.65, 0.77, 0.87, 1];
const size = { width: 960, height: 1200 };
const ratio = 2;

/** The generated data module the page imports: environment scale, frames and label anchors. */
function writeData(envScale, frames, anchors) {
  const list = frames.map((f) => `  { at: ${f.at}, src: "${f.src}" },`).join("\n");
  const points = Object.entries(anchors)
    .map(([key, [x, y]]) => `  ${key}: [${x}, ${y}],`)
    .join("\n");
  writeFileSync(
    dataFile,
    `import type { AnchorId } from "./scene";

/**
 * The build as still frames, rendered from the 3D scene by scripts/render-drink-stills.mjs
 * (rerun it after changing the scene). The home page shows these first, and for good on
 * devices that don't get the live 3D. Generated: don't edit by hand.
 */

/** The studio's environment map, baked from the scene; its values are scaled down by \`scale\`. */
export const bakedEnvironment = { src: "/images/drink-build/studio.webp", scale: ${envScale} };

export const stillSize = { width: ${size.width}, height: ${size.height} };

export const stillFrames: { at: number; src: string }[] = [
${list}
];

/** Where each layer's name sits on the last frame, as fractions of its width and height. */
export const stillAnchors: Record<AnchorId, [number, number]> = {
${points}
};
`,
  );
}

const chromePath =
  process.env.CHROME_PATH ??
  {
    win32: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  }[process.platform] ??
  "google-chrome";
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "m9-stills-"))}`,
    "--no-first-run",
    "--ignore-gpu-blocklist",
    ...(process.platform === "win32" ? ["--use-angle=d3d11"] : []),
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws;
for (let i = 0; i < 100 && !ws; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = list.find((t) => t.type === "page");
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch {}
  if (!ws) await sleep(200);
}
if (!ws) throw new Error("Chrome did not start");
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, (m) =>
      m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result),
    );
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "failed");
  return r.result.value;
};
const open = async () => {
  await send("Page.navigate", { url });
  for (let i = 0; i < 240; i++) {
    await sleep(250);
    if (await evaluate("typeof window.__m9DrinkSnapshot === 'function'").catch(() => false)) return;
  }
  throw new Error("The 3D scene never started: run the dev server, and Chrome needs a GPU.");
};

try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await open();
  mkdirSync(outDir, { recursive: true });

  // The environment map first: bake it, then reload so the frames are drawn with the baked
  // copy the page will use.
  const environment = await evaluate("window.__m9DrinkEnvironment()");
  await sharp(Buffer.from(environment.image.split(",")[1], "base64"))
    .webp({ lossless: true, effort: 6 })
    .toFile(join(outDir, "studio.webp"));
  const envScale = +environment.scale.toFixed(4);
  console.log(`studio.webp  scale ${envScale}`);
  const frames = keyframes.map((at, i) => ({ at, src: `/images/drink-build/still-${i}.webp` }));
  writeData(envScale, frames, {
    finish: [0.5, 0.11],
    foam: [0.5, 0.22],
    pistachio: [0.5, 0.35],
    milk: [0.5, 0.5],
    matcha: [0.5, 0.79],
  });
  await sleep(2000);
  await open();

  let anchors = {};
  for (const [i, at] of keyframes.entries()) {
    const shot = await evaluate(`window.__m9DrinkSnapshot(${at}, ${ratio})`);
    const png = Buffer.from(shot.image.split(",")[1], "base64");
    const { width: w, height: h } = await sharp(png).metadata();
    const left = Math.max(0, Math.round(shot.box.x * ratio));
    const top = Math.max(0, Math.round(shot.box.y * ratio));
    const region = {
      left,
      top,
      width: Math.min(w - left, Math.round(shot.box.width * ratio)),
      height: Math.min(h - top, Math.round(shot.box.height * ratio)),
    };
    await sharp(png)
      .extract(region)
      .resize(size.width, size.height, { fit: "fill" })
      .webp({ quality: 80, effort: 6 })
      .toFile(join(outDir, `still-${i}.webp`));
    if (at === keyframes.at(-1)) {
      anchors = Object.fromEntries(
        Object.entries(shot.anchors).map(([key, a]) => [
          key,
          [
            +((a.x - shot.box.x) / shot.box.width).toFixed(4),
            +((a.y - shot.box.y) / shot.box.height).toFixed(4),
          ],
        ]),
      );
    }
    console.log(`still-${i}.webp  at ${at}`);
  }
  writeData(envScale, frames, anchors);
  console.log(`wrote ${dataFile}`);
} finally {
  ws.close();
  chrome.kill();
}

// Leaf shadows for the stage (komorebi), as the page multiplies them over the drink: soft
// foliage along the top and the right, clear of the text on the left.
{
  let seed = 7;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const clusters = [
    [760, -60, 0.5, 14],
    [1180, -30, 1.2, 16],
    [1560, 180, 2.2, 16],
    [1620, 560, 2.9, 12],
  ];
  const far = [];
  const near = [];
  for (const [cx, cy, angle, count] of clusters) {
    for (let k = 0; k < count; k++) {
      const t = k / count;
      const x = cx + Math.cos(angle) * 320 * t + (rand() - 0.5) * 220;
      const y = cy + Math.sin(angle) * 320 * t + (rand() - 0.5) * 220;
      const length = 110 + rand() * 90;
      const width = 34 + rand() * 22;
      const turn = ((angle + (rand() - 0.5) * 2.2) * 180) / Math.PI;
      const leaf = `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(1)})" d="M0 0 Q ${(length * 0.45).toFixed(1)} ${-width} ${length.toFixed(1)} 0 Q ${(length * 0.45).toFixed(1)} ${width} 0 0Z"/>`;
      (rand() < 0.7 ? far : near).push(leaf);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
  <defs>
    <filter id="far" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="near" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="13"/></filter>
  </defs>
  <rect width="1600" height="1000" fill="#fff"/>
  <g fill="#8a8272" fill-opacity="0.3" filter="url(#far)">${far.join("")}</g>
  <g fill="#7a7262" fill-opacity="0.34" filter="url(#near)">${near.join("")}</g>
</svg>`;
  await sharp(Buffer.from(svg))
    .grayscale()
    .webp({ quality: 70 })
    .toFile(join(outDir, "komorebi.webp"));
  console.log("komorebi.webp");
}
