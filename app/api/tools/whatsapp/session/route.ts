import { guarded } from "@/lib/tools/whatsapp/guard";
import { closeSession, getSession, peekSession } from "@/lib/tools/whatsapp/runtime";

export const dynamic = "force-dynamic";

/** POST { action: "start" | "stop" } — opens or closes the linked browser. */
export const POST = guarded(async (request: Request) => {
  const body = (await request.json().catch(() => ({}))) as { action?: string };

  if (body.action === "stop") {
    await closeSession();
    return Response.json({ running: false, loggedIn: false });
  }

  const session = await getSession();
  return Response.json(await session.status());
});

export const GET = guarded(async () => {
  const session = peekSession();
  return Response.json(session ? await session.status() : { running: false, loggedIn: false });
});
