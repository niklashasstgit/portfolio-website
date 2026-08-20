import { Chapter } from "./types";

export const hyendRocketChapters: Chapter[] = [
  {
    id: "intro",
    kicker: "01 — The Team",
    title: "HyEnD — Hybrid Engine Development, University of Stuttgart",
    body: [
      "HyEnD is the University of Stuttgart's student rocketry team, developing hybrid rocket engines end to end — design, manufacture, static fire, flight. I worked in the propulsion and structures pole from October 2023 to January 2025.",
      "A hybrid engine sits between the two classical architectures: a solid fuel grain in the combustion chamber, and a liquid or gaseous oxidiser injected into it from a separate tank. That split is the whole appeal. Unlike a solid motor it can be throttled and shut down, because stopping the oxidiser stops the combustion; unlike a liquid engine it needs only one fluid system instead of two, which removes an entire tank, feed line and injector circuit from the vehicle. The price is combustion that is harder to model — the fuel is consumed off a receding surface rather than injected at a controlled rate, so the mixture ratio drifts as the grain burns back.",
      "That drift is the thread running through everything below: it is why the fuel geometry has to be sized carefully, why the injector is the component that sets the engine's behaviour, and why the performance prediction matters before anyone lights anything.",
    ],
    layout: "text-only",
    tags: ["HyEnD", "University of Stuttgart", "Hybrid Propulsion"],
  },
  {
    id: "propellant",
    kicker: "02 — Propellant Development",
    title: "Developing and testing the solid fuel side",
    body: [
      "Part of my work went into the solid propellant side of the engine: developing and characterising the fuel grain ahead of static-fire testing.",
      "In a hybrid, the fuel grain does something a solid motor's grain never has to. It is not carrying an oxidiser within itself — it burns only where oxidiser reaches its surface, which means the rate at which the surface recedes depends on the flow over it rather than purely on chamber pressure. Two consequences follow directly, and both drive the design: the burn rate is comparatively low, so the grain needs enough exposed surface area to produce useful thrust; and because the port opens up as the fuel is consumed, the surface area and the mixture ratio change continuously through the burn.",
      "Characterising a candidate fuel therefore means finding out how fast it actually regresses under realistic flow conditions, not just whether it burns — and that number is what every subsequent sizing calculation depends on.",
    ],
    layout: "text-only",
    tags: ["Solid Propellant", "Grain Regression", "Fuel Characterisation"],
  },
  {
    id: "injector",
    kicker: "03 — Injector Sizing",
    title: "Two-phase flow, and why the injector is the hard part",
    body: [
      "On the analysis side I worked on injector sizing and the dimensioning of the fuel segment. The injector is the single component that sets how the engine behaves: it fixes the oxidiser mass flow, which with the fuel regression sets the mixture ratio, which sets the combustion temperature and the specific impulse.",
      "It is also the component where the physics gets awkward. A self-pressurising oxidiser stored as a saturated liquid begins to boil as it drops through the injector, so what enters the chamber is neither purely liquid nor purely gas but a two-phase mixture — and the ordinary incompressible orifice equation, which assumes a single-phase liquid, quietly stops being valid. Sizing the holes with it gives the wrong mass flow, and therefore the wrong mixture ratio and the wrong engine.",
      "Getting that right means using models built for flashing two-phase flow rather than the textbook single-phase relation, and accepting that the answer is a band rather than a single number.",
    ],
    layout: "text-only",
    tags: ["Injector Design", "Two-Phase Flow", "Mass Flow"],
  },
  {
    id: "performance",
    kicker: "04 — Performance Prediction",
    title: "O/F sweeps and NASA CEA before anything is fired",
    body: [
      "With the injector and grain sized, the question becomes what the engine will actually deliver — and here the mixture-ratio drift returns as the central problem. Specific impulse is not flat with oxidiser-to-fuel ratio; it peaks somewhere and falls away on both sides, so an engine whose O/F wanders through the burn is moving along that curve the whole time.",
      "I ran O/F sweeps using NASA CEA-based combustion models to find where the peak sits for the propellant combination and to see how much performance is lost at the ends of the range the engine will actually pass through. The useful design outcome is not the peak value itself but the choice of where to place the engine's starting point on that curve, so that the drift moves it across the best part of the range rather than off the edge of it.",
      "This is the step that justifies the hardware before it exists: checking on paper that the geometry, the injector and the propellant combination produce a sensible thrust and impulse, so a static fire tests a design rather than discovers one.",
    ],
    layout: "text-only",
    tags: ["NASA CEA", "O/F Ratio", "Specific Impulse", "Matlab"],
  },
  {
    id: "structures",
    kicker: "05 — Structures",
    title: "Carbon-reinforced tanks and combustion chambers",
    body: [
      "On the structures side: engine design and build, including carbon-fibre-reinforced construction of the oxidiser tank and the combustion chamber.",
      "These are the two components with the least forgiving requirements on the vehicle. Both are pressure vessels, so both are sized against burst with a margin; both have to be as light as possible, because tank and chamber mass is dead weight carried the whole way up. Carbon fibre answers that well — it is stiff and strong along the fibre direction, so a vessel can be wound with the fibres laid where the hoop and axial stresses actually are.",
      "The combustion chamber adds the thermal problem on top. Composite loses strength as it heats, and the inside of a firing engine is far past what the matrix can survive, so the structural wall has to be protected by a liner that ablates or insulates for the duration of the burn — the chamber only has to survive as long as the firing lasts, but it has to survive all of it.",
      "Building these by hand is where the analysis meets reality: layup quality, fibre alignment and cure are as decisive for whether the part holds as the stress calculation that specified it.",
    ],
    layout: "text-only",
    tags: ["Composites", "Pressure Vessels", "Thermal Protection", "Engine Build"],
  },
];
