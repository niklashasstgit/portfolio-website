import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminConfigured, verifySessionToken } from "@/lib/admin-auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";

// The admin console must never be statically cached or indexed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-20">
        <AdminLogin configured={isAdminConfigured()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono-tight text-[10px] uppercase tracking-[0.25em] text-accent">
            Restricted
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-fg">Admin console</h1>
        </div>
        <AdminNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
