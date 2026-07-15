"use client";

import { useState } from "react";

export type VisitDetails = {
  browser: string;
  os: string;
  deviceType: string;
  screen: string;
  viewport: string;
  language: string;
  timezone: string;
  ua: string;
  asn: string;
  ref: string;
};

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
        {label}
      </span>
      <span className="text-right text-xs text-fg-muted">{value}</span>
    </div>
  );
}

/**
 * "Investigate" toggle — the extra device/browser detail (browser, OS, screen,
 * language, timezone, raw UA…) is captured on every visit but kept out of the
 * main tables; this expands it inline only when you want to dig into one row.
 */
export default function VisitDetail({ details }: { details: VisitDetails }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint transition-colors hover:text-accent"
      >
        {open ? "Hide ▴" : "Investigate ▾"}
      </button>
      {open && (
        <div className="mt-2 w-64 rounded-lg border border-line bg-bg-raised/60 px-3 py-2">
          <Row label="Browser" value={details.browser} />
          <Row label="OS" value={details.os} />
          <Row label="Device" value={details.deviceType} />
          <Row label="Screen" value={details.screen} />
          <Row label="Viewport" value={details.viewport} />
          <Row label="Language" value={details.language} />
          <Row label="Timezone" value={details.timezone} />
          <Row label="ASN" value={details.asn} />
          <Row label="Referrer" value={details.ref} />
          {details.ua && (
            <div className="mt-1.5 break-all border-t border-line pt-1.5 text-[10px] text-fg-faint">
              {details.ua}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
