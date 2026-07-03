// Recreated schematic of a tilt-rotor VTOL transition sequence:
// vertical hover -> transition -> wing-borne forward flight.
const STAGES = [
  { x: 60, label: "hover", tilt: 90 },
  { x: 215, label: "transition", tilt: 45 },
  { x: 370, label: "forward flight", tilt: 0 },
];

function Rotor({ x, y, tiltDeg }: { x: number; y: number; tiltDeg: number }) {
  const rad = (tiltDeg * Math.PI) / 180;
  const len = 26;
  const dx = len * Math.sin(rad);
  const dy = -len * Math.cos(rad);
  return (
    <g>
      <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke="var(--color-accent-2)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={x} cy={y} r="4" fill="var(--color-accent)" />
    </g>
  );
}

export default function VtolTransitionDiagram() {
  return (
    <div className="rounded-lg border border-line bg-bg-raised p-5">
      <svg viewBox="0 0 430 200" className="w-full">
        <line x1="20" y1="150" x2="410" y2="150" stroke="var(--color-line)" strokeWidth="1" />
        {STAGES.map((s) => (
          <g key={s.label}>
            {/* fuselage */}
            <rect x={s.x - 24} y="122" width="48" height="10" rx="4" fill="var(--color-fg-faint)" opacity="0.5" />
            <Rotor x={s.x - 20} y={127} tiltDeg={s.tilt} />
            <Rotor x={s.x + 20} y={127} tiltDeg={s.tilt} />
            <text
              x={s.x}
              y={172}
              textAnchor="middle"
              fill="var(--color-fg-muted)"
              fontSize="10"
              fontFamily="var(--font-geist-mono)"
            >
              {s.label}
            </text>
            <text
              x={s.x}
              y={186}
              textAnchor="middle"
              fill="var(--color-fg-faint)"
              fontSize="9"
              fontFamily="var(--font-geist-mono)"
            >
              rotor tilt {s.tilt}°
            </text>
          </g>
        ))}
        <path
          d="M100 100 C 160 80, 190 80, 215 70"
          fill="none"
          stroke="var(--color-fg-faint)"
          strokeDasharray="3 4"
          markerEnd="url(#arrow2)"
        />
        <path
          d="M255 70 C 290 80, 320 100, 350 100"
          fill="none"
          stroke="var(--color-fg-faint)"
          strokeDasharray="3 4"
        />
      </svg>
      <p className="mt-3 font-mono-tight text-[11px] text-fg-faint">
        Recreated schematic of the tilt-rotor transition concept from the VTOL thesis — rotor
        thrust vector rotates from fully vertical (hover) to fully horizontal (forward flight).
      </p>
    </div>
  );
}
