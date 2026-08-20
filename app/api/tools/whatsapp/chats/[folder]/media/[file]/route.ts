import path from "path";
import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { loadMedia } from "@/lib/tools/whatsapp/source";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf",
};

/** Serve one captured thumbnail, from disk or OneDrive. */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ folder: string; file: string }> }
) {
  const denied = await guardToolsRequest({ requireLocal: false });
  if (denied) return denied;

  const { folder, file } = await ctx.params;
  const safe = path.basename(decodeURIComponent(file));
  const found = await loadMedia(decodeURIComponent(folder), safe);
  if (!found) return Response.json({ error: "not found" }, { status: 404 });

  return new Response(new Uint8Array(found.body), {
    headers: {
      "Content-Type": TYPES[path.extname(safe).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": String(found.size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
