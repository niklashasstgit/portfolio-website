import { Chapter } from "./types";

export const epflSpacecraftChapters: Chapter[] = [
  {
    id: "intro",
    kicker: "01 — The Assignment",
    title: "Building a mass model of the CHESS satellite for vibration qualification",
    body: [
      "This was a single, focused project done during my exchange semester at EPFL (Feb–Aug 2025) — five months on the EPFL Spacecraft Team's structures pole. That timeframe is the whole reason the scope was what it was: get one clear deliverable done end to end rather than follow a subsystem across years.",
      "The deliverable was a mass model of the CHESS satellite — a structural stand-in that reproduces the real spacecraft's mass, centre of gravity and stiffness distribution without any of the functional (and expensive, flight-critical) electronics. A mass model lets you take the structure to a shaker table and qualify it against launch vibration long before you would ever risk flight hardware.",
      "My task had two halves that had to end up describing the same object: a digital model to simulate, and a physical model to actually put on the shaker — then compare the two.",
    ],
    layout: "text-only",
    tags: ["EPFL", "CHESS", "Structural / Mass Model", "Exchange Semester"],
  },
  {
    id: "chess",
    kicker: "02 — The Flight Design",
    title: "Starting from a satellite that was almost finished",
    body: [
      "CHESS is a student-built cubesat with a tall, stacked internal architecture — subsystem trays, avionics boards and a payload threaded onto a slender aluminium primary structure. By the time I joined, that design was essentially frozen, which is exactly the point at which a mass model becomes worth building: the geometry and the mass budget are stable enough to reproduce faithfully.",
      "So the flight CAD became my master reference. Every tray position, every board mass, every mounting interface and the overall centre of gravity had to be read off this model and then rebuilt in a way that behaves structurally like the real thing — without being the real thing.",
    ],
    media: [
      {
        type: "image",
        src: "/images/epfl-spacecraft/chess-cad-model.png",
        alt: "Exploded CAD view of the CHESS cubesat showing its stacked internal trays, boards and payload on an aluminium primary structure",
        caption: "The near-frozen CHESS flight design — the CAD master used as the reference for the mass model's geometry, stack order and mass budget.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["CHESS", "CubeSat", "CAD Reference"],
  },
  {
    id: "why-mass-model",
    kicker: "03 — Why a Mass Model",
    title: "Qualify the structure, not the electronics",
    body: [
      "A satellite has to survive the vibration of launch before it ever has to survive space. You want to prove the primary structure and its joints can take qualification-level loads — but you do not want to strap a fully populated flight unit to a shaker to find out.",
      "The mass model resolves that: it matches the flight satellite where it matters for a structural test — total mass, centre of gravity, and the way mass is distributed and mounted along the structure — while replacing every functional board with an inert dummy of the same mass and footprint. If the structure and the model agree, the shaker campaign is meaningful and nothing irreplaceable is ever at risk.",
    ],
    layout: "text-only",
    tags: ["Launch Loads", "Qualification", "Risk Reduction"],
  },
  {
    id: "digital-model",
    kicker: "04 — The Digital Model",
    title: "A finite-element model to predict how it rings",
    body: [
      "The first half was digital. I built a finite-element model of the mass model: the aluminium frame as its structural members, each dummy board as a lumped mass at the right location, and the bolted interfaces represented so the load path through the stack was captured.",
      "The output that matters here is a modal analysis — the natural frequencies and mode shapes of the assembly. Those first modes are what a vibration test hunts for, and having them predicted up front tells you where to expect resonances, whether the structure clears the launcher's minimum-frequency requirement, and where to place the accelerometers on the real hardware.",
    ],
    layout: "text-only",
    tags: ["Finite Element", "Modal Analysis", "Natural Frequencies"],
  },
  {
    id: "dummy-masses",
    kicker: "05 — Designing the Dummy Masses",
    title: "Metal plates and weights standing in for every board",
    body: [
      "With the model predicting behaviour, the physical build had to reproduce it. Each real PCB and subsystem tray was replaced by a dummy: metal plates and added weights machined to match the mass and mounting footprint of the component they stood in for, stacked with the same G10 spacers and threaded rods as the flight boards.",
      "The goal was ruthless similarity to the original — same masses in the same places, same stack order, same interfaces — so that the physical object and the digital object are genuinely two descriptions of one satellite, and a shaker result on one says something true about the other.",
    ],
    layout: "text-only",
    tags: ["Dummy Masses", "Mass Matching", "CoG"],
  },
  {
    id: "machining",
    kicker: "06 — Manufacturing",
    title: "Turning the CAD into aluminium in the EPFL workshop",
    body: [
      "The primary structure and the dummy masses were then manufactured in the EPFL student workshop — turning, milling and drilling parts to match the CAD dimensions and the interface holes that let the stack bolt together the same way the flight structure does.",
      "This is the part of the job I like most: a plan meeting a workshop and occasionally turning out to be wrong in an interesting way. Getting the frame square, the hole patterns aligned and the tolerances tight enough that the assembly actually behaves like the model is where a mass model is made or lost.",
    ],
    media: [
      {
        type: "image",
        src: "/images/epfl-spacecraft/frame-machining.jpg",
        alt: "Machining the aluminium primary structure of the CHESS mass model at the EPFL workshop, with the assembled frame on the bench",
        caption: "Manufacturing the aluminium primary structure and dummy masses in the EPFL student workshop.",
        fit: "contain",
      },
    ],
    layout: "image-left",
    tags: ["Machining", "Aluminium", "Tolerances"],
  },
  {
    id: "assembly",
    kicker: "07 — Assembly",
    title: "Stacking the model so it matches the simulation",
    body: [
      "Assembly is where the two halves are reconciled. The dummy trays and plates go onto the rails in the flight stack order, the threaded rods are torqued to spec, and the whole column is checked so its total mass, centre of gravity and stiffness distribution line up with what the finite-element model assumed.",
      "The result is the physical twin of the digital model: an inert, metal-and-G10 version of CHESS that is ready to be shaken.",
    ],
    media: [
      {
        type: "image",
        src: "/images/epfl-spacecraft/mass-model-assembled.jpg",
        alt: "The assembled CHESS mass model — an aluminium frame holding a stack of metal dummy plates separated by yellow G10 spacers",
        caption: "The assembled mass model — dummy plates and G10 spacers stacked on the aluminium frame, mass- and CoG-matched to the flight design.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["Assembly", "Stack-Up", "Torque"],
  },
  {
    id: "instrumentation",
    kicker: "08 — Onto the Shaker",
    title: "Fixturing and instrumenting the model for test",
    body: [
      "The assembled model was mounted to the shaker through a fixture at its launch interface, and accelerometers were bonded at the base and at points up the stack — including near the predicted mode shapes, so the sensors would actually see the resonances the model expected.",
      "The test itself follows the standard sequence used to qualify a satellite structure: low-level sine sweeps to find the resonances, then random vibration up to qualification levels along each axis.",
    ],
    layout: "text-only",
    tags: ["Shaker", "Accelerometers", "Test Fixture"],
  },
  {
    id: "sine-sweep",
    kicker: "09 — Resonance Search",
    title: "A low-level sine sweep to find the first modes",
    body: [
      "The campaign opens with a low-level sine sweep — a gentle sweep across the frequency band that excites the structure just enough to reveal where its resonances sit, without overstressing anything. This is the physical measurement of the same first modes the finite-element model predicted.",
      "That first sweep is also the reference signature: it gets repeated after every high-level run, because a resonance that has shifted between two sweeps is the classic tell-tale of something loosening or cracking inside the stack.",
    ],
    layout: "text-only",
    tags: ["Sine Sweep", "Resonance", "Modal Survey"],
  },
  {
    id: "random-vibe",
    kicker: "10 — Qualification Levels",
    title: "Random vibration to launch loads on each axis",
    body: [
      "With the resonances located, the model is driven with random vibration representative of the launch environment, at qualification levels, along each of its three axes. Between the high-level runs the low-level sine sweep is repeated, and the before/after resonance signatures are compared to confirm the structure came through undamaged.",
      "For a mass model the pass criterion is really about the structure and its joints: it should ride out the qualification spectrum with its modes unchanged and its bolted interfaces intact.",
    ],
    layout: "text-only",
    tags: ["Random Vibration", "Launch Environment", "Structural Integrity"],
  },
  {
    id: "correlation",
    kicker: "11 — Test vs. Simulation",
    title: "Closing the loop between the model and the measurement",
    body: [
      "The final step is correlation: line the measured natural frequencies up against the finite-element prediction and tune the model — bolt stiffnesses, joint representations, boundary conditions — until digital and physical agree. A well-built mass model typically lands its first bending mode within a few percent of the prediction and comfortably above the launcher's minimum-frequency requirement, which is what tells you the modelling assumptions can be trusted for the flight structure too.",
      "I handed the campaign over at this correlation stage — my five months covered building both the digital and the physical model and getting them onto the shaker, and the team carried the final model-tuning forward from there.",
    ],
    layout: "text-only",
    tags: ["Correlation", "Model Updating", "Validation"],
  },
  {
    id: "result",
    kicker: "12 — Result",
    title: "One satellite, described twice, ready to trust",
    body: [
      "In five months the project went from a near-frozen flight design to two matched descriptions of the same satellite — a finite-element model that predicts how CHESS rings, and a machined, assembled mass model that survives the shaker — plus the fixture, instrumentation and test procedure the team can reuse when the real structure's turn comes.",
      "It is a compact, complete slice of structural engineering: read a design, predict its behaviour, build the hardware, test it against launch loads, and compare reality back to the model.",
    ],
    layout: "text-only",
    tags: ["Structures", "End-to-End", "Result"],
  },
];
