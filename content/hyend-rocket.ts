import { Chapter } from "./types";

export const hyendRocketChapters: Chapter[] = [
  {
    id: "intro",
    kicker: "01 — The Team",
    title: "HyEnD — Hybrid Engine Development, University of Stuttgart",
    body: [
      "HyEnD is the University of Stuttgart's student rocketry team, developing hybrid rocket engines end to end. I worked in the propulsion/structures pole from October 2023 to January 2025.",
      "This page is still being filled in with real build and test photos — for now, here's what the work actually involved.",
    ],
    layout: "text-only",
    tags: ["HyEnD", "University of Stuttgart", "Hybrid Propulsion"],
  },
  {
    id: "propellant",
    kicker: "02 — Propellant Development",
    title: "Solid propellant grain development and testing",
    body: [
      "Hybrid engines pair a solid fuel grain with a liquid or gaseous oxidiser. Part of my work went into developing and testing the solid propellant side — grain formulation and characterisation ahead of static-fire testing.",
    ],
    layout: "text-only",
    tags: ["Solid Propellant", "Grain Design"],
  },
  {
    id: "injector",
    kicker: "03 — Injector & Performance Modelling",
    title: "Sizing the injector, modelling combustion performance",
    body: [
      "On the analysis side, I worked on two-phase-flow injector sizing and performance prediction: dimensioning the fuel segment, running O/F-ratio sweeps to find the operating point, and using NASA CEA-based combustion models to predict engine performance ahead of test firings — checking the design on paper before committing hardware to it.",
    ],
    layout: "text-only",
    tags: ["Injector Design", "Two-Phase Flow", "NASA CEA", "Matlab"],
  },
  {
    id: "structures",
    kicker: "04 — Structures",
    title: "Carbon-reinforced tank and combustion chamber construction",
    body: [
      "On the structures side: engine design and build, plus carbon-fibre-reinforced construction of the propellant tank and combustion chamber — the pressure vessels that have to survive both the structural loads and the thermal environment of a firing engine.",
    ],
    layout: "text-only",
    tags: ["Composites", "Pressure Vessels", "Engine Build"],
  },
];
