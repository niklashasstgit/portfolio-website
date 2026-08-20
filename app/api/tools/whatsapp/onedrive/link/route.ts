import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { guardedRead } from "@/lib/tools/whatsapp/guard";
import { authorizeUrl, isOneDriveConfigured } from "@/lib/tools/whatsapp/onedrive/auth";

export const dynamic = "force-dynamic";

export const STATE_COOKIE = "nb_od_state";

/**
 * Begin the OneDrive consent flow. The redirect URI is derived from the
 * request, so the same code works on localhost and on the deployed domain —
 * both just have to be registered on the Azure app.
 */
export const POST = guardedRead(async (request: Request) => {
  if (!isOneDriveConfigured()) {
    return Response.json(
      { error: "Set ONEDRIVE_CLIENT_ID and ONEDRIVE_CLIENT_SECRET first." },
      { status: 503 }
    );
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/tools/whatsapp/onedrive/callback`;
  const state = randomBytes(16).toString("hex");

  // Round-tripped through Microsoft and compared on return, so a third party
  // cannot walk someone else's browser through this flow.
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return Response.json({ url: authorizeUrl(redirectUri, state), redirectUri });
});
