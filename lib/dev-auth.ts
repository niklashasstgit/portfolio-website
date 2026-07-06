/**
 * Shared developer-console auth constants + hashing.
 *
 * The password is never shipped in plaintext — only this salted SHA-256 digest is.
 * The client hashes the entered value and compares (UX gate); the server ALSO hashes
 * and compares on every write (the real gate — see app/api/site-settings/route.ts), so a
 * write can't be forged just by reading the bundle. Web Crypto works in both the browser
 * and the Node/Edge runtime, so this module is isomorphic.
 */

export const PW_SALT = "blattner-dev::v1::";
// salted SHA-256 of the developer password
export const PW_HASH = "c15ba7394ef4d7d1129eaae524f994119bfa91d1db692c630a3d5d3804b39785";

export async function sha256hex(message: string): Promise<string> {
  const bytes = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** True when `password` matches the console passphrase (hash) or the rotation env var. */
export async function verifyDevPassword(password: string, adminEnv?: string): Promise<boolean> {
  if (typeof password !== "string" || !password) return false;
  if (adminEnv && password === adminEnv) return true;
  return (await sha256hex(PW_SALT + password)) === PW_HASH;
}
