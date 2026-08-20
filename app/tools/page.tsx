import Link from "next/link";
import { isToolsAuthed } from "@/lib/tools/auth";

/**
 * The toolbox index. Each tool is a tile; tools that do not exist yet are
 * shown greyed out so the shape of the panel is visible from day one.
 */

interface Tool {
  slug: string;
  name: string;
  blurb: string;
  icon: React.ReactNode;
  ready: boolean;
}

const WhatsAppIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
    <path
      d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M8.6 7.4c.3-.1.6 0 .8.3l.9 1.5c.1.3.1.6-.1.8l-.5.6c-.1.2-.2.4 0 .7.5.9 1.3 1.7 2.2 2.2.3.2.5.1.7-.1l.6-.5c.2-.2.5-.2.8-.1l1.5.9c.3.2.4.5.3.8-.2.8-1 1.4-1.9 1.4-2.9 0-6.5-3.6-6.5-6.5 0-.9.5-1.7 1.2-2Z"
      fill="currentColor"
    />
  </svg>
);

const PlaceholderIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const TOOLS: Tool[] = [
  {
    slug: "whatsapp",
    name: "WhatsApp Archive",
    blurb: "Back up every chat, keep every version, read them all here.",
    icon: WhatsAppIcon,
    ready: true,
  },
  {
    slug: "files",
    name: "File Converter",
    blurb: "Batch conversions without uploading anything anywhere.",
    icon: PlaceholderIcon,
    ready: false,
  },
  {
    slug: "vault",
    name: "Link Vault",
    blurb: "Saved links and notes, searchable, kept off other people's servers.",
    icon: PlaceholderIcon,
    ready: false,
  },
  {
    slug: "photos",
    name: "Photo Backup",
    blurb: "Mirror phone albums into the same archive folder.",
    icon: PlaceholderIcon,
    ready: false,
  },
];

export default async function ToolsIndexPage() {
  // Same reasoning as the WhatsApp page: the layout's gate does not stop this
  // from rendering into the payload.
  if (!(await isToolsAuthed())) return null;

  return (
    <div>
      <p className="max-w-2xl text-sm text-fg-muted">
        Private utilities that run on this machine. They read and write local files, so they work
        while the site is running on your own computer.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) =>
          tool.ready ? (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-2xl border border-line bg-bg-raised p-5 transition-colors hover:border-accent"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/12 text-accent">
                {tool.icon}
              </span>
              <h2 className="mt-4 text-base font-semibold text-fg">{tool.name}</h2>
              <p className="mt-1 text-sm text-fg-muted">{tool.blurb}</p>
              <span className="mt-4 inline-block font-mono-tight text-[10px] uppercase tracking-[0.2em] text-accent">
                Open →
              </span>
            </Link>
          ) : (
            <div
              key={tool.slug}
              aria-disabled
              className="rounded-2xl border border-dashed border-line bg-bg-raised/40 p-5 opacity-55"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-fg/5 text-fg-muted">
                {tool.icon}
              </span>
              <h2 className="mt-4 text-base font-semibold text-fg">{tool.name}</h2>
              <p className="mt-1 text-sm text-fg-muted">{tool.blurb}</p>
              <span className="mt-4 inline-block font-mono-tight text-[10px] uppercase tracking-[0.2em] text-fg-muted">
                Soon
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
