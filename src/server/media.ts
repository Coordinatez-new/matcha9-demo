import "server-only";
import sharp from "sharp";
import { builtInImages } from "@/content/menu";
import type { LibraryImage } from "@/lib/menu";
import { getDb } from "./db";
import { isUuid } from "./orders";

/**
 * Photos uploaded from the dashboard. They're resized and converted to WebP, then stored in the
 * database itself, so there's no separate file storage to set up. Served from /media/<id>.webp.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 1600;

export type { LibraryImage };

export async function saveUpload(file: File): Promise<LibraryImage> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("That image is over 10 MB.");

  const output = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
    .rotate() // respect the camera's orientation
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true })
    .catch(() => null);
  if (!output) throw new Error("That file couldn’t be read as an image.");

  const db = await getDb();
  const name = file.name.replace(/\.[^.]+$/, "").slice(0, 120) || "photo";
  const [row] = await db.query<{ id: string }>(
    `insert into media (filename, content_type, width, height, size, data)
     values ($1, 'image/webp', $2, $3, $4, $5) returning id`,
    [name, output.info.width, output.info.height, output.data.length, output.data],
  );
  return {
    id: row!.id,
    src: `/media/${row!.id}.webp`,
    width: output.info.width,
    height: output.info.height,
    label: name,
  };
}

export async function getMediaFile(id: string) {
  if (!isUuid(id)) return null;
  const db = await getDb();
  const [row] = await db.query<{ data: Uint8Array; content_type: string }>(
    "select data, content_type from media where id = $1",
    [id],
  );
  return row ? { data: Buffer.from(row.data), contentType: row.content_type } : null;
}

/** Uploaded photos (newest first) followed by the photography that ships with the site. */
export async function listLibrary(): Promise<LibraryImage[]> {
  const db = await getDb();
  const rows = await db.query<{ id: string; filename: string; width: number; height: number }>(
    "select id, filename, width, height from media order by created_at desc limit 200",
  );
  return [
    ...rows.map((r) => ({
      id: r.id,
      src: `/media/${r.id}.webp`,
      width: r.width,
      height: r.height,
      label: r.filename,
    })),
    ...builtInImages(),
  ];
}
