import { Chapter } from "./types";

export const lunarLanderChapters: Chapter[] = [
  {
    id: "workshop",
    kicker: "01 — The Workshop",
    title: "Design a lunar base in a week — with people you met on Monday",
    body: [
      "The Space Station Design Workshop (SSDW) is an intensive, international systems-engineering workshop hosted in Stuttgart by the Institute of Space Systems (IRS). Student and young-professional teams from around the world are dropped into a single, enormous problem statement and have to deliver a complete, self-consistent space-mission concept — architecture, subsystems, cost, business case, legal framework — in a matter of days, defended in front of a jury of space-industry experts at the end.",
      "It runs the way a real concept study runs, just compressed to breaking point: a team of twenty specialists, each owning a subsystem, forced to converge on one design while every decision ripples into everyone else's. Mass you claim is mass someone else can't have; power you draw is power that has to be generated and cooled.",
      "For the 2025 edition I was part of Team Gold, whose brief was a permanent crewed lunar base. This page is the story of that project as a whole — and then a deep dive into the part I owned: getting everything, and everyone, to the surface and back.",
    ],
    layout: "text-only",
    tags: ["SSDW 2025", "Stuttgart · IRS", "Systems Engineering"],
  },
  {
    id: "alfheim",
    kicker: "02 — The Mission",
    title: "ALFHEIM — a sustainable outpost at the lunar south pole",
    body: [
      "Team Gold's concept was ALFHEIM: the Advanced Lunar Facility for Habitation, Exploration, Innovation & Maintenance — a permanently crewed base at the Moon's south pole, operational by 2035 and designed to run for up to 50 years. The south pole was chosen for the same reasons Artemis targets it: near-continuous solar illumination on the crater rims for power, and permanently shadowed regions nearby holding water ice for life support and propellant.",
      "The architecture is deliberately modular — a mix of rigid and inflatable habitation modules joined through a nodal system, so the base can grow, tolerate failures and be maintained module by module. Two enabling technologies carry the long-term vision: In-Situ Resource Utilisation (ISRU) to extract water, oxygen and construction material from the shadowed regolith, and bioregenerative life support to close the air, water and biomass loops and cut dependence on Earth resupply. A phased roadmap starts on physicochemical systems and resupply, then folds in ISRU and bioregenerative life support around 2040. The program was costed at roughly 80–100 billion USD, underpinned by a public-private 'Space-as-a-Service' business model.",
      "As a member of a twenty-person team on a concept this broad, I had a hand in many corners of it — but my named responsibility was one specific, unavoidable question.",
    ],
    layout: "text-only",
    tags: ["ALFHEIM", "Lunar South Pole", "ISRU", "Modular Base"],
  },
  {
    id: "role",
    kicker: "03 — My Role",
    title: "Propulsion & Transportation lead: how does any of this reach the Moon?",
    body: [
      "I led propulsion and transportation — transport vehicles, landers and logistics. On paper it's one subsystem box on the org chart; in practice it's the constraint the entire base is built against. A habitat that can't be flown to the surface, or a crew that can't get home, is not a mission. Every module's mass and diameter, every crew rotation, every tonne of resupply had to survive the trip through my part of the architecture.",
      "The task decomposed into a chain of coupled decisions: which rocket launches the cargo, which launches the crew, how everything transfers from Earth to lunar orbit, and — the hard part — what actually carries mass down to the south-pole surface and lifts crew back off it. Where a proven vehicle existed, the job was to justify buying it. Where none did, the job was to design one.",
      "The sections below walk that chain from orbit down to the regolith, and are where most of my week went.",
    ],
    layout: "text-only",
    tags: ["Propulsion Lead", "Transportation Architecture", "Logistics"],
  },
  {
    id: "architecture",
    kicker: "04 — The Δv Chain",
    title: "From trans-lunar injection to the surface, via Gateway",
    body: [
      "The backbone is a Gateway-centric architecture. Vehicles leave Earth on a trans-lunar injection, insert into the Near-Rectilinear Halo Orbit (NRHO) that the Lunar Gateway occupies, and from there a lander drops to the south-pole surface; the return runs in reverse. That staging point matters, because it lets the Earth-launch vehicle, the transfer and the lander each be optimised for its own leg instead of one vehicle carrying dead mass through the whole trip.",
      "The energy bookkeeping — the Δv budget — is what sizes every vehicle downstream. Drawing on the NASA HLS mission-design references, I broke the trip into its legs: roughly 0.8–0.9 km/s to insert from trans-lunar injection into NRHO, about 2.2–2.4 km/s for the powered descent from NRHO down through low lunar orbit to the surface, and a comparable 2.2–2.5 km/s to ascend and rendezvous back at NRHO. Those numbers are the input to every rocket-equation calculation that follows: descent and ascent each cost more than two kilometres per second, and there is no atmosphere to help.",
      "With the budget fixed, the architecture became a series of trade studies — one per vehicle in the chain.",
    ],
    media: [
      {
        type: "image",
        src: "/images/lunar-lander/dv-budget.png",
        alt: "Bar chart of the delta-v budget for the three mission legs",
        caption: "Own work — mission Δv budget by leg, from the workshop's mission-analysis references. Descent and ascent dominate and size the landers.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["Δv Budget", "NRHO / Gateway", "Mission Analysis"],
  },
  {
    id: "launcher",
    kicker: "05 — The Launch Trade-off",
    title: "Choosing the ride to trans-lunar injection",
    body: [
      "For the Earth-launch segment, plenty of vehicles exist, so this was a buy decision made rigorously rather than a design task. I set up a weighted decision matrix over twelve candidate launchers — from Ariane 64 and Vulcan Centaur through New Glenn, Neutron and Long March 10 to the full SLS Block family — scored against seven criteria and normalised with a Six-Sigma weighting scheme. Payload to trans-lunar injection carried the most weight, followed by fairing size (habitat modules are volume-critical, not just mass-critical), demonstrated success rate, and European accessibility, with cost-per-kg and reusability deliberately down-weighted in an exploration context.",
      "Falcon Heavy came out on top. It delivers about 20 t to trans-lunar injection, is flight-proven with a strong success record, and is available today — while SLS Block 2 and Starship, though more capable on paper, carried too much schedule risk for an early-2030s first flight. Neatly, because the Falcon Heavy payload also fits inside the mass and fairing envelopes of both SLS Block 2 and Starship, those heavier vehicles fall out for free as fallback options if Falcon Heavy is unavailable. The same method applied to crew launch selected Falcon Heavy paired with Crew Dragon on safety and reliability grounds, with Orion kept as a lunar-optimised — but costlier — backup.",
      "That settled how mass reaches lunar orbit. The far harder question was the last few kilometres down to the surface.",
    ],
    media: [
      {
        type: "image",
        src: "/images/lunar-lander/launcher-tradeoff.png",
        alt: "Horizontal bar chart ranking launch vehicles by weighted score, Falcon Heavy highest",
        caption: "Own work — weighted launcher trade-off; Falcon Heavy selected on payload-to-TLI, reliability and near-term availability.",
        fit: "contain",
      },
    ],
    layout: "image-left",
    tags: ["Trade Study", "Falcon Heavy", "Decision Matrix"],
  },
  {
    id: "build-vs-buy",
    kicker: "06 — Build vs. Buy",
    title: "The moment we decided to design our own landers",
    body: [
      "Launchers you buy; landers, it turned out, we had to build. I ran the same trade-off discipline over the available and announced lunar-landing options and hit a wall: none of them fit. The commercial and program landers on offer were either sized for the wrong payload class, unavailable on our timeline, or architecturally incompatible with delivering ten-metre habitation modules to a specific south-pole site. For a base whose whole premise is large modular habitats, 'close enough' isn't a lander.",
      "So we made the consequential call: design custom landing systems for ALFHEIM, split into two dedicated vehicles with genuinely different jobs. A crew lander, optimised around safety, abort capability and a round trip — down to the surface and back up to Gateway. And a cargo lander, optimised purely to put the maximum possible module mass and volume on the surface, one-way, with no need to ever fly again.",
      "That split — refusing a single compromise vehicle in favour of two purpose-built ones — is the design decision I'm most satisfied with from the week, and it drove everything that followed: propellant choice, engine count, structure and landing geometry all fall out of treating crew and cargo as separate problems.",
    ],
    layout: "text-only",
    tags: ["Custom Design", "Crew vs. Cargo", "Requirements"],
  },
  {
    id: "propellant",
    kicker: "07 — Propellant Selection",
    title: "Why the crew lander burns green propellant, not hydrazine",
    body: [
      "Propellant choice is the first fork in any lander design, because it sets the specific impulse that the rocket equation then multiplies across the Δv budget. I ran a dedicated trade-off. The obvious default for a storable lander is hydrazine / nitrogen tetroxide — hypergolic, deeply flight-proven, and space-storable for the months the vehicle would sit on the surface. Its cost is toxicity: hazardous ground handling, elaborate safety procedures, and the growing regulatory pressure (HARCC and similar) to phase it out.",
      "For the crew lander I selected instead a green propellant combination — ethanol and nitrous oxide, from the ISPtech / HyNox engine line. At around 285 s specific impulse it comes close to hydrazine's performance, while its higher energy density partly compensates for the gap, and crucially it is storable without the toxic-fume hazard. With a crew aboard during ground operations, eliminating toxic propellant is worth real performance margin. The sizing chart makes the stakes concrete: at the two-plus km/s each leg demands, small changes in specific impulse swing the propellant mass fraction by tens of percent, which is why this trade-off, not the structure, dominated the crew lander's mass.",
      "The cargo lander, flying uncrewed and one-way, could make the opposite trade and reach for the highest performance available — cryogenic hydrogen and oxygen at about 455 s — accepting handling complexity it doesn't have a crew to endanger.",
    ],
    media: [
      {
        type: "image",
        src: "/images/lunar-lander/mass-sizing.png",
        alt: "Tsiolkovsky propellant-mass-fraction curves for three propellant combinations versus delta-v",
        caption: "Own work — Tsiolkovsky sizing: propellant mass fraction vs. Δv for each candidate propellant. Higher Isp (H₂/O₂) buys dramatic mass savings on the demanding lunar legs.",
        fit: "contain",
      },
    ],
    layout: "image-right",
    tags: ["Green Propellant", "Ethanol / N₂O", "Isp", "Rocket Equation"],
  },
  {
    id: "crew-lander",
    kicker: "08 — The Crew Lander",
    title: "Engineered around a single dropped engine",
    body: [
      "Because the green ethanol/nitrous-oxide combination is neither hypergolic nor yet fully flight-qualified, its engine-out risk is higher than a hydrazine baseline — so I built the crew lander's architecture around surviving failures rather than assuming they won't happen. The descent stage carries six pressure-fed engines, laid out so that any four of them can complete the landing safely: the vehicle can lose an engine on final descent, the crew's least forgiving moment, and still touch down. The ascent stage uses four slightly smaller engines of the same family, sized so that just two can still reach orbit for rendezvous with Gateway, while all four together give a high thrust-to-weight ratio and a brisk climb off the surface.",
      "Pressure-feeding the engines was a deliberate simplification: no turbopumps, far fewer failure modes, and near-instant deep throttling — exactly what a precision powered descent to an unprepared south-pole site needs. The same nitrous oxide that feeds the main engines doubles as an efficient monopropellant for reaction control when run through a catalyst, so attitude control shares the main propellant tanks instead of carrying a separate cold-gas system.",
      "Sizing the vehicle against the Δv budget — with a 20% structural mass fraction and a 10% propellant margin as working assumptions — produced a two-stage lander in the low-double-digit-tonne class at NRHO departure, with the compact ascent stage nested inside the descent stage's thrust structure. Every number there is a preliminary concept estimate, but the architecture — redundant pressure-fed engines, shared green propellant, staged for the round trip — is the part that matters, and it holds together.",
    ],
    layout: "text-only",
    tags: ["Engine-Out Redundancy", "Pressure-Fed", "Two-Stage", "RCS"],
  },
  {
    id: "cargo-lander",
    kicker: "09 — The Cargo Lander",
    title: "A lander that lies down so a rover can drive under the habitat",
    body: [
      "The cargo lander is where the design gets genuinely unusual, and it started from a hard geometric constraint: to use the full Falcon Heavy fairing I sized the delivered payload as a habitation module up to ten metres long, and once you add the propulsion stage beneath it the assembly stands nearly eighteen metres tall. Landing an eighteen-metre tower vertically on unprepared regolith, then somehow lowering a ten-metre module to the ground from its top, is asking for a tip-over and an unreachable payload.",
      "So the cargo lander lands horizontally. The whole stack comes down on its side, distributing the descent engines and thrust structure along its length to keep the centre of mass balanced through the burn, with the power-and-propulsion pods flattened on their outer faces to carry two landing legs each. Once it's down, the module sits low and level, and a rover can simply drive underneath or alongside to lift it clear and carry it to the build site — turning the lander's most awkward feature into its most useful one. Assuming hydrogen/oxygen propulsion and the full 20 t Falcon Heavy payload at trans-lunar injection, the sizing left roughly 7.75 t of delivered module mass on the surface per flight.",
      "It is not an elegant vehicle. But it does the one thing the base absolutely requires — put a large, intact habitat module on the ground, accessible — and it does it without any pre-existing surface infrastructure to help.",
    ],
    media: [
      {
        type: "image",
        src: "/images/lunar-lander/cargo-lander-config.png",
        alt: "Schematic of the cargo lander in its horizontal landing configuration with distributed thrust pods and landing legs",
        caption: "Own work — cargo lander in its horizontal-landing configuration: a 10 m module on distributed thrust/power pods, landed sideways for stability and rover access.",
        fit: "contain",
      },
    ],
    layout: "image-left",
    tags: ["Horizontal Landing", "10 m Modules", "Rover Access", "Falcon Heavy Fairing"],
  },
  {
    id: "landing-safety",
    kicker: "10 — Landing Safety",
    title: "The pitch-over, the plume and the single-engine failure",
    body: [
      "A powered descent is most fragile in its final seconds, so part of the transportation work was checking that the landing itself survives things going wrong. Working with mission analysis, we sketched a conceptual descent trajectory into the candidate south-pole craters — a braking phase from low lunar orbit followed by a pitch-over into the vertical for terminal descent — and ran failure cases against it. The one that matters most is losing an engine during the pitch-over, the exact instant the vehicle is rotating and near the ground; the analysis showed the multi-engine, engine-out-tolerant layout keeps the landing site safe even then, which is precisely the scenario the six-engine descent stage was designed for.",
      "The exhaust plume is its own hazard on the Moon: with no atmosphere, engine efflux blasts regolith outward at high velocity, sandblasting anything nearby. The early landers are laid out to spread their thrust and keep plume velocities down, but landings still have to be spaced well apart from the base and from each other to protect existing hardware until dedicated infrastructure exists.",
      "These were conceptual, first-order safety checks rather than full six-degree-of-freedom simulations — the honest scope of a one-week study — but they were enough to confirm the architecture didn't have a fatal flaw hiding in its most dangerous phase.",
    ],
    layout: "text-only",
    tags: ["Descent Trajectory", "Pitch-Over", "Plume-Regolith", "Failure Analysis"],
  },
  {
    id: "future",
    kicker: "11 — The Evolution Path",
    title: "How the landers get better once the base makes its own fuel",
    body: [
      "The transportation architecture was designed to evolve with the base rather than stay frozen. The first-generation landers carry storable propellant because they have to arrive fully fuelled and wait. But once ALFHEIM's ISRU plant is producing hydrogen and oxygen from polar water ice at scale, the landers no longer need to store cryogens for months — they can refuel directly from the base. That single change unlocks a chain of gains: higher-specific-impulse cryogenic engines, no ascent propellant carried down from Earth, and an ascent stage that can even ferry locally-made propellant up to Gateway or a future orbital depot. Taken far enough, a sustained lunar oxygen-hydrogen supply turns the base into a refuelling node for missions heading further out.",
      "The surface infrastructure evolves in parallel. Where the first landings rely on spreading thrust to avoid burning into raw regolith, a mature base — envisioned past 2040 — would use dedicated, compacted or 3D-printed landing pads with integrated propellant storage, automated fuelling, and modular guidance structures for precise, repeatable landings at higher cadence.",
      "Sketching that roadmap was the point where propulsion stopped being an isolated subsystem and became part of the base's whole growth story — the piece that makes 'sustainable' more than a slogan.",
    ],
    layout: "text-only",
    tags: ["ISRU Refuelling", "Cryogenic Evolution", "Landing Pads", "Cislunar Depot"],
  },
  {
    id: "reflection",
    kicker: "12 — Reflection",
    title: "What a week of forced trade-offs teaches",
    body: [
      "The lasting lesson was how tightly a real space architecture is coupled, and how fast you feel it when twenty people design one together under a deadline. A propellant choice made for crew-safety reasons changed the lander's mass, which changed what the launcher had to lift, which fed back into cost and schedule that other team members owned. Nothing was local. The value of the trade-off discipline — weighting criteria explicitly, scoring candidates, defending the number — was that it made those coupled decisions legible and arguable instead of matters of taste.",
      "It was also a lesson in scoping honesty: conceptual trajectories, first-order sizing and preliminary mass fractions are the right fidelity for a one-week concept study, as long as you're clear that's what they are. The goal wasn't a flight-ready lander; it was an architecture that hangs together, is justified at every branch, and is honest about where the detailed work would still have to be done. ALFHEIM — landers, launch chain and all — was defended in front of the expert jury as exactly that, and holding the propulsion story together end to end under that pressure is the part of the workshop I'd do again in a heartbeat.",
    ],
    layout: "text-only",
    tags: ["Systems Coupling", "Concept-Study Fidelity", "Lessons"],
  },
];
