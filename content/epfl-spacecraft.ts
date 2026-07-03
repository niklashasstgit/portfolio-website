import { Chapter } from "./types";

export const epflSpacecraftChapters: Chapter[] = [
  {
    id: "intro",
    kicker: "01 — The Team",
    title: "EPFL Spacecraft Team — Structures Pole",
    body: [
      "During my exchange semester at EPFL (Feb–Aug 2025), I joined the EPFL Spacecraft Team's structures pole, working on the CHESS satellite programme — a student-built cubesat.",
      "This page is still being filled in with real photos and results from the vibration test campaign — for now, here's the shape of the work.",
    ],
    layout: "text-only",
    tags: ["EPFL", "CHESS", "Structures"],
  },
  {
    id: "vibration-testing",
    kicker: "02 — Vibration Testing",
    title: "Qualifying a cubesat structure against launch loads",
    body: [
      "A satellite structure has to survive the vibration environment of launch before it ever has to survive space. My work on the structures pole centered on vibration testing the CHESS satellite structure — running it against qualification-level loads and evaluating the results against structural margins.",
    ],
    layout: "text-only",
    tags: ["Vibration Testing", "Launch Loads", "Structural Margins"],
  },
  {
    id: "test-stand",
    kicker: "03 — Test Stand Design",
    title: "Designing the fixture the satellite gets tested in",
    body: [
      "A vibration test is only as good as the fixture holding the test article to the shaker table — a poorly designed stand introduces its own resonances that contaminate the results. Part of this role involved designing the test stand itself: stiff enough to stay out of the frequency range of interest, while still being practical to mount and instrument.",
    ],
    layout: "text-only",
    tags: ["Test Stand", "Fixture Design"],
  },
];
