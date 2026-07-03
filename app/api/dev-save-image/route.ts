import { writeFile } from "fs/promises";
import path from "path";

// Temporary dev-only helper to save generated canvas images into
// public/images/visual-sky-radar/. Deleted after use.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("dev only", { status: 403 });
  }
  const { name, dataUrl } = (await request.json()) as { name: string; dataUrl: string };
  if (!/^[a-z0-9-]+\.(png|jpg)$/.test(name)) {
    return new Response("bad name", { status: 400 });
  }
  const base64 = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, "");
  const target = path.join(process.cwd(), "public", "images", "visual-sky-radar", name);
  await writeFile(target, Buffer.from(base64, "base64"));
  return Response.json({ ok: true, target });
}
