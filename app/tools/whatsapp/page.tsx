import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppTool from "@/components/tools/whatsapp/WhatsAppTool";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { ensureArchive } from "@/lib/tools/whatsapp/vault";
import { loadIndex, resolveSource } from "@/lib/tools/whatsapp/source";
import { isOneDriveConfigured, readToken } from "@/lib/tools/whatsapp/onedrive/auth";
import { peekSession } from "@/lib/tools/whatsapp/runtime";
import { isToolsAuthed } from "@/lib/tools/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WhatsApp Archive",
  robots: { index: false, follow: false },
};

/**
 * The archive is read here, on the server, and handed to the client as initial
 * state. That avoids a load-then-fetch waterfall entirely: the page arrives
 * with your chats already in it.
 */
export default async function WhatsAppToolPage() {
  // The layout shows the PIN form, but it does not stop this component from
  // running: without this guard the archive would be read and serialised into
  // the RSC payload for anyone who requests the URL. Verified by test.
  if (!(await isToolsAuthed())) return null;

  // Local disk when running on your machine; the OneDrive app folder when the
  // deployed site is serving it; nothing at all if neither is available.
  const source = await resolveSource();
  const settings = source === "local" ? await readToolSettings() : null;
  if (settings) await ensureArchive(settings.archiveRoot);

  const { index } = source === "none" ? { index: null } : await loadIndex();
  const odToken = isOneDriveConfigured() ? await readToken() : null;
  const oneDrive = {
    configured: isOneDriveConfigured(),
    linked: !!odToken,
    account: odToken?.account ?? "",
    linkedAt: odToken?.linkedAt ?? null,
    source,
  };

  const live = peekSession();
  const session = live ? await live.status() : { running: false, loggedIn: false };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-fg">WhatsApp Archive</h2>
          <p className="mt-1 max-w-2xl text-sm text-fg-muted">
            Your own copy of every chat. Backups only ever add — nothing is deleted here when it is
            deleted there.
          </p>
        </div>
        <Link href="/tools" className="text-sm text-fg-muted hover:text-fg">
          ← All tools
        </Link>
      </div>

      {index ? (
        <WhatsAppTool
          initial={{ settings, index, session, readOnly: source === "onedrive", oneDrive }}
        />
      ) : (
        <div className="rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <h3 className="text-base font-semibold text-fg">Nothing to read here yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
            Backups run on your own machine — they drive a real browser and write to a real disk.
            Link OneDrive there and this page will serve the archive from it on any device.
          </p>
          <p className="mx-auto mt-3 max-w-md text-xs text-fg-muted">
            On your machine: <code className="text-fg">npm run dev</code> →{" "}
            <code className="text-fg">/tools/whatsapp</code> → Settings → OneDrive.
          </p>
        </div>
      )}
    </div>
  );
}
