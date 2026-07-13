import { Chapter } from "./types";

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
    slug: "pinn-optimization",
    title: "Optimization of Hybrid Algorithms to Minimize the Loss Function in PINNs",
    tagline: "University project exploring hybrid optimisation strategies for training physics-informed neural networks",
    kicker: "Academic Project · University of Stuttgart",
    year: "2025",
    tags: ["Python", "PyTorch", "Optuna", "Machine Learning"],
    summary:
      "University project exploring hybrid optimisation strategies (gradient + heuristic) for training physics-informed neural networks.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "Hybrid optimisation for physics-informed neural networks",
        body: [
          "Physics-informed neural networks (PINNs) fold governing equations directly into the loss function, which makes that loss landscape considerably harder to optimise than a standard supervised-learning problem. This project explored hybrid optimisation strategies — combining gradient-based and heuristic search — to train PINNs more reliably, using PyTorch and Optuna for hyperparameter search.",
          "This page is still being filled in with methodology and results — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["PINNs", "Optimization"],
      },
    ],
  },
  {
    slug: "smart-mirror",
    title: 'Smart Mirror Development and Business Concept for "Jugend Gründet"',
    tagline: "Built a smart-mirror device and pitched a full business concept around it in a national competition",
    kicker: 'School Project · "Jugend Gründet"',
    year: "2018",
    tags: ["Public Speaking", "Entrepreneurship", "Project Management", "Business Plan Development"],
    summary: "Built a smart-mirror device and pitched a full business concept around it in a national competition.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: 'A smart mirror and business plan for "Jugend Gründet"',
        body: [
          'Built a working smart-mirror device — a two-way mirror with an embedded display for weather, time, and notifications — and developed a full business concept around it for "Jugend Gründet", a national student entrepreneurship competition.',
          "This page is still being filled in with photos and the business plan details — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Jugend Gründet", "Entrepreneurship"],
      },
    ],
  },
  {
    slug: "line-following-cars",
    title: "Development of Two Line-Following and Maze-Solving Cars: Analog vs. Arduino",
    tagline: "Built two competing robotic cars — one analog-circuit-based, one Arduino-based — to solve the same maze",
    kicker: "School Project",
    year: "2016",
    tags: ["Arduino (C++)", "Problem-Solving", "Robotics"],
    summary: "Built two competing robotic cars — one analog-circuit-based, one Arduino-based — to solve the same maze.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "Analog circuit vs. Arduino: two approaches to the same maze",
        body: [
          "Built two line-following, maze-solving robotic cars to compare approaches: one built from discrete analog circuitry (comparators and op-amps reacting directly to sensor voltages), the other running control logic on an Arduino.",
          "This page is still being filled in with build photos and a proper writeup of how each approach compared — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Analog Electronics", "Arduino"],
      },
    ],
  },
  {
    slug: "diy-quadrotor",
    title: "DIY Autonomous Quadrotor",
    tagline: "First self-built Ardupilot multirotor platform with autonomous flight capabilities",
    kicker: "Personal Project · RC",
    year: "2018",
    tags: ["Ardupilot", "Multirotor", "Electronics", "Flight Control"],
    summary:
      "First complete autonomous multirotor from frame assembly to flight testing. Custom built frame with Ardupilot flight controller, calibrated compass and IMU, and autonomous mission capabilities.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "A first self-built autonomous multirotor",
        body: [
          "My first complete autonomous multirotor build, from frame assembly through flight testing: a custom frame, an Ardupilot flight controller, calibrated compass and IMU, and autonomous waypoint missions once the basic platform was flying reliably.",
          "This page is still being filled in with build photos and flight footage — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Ardupilot", "First Build"],
      },
    ],
  },
  {
    slug: "tilt-rotor-vtol",
    title: "Tilt-Rotor VTOL Transition Platform",
    tagline: "Electric aircraft with tilting rotors for vertical takeoff and forward flight",
    kicker: "Personal Project · RC",
    year: "2022 – present",
    tags: ["VTOL", "Tilting Rotors", "Transition Flight", "Ardupilot"],
    summary:
      "Experimental tilt-rotor aircraft blending multirotor vertical takeoff with fixed-wing forward flight efficiency. Motorized servo-driven rotor tilt mechanism with Ardupilot transition logic.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "Blending vertical takeoff with fixed-wing efficiency",
        body: [
          "An experimental tilt-rotor aircraft: multirotor vertical takeoff and landing, transitioning in flight into efficient fixed-wing forward flight via a servo-driven rotor tilt mechanism, with Ardupilot handling the transition logic.",
          "This page is still being filled in with the transition-flight data and build details — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["VTOL", "Flight Transition"],
      },
    ],
  },
  {
    slug: "composite-fixed-wing",
    title: "Foam & Fiberglass Fixed-Wing Platform",
    tagline: "Traditional composite construction with foam core and fiberglass layup",
    kicker: "Personal Project · RC",
    year: "2020",
    tags: ["Composite", "Fiberglass", "Foam Core", "Hand-Laid Construction"],
    summary:
      "Fixed-wing aircraft constructed using conventional foam core and hand-laid fiberglass technique. Balance between light weight, durability, and ease of repair.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "A conventional composite fixed-wing build",
        body: [
          "A fixed-wing RC aircraft built with a conventional foam-core-and-hand-laid-fiberglass technique, chosen for a good balance of light weight, durability, and field-repairability compared to the 3D-printed and hybrid builds.",
          "This page is still being filled in with build photos and flight notes — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Composite Construction", "Fixed-Wing"],
      },
    ],
  },
];
