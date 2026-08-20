import { createReadStream, promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";
import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { chatDir, MEDIA_DIR } from "@/lib/tools/whatsapp/vault";

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

/** Serve one captured thumbnail out of the archive. */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ folder: string; file: string }> }
) {
  const denied = await guardToolsRequest();
  if (denied) return denied;

  const { folder, file } = await ctx.params;
  const settings = await readToolSettings();

  // basename() so a crafted name cannot climb out of the media folder
  const safe = path.basename(decodeURIComponent(file));
  const full = path.join(chatDir(settings.archiveRoot, decodeURIComponent(folder)), MEDIA_DIR, safe);

  try {
    const stat = await fs.stat(full);
    if (!stat.isFile()) throw new Error("not a file");
    const stream = Readable.toWeb(createReadStream(full)) as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Type": TYPES[path.extname(safe).toLowerCase()] ?? "application/octet-stream",
        "Content-Length": String(stat.size),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
}
