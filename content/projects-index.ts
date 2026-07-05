import {
  PersonalSubsection,
  ProjectMeta,
  ProjectSection,
  AcademicSubsection,
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
    tags: ["C++", "Python", "OpenCV", "Computer Vision", "CNN"],
    cover: "/images/visual-sky-radar.png",
    summary:
      "A ground-based, multi-camera network that spots aircraft and contrails in the open sky, triangulates their position from two calibrated cameras, and cross-references live ADS-B traffic.",
    status: "flagship",
    href: "/projects/visual-sky-radar",
    section: "personal",
    subsection: "software-projects",
  },
  {
    slug: "thermal-correlation",
    title: "Spacecraft Thermal Correlation",
    tagline: "Automated Bayesian correlation of spacecraft thermal models — Airbus Defence and Space",
    category: "Academic · Master Thesis",
    year: "2026",
    tags: ["Python", "Bayesian Inference", "Machine Learning", "Thermal"],
    cover: "/images/thermal-correlation/sentinel2-model.jpg",
    summary:
      "Master thesis at Airbus Defence and Space: replacing manual thermal-model tuning with a Bayesian pipeline and neural-network surrogate models, validated against real Sentinel-2 test data.",
    status: "category",
    href: "/projects/thermal-correlation",
    section: "academic",
    academicSubsection: "masters",
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
  },
  {
    slug: "burn-simulation",
    title: "Generic Solid-Motor Burn Simulator",
    tagline:
      "An internal-ballistics tool that turns grain geometry into a thrust curve — Diehl Defence",
    category: "Academic - Project Work",
    year: "2021",
    tags: ["Python", "Internal Ballistics", "Solid Rocket Motors", "CAD"],
    cover: "/images/placeholders/generic.svg",
    summary:
      "A generic internal-ballistics tool for solid rocket motors, built during a placement at Diehl Defence: it takes an arbitrary grain geometry and propellant and returns thrust, chamber pressure and impulse — including a full analytic star-grain model — validated against a real test firing.",
    status: "category",
    href: "/projects/burn-simulation",
    section: "academic",
    academicSubsection: "bachelors",
  },
  {
    slug: "epfl-spacecraft",
    title: "EPFL Spacecraft Team",
    tagline: "Structures pole — vibration testing & test stand design for the CHESS satellite",
    category: "Student Association",
    year: "2025",
    tags: ["Vibration Testing", "Mass Model", "Structures"],
    cover: "/images/epfl-spacecraft/cover.png",
    summary:
      "Structures-pole member on EPFL's student spacecraft team during a five-month exchange semester: built a digital and physical mass model of the CHESS cubesat and took it through a shaker-table vibration campaign.",
    status: "category",
    href: "/projects/epfl-spacecraft",
    section: "associations",
  },
  {
    slug: "hyend-rocket",
    title: "HyEnD — Hybrid Engine Development",
    tagline: "Propulsion & structures — solid propellant hybrid rocket engine",
    category: "Student Association",
    year: "2023 – 2025",
    tags: ["Propulsion", "Composites", "Rocket Engines"],
    cover: "/images/hyend-rocket/cover.png",
    summary:
      "University of Stuttgart's student rocketry team. Propulsion/structures pole: solid propellant development and testing, engine design and build, carbon-fibre tank and combustion chamber construction.",
    status: "placeholder",
    href: "/projects/hyend-rocket",
    section: "associations",
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
      "A from-scratch 2D Navier-Stokes solver with a live, interactive viewer for exploring fluid behaviour in real time.",
    tags: ["Python", "CFD", "NS-Equations", "Scientific Visualization"],
    section: "personal",
    subsection: "software-projects",
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
    year: "2022/23",
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
      "Exploration of the Y4 (quad plus two) configuration with coaxial motor pairs, offering redundancy and different handling characteristics compared to standard quadrotors. Ardupilot-based flight control.",
    tags: ["Ardupilot", "Y4 Config", "Flight Dynamics", "CAD"],
    section: "personal",
    subsection: "rc-projects",
  },
  {
    slug: "tilt-rotor-vtol",
    title: "Tilt-Rotor VTOL Transition Platform",
    year: "2021",
    summary:
      "Experimental tilt-rotor aircraft blending multirotor vertical takeoff with fixed-wing forward flight efficiency. Motorized servo-driven rotor tilt mechanism with Ardupilot transition logic.",
    tags: ["VTOL", "Tilting Rotors", "Transition Flight", "Ardupilot"],
    section: "personal",
    subsection: "rc-projects",
  },
  {
    slug: "3d-printed-airframe",
    title: "3D-Printed Composite Airframe",
    year: "2019",
    summary:
      "RC aircraft airframe designed in CAD and 3D-printed in nylon-based composite material. Emphasis on structural efficiency and rapid iteration of aerodynamic features.",
    tags: ["3D Printing", "Nylon Composite", "Airframe Design", "Fusion 360"],
    section: "personal",
    subsection: "rc-projects",
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
    slug: "pinn-optimization",
    title: "Optimization of Hybrid Algorithms to Minimize the Loss Function in PINNs",
    year: "2025",
    summary:
      "University project exploring hybrid optimisation strategies (gradient + heuristic) for training physics-informed neural networks.",
    tags: ["Python", "PyTorch", "Optuna", "Machine Learning"],
    section: "academic",
    academicSubsection: "masters",
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
  },
  {
    slug: "horten-h3-airfoil",
    title: "Modernizing the Horten H3 Airfoil",
    year: "2024",
    summary:
      "Re-optimised a historic flying-wing airfoil for efficiency while preserving its stability characteristics.",
    tags: ["X-Foil", "Airfoil Design", "CFD", "C++"],
    section: "academic",
    academicSubsection: "masters",
  },
  {
    slug: "bridge-fea",
    title: "Structural Analysis of a Bridge Under Various Load Cases",
    year: "2024",
    summary: "FEA-based dynamic and modal analysis of a bridge structure under varying load conditions.",
    tags: ["FEA (Abaqus)", "Dynamic Analysis", "Modal Analysis"],
    section: "academic",
    academicSubsection: "masters",
  },
  {
    slug: "turbulence-models",
    title: "Comparison of Turbulence Models in Sub- and Transonic Flow",
    year: "2024",
    summary: "Benchmarked several turbulence closure models against each other across flow regimes using TAU.",
    tags: ["CFD (TAU)", "Pointwise", "Airfoil Aerodynamics"],
    section: "academic",
    academicSubsection: "masters",
  },
  {
    slug: "verification-device",
    title: "Functional Verification Device for an Electronic Subsystem",
    year: "2020",
    summary: "Designed and built a dedicated PCB test rig to functionally verify an electronic subsystem.",
    tags: ["Electronics", "PCB Design", "Prototyping", "Hardware Testing"],
    section: "academic",
    academicSubsection: "bachelors",
  },
];
