import {
  PersonalSubsection,
  ProjectMeta,
  ProjectSection,
  AcademicSubsection,
  ProjectLink,
  ProjectDisclaimer,
  sectionLabels,
} from "./types";

/** Shared fallback cover for any project without its own image yet. */
export const GENERIC_PLACEHOLDER = "/images/placeholders/generic.svg";

export const projects: ProjectMeta[] = [
  {
    slug: "visual-sky-radar",
    title: "Visual Sky Radar",
    tagline: "Distributed multi-camera system for real-time aerial tracking",
    category: "Personal · Software",
    year: "2025",
    tags: ["C++", "Python", "OpenCV", "Computer Vision", "Kalman Filtering"],
    cover: "/images/visual-sky-radar/cover.png",
    summary:
      "A ground-based network of three calibrated camera stations that spots aircraft and contrails in the open sky, triangulates their 3D position, fuses the fixes through an unscented Kalman filter, and cross-references live ADS-B traffic.",
    status: "flagship",
    href: "/projects/visual-sky-radar",
    section: "personal",
    subsection: "software-projects",
    role: "Solo — concept, software, calibration, field testing",
    duration: "2025, ongoing",
    team: "Solo",
    tools: ["C++17", "Qt6", "OpenCV", "FFmpeg", "Python"],
  },
  {
    slug: "thermal-correlation",
    title: "Enhancing Spacecraft Thermal Design through Automated Data Correlation",
    tagline: "Automated Bayesian correlation of spacecraft thermal models — Airbus Defence and Space",
    category: "Academic · Master Thesis",
    year: "2026",
    tags: ["Python", "Bayesian Inference", "Machine Learning", "Thermal"],
    cover: "/images/thermal-correlation/sentinel2-model.jpg",
    summary:
      "Master thesis at Airbus Defence and Space: replacing manual thermal-model tuning with a Bayesian pipeline and a neural-network surrogate, validated against real Sentinel-2 thermal-vacuum test data. Correlation parameters become distributions with quantified confidence instead of single hand-picked values.",
    status: "category",
    href: "/projects/thermal-correlation",
    section: "academic",
    academicSubsection: "masters",
    role: "Master thesis — method, implementation, validation, tooling",
    duration: "6 months (10.2025 – 04.2026)",
    team: "Solo, within the thermal architecture department",
    tools: ["Python", "PyTorch", "PyQt5", "ESATAN-TMS"],
    disclaimer: {
      org: "Airbus Defence and Space GmbH, Immenstaad",
      source: "my published master thesis, “Enhancing Spacecraft Thermal Design through Automated Data Correlation” (University of Stuttgart, 2026)",
    },
  },
  {
    slug: "supersonic-inlet",
    title: "Supersonic Inlet Design Tool",
    tagline:
      "Analytical shock-system design for supersonic diffuser inlets, validated against CFD — Diehl Defence",
    category: "Academic · Bachelor Thesis",
    year: "2022",
    tags: ["Python", "Supersonic Aerodynamics", "CFD (Ansys)", "Compressible Flow"],
    cover: "/images/supersonic-inlet/cover-hero.png",
    summary:
      "Bachelor thesis at Diehl Defence: an analytical Python tool that lays out the shock system and geometry of a supersonic inlet from a few design constraints, analyses it off-design, and is validated against Ansys CFD and a NASA wind-tunnel schlieren image.",
    status: "category",
    href: "/projects/supersonic-inlet",
    section: "academic",
    academicSubsection: "bachelors",
    role: "Bachelor thesis — tool development, CFD validation",
    duration: "3 months (2022)",
    team: "Solo, within the propulsion & aerodynamics group",
    tools: ["Python", "Ansys Fluent", "Git"],
    disclaimer: {
      org: "Diehl Defence",
      source: "my published bachelor thesis, “Development of an Analytical Tool for Designing Supersonic Diffuser Inlets” (DHBW Ravensburg, 2022)",
    },
  },
  {
    slug: "burn-simulation",
    title: "Generic Solid-Motor Burn Simulator",
    tagline:
      "An internal-ballistics tool that turns grain geometry into a thrust curve — Diehl Defence",
    category: "Academic · Project Work",
    year: "2021",
    tags: ["Python", "Internal Ballistics", "Solid Rocket Motors", "CAD"],
    cover: "/images/burn-simulation/cover.png",
    summary:
      "A generic internal-ballistics tool for solid rocket motors, built during a placement at Diehl Defence: it takes an arbitrary grain geometry and propellant and returns thrust, chamber pressure and impulse — including a full analytic star-grain model — validated against a real test firing.",
    status: "category",
    href: "/projects/burn-simulation",
    section: "academic",
    academicSubsection: "bachelors",
    role: "Project work — tool development, star-grain model, validation",
    duration: "2021, during the dual study placement",
    team: "Solo, within the propulsion group",
    tools: ["Python", "Matlab", "RPA", "Git"],
    disclaimer: {
      org: "Diehl Defence",
      source: "my published project report, “Development of a Generic Burn Simulation Tool for Solid Rocket Motors” (DHBW Ravensburg, 2021)",
    },
  },
  {
    slug: "epfl-spacecraft",
    title: "EPFL Spacecraft Team",
    tagline: "Structures pole — mass model, test stand design & vibration testing for the CHESS satellite",
    category: "Student Association · EPFL",
    year: "2025",
    tags: ["Vibration Testing", "Mass Model", "Structures"],
    cover: "/images/epfl-spacecraft/cover.png",
    summary:
      "Structures-pole member on EPFL's student spacecraft team during a five-month exchange semester: built a digital and physical mass model of the CHESS cubesat, designed its shaker fixture, and instrumented it for the vibration qualification campaign.",
    status: "category",
    href: "/projects/epfl-spacecraft",
    section: "associations",
    role: "Structures pole — FE model, dummy masses, fixture, instrumentation",
    duration: "5 months (02.2025 – 08.2025)",
    team: "Structures pole of the EPFL Spacecraft Team",
    tools: ["CAD", "Finite Element Analysis", "Shaker / accelerometry", "Machine shop"],
  },
  {
    slug: "hyend-rocket",
    title: "HyEnD — Hybrid Engine Development",
    tagline: "Propulsion & structures — solid propellant hybrid rocket engine",
    category: "Student Association · University of Stuttgart",
    year: "2023 – 2025",
    tags: ["Propulsion", "Composites", "Rocket Engines"],
    cover: "/images/hyend-rocket/cover.png",
    summary:
      "University of Stuttgart's student rocketry team. Propulsion/structures pole: solid propellant development and testing, engine design and build, carbon-fibre tank and combustion chamber construction.",
    status: "category",
    href: "/projects/hyend-rocket",
    section: "associations",
    role: "Propulsion / structures pole",
    duration: "15 months (10.2023 – 01.2025)",
    team: "HyEnD student rocketry team",
    tools: ["Matlab", "NASA CEA", "Composites layup", "Test stand"],
  },
  {
    slug: "pinn-optimization",
    title: "Optimization of Hybrid Algorithms to Minimize the Loss Function in PINNs",
    tagline: "A three-phase Adam → CMA-ES → L-BFGS optimizer, tuned by Optuna, that rescues physics-informed networks from ravines gradient descent alone can't escape",
    category: "Academic · Project Work",
    year: "2025",
    tags: ["Python", "PyTorch", "Optuna", "CMA-ES", "Machine Learning"],
    cover: "/images/pinn-optimization/cover.png",
    summary:
      "A hybrid Adam → CMA-ES → L-BFGS training pipeline for physics-informed neural networks, tuned with Optuna: an 18× accuracy improvement over Adam alone on the notoriously hard Allen–Cahn benchmark.",
    status: "category",
    href: "/projects/pinn-optimization",
    section: "academic",
    academicSubsection: "masters",
    role: "Project work — optimiser design, tuning study, benchmarking",
    duration: "2025",
    team: "Solo",
    tools: ["Python", "PyTorch", "Optuna", "CMA-ES"],
  },
];

