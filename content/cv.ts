export const cvBasics = {
  name: "Niklas Julian Blattner",
  location: "Weingarten, Germany",
  phone: "+49 175 7373 221",
  email: "niklasblattner@gmail.com",
  linkedin: "linkedin.com/in/niklas-blattner",
  linkedinHref: "https://www.linkedin.com/in/niklas-blattner",
  github: "github.com/niklasblattner",
  githubHref: "https://github.com/niklasblattner",
};

export type EmploymentEntry = {
  period: string;
  role: string;
  org: string;
  bullets: string[];
};

export const employment: EmploymentEntry[] = [
  {
    period: "10.2025 – 04.2026",
    role: "Master Thesis",
    org: "Airbus Defence and Space GmbH, Immenstaad",
    bullets: [
      "Developed automated Bayesian methods to correlate thermal models with test data.",
      "Conducted sensitivity analyses and optimization utilizing surrogate models.",
    ],
  },
  {
    period: "10.2024 – 02.2025",
    role: "Teaching Assistant — CFD Seminar",
    org: "University of Stuttgart",
    bullets: [
      "Guided students through complex CFD exercises and provided technical advice on simulations and analysis.",
      "Supported lectures and exercises for the seminar.",
    ],
  },
  {
    period: "10.2022 – 09.2023",
    role: "Development Engineer Propulsion and Aerodynamics",
    org: "Diehl Defence",
    bullets: [
      "Developed various parts of solid rocket motors, FEM structural analysis, numerous CFD calculations for solid motors and jet engines.",
      "Missile structural design and aerodynamic considerations, SRM propellant design, missile launch simulations.",
    ],
  },
  {
    period: "09.2019 – 09.2022",
    role: "Working Student (Dual Study Program)",
    org: "Diehl Defence + DHBW Ravensburg",
    bullets: [
      "Principles of mechanical production and electronics.",
      "Created analytical Python tools for combustion, nozzle, and inlet design as well as CFD analyses of jet exhausts.",
    ],
  },
];

export type EducationEntry = {
  period: string;
  degree: string;
  org: string;
  detail: string;
};

export const education: EducationEntry[] = [
  {
    period: "10.2023 – 05.2026",
    degree: "M.Sc. Aerospace Engineering",
    org: "University of Stuttgart",
    detail:
      "Specialization: Experimental and numeric methods and spaceflight technology. Thesis: Enhancing Spacecraft Thermal Design through Automated Data Correlation.",
  },
  {
    period: "02.2025 – 07.2025",
    degree: "M.Sc. Exchange Semester",
    org: "École polytechnique fédérale de Lausanne (EPFL)",
    detail:
      "Exchange semester at the mechanical engineering department with classes on network machine learning, high performance computing, space mechanisms.",
  },
  {
    period: "10.2019 – 09.2022",
    degree: "B.Eng. Aerospace Engineering",
    org: "DHBW Ravensburg",
    detail:
      "Specialization: Aerospace Electronics and Systems Engineering. Thesis: Development of an Analytical Tool for Designing Supersonic Diffuser Inlets.",
  },
];

export type AssociationEntry = {
  period: string;
  role: string;
  org: string;
  detail: string;
  href?: string;
};

export const associations: AssociationEntry[] = [
  {
    period: "02.2025 – 08.2025",
    role: "Structures Pole",
    org: "EPFL Spacecraft Team",
    detail: "Vibration testing and test stand design for the CHESS satellite.",
    href: "/projects/epfl-spacecraft",
  },
  {
    period: "10.2023 – 01.2025",
    role: "Propulsion / Structures Pole",
    org: "Hybrid Engine Development (HyEnD) — University of Stuttgart",
    detail:
      "Solid propellant development and testing, engine design and build, carbon-reinforced tank and combustion chamber construction.",
    href: "/projects/hyend-rocket",
  },
];

export const skills = {
  languages: ["German (C2)", "English (C2)", "French (B1)"],
  coding: ["Python", "Matlab", "C++", "LaTeX", "Git"],
  software: [
    "Ansys Fluent & Mechanical",
    "TAU",
    "Abaqus",
    "Fusion 360",
    "Solidworks",
    "CATIA",
    "TecPlot",
    "RPA",
  ],
  misc: [
    "Toolshop experience",
    "3D printing (FDM/SLA)",
    "Football",
    "Glider pilot",
  ],
  soft: [
    "Adaptability",
    "Cooperative",
    "Close collaboration",
    "Time management",
    "Communication",
    "Creativity",
    "Leadership",
    "Resilience",
    "Team player",
    "Strong organisation & coordination",
    "Systematic & diligent",
    "Independent",
    "Drive towards excellence",
    "Solution-driven & proactive",
  ],
};

export type CvProjectEntry = {
  year: string;
  title: string;
  skills: string[];
  href?: string;
};

