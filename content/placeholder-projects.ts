import { Chapter } from "./types";

/**
 * Lighter-weight projects that get a short, self-contained page rather than a
 * full scroll-story. These are complete at the length they deserve — they are
 * not stubs waiting to be filled in.
 */
export type PlaceholderProject = {
  slug: string;
  title: string;
  tagline: string;
  kicker: string;
  year: string;
  tags: string[];
  summary: string;
  chapters: Chapter[];
};

export const placeholderProjects: PlaceholderProject[] = [
  {
    slug: "cnc-machine",
    title: "Mostly 3D-Printed CNC Machine, Rebuilt for Real Tolerance",
    tagline: "A printed-structure CNC router, redesigned after the first version flexed under load",
    kicker: "Personal Project · Hardware",
    year: "2018/19",
    tags: ["CNC Design", "CAD (Solidworks)", "3D Printing", "Metalworking", "Laser Cutting"],
    summary:
      "A self-built CNC router whose structure was largely 3D-printed, then redesigned after the first version flexed under load — stiffer printed parts, metal where printing could not hold tolerance, and a rebuilt gantry that finally cut accurately in wood and aluminium.",
    chapters: [
      {
        id: "build",
        kicker: "01 — The Build",
        title: "A CNC machine printed on the machine's own predecessor",
        body: [
          "The idea was to build a working three-axis CNC router with as much of its structure as possible produced on a 3D printer — printed axis carriages, motor mounts, bearing blocks and gantry joints, combined with bought linear rails, leadscrews and stepper motors, on a frame cut from wood and aluminium profile.",
          "Designing it in Solidworks meant every bracket could be made to fit the exact rails and motors on the bench rather than the other way around, and a part that turned out wrong could be reprinted the same evening. That iteration speed is the real argument for a printed machine.",
        ],
        layout: "text-only",
        tags: ["Solidworks", "FDM Printing", "Three-Axis Router"],
      },
      {
        id: "problem",
        kicker: "02 — The Flaw",
        title: "Printed plastic is stiff enough — until you ask it to cut",
        body: [
          "The first version ran, but it did not hold tolerance. A CNC machine is a structural problem disguised as a motion problem: cutting forces push back on the tool, and any deflection anywhere in the loop from spindle to workpiece shows up directly in the cut. Printed PLA brackets that felt rigid in the hand flexed measurably under load, and the errors compounded across the gantry.",
          "This is the failure mode nobody warns you about with printed machine tools. The parts are not weak — they deform elastically, quietly, exactly while cutting, and the machine still looks fine when you switch it off.",
        ],
        layout: "text-only",
        tags: ["Stiffness", "Deflection", "Cutting Forces"],
      },
      {
        id: "rebuild",
        kicker: "03 — The Rebuild",
        title: "Print what can be printed, machine what can't",
        body: [
          "The redesign kept the printed approach where it earned its place and replaced it where it didn't. Load-bearing joints were reprinted thicker, with more perimeters and higher infill and reoriented so layer lines no longer ran across the direction of load. The parts carrying the worst of the cutting forces were remade in metal, and the gantry was rebuilt to shorten the structural loop between the spindle and the bed.",
          "The rebuilt machine cut accurately enough to be genuinely useful in wood and light aluminium, and went on to make parts for later projects — including some of the RC aircraft elsewhere on this site.",
          "The lesson generalised well beyond this machine: additive manufacturing is a superb way to iterate geometry, and a poor way to avoid thinking about stiffness. Knowing which parts of a structure you are allowed to print is the actual skill.",
        ],
        layout: "text-only",
        tags: ["Redesign", "Hybrid Construction", "Machine Stiffness"],
      },
    ],
  },
  {
    slug: "smart-mirror",
    title: 'Smart Mirror Development and Business Concept for "Jugend Gründet"',
    tagline: "A smart-mirror device and the full business concept pitched around it in a national competition",
    kicker: 'School Project · "Jugend Gründet"',
    year: "2018",
    tags: ["Public Speaking", "Entrepreneurship", "Project Management", "Business Plan Development"],
    summary: "Built a smart-mirror device and pitched a full business concept around it in a national competition.",
    chapters: [
      {
        id: "device",
        kicker: "01 — The Device",
        title: "A display behind a two-way mirror",
        body: [
          "The build is deceptively simple: a two-way mirror with a display mounted behind it, so the screen is invisible where it shows black and reads as text floating in the glass where it doesn't. Behind that sits a small computer driving a dashboard — time, weather, calendar and notifications — sized and positioned so the information sits beside your reflection rather than across it.",
        ],
        layout: "text-only",
        tags: ["Two-Way Mirror", "Embedded Display"],
      },
      {
        id: "business",
        kicker: "02 — The Competition",
        title: 'Building the business case for "Jugend Gründet"',
        body: [
          '"Jugend Gründet" is a German national student entrepreneurship competition, and it asks for far more than a working prototype: a business plan, a market and competitor analysis, a costing and pricing model, and a pitch defended in front of a jury.',
          "That made this the first project where the engineering was the smaller half of the work. Deciding who the product was actually for, what it should cost, and how to explain it to people who had never seen one turned out to be harder than getting the display to sit behind the glass — and the presentation practice has been useful in every technical review since.",
        ],
        layout: "text-only",
        tags: ["Business Plan", "Market Analysis", "Pitching"],
      },
    ],
  },
  {
    slug: "line-following-cars",
    title: "Development of Two Line-Following and Maze-Solving Cars: Analog vs. Arduino",
    tagline: "Two robotic cars solving the same maze — one built from analog circuitry, one from code",
    kicker: "School Project",
    year: "2016",
    tags: ["Arduino (C++)", "Analog Electronics", "Problem-Solving", "Robotics"],
    summary: "Built two competing robotic cars — one analog-circuit-based, one Arduino-based — to solve the same maze.",
    chapters: [
      {
        id: "premise",
        kicker: "01 — The Premise",
        title: "Same maze, two completely different machines",
        body: [
          "The task was to build a car that follows a line and solves a maze. The interesting decision was to build it twice, two different ways, and let the comparison be the point.",
          "One car does it in hardware: reflectance sensors feeding comparators and op-amps that drive the motors directly, so the control law is literally the circuit. The other does it in software: the same sensors read by an Arduino, with the following and maze-solving logic written in code.",
        ],
        layout: "text-only",
        tags: ["Line Following", "Maze Solving"],
      },
      {
        id: "comparison",
        kicker: "02 — What the Comparison Taught",
        title: "The analog car reacts; the digital car remembers",
        body: [
          "The analog car is immediate — there is no loop rate, no sampling delay, the motors respond as fast as the sensors change. But it only ever reacts to what it sees right now, and tuning it means physically changing components.",
          "The Arduino car is slower to respond and needed its timing thought about, but it can hold state: remember which junctions it has taken, store a route, and improve on a second run. Maze-solving needs memory, and that is exactly where the analog approach hits its ceiling.",
          "It was an early, very concrete lesson in choosing the right level of complexity for a problem — and my first real exposure to writing embedded code, which turned into the Arduino work in the verification device four years later.",
        ],
        layout: "text-only",
        tags: ["Analog vs. Digital", "Embedded Control", "State"],
      },
    ],
  },
  {
    slug: "diy-quadrotor",
    title: "DIY Autonomous Quadrotor",
    tagline: "The first self-built Ardupilot multirotor, from frame assembly to autonomous waypoint missions",
    kicker: "Personal Project · RC",
    year: "2018",
    tags: ["Ardupilot", "Multirotor", "Electronics", "Flight Control"],
    summary:
      "First complete autonomous multirotor from frame assembly to flight testing. Custom built frame with Ardupilot flight controller, calibrated compass and IMU, and autonomous mission capabilities.",
    chapters: [
      {
        id: "build",
        kicker: "01 — The Build",
        title: "The first aircraft I built that flew itself",
        body: [
          "My first complete autonomous multirotor, built from parts rather than from a kit: a custom frame, motors and ESCs chosen against the intended all-up weight, and an Ardupilot flight controller as the brain.",
          "Getting a multirotor into the air is the easy half. Getting it to hold a position without drifting means a properly calibrated IMU and, above all, a properly calibrated compass — mounted far enough from the power wiring that the motor currents do not pull the heading around, which is the classic first-build mistake and the one that costs the most flights to diagnose.",
        ],
        layout: "text-only",
        tags: ["Ardupilot", "IMU / Compass Calibration"],
      },
      {
        id: "autonomy",
        kicker: "02 — Autonomy",
        title: "From manual hover to flying a planned mission",
        body: [
          "Once the platform hovered reliably, the interesting part began: planning waypoint missions on a map, uploading them, and watching the aircraft fly a route it had never been flown through manually.",
          "This is the project everything else in the RC section grew out of. The Ardupilot toolchain, the tuning workflow, and the habit of testing one change at a time all started here, and they carried directly into the Y4 and the VTOL work that followed.",
        ],
        layout: "text-only",
        tags: ["Waypoint Missions", "Autonomous Flight", "Foundations"],
      },
    ],
  },
  {
    slug: "tilt-rotor-vtol",
    title: "Design and Implementation of a VTOL UAV with Flight Transition Optimisation",
    tagline: "A tilt-rotor UAV designed around the hardest part of the flight envelope: the transition itself",
    kicker: "University Project · DHBW Ravensburg",
    year: "2021",
    tags: ["VTOL", "Tilting Rotors", "Transition Flight", "CAD (CATIA)", "Flight Mechanics"],
    summary:
      "University project: an experimental tilt-rotor UAV blending multirotor vertical takeoff with fixed-wing forward-flight efficiency — structural, propulsion and aerodynamic design in CATIA, with a servo-driven rotor tilt mechanism and the flight mechanics of the transition itself as the design driver.",
    chapters: [
      {
        id: "premise",
        kicker: "01 — The Premise",
        title: "Two aircraft in one airframe",
        body: [
          "A multirotor can take off from anywhere and hover, and pays for it with terrible cruise efficiency — it holds itself up entirely on thrust. A fixed-wing aircraft cruises efficiently on a wing and needs a runway. A tilt-rotor tries to be both: rotors pointing up for takeoff and hover, then rotated forward so the wing takes over the lift and the rotors become propellers.",
          "The design work covered the whole aircraft — structure, propulsion and aerodynamics, modelled in CATIA — but the configuration only makes sense if one specific manoeuvre works, and that manoeuvre is where the project's attention went.",
        ],
        layout: "text-only",
        tags: ["VTOL", "Configuration Design", "CATIA"],
      },
      {
        id: "transition",
        kicker: "02 — The Transition",
        title: "The few seconds where the aircraft is neither one thing nor the other",
        body: [
          "Transition is the interesting engineering problem. Partway through the tilt the rotors are no longer holding the aircraft up and the wing is not yet flying — the aircraft is at low airspeed with a wing near its stall, control authority shifting from differential thrust to aerodynamic surfaces, and every degree of tilt changing the balance between the two.",
          "Optimising that means choosing how fast to rotate the nacelles and how to schedule the transition against airspeed: tilt too quickly and the wing has no speed to generate lift when the rotors stop supporting the aircraft; tilt too slowly and the aircraft spends longer than necessary in the regime where neither system has full authority.",
          "That coupling — the tilt schedule, the airspeed build-up and the control handover all constraining each other — was the core of the design study, and it drove the mechanism, the wing sizing and the propulsion layout alike.",
        ],
        layout: "text-only",
        tags: ["Transition Schedule", "Control Authority", "Flight Mechanics"],
      },
    ],
  },
  {
    slug: "composite-fixed-wing",
    title: "Foam & Fiberglass Fixed-Wing Platform",
    tagline: "Conventional composite construction — foam core, hand-laid glass, field-repairable",
    kicker: "Personal Project · RC",
    year: "2020",
    tags: ["Composite", "Fiberglass", "Foam Core", "Hand-Laid Construction"],
    summary:
      "Fixed-wing aircraft constructed using conventional foam core and hand-laid fiberglass technique. Balance between light weight, durability, and ease of repair.",
    chapters: [
      {
        id: "method",
        kicker: "01 — The Method",
        title: "Foam takes the shape, glass takes the load",
        body: [
          "This aircraft was built the conventional way, and deliberately so: a shaped foam core carrying a hand-laid fiberglass skin. The foam holds the aerofoil section and resists the core shear; the glass skin carries the bending and torsion and provides the surface. It is the same structural logic as a sandwich panel, made in a garage.",
          "Hand layup is a genuinely physical skill — wetting out the cloth evenly, working out the air, and using no more resin than the fabric needs, because every gram of excess resin is weight that contributes nothing.",
        ],
        layout: "text-only",
        tags: ["Sandwich Structure", "Hand Layup", "Wet-Out"],
      },
      {
        id: "tradeoff",
        kicker: "02 — Why This, Not Printing",
        title: "The build method chosen against the 3D-printed airframes",
        body: [
          "Coming after the 3D-printed warbirds, this was the direct comparison. Printing gives exact geometry and repeatability; foam and glass gives a far better strength-to-weight ratio and, crucially, survives landings — a cracked glass skin can be sanded and patched in an evening, where a broken printed part has to be reprinted and rebonded.",
          "For an aircraft that is meant to be flown regularly rather than admired, that repairability is worth more than the geometric precision, and this airframe was the one that made the trade-off obvious.",
        ],
        layout: "text-only",
        tags: ["Build Trade-off", "Repairability", "Strength-to-Weight"],
      },
    ],
  },
];
