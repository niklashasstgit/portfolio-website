import Image from "next/image";
import { MediaItem } from "@/content/types";

export default function MediaFrame({
  item,
  preload = false,
  sizes = "(min-width: 1024px) 640px, 100vw",
}: {
  item: MediaItem;
  preload?: boolean;
  sizes?: string;
}) {
  return (
    <figure className="group relative overflow-hidden rounded-lg border border-line bg-bg-raised">
      <div className="pointer-events-none absolute inset-0 z-10 bp-grid-fine opacity-[0.04]" />
      {item.type === "video" ? (
        <video
          src={item.src}
          className="aspect-video w-full object-cover"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="relative aspect-video w-full">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes={sizes}
            preload={preload}
            className={item.fit === "contain" ? "object-contain" : "object-cover"}
          />
        </div>
      )}
      {item.caption && (
        <figcaption className="border-t border-line px-4 py-2.5 font-mono-tight text-xs text-fg-muted">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}