export const flagshipProjects = projects.filter((p) => p.status === "flagship");
export const categoryProjects = projects.filter((p) => p.status === "category");
export const placeholderProjects = projects.filter((p) => p.status === "placeholder");

/**
 * Turn a free-form `year` string into a sortable number: the latest year it
 * refers to. Handles ranges ("2023 – 2025" → 2025), split years ("2022/23" →
 * 2023), and open-ended work ("2022 – present" → sorts newest).
 */
export function yearSortValue(year: string): number {
  const y = year.toLowerCase();
  if (/present|current|ongoing|now/.test(y)) return 9999;
  const split = y.match(/(\d{4})\s*\/\s*(\d{2})\b/); // e.g. 2022/23
  if (split) return 2000 + parseInt(split[2], 10);
  const fours = y.match(/\d{4}/g);
  if (fours && fours.length) return Math.max(...fours.map(Number));
  return 0;
}

/** Newest first; ties keep their existing (stable) order. */
export function sortByDate<T extends { year: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => yearSortValue(b.year) - yearSortValue(a.year));
}

export type CardProject = {
  slug: string;
  title: string;
  year: string;
  summary: string;
  tags: string[];
  section: ProjectSection;
  subsection?: PersonalSubsection;
  academicSubsection?: AcademicSubsection;
  /** Optional own cover; falls back to the generic placeholder when absent. */
  cover?: string;
  role?: string;
  duration?: string;
  team?: string;
  tools?: string[];
  links?: ProjectLink[];
  disclaimer?: ProjectDisclaimer;
};

