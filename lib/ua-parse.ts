/**
 * Minimal User-Agent parser — just enough to bucket "Chrome / macOS / desktop"
 * for the analytics dashboard. Not exhaustive; good enough for a personal-site
 * visitor breakdown, not a full UA database.
 */

export type ParsedUa = {
  browser: string;
  os: string;
  deviceType: "mobile" | "tablet" | "desktop";
};

export function parseUserAgent(ua: string): ParsedUa {
  const s = ua || "";

  let os = "Unknown";
  if (/windows/i.test(s)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(s)) os = "iOS";
  else if (/mac os x|macintosh/i.test(s)) os = "macOS";
  else if (/android/i.test(s)) os = "Android";
  else if (/cros/i.test(s)) os = "ChromeOS";
  else if (/linux/i.test(s)) os = "Linux";

  let browser = "Unknown";
  if (/edg\//i.test(s)) browser = "Edge";
  else if (/opr\/|opera/i.test(s)) browser = "Opera";
  else if (/chrome\//i.test(s) && !/chromium/i.test(s)) browser = "Chrome";
  else if (/crios\//i.test(s)) browser = "Chrome"; // Chrome on iOS
  else if (/fxios\//i.test(s)) browser = "Firefox"; // Firefox on iOS
  else if (/firefox\//i.test(s)) browser = "Firefox";
  else if (/safari\//i.test(s) && /version\//i.test(s)) browser = "Safari";
  else if (/msie|trident/i.test(s)) browser = "Internet Explorer";

  const deviceType: ParsedUa["deviceType"] = /ipad|tablet/i.test(s)
    ? "tablet"
    : /mobi|iphone|ipod|android.*mobile/i.test(s)
      ? "mobile"
      : "desktop";

  return { browser, os, deviceType };
}