export const cvProjects: { group: string; items: CvProjectEntry[] }[] = [
  {
    group: "University",
    items: [
      {
        year: "2026",
        title:
          "Enhancing Spacecraft Thermal Design through Automated Data Correlation",
        skills: ["Python", "Machine learning", "Data science", "Statistics"],
        href: "/projects/thermal-correlation",
      },
      {
        year: "2025",
        title:
          "Designing Lunar Landing and Ascend Stage at Space Station Design Workshop",
        skills: ["Matlab", "Astos", "Systems Engineering", "Synera"],
        href: "/projects/lunar-lander",
      },
      {
        year: "2025",
        title:
          "Optimization of Hybrid Algorithms to Minimize the Loss Function in PINNs",
        skills: ["Python", "PyTorch", "Optuna", "Machine learning"],
        href: "/projects/pinn-optimization",
      },
      {
        year: "2024",
        title:
          "Modernizing the Horten H3 Airfoil: Enhancing Efficiency and Preserving Stability",
        skills: ["X-Foil", "Airfoil design", "CFD", "C++"],
        href: "/projects/horten-h3-airfoil",
      },
      {
        year: "2024",
        title:
          "Structural Analysis of a Bridge Under Various Load Cases Using FEA",
        skills: ["FEA (Abaqus)", "Dynamic and modal analysis"],
        href: "/projects/bridge-fea",
      },
      {
        year: "2024",
        title:
          "Comparison of Different Turbulence Models in Sub- and Transonic Flow Regimes",
        skills: ["CFD (TAU)", "Pointwise", "Airfoil aerodynamics"],
        href: "/projects/turbulence-models",
      },
      {
        year: "2022",
        title:
          "Development of an Analytical Tool for Designing Supersonic Diffuser Inlets",
        skills: ["Python", "CFD (Ansys Fluent)", "Git", "Supersonic aerodynamics"],
        href: "/projects/supersonic-inlet",
      },
      {
        year: "2021",
        title: "Development of a Generic Burn Simulation Tool for Solid Rocket Motors",
        skills: ["Python", "Matlab", "Git", "Chemistry", "RPA"],
        href: "/projects/burn-simulation",
      },
      {
        year: "2021",
        title: "Design and Implementation of a VTOL UAV with Flight Transition Optimisation",
        skills: ["CAD (CATIA)", "Flight mechanics", "Structure/propulsion/aerodynamic design"],
        href: "/projects/tilt-rotor-vtol",
      },
      {
        year: "2020",
        title: "Development of a Functional Verification Device for an Electronic Subsystem",
        skills: ["Electronics", "PCB design and layout", "Prototyping", "Hardware testing"],
        href: "/projects/verification-device",
      },
    ],
  },
  {
    group: "School",
    items: [
      {
        year: "2018",
        title: 'Smart Mirror Development and Business Concept for "Jugend Gründet"',
        skills: ["Public speaking", "Entrepreneurship", "Project management", "Business plan development"],
        href: "/projects/smart-mirror",
      },
      {
        year: "2016",
        title: "Development of Two Line-Following and Maze-Solving Cars: Analog vs. Arduino",
        skills: ["Arduino (C++)", "Problem-solving", "Robotics"],
        href: "/projects/line-following-cars",
      },
    ],
  },
  {
    group: "Private",
    items: [
      {
        year: "2025",
        title: "Distributed Multi-Camera System for Real-Time Aerial Tracking",
        skills: ["C++", "Python", "OpenCV", "Computer vision", "Visual tracking", "CNN object classification"],
        href: "/projects/visual-sky-radar",
      },
      {
        year: "2025",
        title: "Development of a 2D CFD Framework for Interactive Flow Simulation",
        skills: ["Python", "CFD", "NS-equations", "Fluid dynamics", "Scientific visualization"],
        href: "/projects/cfd-framework",
      },
      {
        year: "2024",
        title: "Developed a custom 2D airfoil design code for sub- and transonic regimes",
        skills: ["C++", "Aerodynamics", "Airfoil Design", "Computational Methods", "Parametric Modelling"],
        href: "/projects/airfoil-design-code",
      },
      {
        year: "2022/23",
        title: "Investment Portfolio Management and Financial Analytics Platform",
        skills: ["Python", "Data visualization", "Portfolio management", "Database management"],
        href: "/projects/investment-platform",
      },
      {
        year: "2018/19",
        title: "Build and Redesigned Mostly 3D Printed CNC Machine",
        skills: ["CNC design", "CAD (Fusion 360)", "Wood and metalworking", "Laser cutting"],
      },
      {
        year: "from 2017",
        title: "Drone and Aircraft Design, Simulation, Testing and Manufacturing",
        skills: ["CAD (Fusion 360)", "Additive manufacturing", "Ardupilot", "RC drone and plane design"],
      },
      {
        year: "from 2015",
        title: "Additive Manufacturing",
        skills: ["Additive manufacturing (FDM/SLA)", "Prototyping", "Component design"],
      },
    ],
  },
];