/**
 * Adapt a lighter-weight CardProject into the full ProjectMeta shape so it can
 * be rendered by ProjectCard (with a cover image) anywhere the flagship/category
 * projects appear.
 */
export function cardToMeta(c: CardProject): ProjectMeta {
  return {
    slug: c.slug,
    title: c.title,
    tagline: c.summary,
    category: sectionLabels[c.section],
    year: c.year,
    tags: c.tags,
    cover: c.cover ?? GENERIC_PLACEHOLDER,
    summary: c.summary,
    status: "card",
    href: `/projects/${c.slug}`,
    section: c.section,
    subsection: c.subsection,
    academicSubsection: c.academicSubsection,
    role: c.role,
    duration: c.duration,
    team: c.team,
    tools: c.tools,
    links: c.links,
    disclaimer: c.disclaimer,
  };
}

// Lighter-weight projects pulled from the CV — each still gets its own
// (mostly placeholder) journey page via app/projects/[slug], see
// content/placeholder-projects.ts.
export const cardProjects: CardProject[] = [
  {
    slug: "cfd-framework",
    title: "2D CFD Framework for Interactive Flow Simulation",
    year: "2025",
    summary:
      "A from-scratch 2D flow solver with a live, interactive viewer: a vectorized D2Q9 Lattice-Boltzmann core in pure Python/numpy, validated against analytic and benchmark solutions, fast enough to draw obstacles with the mouse and watch a Kármán vortex street form in real time.",
    tags: ["Python", "CFD", "Lattice-Boltzmann", "NS-Equations", "Scientific Visualization"],
    section: "personal",
    subsection: "software-projects",
    cover: "/images/cfd-framework/cover.png",
  },
  {
    slug: "airfoil-design-code",
    title: "Custom 2D Airfoil Design Code",
    year: "2024",
    summary:
      "An inverse 2D airfoil design tool: prescribe the velocity distribution and get the geometry plus its full polar — exact potential-flow core, integral boundary-layer analysis with transition prediction, and an interactive GUI. Prototyped in Python, final version in C++.",
    tags: ["C++", "Python", "Inverse Design", "Aerodynamics", "Boundary Layer"],
    section: "personal",
    subsection: "software-projects",
    cover: "/images/airfoil-design-code/cover.png",
  },
  {
    slug: "investment-platform",
    title: "Investment Portfolio Management & Financial Analytics Platform",
    year: "2022 – present",
    summary:
      "A local-first Python platform that turns raw broker statement exports into a queryable portfolio database — with interactive charts, benchmark comparison against MSCI World, and performance, risk and allocation analytics.",
    tags: ["Python", "SQLite", "Financial Analytics", "Data Visualization", "Portfolio Management"],
    section: "personal",
    subsection: "software-projects",
    cover: "/images/investment-platform/cover.png",
  },
  {
    slug: "diy-quadrotor",
    title: "DIY Autonomous Quadrotor",
    year: "2018",
    summary:
      "First complete autonomous multirotor from frame assembly to flight testing. Custom built frame with Ardupilot flight controller, calibrated compass and IMU, and autonomous mission capabilities.",
    tags: ["Ardupilot", "Multirotor", "Electronics", "Flight Control"],
    section: "personal",
    subsection: "rc-projects",
  },
  {
    slug: "y4-multirotor",
    title: "Y4 Coaxial Multirotor Configuration",
    year: "2021",
    summary:
      "A 3D-printed Y4 multirotor: tricopter geometry with a coaxial rear motor pair instead of a yaw servo. Custom motor mixer, thrust-stand-derived yaw linearisation, and a deliberate motor-out flight test — Ardupilot-based flight control throughout.",
    tags: ["Ardupilot", "Y4 Config", "Flight Dynamics", "CAD"],
    section: "personal",
    subsection: "rc-projects",
    cover: "/images/y4-multirotor/cover.jpg",
  },
  {
    slug: "tilt-rotor-vtol",
    title: "Design and Implementation of a VTOL UAV with Flight Transition Optimisation",
    year: "2021",
    summary:
      "University project: an experimental tilt-rotor UAV blending multirotor vertical takeoff with fixed-wing forward-flight efficiency — structural, propulsion and aerodynamic design in CATIA, with a servo-driven rotor tilt mechanism and the flight mechanics of the transition itself as the design driver.",
    tags: ["VTOL", "Tilting Rotors", "Transition Flight", "CAD (CATIA)", "Flight Mechanics"],
    section: "academic",
    academicSubsection: "bachelors",
  },
  {
    slug: "3d-printed-airframe",
    title: "3D-Printed Aircraft: From Spitfire to Bf 109",
    year: "2019",
    summary:
      "Two fully 3D-printed RC warbirds: a thin-walled Spitfire that proved too heavy and crashed after twenty wobbly metres, and a Messerschmitt Bf 109 redesigned around an internal spine structure — light enough to actually fly.",
    tags: ["3D Printing", "Airframe Design", "Lightweight Structures", "Fusion 360"],
    section: "personal",
    subsection: "rc-projects",
    cover: "/images/3d-printed-airframe/cover.jpg",
  },
  {
    slug: "composite-fixed-wing",
    title: "Foam & Fiberglass Fixed-Wing Platform",
    year: "2020",
    summary:
      "Fixed-wing aircraft constructed using conventional foam core and hand-laid fiberglass technique. Balance between light weight, durability, and ease of repair.",
    tags: ["Composite", "Fiberglass", "Foam Core", "Hand-Laid Construction"],
    section: "personal",
    subsection: "rc-projects",
  },
  {
    slug: "cnc-machine",
    title: "Mostly 3D-Printed CNC Machine, Rebuilt for Real Tolerance",
    year: "2018/19",
    summary:
      "A self-built CNC router whose structure was largely 3D-printed, then redesigned after the first version flexed under load — stiffer printed parts, metal where printing could not hold tolerance, and a rebuilt gantry that finally cut accurately in wood and aluminium.",
    tags: ["CNC Design", "CAD (Solidworks)", "3D Printing", "Metalworking", "Laser Cutting"],
    section: "personal",
    subsection: "hardware-projects",
  },
  {
    slug: "smart-mirror",
    title: 'Smart Mirror & Business Concept for "Jugend Gründet"',
    year: "2018",
    summary: "Built a smart-mirror device and pitched a full business concept around it in a national competition.",
    tags: ["Entrepreneurship", "Project Management", "Public Speaking"],
    section: "personal",
    subsection: "hardware-projects",
  },
  {
    slug: "line-following-cars",
    title: "Line-Following & Maze-Solving Cars: Analog vs. Arduino",
    year: "2016",
    summary: "Built two competing robotic cars — one analog-circuit-based, one Arduino-based — to solve the same maze.",
    tags: ["Arduino (C++)", "Robotics", "Problem Solving"],
    section: "personal",
    subsection: "hardware-projects",
  },
  {
    slug: "lunar-lander",
    title: "Designing Lunar Landing and Ascent Stage — Space Station Design Workshop 2025",
    year: "2025",
    summary:
      "Propulsion & transportation lead on Team Gold's ALFHEIM lunar-base concept: the launch/transfer architecture, launcher and propellant trade studies, and the custom-designed crew and cargo landing/ascent stages for the south pole.",
    tags: ["Propulsion", "Lander Design", "Trade Studies", "Systems Engineering"],
    section: "academic",
    academicSubsection: "masters",
    cover: "/images/lunar-lander/cover.png",
    role: "Propulsion & transportation lead",
    duration: "One week (Space Station Design Workshop 2025)",
    team: "Team Gold — 20 people, one subsystem each",
    tools: ["Matlab", "Astos", "Synera", "Trade-off matrices"],
  },
  {
    slug: "horten-h3-airfoil",
    title: "Modernizing the Horten H3 Airfoil",
    year: "2024",
    summary:
      "Full inverse redesign of the 1938 Horten H3 flying-wing airfoil: same pitching moment for unchanged trim and stability, ~10% less drag in the laminar bucket, a soft stall instead of a hard one — validated with CFD and converted into a glide-polar improvement.",
    tags: ["Inverse Design", "Eppler Method", "Airfoil Design", "CFD", "Flying Wing"],
    section: "academic",
    academicSubsection: "masters",
    cover: "/images/horten-h3-airfoil/cover.jpg",
  },
  {
    slug: "bridge-fea",
    title: "Structural Analysis of a Bridge Under Various Load Cases",
    year: "2024",
    summary:
      "Full FEM journey on a real steel footbridge: hybrid TCL-scripted meshing in ICEM, mesh convergence, prestressed modal analysis, pedestrian-induced dynamics in Abaqus — validated by jumping on the actual bridge with an accelerometer.",
    tags: ["FEA (Abaqus)", "ANSYS ICEM", "Dynamic Analysis", "Modal Analysis"],
    section: "academic",
    academicSubsection: "masters",
    cover: "/images/bridge-fea/cover.jpg",
  },
  {
    slug: "turbulence-models",
    title: "Comparison of Turbulence Models in Sub- and Transonic Flow",
    year: "2024",
    summary:
      "Six RANS turbulence models — from Spalart-Allmaras to a full Reynolds-stress model — benchmarked on the RAE 2822 airfoil in DLR TAU against wind-tunnel data: mesh convergence via Richardson extrapolation, shock positions, computing cost, and polars to stall including shock buffet.",
    tags: ["CFD (TAU)", "Pointwise", "Turbulence Modelling", "Transonic Flow", "Airfoil Aerodynamics"],
    section: "academic",
    academicSubsection: "masters",
    cover: "/images/turbulence-models/cover.png",
  },
  {
    slug: "verification-device",
    title: "Functional Verification Device for an Electronic Subsystem",
    year: "2020",
    summary:
      "Project work at Diehl Defence: a complete Arduino-based test box that automates 34 resistance checks on an electronic subsystem — concept trade studies, custom four-layer PCB with a 32-relay switching matrix and constant-current measurement, enclosure, firmware state machine and a built-in calibration path.",
    tags: ["Electronics", "PCB Design", "Prototyping", "Hardware Testing", "Arduino (C++)"],
    section: "academic",
    academicSubsection: "bachelors",
    cover: "/images/verification-device/cover.jpg",
    role: "Project work — concept, PCB, enclosure, firmware, calibration",
    duration: "2020, during the dual study placement",
    team: "Solo, within the electronics group",
    tools: ["Arduino (C++)", "PCB layout", "CAD", "Lab measurement"],
    disclaimer: {
      org: "Diehl Defence",
      source: "my published project report, “Development of a Functional Verification Device for an Electronic Subsystem” (DHBW Ravensburg, 2020)",
    },
  },
];
