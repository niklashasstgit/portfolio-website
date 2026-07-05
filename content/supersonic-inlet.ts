import { Chapter } from "./types";

export const supersonicInletChapters: Chapter[] = [
  {
    id: "problem",
    kicker: "01 — The Problem",
    title: "Before a supersonic engine can burn air, the inlet has to tame it",
    body: [
      "An air-breathing engine flying at supersonic speed faces a hard requirement: the air reaching the combustor must be compressed and slowed to subsonic speed, efficiently, without wrecking the flow. That job belongs to the inlet — and for a ramjet or a supersonic missile it is decisive, because every percent of pressure lost in the inlet is thrust the engine never gets back.",
      "A supersonic inlet does this with a staged system of shock waves. Getting the ramp angles, their positions and the lip geometry right is a genuinely coupled aerodynamic problem, and iterating it in CFD from the very first sketch is far too slow for early design.",
      "This bachelor thesis, done at Diehl Defence, built an analytical Python tool for exactly that preliminary phase: from a handful of design constraints it lays out the shock system, sizes the geometry, reports every flow parameter along the way — and then analyses how that fixed geometry behaves off-design.",
    ],
    media: [
      {
        type: "image",
        src: "/images/supersonic-inlet/tool-geometry.png",
        alt: "Tool output showing a multi-ramp inlet geometry with its shock system and total-pressure recovery",
        caption: "Own tool output — a four-ramp inlet with its computed shock system and total-pressure recovery.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["Supersonic Inlets", "Ramjet", "Preliminary Design"],
  },
  {
    id: "shocks",
    kicker: "02 — Compression by Shock Waves",
    title: "A staircase of oblique shocks, then one normal shock",
    body: [
      "Each ramp of the inlet turns the flow and throws off an oblique shock; across every shock the flow slows and its static pressure jumps while some total pressure is lost. Stacking several weak oblique shocks — instead of one strong one — recovers far more total pressure, so the design is a compromise between compression, losses and length. A final normal shock at the throat drops the flow to subsonic for the combustor.",
      "The physics the tool encodes is textbook compressible flow — oblique-shock and normal-shock relations, Prandtl-Meyer expansion for the off-design turns — plus the design rule that at the on-design point every shock should focus exactly on the cowl lip (the 'shock-on-lip' condition) so no air spills and no extra drag is paid.",
      "A CFD Mach-number field makes the staircase visible: each ramp compresses the flow a little more (colour steps down) until the shocks converge on the lip.",
    ],
    media: [
      {
        type: "image",
        src: "/images/supersonic-inlet/mach-contour-t1.png",
        alt: "CFD Mach-number contour of a multi-ramp supersonic inlet",
        caption: "CFD Mach-number field — successive oblique shocks focusing on the cowl lip.",
        fit: "contain",
      },
    ],
    layout: "image-left",
    tags: ["Oblique Shocks", "Prandtl-Meyer", "Total Pressure Recovery"],
  },
  {
    id: "tool",
    kicker: "03 — The Design Tool",
    title: "Analytical, table-driven, and fast enough to sweep",
    body: [
      "The tool is organised around a case dictionary that carries the whole design. It reads the flight altitude and interpolates the ICAO standard atmosphere for the freestream conditions, then walks the ramps one shock at a time — feeding each shock's outputs into the next — and looks up the Prandtl-Meyer relation from a table for the expansion turns.",
      "From the resulting shock angles it sizes the inlet geometry for the shock-on-lip condition, adds the throat normal shock, prints every station's flow state to the console and writes it all to CSV. A whole design case solves in well under ten seconds, so a designer can sweep ramp counts and angles and immediately see the effect on total-pressure recovery.",
      "It then does a second pass off-design: keeping the geometry fixed but overriding Mach number, altitude or angle of attack, it recomputes the shock field so the inlet's efficiency can be judged across a range of flight conditions — not just its single design point. Below, the same inlet at its design point (left) and off-design (right).",
    ],
    media: [
      {
        type: "image",
        src: "/images/supersonic-inlet/tool-design-offdesign.png",
        alt: "Tool output comparing the inlet shock system on-design and off-design",
        caption: "Own tool output — design case (left) vs. off-design (right); shocks no longer meet the lip off-design.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["Python", "Standard Atmosphere", "Off-Design"],
  },
  {
    id: "cfd-setup",
    kicker: "04 — Validating with CFD",
    title: "Rebuilding each design in Ansys to see what the analysis left out",
    body: [
      "An analytical tool is only as good as its assumptions, so two designs generated by the tool were rebuilt and solved in CFD. The geometry was drawn in SpaceClaim, wrapped in a far-field domain, and meshed with deliberate care: the tips get the finest cells, a refined band follows the walls for the boundary layer, and a 25-layer prism stack sized for y+ below 5 resolves the near-wall gradients.",
      "The flow was solved in Ansys Fluent as a density-based, compressible, k-ω SST case with mesh adaption sharpening the shocks over the run. The refined mesh below shows the cells clustering exactly along the oblique shocks — a sign the solution is resolving the features that matter.",
    ],
    media: [
      {
        type: "image",
        src: "/images/supersonic-inlet/cfd-mesh.png",
        alt: "Refined CFD mesh clustering along the inlet's oblique shocks",
        caption: "CFD mesh after adaptive refinement — cells cluster along the shock lines and the walls.",
        fit: "contain",
      },
    ],
    layout: "image-left",
    tags: ["Ansys Fluent", "Meshing", "y+ / Prism Layer"],
  },
  {
    id: "comparison",
    kicker: "05 — Analytic vs. CFD",
    title: "Shock angles within 0.6°, flow parameters within a couple of percent",
    body: [
      "Across both test cases the analytical shock angles matched the CFD-measured angles to within 0.6° at every ramp, and Mach number, pressure, total pressure and temperature agreed to a few percent. The tool's Mach numbers sit slightly high — it ignores the boundary layer, which thickens the effective ramps and steepens the shocks a touch in CFD — but the offset is small and consistent.",
      "That is the whole point of the validation: it shows the simplifications baked into the analytical method cost very little accuracy, so the tool is reliable enough to stand in for CFD during preliminary design. Below, the CFD Mach field and the total-pressure field for a design case.",
    ],
    media: [
      {
        type: "image",
        src: "/images/supersonic-inlet/mach-contour-t2.png",
        alt: "CFD Mach-number contour for the second test case",
        caption: "CFD Mach-number field for a design case — shocks focused on the lip.",
        fit: "contain",
      },
      {
        type: "image",
        src: "/images/supersonic-inlet/total-pressure-t2.png",
        alt: "CFD total-pressure contour for the second test case",
        caption: "Total-pressure field — the quantity the whole inlet exists to preserve.",
        fit: "contain",
      },
    ],
    layout: "gallery",
    tags: ["Validation", "Shock Angle", "Total Pressure"],
  },
  {
    id: "offdesign",
    kicker: "06 — Off-Design",
    title: "What happens when the flight condition drifts off the design point",
    body: [
      "The real test of an inlet is how gracefully it degrades. Running one case off-design — dropping the freestream from Mach 3 to Mach 2.5 — the shocks no longer land on the lip and the recovery drops, and the tool's off-design pass predicted the new flow state in agreement with CFD. Being able to see that trade in seconds, rather than after an overnight CFD run, is what makes the tool useful in a design loop.",
    ],
    media: [
      {
        type: "image",
        src: "/images/supersonic-inlet/offdesign-mach.png",
        alt: "CFD Mach-number contour of the inlet operating off-design",
        caption: "CFD Mach field off-design — the shock system detaches from the cowl lip.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["Off-Design", "Spillage"],
  },
  {
    id: "schlieren",
    kicker: "07 — Ground Truth",
    title: "One more check: does the CFD itself match reality?",
    body: [
      "To make sure the CFD wasn't quietly validating the tool against another set of assumptions, the CFD method was itself checked against a wind-tunnel schlieren image from a NASA supersonic-inlet study. Rebuilt with the same meshing and solver settings, the simulated shock structure lines up almost exactly with the experiment — the leading oblique shock and the following bow shock sit right on top of the photographed ones.",
      "That closes the loop: the CFD reproduces reality, and the analytical tool reproduces the CFD.",
    ],
    media: [
      {
        type: "image",
        src: "/images/supersonic-inlet/cfd-vs-schlieren-overlay.png",
        alt: "Overlay of CFD Mach contour (top) against a wind-tunnel schlieren image (bottom)",
        caption: "CFD (top half) overlaid on a NASA wind-tunnel schlieren image (bottom half) — shocks coincide.",
        fit: "contain",
      },
    ],
    layout: "image-left",
    tags: ["Schlieren", "Experimental Validation"],
  },
  {
    id: "result",
    kicker: "08 — Result",
    title: "Seconds instead of overnight, accurate enough to trust",
    body: [
      "The finished tool turns a supersonic-inlet preliminary design — a task that otherwise means setting up CFD — into a sub-ten-second analytical run that a designer can iterate freely, backed by a CFD campaign that quantifies exactly how much accuracy the speed costs: very little. It hands the next design phase a geometry and a full flow map to start from, on-design and off-design alike.",
    ],
    layout: "text-only",
    tags: ["Tooling", "Result"],
  },
];
