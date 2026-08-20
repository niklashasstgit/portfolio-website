import crypto from "crypto";

/**
 * Chat titles are arbitrary user text: emoji, slashes, colons, trailing dots,
 * right-to-left marks. Folder names have to satisfy NTFS:
 *
 *   - no  < > : " / \ | ? *  and no control characters
 *   - no trailing dot or space (Explorer cannot open such a folder)
 *   - not a reserved device name (CON, PRN, COM1…)
 *
 * The untouched title is always kept in the archive's metadata, so sanitising
 * the directory name loses nothing.
 */

const FORBIDDEN = /[<>:"/\|?*\u0000-\u001f]/g;
const BIDI = /[\u200e\u200f\u202a-\u202e\ufeff]/g;
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const MAX_LEN = 80;

export function shortHash(input: string): string {
  return crypto.createHash("sha1").update(String(input), "utf8").digest("hex").slice(0, 8);
}

export function folderName(title: string): string {
  const original = String(title ?? "");
  let name = original.replace(FORBIDDEN, " ").replace(BIDI, "").replace(/\s+/g, " ").trim();
  name = name.replace(/\.{2,}/g, ".");

  let truncated = false;
  if (name.length > MAX_LEN) {
    name = name.slice(0, MAX_LEN).trim();
    truncated = true;
  }
  name = name.replace(/[. ]+$/, "").replace(/^[. ]+/, "");

  if (!name || RESERVED.test(name)) {
    return name ? `${name}_chat (${shortHash(original)})` : `chat_${shortHash(original)}`;
  }

  // Only fingerprint when sanitising actually lost information that could make
  // two different chats collide. Invisible marks and collapsed whitespace do not.
  const plain = original
    .replace(FORBIDDEN, " ")
    .replace(BIDI, "")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "")
    .replace(/^[. ]+/, "");

  return truncated || name !== plain ? `${name} (${shortHash(original)})` : name;
}

export function fileStem(input: string, fallback = "file"): string {
  let s = String(input ?? "")
    .replace(FORBIDDEN, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._]+|[._]+$/g, "");
  if (s.length > 60) s = s.slice(0, 60);
  return s || fallback;
}

/** Message ids look like `true_4915…@c.us_3A9F` — keep them recognisable. */
export function idStem(id: string): string {
  return fileStem(String(id).replace(/@[cg]\.us/g, ""), `msg_${shortHash(id)}`);
}
