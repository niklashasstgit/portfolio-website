import { Chapter } from "./types";

export const burnSimulationChapters: Chapter[] = [
  {
    id: "problem",
    kicker: "01 — The Problem",
    title: "A solid motor's thrust is locked in the moment you choose the grain",
    body: [
      "A solid rocket motor has no throttle. Once the propellant grain is cast, its entire thrust-versus-time curve is fixed — set by the propellant chemistry and, above all, by the geometry of the burning surface. Get the geometry right and you get the thrust profile you designed for; get it wrong and you find out on the test stand.",
      "That makes fast, trustworthy internal-ballistics prediction the heart of preliminary motor design. The existing in-house code had grown up around a single grain shape and had become tangled and hard to extend. The goal of this project — carried out during an industry placement at Diehl Defence — was to rebuild it on a clean foundation: one generic tool that reads a grain geometry and a propellant, iterates the burn, and returns thrust, chamber pressure, burn time and specific impulse.",
      "The result is a modular Python tool that steps through the burn in configurable time increments and, for any supported grain, turns geometry into a full performance prediction.",
    ],
    media: [
      {
        type: "image",
        src: "/images/burn-simulation/program-flow.png",
        alt: "Program flow chart of the burn simulation tool",
        caption: "Solver loop: read inputs, compute per-grain surface & volume, apply ideal-rocket relations, regress one time step, repeat.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["Internal Ballistics", "Python", "Preliminary Design"],
  },
  {
    id: "regression",
    kicker: "02 — How a Solid Motor Burns",
    title: "The surface recedes, and the whole simulation follows from that",
    body: [
      "A solid grain burns from its exposed surface inward. Each time step, the surface recedes by a small amount — the regression — set by Saint-Robert's burn-rate law, which ties burn rate to the local chamber pressure through two propellant-specific coefficients. New gas is generated in proportion to the burning area; that gas raises the chamber pressure; the pressure drives the nozzle flow and, with it, the thrust.",
      "So everything hinges on one question asked over and over: for the current amount of regression, how much surface is still burning, and how much propellant volume is left? Answer that for every time step and you can integrate the entire firing.",
      "The tool draws each geometry as it burns, which was invaluable for catching errors. Below, a double-cylinder grain is shown in its initial state and after 4 mm of regression — red is the remaining propellant.",
    ],
    media: [
      {
        type: "image",
        src: "/images/burn-simulation/draw-double-cylinder.png",
        alt: "Python cross-section drawing of a double-cylinder grain, remaining propellant in red",
        caption: "Own tool output — remaining propellant (red) of a double-cylinder grain as it regresses.",
        fit: "contain",
      },
    ],
    layout: "image-left",
    tags: ["Saint-Robert's Law", "Regression", "Chamber Pressure"],
  },
  {
    id: "geometries",
    kicker: "03 — A Library of Grain Shapes",
    title: "One tool, many geometries — each with its own surface-area maths",
    body: [
      "Different grain shapes give different thrust signatures: an end-burner burns a constant circular face for a long, low, steady thrust; a hollow cylinder burns its inner bore (and optionally its end faces) and can be tuned to a near-neutral profile; a double cylinder balances a shrinking inner surface against a growing outer one for a flat curve without fine-tuning.",
      "Each geometry is its own class that knows how to compute its burning surface and remaining volume as a function of regression, defined by a small, documented parameter set. New shapes drop in without touching the solver.",
    ],
    media: [
      {
        type: "image",
        src: "/images/burn-simulation/grain-cylinder.png",
        alt: "Technical drawing of a hollow-cylinder grain",
        caption: "Hollow-cylinder grain — burns the inner bore, optionally the end faces.",
        fit: "contain",
      },
      {
        type: "image",
        src: "/images/burn-simulation/grain-double-cylinder.png",
        alt: "Technical drawing of a double-cylinder grain",
        caption: "Double cylinder — a solid core inside a hollow tube, for a naturally flat thrust profile.",
        fit: "contain",
      },
      {
        type: "image",
        src: "/images/burn-simulation/grain-star.png",
        alt: "Technical drawing of a star grain cross-section and side view",
        caption: "Star grain — a large burning surface and high volumetric loading, used in roughly 40% of all SRMs.",
        fit: "contain",
      },
    ],
    layout: "gallery",
    tags: ["Grain Design", "End-Burner", "Cylinder", "Star"],
  },
  {
    id: "star",
    kicker: "04 — The Star Grain",
    title: "The star is where the geometry gets genuinely hard",
    body: [
      "The star grain is the most rewarding and the most difficult shape. It's fully described by seven parameters (number of points, tip and fillet radii, point height and angle, diameters, length), and its burning contour passes through four distinct phases as it recedes — segments of the profile appear and vanish, and by choosing the point angle correctly the surface can be held nearly neutral through a phase.",
      "Rather than mesh the whole cross-section, the tool exploits symmetry and solves just half a star point analytically: it decomposes the contour into circular-arc and straight segments, tracks which segments exist in the current burn phase, and sums their lengths — then scales up by the number of points. Volume comes from integrating the same contour analytically. The burn-surface curve it produces matches the classic NASA star-grain reference in shape, confirming the geometry maths.",
    ],
    media: [
      {
        type: "image",
        src: "/images/burn-simulation/star-burn-phases.png",
        alt: "Star grain half-segment swept through many regression steps",
        caption: "Own output — one star segment (half a point) swept through successive regression steps.",
        fit: "contain",
      },
      {
        type: "image",
        src: "/images/burn-simulation/star-wedge.png",
        alt: "Star grain segment with remaining propellant highlighted in red",
        caption: "The analysed wedge — remaining propellant in red at one regression step.",
        fit: "contain",
      },
      {
        type: "image",
        src: "/images/burn-simulation/burn-surface-star.png",
        alt: "Plot of burning surface area over regression for a star grain",
        caption: "Burning surface vs. regression for a star grain — the discontinuities are the phase transitions.",
        fit: "contain",
      },
    ],
    layout: "gallery",
    tags: ["Star Grain", "Analytic Geometry", "NASA SP-8076"],
  },
  {
    id: "thrust",
    kicker: "05 — From Geometry to Thrust",
    title: "Wrapping the geometry in ideal-rocket theory",
    body: [
      "With burning surface and free volume known at every step, the solver applies ideal-rocket relations — mass generation, gas mass balance, exhaust velocity through the expansion ratio, and thrust with its pressure term — to march the firing forward in time. Efficiency factors for the nozzle and combustion fold real-world losses into the ideal result.",
      "The output is a set of plots and a statistics sheet: thrust and pressure over time, plus regression-dependent curves of burning surface, propellant mass and volume, and headline numbers like peak and average thrust, total impulse, burn time and specific impulse — all also written to CSV for downstream tools. Below: a thrust curve for a tuned cylinder grain, and the burning-surface history of a star-plus-cylinder combination.",
    ],
    media: [
      {
        type: "image",
        src: "/images/burn-simulation/thrust-cylinder.png",
        alt: "Thrust over time plot for a cylinder-grain motor",
        caption: "Own output — thrust over time for a near-neutral cylinder-grain configuration.",
        fit: "contain",
      },
      {
        type: "image",
        src: "/images/burn-simulation/burn-surface-combo.png",
        alt: "Burning surface over regression for a star and cylinder grain combination",
        caption: "Burning surface vs. regression for a combined star + cylinder grain.",
        fit: "contain",
      },
    ],
    layout: "gallery",
    tags: ["Ideal Rocket Theory", "Thrust Curve", "Specific Impulse"],
  },
  {
    id: "validation",
    kicker: "06 — Validation",
    title: "Checking the prediction against a real firing",
    body: [
      "For validation the tool was run on a small motor built from three identical hollow-cylinder grains, for which measured thrust data existed. The simulation reproduces the correct impulse and burn duration; the measured curve is peakier and rises more slowly, which is exactly what the model's assumptions predict — real ignition isn't instantaneous, real grains aren't perfectly centred, and the burn-rate coefficients are themselves only approximate.",
      "Because the tool deliberately simulates an idealised firing, those differences are expected and acceptable for preliminary design: it gets impulse and specific impulse right and puts the thrust and pressure in the right envelope, which is what the early design phase needs.",
    ],
    media: [
      {
        type: "image",
        src: "/images/burn-simulation/testcase-thrust.png",
        alt: "Simulated thrust curve for the validation test case",
        caption: "Own output — simulated thrust curve for the three-grain validation motor.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["Test Firing", "Validation"],
  },
  {
    id: "result",
    kicker: "07 — Result",
    title: "A clean, generic tool that made it into the design toolchain",
    body: [
      "The rebuilt tool does what it set out to: it takes an arbitrary grain geometry and propellant and returns a full internal-ballistics prediction in seconds, flexible enough to sweep configurations and find one that meets a thrust requirement. The flexible star-grain implementation in particular turned a single-shape script into a genuinely general preliminary-design tool — and it was successfully adopted into the motor-design workflow.",
    ],
    layout: "text-only",
    tags: ["Tooling", "Result"],
  },
];
