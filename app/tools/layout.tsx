import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminConfigured, verifySessionToken } from "@/lib/admin-auth";
import ToolsLogin from "@/components/tools/ToolsLogin";

// Private workshop: never statically cached, never indexed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tools",
  robots: { index: false, follow: false },
};

export default async function ToolsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-20">
        <ToolsLogin configured={isAdminConfigured()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono-tight text-[10px] uppercase tracking-[0.25em] text-accent">
            Private
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-fg">
            <Link href="/tools" className="hover:opacity-80">
              Tools
            </Link>
          </h1>
        </div>
        <nav className="flex gap-4 text-sm text-fg-muted">
          <Link href="/tools" className="hover:text-fg">
            All tools
          </Link>
          <Link href="/admin" className="hover:text-fg">
            Admin
          </Link>
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
