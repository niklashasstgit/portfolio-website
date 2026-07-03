import { PersonalSubsection, ProjectMeta, ProjectSection, AcademicSubsection } from "./types";

export const projects: ProjectMeta[] = [
  {
    slug: "visual-sky-radar",
    title: "Visual Sky Radar",
    tagline: "Distributed multi-camera system for real-time aerial tracking",
    category: "Personal · Software",
    year: "2025",
    tags: ["C++", "Python", "OpenCV", "Computer Vision", "CNN"],
    cover: "/images/placeholders/generic.svg",
    summary:
      "A ground-based, multi-camera network that spots aircraft and contrails in the open sky, triangulates their position from two calibrated cameras, and cross-references live ADS-B traffic.",
    status: "flagship",
    href: "/projects/visual-sky-radar",
    section: "personal",
    subsection: "software-projects",
  },
  {
    slug: "drones-aircraft",
    title: "Drones, Aircraft & Machines",
    tagline: "RC platform builds, a VTOL UAV thesis, and a self-built CNC machine",
    category: "Personal · RC",
    year: "2015 – present",
    tags: ["Fusion 360", "Ardupilot", "CAD", "Additive Manufacturing"],
    cover: "/images/placeholders/generic.svg",
    summary:
      "A decade of building physical things: RC aircraft platforms flown on custom Ardupilot setups, a from-scratch VTOL UAV with flight-transition optimisation, and a redesigned 3D-printed CNC machine.",
    status: "category",
    href: "/projects/drones-aircraft",
    section: "personal",
    subsection: "rc-projects",
  },
  {
    slug: "thermal-correlation",
    title: "Spacecraft Thermal Correlation",
    tagline: "Automated Bayesian correlation of spacecraft thermal models — Airbus Defence and Space",
    category: "Academic · Master Thesis",
    year: "2025 – 2026",
    tags: ["Python", "Bayesian Inference", "Machine Learning", "Thermal"],
    cover: "/images/placeholders/generic.svg",
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
    cover: "/images/placeholders/generic.svg",
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
    tags: ["Vibration Testing", "Test Stand Design", "Structures"],
    cover: "/images/placeholders/epfl-spacecraft.svg",
    summary:
      "Structures pole member on EPFL's student spacecraft team, working on vibration test campaigns and test-stand design for the CHESS cubesat.",
    status: "placeholder",
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
    cover: "/images/placeholders/hyend-rocket.svg",
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

export type CardProject = {
  slug: string;
  title: string;
  year: string;
  summary: string;
  tags: string[];
  section: ProjectSection;
  subsection?: PersonalSubsection;
  academicSubsection?: AcademicSubsection;
};

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
      "A parametric airfoil design tool for sub- and transonic regimes, built to explore shape/performance trade-offs outside of commercial CAD.",
    tags: ["C++", "Aerodynamics", "Airfoil Design", "Parametric Modelling"],
    section: "personal",
    subsection: "software-projects",
  },
  {
    slug: "investment-platform",
    title: "Investment Portfolio Management & Financial Analytics Platform",
    year: "2022/23",
    summary:
      "A Python-based platform for tracking, analysing and visualising an investment portfolio, backed by its own database layer.",
    tags: ["Python", "Data Visualization", "Portfolio Management"],
    section: "personal",
    subsection: "software-projects",
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
    title: "Designing Lunar Landing and Ascend Stage — Space Station Design Workshop",
    year: "2025",
    summary:
      "Systems-engineering design of a lunar lander/ascent stage during an intensive international design workshop.",
    tags: ["Matlab", "Astos", "Systems Engineering", "Synera"],
    section: "academic",
    academicSubsection: "masters",
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
