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
    slug: "lunar-lander",
    title: "Designing Lunar Landing and Ascend Stage at Space Station Design Workshop",
    tagline: "Systems-engineering design of a lunar lander/ascent stage during an intensive international design workshop",
    kicker: "Academic Project · Space Station Design Workshop 2025, Stuttgart",
    year: "2025",
    tags: ["Matlab", "Astos", "Systems Engineering", "Synera"],
    summary:
      "Systems-engineering design of a lunar lander/ascent stage during an intensive international design workshop.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — The Workshop",
        title: "Space Station Design Workshop 2025, Stuttgart",
        body: [
          "The Space Station Design Workshop is an intensive, week-long international systems-engineering workshop where international student teams design a full space mission concept from scratch. My team's task was the lunar landing and ascent stage of a lunar mission architecture.",
          "This page is still being filled in with the actual design results — for now, here's the team at the closing ceremony, and the shape of the work below.",
        ],
        layout: "gallery",
        media: [
          {
            type: "image",
            src: "/images/lunar-lander/ssdw-2025-team.jpg",
            alt: "Space Station Design Workshop 2025 team in Stuttgart, celebrating after the closing ceremony",
            caption: "The Space Station Design Workshop 2025 team, Stuttgart.",
          },
        ],
        tags: ["SSDW 2025", "Stuttgart", "Systems Engineering"],
      },
      {
        id: "lander-ascent",
        kicker: "02 — Lander & Ascent Stage",
        title: "Sizing the landing and ascent stage",
        body: [
          "Work centered on the systems-level design of the lunar landing and ascent stage: trajectory and propulsion sizing in Astos and Matlab, and integrating that with the rest of the mission architecture through Synera.",
        ],
        layout: "text-only",
        tags: ["Trajectory Design", "Propulsion Sizing"],
      },
    ],
  },
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
    slug: "horten-h3-airfoil",
    title: "Modernizing the Horten H3 Airfoil: Enhancing Efficiency and Preserving Stability",
    tagline: "Re-optimised a historic flying-wing airfoil for efficiency while preserving its stability characteristics",
    kicker: "Academic Project · University of Stuttgart",
    year: "2024",
    tags: ["X-Foil", "Airfoil Design", "CFD", "C++"],
    summary:
      "Re-optimised a historic flying-wing airfoil for efficiency while preserving its stability characteristics.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "Re-optimising a historic flying-wing airfoil",
        body: [
          "The Horten H3 flying wing used reflex airfoils shaped to keep the tailless aircraft stable without a horizontal tail. This project re-optimised the airfoil with modern tools (X-Foil, CFD) to improve aerodynamic efficiency while preserving the pitching-moment characteristics that keep a tailless wing stable.",
          "This page is still being filled in with the design iterations and results — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Flying Wing", "Reflex Airfoil", "Stability"],
      },
    ],
  },
  {
    slug: "bridge-fea",
    title: "Structural Analysis of a Bridge Under Various Load Cases Using FEA",
    tagline: "FEA-based dynamic and modal analysis of a bridge structure under varying load conditions",
    kicker: "Academic Project · University of Stuttgart",
    year: "2024",
    tags: ["FEA (Abaqus)", "Dynamic and Modal Analysis"],
    summary: "FEA-based dynamic and modal analysis of a bridge structure under varying load conditions.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "Dynamic and modal analysis of a bridge structure",
        body: [
          "A finite-element study of a bridge structure in Abaqus, covering modal analysis (natural frequencies and mode shapes) and its dynamic response under various load cases.",
          "This page is still being filled in with the model and results — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Abaqus", "Modal Analysis"],
      },
    ],
  },
  {
    slug: "turbulence-models",
    title: "Comparison of Different Turbulence Models in Sub- and Transonic Flow Regimes",
    tagline: "Benchmarked several turbulence closure models against each other across flow regimes using TAU",
    kicker: "Academic Project · University of Stuttgart",
    year: "2024",
    tags: ["CFD (TAU)", "Pointwise", "Airfoil Aerodynamics"],
    summary: "Benchmarked several turbulence closure models against each other across flow regimes using TAU.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "Benchmarking turbulence models across flow regimes",
        body: [
          "A comparative CFD study using DLR TAU (meshed in Pointwise) to see how different turbulence closure models perform on the same airfoil case as the flow moves from subsonic into transonic regimes.",
          "This page is still being filled in with the comparison results — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Turbulence Modelling", "Transonic Flow"],
      },
    ],
  },
  {
    slug: "verification-device",
    title: "Development of a Functional Verification Device for an Electronic Subsystem",
    tagline: "Designed and built a dedicated PCB test rig to functionally verify an electronic subsystem",
    kicker: "Academic Project · DHBW Ravensburg",
    year: "2020",
    tags: ["Electronics", "PCB Design and Layout", "Prototyping", "Hardware Testing"],
    summary: "Designed and built a dedicated PCB test rig to functionally verify an electronic subsystem.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "A dedicated test rig for functional verification",
        body: [
          "Designed and built a purpose-built PCB test rig used to functionally verify an electronic subsystem — covering schematic capture, PCB layout, and prototyping the finished board.",
          "This page is still being filled in with photos and test results — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Electronics", "PCB Design"],
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
    slug: "cfd-framework",
    title: "Development of a 2D CFD Framework for Interactive Flow Simulation",
    tagline: "A from-scratch 2D Navier-Stokes solver with a live, interactive viewer for exploring fluid behaviour in real time",
    kicker: "Personal Project · Software",
    year: "2025",
    tags: ["Python", "CFD", "NS-Equations", "Scientific Visualization"],
    summary:
      "A from-scratch 2D Navier-Stokes solver with a live, interactive viewer for exploring fluid behaviour in real time.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "A from-scratch 2D Navier-Stokes solver",
        body: [
          "A 2D computational-fluid-dynamics framework built from scratch, solving the incompressible Navier-Stokes equations, paired with a live interactive viewer so flow behaviour can be explored and perturbed in real time rather than only inspected after a batch run.",
          "This page is still being filled in with the solver details and viewer demo — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Navier-Stokes", "Real-Time Visualization"],
      },
    ],
  },
  {
    slug: "airfoil-design-code",
    title: "Developed a custom 2D airfoil design code for sub- and transonic regimes",
    tagline: "A parametric airfoil design tool for sub- and transonic regimes, built to explore shape/performance trade-offs outside of commercial CAD",
    kicker: "Personal Project · Software",
    year: "2024",
    tags: ["C++", "Aerodynamics", "Airfoil Design", "Computational Methods", "Parametric Modelling"],
    summary:
      "A parametric airfoil design tool for sub- and transonic regimes, built to explore shape/performance trade-offs outside of commercial CAD.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "A parametric airfoil design code, built from scratch",
        body: [
          "A custom C++ tool for parametrically designing 2D airfoils across sub- and transonic regimes — built to explore shape/performance trade-offs directly rather than through a commercial CAD/CFD suite.",
          "This page is still being filled in with the parametrisation method and example airfoils — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Parametric Design", "Airfoil Aerodynamics"],
      },
    ],
  },
  {
    slug: "investment-platform",
    title: "Investment Portfolio Management and Financial Analytics Platform",
    tagline: "A Python-based platform for tracking, analysing and visualising an investment portfolio, backed by its own database layer",
    kicker: "Personal Project · Software",
    year: "2022/23",
    tags: ["Python", "Data Visualization", "Portfolio Management", "Database Management"],
    summary:
      "A Python-based platform for tracking, analysing and visualising an investment portfolio, backed by its own database layer.",
    chapters: [
      {
        id: "intro",
        kicker: "01 — Overview",
        title: "A self-built portfolio tracking and analytics platform",
        body: [
          "A Python platform for tracking an investment portfolio, backed by its own database layer, with analytics and visualisations built on top to track performance over time.",
          "This page is still being filled in with the architecture and dashboard views — for now, this is the one-line summary from the CV.",
        ],
        layout: "text-only",
        tags: ["Python", "Data Visualization"],
      },
    ],
  },
];
