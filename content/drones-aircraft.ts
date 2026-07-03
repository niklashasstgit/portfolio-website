import { Chapter } from "./types";

export const dronesAircraftChapters: Chapter[] = [
  {
    id: "intro",
    kicker: "01 — A Decade of Building",
    title: "From line-following cars to a tilt-rotor VTOL",
    body: [
      "This is the physical-build thread that runs underneath the software projects: RC aircraft platforms built, wired, and flown; a bachelor thesis spent designing a tilt-rotor VTOL from scratch; and a 3D-printed CNC machine redesigned to actually hold tolerance. All of it shares the same loop — design in CAD, 3D print or machine the part, test it, find out what's wrong, iterate.",
      "Real build photos for this page are still being gathered — the sections below use recreated diagrams and CAD-accurate descriptions in the meantime.",
    ],
    layout: "text-only",
    tags: ["Fusion 360", "Additive Manufacturing", "CAD"],
  },
  {
    id: "vtol",
    kicker: "02 — Bachelor Thesis",
    title: "VTOL UAV with flight-transition optimisation",
    body: [
      "For my bachelor thesis at DHBW Ravensburg I designed and built a tilt-rotor VTOL UAV: an aircraft that takes off and lands like a multicopter, then rotates its rotor thrust vector to transition into efficient, wing-borne forward flight like a fixed-wing plane.",
      "The structural, propulsion, and aerodynamic design was done in CATIA; custom parts — including a purpose-built motor mount and servo mount for the tilt mechanism — were 3D printed from my own Fusion 360 designs rather than sourced off-the-shelf, since no existing hardware matched the transition geometry I needed.",
      "The hard problem wasn't hover or forward flight individually — both are well understood — it was the transition in between, where the aircraft is neither a good multicopter nor a good fixed-wing plane. Optimising that window was the actual thesis.",
    ],
    layout: "diagram",
    diagram: "vtol-transition",
    tags: ["CATIA", "Flight Mechanics", "Tilt-Rotor", "Bachelor Thesis"],
  },
  {
    id: "symposium",
    kicker: "03 — Presenting the Work",
    title: "Presenting the VTOL thesis at the Aviation and Space Symposium, St. Gallen 2022",
    body: [
      "The finished aircraft — a five-rotor tilt configuration built around the transition-optimised design — flew successfully, transitioning between hover and wing-borne flight as intended.",
      "I presented the thesis as a poster at the Aviation and Space Symposium in St. Gallen in 2022, alongside DHBW Ravensburg's other Luft- und Raumfahrttechnik projects.",
    ],
    layout: "gallery",
    media: [
      {
        type: "image",
        src: "/images/drones-aircraft/vtol-flight.jpg",
        alt: "The five-rotor tilt-rotor VTOL UAV in wing-borne forward flight",
        caption: "The finished aircraft in wing-borne forward flight.",
      },
      {
        type: "image",
        src: "/images/drones-aircraft/vtol-symposium-2022.jpg",
        alt: "Presenting the VTOL UAV thesis poster at the Aviation and Space Symposium, St. Gallen 2022",
        caption: "Presenting the thesis at the Aviation and Space Symposium, St. Gallen 2022.",
      },
    ],
    tags: ["Aviation and Space Symposium", "St. Gallen 2022"],
  },
  {
    id: "rc-platforms",
    kicker: "04 — RC Platforms",
    title: "Building, wiring, and flying RC aircraft since 2017",
    body: [
      "Alongside from-scratch design work, I've built and flown a series of RC aircraft platforms — foam-composite airframes (Cessna 152, Piper Pawnee, EDGE 540 aerobatic replica among them), each fitted out with my own Ardupilot flight-controller setups, custom 3D-printed mounts, and wiring.",
      "This is where a lot of the practical flight-systems knowledge that feeds into other projects comes from: motor/ESC sizing, control-surface linkages, flight-controller tuning, and just as importantly, what breaks on landing and why.",
    ],
    layout: "text-only",
    tags: ["Ardupilot", "RC Aircraft", "Flight Controllers"],
  },
  {
    id: "cnc",
    kicker: "05 — Tools, Not Just Toys",
    title: "Redesigning a mostly-3D-printed CNC machine",
    body: [
      "Built and substantially redesigned an MPCNC-style machine — a CNC router whose structural joints are 3D printed and running on standard conduit rails. Getting it to actually hold tolerance meant iterating on the printed corner joints, belt tensioning, and gantry stiffness well past the stock design.",
      "It's since been the shop tool behind a lot of the custom parts in the other projects on this page — motor mounts, jigs, and enclosure panels cut on a machine I built myself.",
    ],
    layout: "text-only",
    tags: ["CNC", "Fusion 360", "Machining", "Laser Cutting"],
  },
];
