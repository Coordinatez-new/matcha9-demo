import type { NextRequest } from "next/server";
import { getMediaFile } from "@/server/media";

/** Photos uploaded from the dashboard. IDs never change content, so they cache forever. */
// Typed here: the route type helpers (RouteContext) aren't generated for the preview build.
type Context = { params: Promise<{ file: string }> };

export async function GET(_request: NextRequest, ctx: Context) {
  const { file } = await ctx.params;
  const media = await getMediaFile(file.replace(/\.webp$/, ""));
  if (!media) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.contentType,
      "Content-Length": String(media.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
