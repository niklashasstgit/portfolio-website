"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires a lightweight beacon to /api/track on first load and on every client-side
 * route change. The client only sends the path + referrer; the visitor's IP,
 * location and network-owner (company) are derived server-side from request
 * headers — see app/api/track/route.ts.
 */
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, ref: document.referrer }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
