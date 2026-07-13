import { Chapter } from "./types";

export const printedAirframeChapters: Chapter[] = [
  {
    id: "idea",
    kicker: "01 — The Idea",
    title: "Why print an aircraft at all?",
    body: [
      "Foam is the sensible material for small RC aircraft — light, forgiving, cheap. But foam has a ceiling: compound curves, scale detail and exact airfoil geometry all fight the material. A 3D printer promises the opposite trade. Whatever surface exists in CAD comes out of the machine exactly — elliptical wing planforms, blended fillets, panel lines, a fuselage that actually looks like the aircraft it's modelled on. The natural candidates were the warbirds whose shapes are hardest to carve from foam, and the first pick was the most famously curved of them all: the Supermarine Spitfire with its elliptical wing.",
      "The plan sounded simple. Model the aircraft in Fusion 360, hollow it out, print it in sections, glue it together, add motor, servos and a battery. What the plan hid is the actual engineering problem of printed aircraft: plastic is roughly an order of magnitude denser than model foam, so every square centimetre of skin costs weight the aircraft may not be able to afford. This page documents two attempts at that problem — a Spitfire that answered it wrong and flew twenty wobbly metres, and a Messerschmitt Bf 109 that answered it right and flew properly.",
    ],
    layout: "text-only",
    tags: ["3D Printing", "Warbirds", "Motivation"],
  },
  {
    id: "spitfire-design",
    kicker: "02 — Spitfire",
    title: "The shell approach: thin walls and a few reinforcements",
    body: [
      "The Spitfire was designed the way a 3D modeller thinks, not the way an aircraft engineer thinks: take the outer surface, offset it inward to a thin printable wall, and add reinforcements where the structure obviously needs help — a few bulkheads in the fuselage, spar-like stiffeners in the wing, a solid motor mount in the nose. Printed in vertical sections and glued along the joints, the airframe came out of the printer looking fantastic: crisp panel lines, a scale canopy shape, an elliptical wing no hot-wire cutter could ever produce.",
      "The systems side was conventional: a brushless outrunner on the nose, ESC and receiver in the wing-root bay, two servos driving elevator and ailerons, and the battery pushed as far forward as the fuselage allowed — a first hint of the balance problem to come. Everything was accessible through the open bay under the wing, closed with a printed hatch.",
      "The scale looks were never the issue. On the bench the Spitfire was already convincing; the question it couldn't answer on the bench was what all that convincing plastic surface weighed.",
    ],
    media: [
      {
        type: "image",
        src: "/images/3d-printed-airframe/spitfire-top.jpg",
        alt: "Top view of the unpainted 3D-printed Spitfire lying in the grass before its maiden flight, with the electronics bay open showing ESC, wiring and servos",
        caption: "The printed Spitfire before its maiden flight — elliptical wing straight out of CAD, electronics bay still open along the fuselage spine.",
      },
    ],
    layout: "image-right",
    tags: ["Fusion 360", "Thin-Wall Printing", "Airframe Design"],
  },
  {
    id: "weight",
    kicker: "03 — The Weight Problem",
    title: "A printed skin is heavier than it looks",
    body: [
      "The arithmetic that sank the first attempt is simple. A model aircraft's foam skin weighs almost nothing — the material is mostly air. A printed skin, even at minimum wall thickness, is solid plastic over the entire wetted surface of the aircraft, and the surface area of a scale fuselage plus an elliptical wing is large. The reinforcements added on top of the shell made a structure that was strong everywhere and light nowhere.",
      "The consequence is wing loading. Weight that a foam airframe simply doesn't have must be carried by the same wing area, so the printed Spitfire needed noticeably more speed than a comparable foam model just to generate its own lift — and it had to reach that speed from a hand launch, with no landing gear and no runway. High wing loading also means every gram of imbalance and every disturbance bites harder, exactly what a maiden flight doesn't need.",
      "None of this was fully appreciated standing in the meadow. The aircraft felt solid, looked ready, and there was only one way to find out.",
    ],
    media: [
      {
        type: "image",
        src: "/images/3d-printed-airframe/spitfire-preflight.jpg",
        alt: "Holding the unpainted 3D-printed Spitfire in a flowering meadow shortly before the hand-launched maiden flight",
        caption: "Minutes before the maiden flight — one hand launch away from twenty metres of data.",
      },
    ],
    layout: "image-left",
    tags: ["Wing Loading", "Mass Budget", "Hand Launch"],
  },
  {
    id: "maiden",
    kicker: "04 — The Maiden Flight",
    title: "Twenty wobbly metres",
    body: [
      "The entire flying career of the Spitfire lasted about twenty metres. Off the hand launch it stayed airborne, roughly straight ahead, wobbling the whole way — and then it was in the grass. Short as it was, the flight was diagnostically rich, because both of its problems were visible from the ground.",
      "First, the centre of gravity was wrong. Despite the battery sitting as far forward as it could go, the aircraft flew tail-heavy: pitch was loose and the nose hunted, the classic signature of a CG behind where the wing wants it. The dense printed tail section — solid plastic all the way to the rudder — cost more balance margin than the CAD estimate had suggested. Second, the propeller dominated the aircraft. At hand-launch speed the control surfaces barely worked, but the motor was at full power, and its torque and slipstream rolled and yawed the airframe far more authoritatively than the ailerons could answer. A heavy aircraft flying at the bottom of its speed range has minimum control authority exactly when it needs the maximum.",
      "The combination — marginal lift, wandering pitch, and a propeller moment the controls couldn't override — used up the twenty metres, and the flight ended in a crash that broke the airframe along several of its glued section joints.",
    ],
    layout: "text-only",
    tags: ["Flight Test", "CG Problems", "Propeller Torque"],
  },
  {
    id: "afterlife",
    kicker: "05 — Afterlife",
    title: "Glued, painted, grounded",
    body: [
      "The broken sections went back together with glue, and since the aircraft was never going to fly again, the last constraint disappeared: it didn't have to stay light. The repaired airframe got a full RAF day-fighter scheme — dark green and ocean grey camouflage, roundels, fin flash and squadron codes — and became what it had honestly always been: a very good-looking scale model.",
      "There is no irony lost here. The paint and the repair glue added yet more weight to an aircraft that crashed for being too heavy; the display Spitfire is the heaviest version of itself that ever existed. As a shelf model it's the best outcome of the first attempt — and a permanent reminder of the lesson it taught.",
      "The real product of the Spitfire wasn't the model, it was the diagnosis: the shell approach cannot work at this scale. Making the walls thinner had reached the limit of what the printer could produce; the weight had to come out of the concept, not the slicer settings.",
    ],
    media: [
      {
        type: "image",
        src: "/images/3d-printed-airframe/cover.jpg",
        alt: "The repaired Spitfire painted in RAF camouflage with roundels and squadron codes, displayed on a wooden table",
        caption: "The Spitfire in its retirement livery — glued back together and painted for display, heavier than it ever flew.",
      },
    ],
    layout: "image-right",
    tags: ["Repair", "Scale Finish", "Display Model"],
  },
  {
    id: "bf109",
    kicker: "06 — Bf 109",
    title: "The spine approach: print the structure, not the skin",
    body: [
      "The second aircraft, a Messerschmitt Bf 109, inverted the design philosophy. Instead of treating the printed part as a solid skin with reinforcements, it was designed the way real airframes are: an internal skeleton of spines and ribs carries the loads, and the skin shrinks to a single printed perimeter whose only job is to give the air a surface. In the slicer the wing sections look almost empty — diagonal spines crossing between the ribs, wrapped in a wall one extrusion wide.",
      "Held against the light, a printed wing section makes the concept visible: the translucent skin shows the crossing spine pattern inside, a printed miniature of a stressed-skin wing with spars and shear webs. The diagonals matter — they triangulate the section so bending and torsion loads run through the spines rather than through the paper-thin skin, which would buckle the moment it was asked to carry anything alone.",
      "The result was a transformation, not an improvement. Section for section, the spine-built airframe came out dramatically lighter than the Spitfire's shell construction — light enough that the finished Bf 109 sat in the class of wing loading where small electric models actually work, with enough margin left over for the battery to sit where the CG wanted it rather than where the fuselage allowed it.",
    ],
    media: [
      {
        type: "image",
        src: "/images/3d-printed-airframe/bf109-wing-spines.jpg",
        alt: "A printed Bf 109 wing section held up against a window, the translucent single-perimeter skin revealing the diagonal internal spine structure",
        caption: "A Bf 109 wing section against the light: single-perimeter skin, and the diagonal spines that actually carry the aircraft.",
      },
    ],
    layout: "image-left",
    tags: ["Internal Spines", "Lightweight Structures", "Stressed Skin"],
  },
  {
    id: "verdict",
    kicker: "07 — The Verdict",
    title: "The second one flew",
    body: [
      "The Bf 109 did what the Spitfire couldn't: it flew, and kept flying. With the wing loading finally reasonable, everything that had been marginal on the first aircraft became normal on the second — the hand launch had margin instead of desperation, the controls answered before the propeller could argue, and the CG sat where the design said it should. The difference between the two aircraft was never the printer, the model or the pilot. It was structure.",
      "The pair of builds compressed a complete aerodynamics lesson into two airframes. Weight is the currency every design decision spends, and surface is where a printed aircraft secretly spends it; a beautiful shell is a display model, an internal structure is an aircraft. Just as lasting was the flight-test lesson from the twenty wobbly metres: centre of gravity and propeller effects decide the first ten seconds of an aircraft's life, and no amount of bench confidence substitutes for them being right.",
      "Both lessons outlived the project. The structural thinking — put material where the loads run, and nowhere else — carried directly into the truss-armed Y4 multirotor build, and the respect for weight budgets and maiden-flight preparation into every aircraft since. The Spitfire supervises all of it from the shelf, in full camouflage, grounded for life.",
    ],
    layout: "text-only",
    tags: ["Flight Success", "Lessons Learned", "Next Builds"],
  },
];
