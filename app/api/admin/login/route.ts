import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  createSessionToken,
  isAdminConfigured,
  verifyAdminPin,
} from "@/lib/admin-auth";

/**
 * POST { pin } → verify against ADMIN_PIN and, on success, set the signed
 * `nb_admin` session cookie (httpOnly). A wrong PIN gets a fixed small delay to
 * blunt online brute-forcing.
 */
export async function POST(request: Request) {
  let body: { pin?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  if (!isAdminConfigured()) {
    return Response.json(
      { error: "Admin is not configured — set ADMIN_PIN in the environment." },
      { status: 503 }
    );
  }

  if (!verifyAdminPin(body.pin)) {
    await new Promise((r) => setTimeout(r, 500));
    return Response.json({ error: "Incorrect PIN." }, { status: 401 });
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return Response.json({ ok: true });
}
