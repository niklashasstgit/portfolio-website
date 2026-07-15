"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VID_KEY = "nb.vid.v1";

/**
 * A stable, per-browser device id. Persisted in localStorage so it survives IP
 * changes (mobile↔WiFi, ISP rotation) and distinguishes devices that share one
 * public IP (e.g. a phone + laptop on the same home WiFi). Lets the admin label
 * and permanently exclude their own devices regardless of network.
 */
function deviceId(): string {
  try {
    let id = localStorage.getItem(VID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/**
 * Fires a lightweight beacon to /api/track on first load and on every client-side
 * route change. Sends the path, referrer and a persistent device id; the visitor's
 * IP, location and network-owner (company) are derived server-side from request
 * headers — see app/api/track/route.ts.
 */
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      const body = {
        path: pathname,
        ref: document.referrer,
        vid: deviceId(),
        // Best-effort client details — browser/OS/device type are re-derived
        // server-side from the UA header, these fill in what only the client knows.
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      };
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
