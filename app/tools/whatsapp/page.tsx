import type { Metadata } from "next";
import Link from "next/link";
import WhatsAppTool from "@/components/tools/whatsapp/WhatsAppTool";
import { isLocalRuntime, readToolSettings } from "@/lib/tools/whatsapp/settings";
import { ensureArchive, readIndex } from "@/lib/tools/whatsapp/vault";
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

  const local = isLocalRuntime();
  const settings = local ? await readToolSettings() : null;

  if (settings) await ensureArchive(settings.archiveRoot);
  const index = settings ? await readIndex(settings.archiveRoot) : null;
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

      {settings && index ? (
        <WhatsAppTool initial={{ settings, index, session }} />
      ) : (
        <div className="rounded-2xl border border-line bg-bg-raised p-8 text-center">
          <h3 className="text-base font-semibold text-fg">This tool runs on your own machine</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
            It drives a real browser and writes to a real disk, so it needs to run locally. Your
            archive never leaves your computer.
          </p>
          <p className="mx-auto mt-3 max-w-md text-xs text-fg-muted">
            Start the site with <code className="text-fg">npm run dev</code> and open{" "}
            <code className="text-fg">/tools/whatsapp</code> there.
          </p>
        </div>
      )}
    </div>
  );
}
