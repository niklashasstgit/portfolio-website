// Recreated schematic of the FOV calibration method: camera at a measured
// distance D from a flat wall with marks at known spacing; the angle each
// mark subtends from the optical axis gives fov_horizontal/vertical_deg.
export default function CalibrationWallDiagram() {
  const camX = 40;
  const camY = 210;
  const wallX = 360;
  const marks = [-3, -2, -1, 0, 1, 2, 3];
  const spacingPx = 24;
  const wallTop = 40;
  const wallBottom = 320;
  const midY = (wallTop + wallBottom) / 2;

  return (
    <div className="rounded-lg border border-line bg-bg-raised p-5">
      <svg viewBox="0 0 400 360" className="w-full">
        {/* wall */}
        <line x1={wallX} y1={wallTop} x2={wallX} y2={wallBottom} stroke="var(--color-line-strong, #333)" strokeWidth="3" />
        {marks.map((m) => {
          const y = midY + m * spacingPx;
          return (
            <g key={m}>
              <line x1={wallX - 6} y1={y} x2={wallX + 6} y2={y} stroke="var(--color-fg-faint)" strokeWidth="1" />
            </g>
          );
        })}
        <text x={wallX + 12} y={wallTop - 10} fill="var(--color-fg-muted)" fontSize="10" fontFamily="var(--font-geist-mono)">
          wall, marks at known spacing s
        </text>

        {/* camera */}
        <rect x={camX - 10} y={camY - 8} width="20" height="16" rx="2" fill="var(--color-accent)" />
        <text x={camX} y={camY + 30} textAnchor="middle" fill="var(--color-fg-muted)" fontSize="10" fontFamily="var(--font-geist-mono)">
          camera
        </text>

        {/* optical axis */}
        <line x1={camX} y1={camY} x2={wallX} y2={midY} stroke="var(--color-fg-faint)" strokeDasharray="3 4" />

        {/* sight lines to extreme marks -> measured half-FOV angle */}
        <line x1={camX} y1={camY} x2={wallX} y2={midY - 3 * spacingPx} stroke="var(--color-accent-2)" strokeWidth="1.4" />
        <line x1={camX} y1={camY} x2={wallX} y2={midY + 3 * spacingPx} stroke="var(--color-accent-2)" strokeWidth="1.4" />

        {/* distance D */}
        <line x1={camX} y1={camY + 60} x2={wallX} y2={camY + 60} stroke="var(--color-fg-faint)" strokeWidth="1" markerEnd="url(#arrow)" />
        <text x={(camX + wallX) / 2} y={camY + 74} textAnchor="middle" fill="var(--color-fg-muted)" fontSize="10" fontFamily="var(--font-geist-mono)">
          measured distance D
        </text>

        {/* angle label */}
        <text x={camX + 46} y={camY - 34} fill="var(--color-accent-2)" fontSize="11" fontFamily="var(--font-geist-mono)">
          θ = atan((n·s / 2) / D)
        </text>
      </svg>
      <p className="mt-3 font-mono-tight text-[11px] text-fg-faint">
        Recreated schematic of the wall-calibration method — sighting evenly spaced marks at a measured
        distance to solve for each camera&apos;s true horizontal/vertical field of view.
      </p>
    </div>
  );
}
