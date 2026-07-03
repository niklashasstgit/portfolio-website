"use client";

import { useEffect, useRef, useState } from "react";
import { useGsap } from "@/lib/gsap";

/**
 * Full-viewport hero around the static-fire photo (drop the real shot at
 * /images/hero/static-fire.jpg — a procedural scene stands in until then).
 * At rest the canvas only adds a gentle shimmer and drifting sparks, so the
 * photo reads as the actual test. On scroll the section pins and the flame
 * detaches, curls into a ring, spins one turn like a loader, and vanishes to
 * reveal the projects.
 */

// smooth pseudo-noise from stacked sines — cheap and good enough for flicker
function noise(t: number, seed: number) {
  return (
    0.5 +
    0.28 * Math.sin(t * 1.7 + seed * 12.9) +
    0.16 * Math.sin(t * 4.3 + seed * 78.2) +
    0.06 * Math.sin(t * 9.1 + seed * 37.7)
  );
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

type DrawOpts = {
  /** vertical position of the plume axis as a fraction of height */
  oyFrac: number;
  /** scroll progress through the pinned transition, 0..1 */
  p: number;
  /** how strongly the flame is drawn at rest (subtle over the real photo) */
  restStrength: number;
};

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  sparks: Spark[],
  dt: number,
  { oyFrac, p, restStrength }: DrawOpts
) {
  ctx.clearRect(0, 0, w, h);

  // transition phases
  const rise = smoothstep(0, 0.15, p); // flame brightens to full
  const bend = smoothstep(0.18, 0.5, p); // straight plume curls into a ring
  const spinT = smoothstep(0.5, 0.85, p); // ring spins one full turn
  const vanish = smoothstep(0.85, 1, p); // ring collapses and fades
  const strength = (restStrength + (1 - restStrength) * rise) * (1 - vanish);
  if (strength <= 0.001) return;

  const spinPhase = spinT * Math.PI * 2 + t * 0.15;

  // straight-plume geometry
  const ox = w * 0.11;
  const oy = h * oyFrac;
  const plumeLen = w * 0.62;

  // ring geometry
  const cx = w * 0.5;
  const cy = h * 0.46;
  const R = Math.min(w, h) * 0.27 * (1 - 0.85 * vanish);

  // position of flame cell s ∈ [0,1], morphing line → circle
  const pathPoint = (s: number, jitter: number) => {
    const lx = ox + s * plumeLen;
    const ly = oy + jitter + s * h * 0.015;
    const a = -Math.PI / 2 + s * Math.PI * 2 + spinPhase;
    const rx = cx + Math.cos(a) * (R + jitter * 0.6);
    const ry = cy + Math.sin(a) * (R + jitter * 0.6);
    return [lx + (rx - lx) * bend, ly + (ry - ly) * bend] as const;
  };

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const flicker = 0.75 + 0.25 * noise(t * 2.2, 3);

  // ambient glow, drifting from the plume toward the ring centre
  const gx = ox + plumeLen * 0.35 + (cx - ox - plumeLen * 0.35) * bend;
  const gy = oy + (cy - oy) * bend;
  const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, plumeLen * 0.75);
  glow.addColorStop(0, `rgba(255, 120, 40, ${0.16 * flicker * strength})`);
  glow.addColorStop(0.5, `rgba(255, 80, 30, ${0.06 * flicker * strength})`);
  glow.addColorStop(1, "rgba(255, 60, 20, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // flame cells along the morphing path; the brightness falloff along s
  // reads as exhaust downstream, and as a comet tail once it's a ring
  const cells = 44;
  for (let i = 0; i < cells; i++) {
    const f = i / (cells - 1);
    const diamonds =
      0.55 + 0.45 * Math.sin(f * 34 - t * 2.1 - spinPhase * 3) * Math.exp(-f * 1.6 * (1 - bend));
    const turb = (noise(t * 3.5 + f * 6, i) - 0.5) * h * 0.02 * (0.3 + f) * (1 - bend * 0.6);
    const [x, y] = pathPoint(f, turb);
    const baseR =
      h * (0.012 + f * 0.075 * (1 - bend * 0.55)) * (0.85 + 0.3 * noise(t * 5, i * 3));
    const bright = (1 - f * 0.55) * (0.55 + 0.45 * diamonds) * flicker * strength;

    // hot core (white → yellow)
    let g = ctx.createRadialGradient(x, y, 0, x, y, baseR);
    g.addColorStop(0, `rgba(255, 250, 235, ${0.5 * bright})`);
    g.addColorStop(0.4, `rgba(255, 205, 120, ${0.32 * bright})`);
    g.addColorStop(1, "rgba(255, 140, 50, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, baseR, 0, Math.PI * 2);
    ctx.fill();

    // orange sheath, wider and fainter
    const sheathR = baseR * 2.4;
    g = ctx.createRadialGradient(x, y, 0, x, y, sheathR);
    g.addColorStop(0, `rgba(255, 130, 55, ${0.13 * bright})`);
    g.addColorStop(0.6, `rgba(255, 90, 60, ${0.05 * bright})`);
    g.addColorStop(1, "rgba(255, 70, 60, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, sheathR, 0, Math.PI * 2);
    ctx.fill();
  }

  // bright flash at the nozzle — only while the plume is still attached
  const nozzleA = flicker * strength * (1 - smoothstep(0.18, 0.35, p));
  if (nozzleA > 0.01) {
    const nozzleR = h * 0.035 * (0.9 + 0.2 * noise(t * 8, 7));
    const ng = ctx.createRadialGradient(ox, oy, 0, ox, oy, nozzleR * 2.5);
    ng.addColorStop(0, `rgba(255, 255, 250, ${0.9 * nozzleA})`);
    ng.addColorStop(0.35, `rgba(255, 220, 150, ${0.5 * nozzleA})`);
    ng.addColorStop(1, "rgba(255, 150, 60, 0)");
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(ox, oy, nozzleR * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // futuristic HUD accents while the ring exists: thin guide circle,
  // counter-rotating tick marks, and a few orbiting dots
  const hudA = bend * (1 - vanish);
  if (hudA > 0.01) {
    ctx.strokeStyle = `rgba(82, 217, 196, ${0.28 * hudA})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.28, 0, Math.PI * 2);
    ctx.stroke();

    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2 - spinPhase * 0.5;
      const r1 = R * 1.28;
      const r2 = R * (k % 6 === 0 ? 1.36 : 1.32);
      ctx.strokeStyle = `rgba(82, 217, 196, ${(k % 6 === 0 ? 0.4 : 0.2) * hudA})`;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }

    for (let k = 0; k < 3; k++) {
      const a = spinPhase * 1.6 + (k / 3) * Math.PI * 2;
      const dg = ctx.createRadialGradient(
        cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12, 0,
        cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12, 6
      );
      dg.addColorStop(0, `rgba(180, 255, 240, ${0.9 * hudA})`);
      dg.addColorStop(1, "rgba(82, 217, 196, 0)");
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 1.12, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // sparks: streaks flying downstream; they die out as the flame lifts off
  const sparkA = strength * (1 - bend);
  for (const s of sparks) {
    s.life -= dt;
    if (s.life <= 0) {
      const f = Math.random() ** 1.6;
      s.x = ox + f * plumeLen * (0.3 + Math.random() * 0.9);
      s.y = oy + (Math.random() - 0.5) * h * 0.06 * (0.4 + f);
      const speed = w * (0.12 + Math.random() * 0.3);
      const ang = (Math.random() - 0.5) * 0.5;
      s.vx = Math.cos(ang) * speed;
      s.vy = Math.sin(ang) * speed - h * 0.02 * Math.random();
      s.maxLife = 0.5 + Math.random() * 1.4;
      s.life = s.maxLife;
      s.size = 0.6 + Math.random() * 1.4;
    }
    if (sparkA <= 0.01) continue;
    s.vy += h * 0.12 * dt; // gravity
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    const a = Math.max(0, s.life / s.maxLife) * sparkA;
    ctx.strokeStyle = `rgba(255, ${170 + Math.floor(60 * a)}, ${
      80 + Math.floor(100 * a)
    }, ${0.55 * a})`;
    ctx.lineWidth = s.size;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03);
    ctx.stroke();
  }

  ctx.restore();
}

function TestStandSilhouette() {
  // simplified motor-on-test-stand silhouette, drawn where the plume starts
  return (
    <svg
      viewBox="0 0 220 160"
      aria-hidden
      style={{ top: "var(--plume-y, 24%)" }}
      className="pointer-events-none absolute left-[1%] w-[13%] -translate-y-[46%]"
    >
      {/* stand frame */}
      <path d="M30 150 L58 62 L66 62 L44 150 Z" fill="#05070a" />
      <path d="M96 150 L70 62 L78 62 L108 150 Z" fill="#05070a" />
      <rect x="20" y="148" width="120" height="6" rx="2" fill="#05070a" />
      {/* motor casing */}
      <rect x="38" y="52" width="118" height="34" rx="8" fill="#0b0f14" />
      <rect x="38" y="52" width="118" height="34" rx="8" fill="url(#casing)" />
      <rect x="150" y="58" width="16" height="22" rx="3" fill="#080b0f" />
      {/* nozzle */}
      <path d="M166 60 L190 54 L190 84 L166 78 Z" fill="#05070a" />
      <defs>
        <linearGradient id="casing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(150,170,190,0.28)" />
          <stop offset="0.5" stopColor="rgba(90,105,120,0.12)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.35)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function StaticFireHero({ children }: { children?: React.ReactNode }) {
  const { gsap, ScrollTrigger } = useGsap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLAnchorElement | null>(null);
  const progressRef = useRef(0);
  const [photoOk, setPhotoOk] = useState(false);
  const photoOkRef = useRef(false);

  // probe for the real test photo after mount — a server-rendered <img> that
  // 404s would fire its error event before hydration, so onError can't be
  // relied on here
  useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => {
      photoOkRef.current = true;
      setPhotoOk(true);
    };
    probe.src = "/images/hero/static-fire.jpg";
  }, []);

  // pin the hero and drive the flame-to-ring transition with scroll
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // gsap.context so revert() fully undoes the pin DOM changes — a plain
    // st.kill() leaves the pin-spacer behind and StrictMode's second effect
    // run then measures a zero-width layout
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 0.6,
        // a nudge past the start runs the full turn on its own and reveals
        // the projects — "loads shortly, then disappears"
        snap: {
          snapTo: (v) => (v < 0.2 ? 0 : 1),
          duration: { min: 0.5, max: 1.4 },
          ease: "power2.inOut",
          delay: 0.1,
        },
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    });
    return () => ctx.revert();
  }, [gsap, ScrollTrigger]);

  // canvas animation loop; also applies the scroll-progress fades to the
  // photo, copy and scroll cue so everything stays in one rAF
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let oyFrac = 0.24;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (photoOkRef.current) {
        // align with the plume in the photo (roughly mid-frame); the overlay
        // is subtle enough that text below stays readable
        oyFrac = 0.45;
      } else {
        // keep the procedural plume clear of the hero copy
        const content = contentRef.current;
        if (content && h > 0) {
          const contentTop = content.getBoundingClientRect().top - rect.top;
          oyFrac = Math.min(0.28, Math.max(0.1, contentTop / h - 0.14));
        }
      }
      canvas.parentElement?.style.setProperty("--plume-y", `${oyFrac * 100}%`);
    };
    resize();
    window.addEventListener("resize", resize);

    const sparks: Spark[] = Array.from({ length: 110 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1,
    }));

    let raf = 0;
    let last = performance.now();
    let running = true;

    const applyDomFades = (p: number) => {
      const contentA = 1 - smoothstep(0, 0.18, p);
      const content = contentRef.current;
      if (content) {
        content.style.opacity = String(contentA);
        content.style.transform = `translateY(${-p * 120}px)`;
      }
      const photo = photoRef.current;
      if (photo) photo.style.opacity = String(0.62 * (1 - smoothstep(0.05, 0.3, p)));
      const backdrop = backdropRef.current;
      if (backdrop) backdrop.style.opacity = String(1 - smoothstep(0.05, 0.3, p));
      const cue = cueRef.current;
      if (cue) cue.style.opacity = String(contentA);
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = progressRef.current;
      applyDomFades(p);
      drawScene(ctx, w, h, now / 1000, sparks, dt, {
        oyFrac,
        p,
        restStrength: photoOkRef.current ? 0.3 : 1,
      });
      raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      // single static frame, no loop
      drawScene(ctx, w, h, 1.234, sparks, 0.016, {
        oyFrac,
        p: 0,
        restStrength: photoOkRef.current ? 0.3 : 1,
      });
    } else {
      const io = new IntersectionObserver(([entry]) => {
        const visible = entry.isIntersecting && !document.hidden;
        if (visible && !running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      });
      io.observe(canvas);
      raf = requestAnimationFrame(frame);
      return () => {
        running = false;
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener("resize", resize);
      };
    }
    return () => window.removeEventListener("resize", resize);
  }, [photoOk]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden border-b border-line"
    >
      {/* backdrop: real test photo when available, procedural scene otherwise */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_45%,#151a22_0%,#0c1016_45%,#07090d_100%)]" />
      {photoOk && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={photoRef}
          src="/images/hero/static-fire.jpg"
          alt="Static fire test of a solid rocket motor"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.62]"
        />
      )}
      <div ref={backdropRef} className="absolute inset-0">
        <div className="bp-grid absolute inset-0 opacity-[0.04]" />
        {!photoOk && <TestStandSilhouette />}
      </div>

      {/* animated flame — plume at rest, loading ring while scrolling */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full will-change-transform"
      />

      {/* legibility gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg" />

      {/* content */}
      <div
        ref={contentRef}
        className="relative mx-auto mt-auto w-full max-w-6xl px-5 pb-28 pt-40 sm:px-8"
      >
        <span className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
          Aerospace Engineer
        </span>
        <h1 className="text-balance mt-5 max-w-3xl text-4xl font-semibold leading-tight text-fg [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] sm:text-6xl">
          Building things that fly, orbit, burn, and learn.
        </h1>
        {children}
      </div>

      {/* scroll cue */}
      <a
        ref={cueRef}
        href="#projects"
        aria-label="Scroll to projects"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-fg-faint transition-colors hover:text-accent"
      >
        <svg width="22" height="30" viewBox="0 0 22 30" fill="none" aria-hidden>
          <rect x="1" y="1" width="20" height="28" rx="10" stroke="currentColor" strokeWidth="1.5" />
          <circle className="animate-bounce" cx="11" cy="10" r="3" fill="currentColor" />
        </svg>
      </a>
    </section>
  );
}
