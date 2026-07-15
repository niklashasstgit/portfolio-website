"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const TABS = [
  { href: "/admin", label: "Analytics" },
  { href: "/admin/projects", label: "Projects" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="flex items-center gap-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active
                ? "bg-accent/15 text-accent"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        disabled={loggingOut}
        className="ml-2 rounded-full border border-line px-4 py-1.5 text-sm text-fg-muted transition-colors hover:border-red-500/60 hover:text-red-400 disabled:opacity-50"
      >
        {loggingOut ? "…" : "Log out"}
      </button>
    </nav>
  );
}
