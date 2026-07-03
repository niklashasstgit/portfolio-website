const CAMERAS = [
  {
    label: "SkyCam-1 (Xiaomi)",
    color: "#20d4ff",
    lat: 47.838522,
    lon: 9.6602,
    fovH: 34.0,
    x: 90,
    y: 300,
  },
  {
    label: "SkyCam-2 (Vivo)",
    color: "#ff9f40",
    lat: 47.8024,
    lon: 9.63916,
    fovH: 35.6,
    x: 340,
    y: 320,
  },
];

// baseline distance from the two cameras' real lat/lon (haversine, flat-earth approx over ~4km)
const BASELINE_KM = 4.3;

function conePoints(x: number, y: number, aimX: number, aimY: number, halfAngleDeg: number, length: number) {
  const dx = aimX - x;
  const dy = aimY - y;
  const base = Math.atan2(dy, dx);
  const half = (halfAngleDeg * Math.PI) / 180;
  // round to fixed decimals so SSR and client render identical markup
  const r = (n: number) => n.toFixed(2);
  const p1 = [x + length * Math.cos(base - half), y + length * Math.sin(base - half)];
  const p2 = [x + length * Math.cos(base + half), y + length * Math.sin(base + half)];
  return `${x},${y} ${r(p1[0])},${r(p1[1])} ${r(p2[0])},${r(p2[1])}`;
}

export default function CameraFovDiagram() {
  const targetX = 215;
  const targetY = 70;

  return (
    <div className="rounded-lg border border-line bg-bg-raised p-5">
      <svg viewBox="0 0 430 360" className="w-full">
        <defs>
          <pattern id="fov-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="var(--color-line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="430" height="360" fill="url(#fov-grid)" />

        {CAMERAS.map((c) => (
          <polygon
            key={c.label}
            points={conePoints(c.x, c.y, targetX, targetY, c.fovH / 2, 320)}
            fill={c.color}
            opacity="0.12"
            stroke={c.color}
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        ))}

        {/* tracked object at convergence */}
        <circle cx={targetX} cy={targetY} r="5" fill="var(--color-accent)" />
        <text x={targetX + 10} y={targetY - 6} fill="var(--color-fg)" fontSize="10" fontFamily="var(--font-geist-mono)">
          triangulated position
        </text>

        {/* baseline */}
        <line
          x1={CAMERAS[0].x}
          y1={CAMERAS[0].y}
          x2={CAMERAS[1].x}
          y2={CAMERAS[1].y}
          stroke="var(--color-fg-faint)"
          strokeDasharray="4 4"
        />
        <text
          x={(CAMERAS[0].x + CAMERAS[1].x) / 2 - 26}
          y={(CAMERAS[0].y + CAMERAS[1].y) / 2 + 16}
          fill="var(--color-fg-muted)"
          fontSize="10"
          fontFamily="var(--font-geist-mono)"
        >
          baseline ≈ {BASELINE_KM} km
        </text>

        {CAMERAS.map((c) => (
          <g key={c.label}>
            <circle cx={c.x} cy={c.y} r="5" fill={c.color} />
            <text
              x={c.x}
              y={c.y + 20}
              textAnchor="middle"
              fill="var(--color-fg-muted)"
              fontSize="10"
              fontFamily="var(--font-geist-mono)"
            >
              {c.label}
            </text>
            <text
              x={c.x}
              y={c.y + 33}
              textAnchor="middle"
              fill="var(--color-fg-faint)"
              fontSize="9"
              fontFamily="var(--font-geist-mono)"
            >
              FOV {c.fovH.toFixed(1)}°
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-3 font-mono-tight text-[11px] text-fg-faint">
        Recreated schematic from camera_specs.json — real FOV and baseline geometry, redrawn (site does not
        include on-site photos yet).
      </p>
    </div>
  );
}
