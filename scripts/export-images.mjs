// Writes every photo in the static export at the widths next/image asks for, so the design
// preview can serve phone-sized images from GitHub Pages (which has no image optimiser).
// Runs after `next build` in `npm run build:pages`; see src/lib/image-loader.ts for the URLs.
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const out = join(root, "out");
const { deviceSizes, imageSizes } = JSON.parse(
  readFileSync(join(root, "image-sizes.json"), "utf8"),
);
const widths = [...new Set([...imageSizes, ...deviceSizes])].sort((a, b) => a - b);
const formats = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);

async function* files(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (formats.has(extname(entry.name).toLowerCase())) yield path;
  }
}

function encoder(image, ext) {
  switch (ext) {
    case ".webp":
      return image.webp({ quality: 76, effort: 5 });
    case ".avif":
      return image.avif({ quality: 55 });
    case ".png":
      return image.png({ compressionLevel: 9, palette: true });
    default:
      return image.jpeg({ quality: 78, mozjpeg: true });
  }
}

let sources = 0;
let written = 0;
let bytes = 0;
for (const folder of [join(out, "images"), join(out, "_next", "static", "media")]) {
  for await (const file of files(folder)) {
    sources++;
    const rel = relative(out, file);
    const ext = extname(file).toLowerCase();
    const { width: original = 0 } = await sharp(file).metadata();
    for (const width of widths) {
      const target = join(out, "_img", String(width), rel);
      await mkdir(dirname(target), { recursive: true });
      // Never upscale: at or above the original size, the original is the best file there is.
      if (width >= original) await copyFile(file, target);
      else await encoder(sharp(file).resize({ width }), ext).toFile(target);
      bytes += (await stat(target)).size;
      written++;
    }
  }
}
console.log(
  `${sources} images × ${widths.length} widths: ${written} files, ${(bytes / 1048576).toFixed(1)} MB`,
);
