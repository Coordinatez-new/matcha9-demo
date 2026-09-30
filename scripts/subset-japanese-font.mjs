// Rebuilds the Japanese font used for the site's kanji and kana accents: Shippori Mincho,
// cut down to exactly the characters that appear in src/ (a few kilobytes instead of megabytes).
// Run it after adding or changing Japanese text:  node scripts/subset-japanese-font.mjs
// Shippori Mincho is licensed under the SIL Open Font License (see src/assets/fonts/OFL.txt).
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const out = join(root, "src", "assets", "fonts");
const japanese = /[　-ヿ㐀-䶿一-鿿＀-￯]/gu;

function walk(dir, found = new Set()) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, found);
    else if (/\.(tsx?|css)$/.test(name)) {
      for (const ch of readFileSync(path, "utf8").match(japanese) ?? []) found.add(ch);
    }
  }
  return found;
}

const text = [...walk(join(root, "src"))].sort().join("");
if (!text) throw new Error("No Japanese characters found in src/");

// A current browser user agent, so Google Fonts answers with WOFF2.
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
};

mkdirSync(out, { recursive: true });
for (const weight of [500, 700]) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl, { headers })).text();
  const fontUrl = /url\((https:[^)]+)\)\s*format\('woff2'\)/.exec(css)?.[1];
  if (!fontUrl) throw new Error(`No WOFF2 in the Google Fonts response for weight ${weight}`);
  const font = Buffer.from(await (await fetch(fontUrl, { headers })).arrayBuffer());
  writeFileSync(join(out, `shippori-mincho-${weight}.woff2`), font);
  console.log(`shippori-mincho-${weight}.woff2  ${font.length} bytes`);
}
console.log(`${text.length} characters: ${text}`);
