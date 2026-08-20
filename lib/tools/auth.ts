// NOTE: server-only module.
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

/**
 * Is this request carrying a valid tools/admin session?
 *
 * Must be checked in every server component under /tools that touches data —
 * NOT only in the layout. A layout that renders a login form instead of
 * `children` still lets those children render: React evaluates the page and
 * Next serialises its props into the RSC payload, so anything the page reads
 * ships to the browser even though nothing is visible on screen.
 */
export async function isToolsAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
