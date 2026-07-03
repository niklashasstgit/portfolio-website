"use client";

import dynamic from "next/dynamic";

// three.js can only run in the browser — skip prerendering entirely
const SimScene = dynamic(() => import("./SimScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="font-mono-tight text-xs uppercase tracking-widest text-fg-faint">
        loading 3D scene…
      </span>
    </div>
  ),
});

export default function SimViewer() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-bg-raised-2">
      <div className="h-[420px] w-full cursor-grab active:cursor-grabbing sm:h-[520px]">
        <SimScene />
      </div>
      <span className="font-mono-tight pointer-events-none absolute left-4 top-4 rounded-full border border-line bg-bg/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-fg-muted backdrop-blur">
        interactive — drag to rotate
      </span>
      <p className="border-t border-line px-4 py-3 text-xs leading-relaxed text-fg-faint">
        Recreation of the simulation environment: two to three ground cameras with overlapping
        fields of view over satellite terrain, tracking aircraft crossing the shared airspace.
      </p>
    </div>
  );
}
