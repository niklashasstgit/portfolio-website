import { Chapter } from "./types";

export const visualSkyRadarChapters: Chapter[] = [
  {
    id: "problem",
    kicker: "01 — The Idea",
    title: "Can two cheap phone cameras triangulate an aircraft?",
    body: [
      "Every plane overhead already broadcasts its position over ADS-B — services like OpenSky make that data public. But I wanted to know whether I could independently see and locate aircraft myself, from the ground, using nothing but two ordinary phone cameras and some geometry.",
      "The goal: point two fixed, calibrated cameras at the sky from two different locations, detect the same aircraft (or its contrail) in both feeds, and triangulate a 3D position — then cross-check it against the real ADS-B track for that flight.",
    ],
    media: [
      {
        type: "image",
        src: "/images/visual-sky-radar/pipeline-00-original.png",
        alt: "Raw sky photo showing a jet contrail",
        caption: "Raw frame from a fixed sky camera — the kind of input the whole pipeline starts from.",
      },
    ],
    layout: "image-right",
    tags: ["Concept", "ADS-B", "OpenSky"],
  },
  {
    id: "concept",
    kicker: "02 — Multi-Camera Concept",
    title: "Two ground stations, one triangulated track",
    body: [
      "The system runs two independent camera stations roughly 4.3 km apart. Each one watches a wide slice of sky, detects candidate targets locally, and reports bearing (azimuth/elevation) toward anything it finds.",
      "Where two bearings from two known locations cross, that intersection is a 3D position estimate — classic optical triangulation, just aimed upward instead of across a lab bench.",
    ],
    layout: "diagram",
    diagram: "camera-fov",
    tags: ["Triangulation", "Geometry"],
  },
  {
    id: "calibration",
    kicker: "03 — Camera Alignment",
    title: "Turning a phone camera into a measuring instrument",
    body: [
      "A phone's stated field of view is a marketing number, not a calibration certificate — I needed the real horizontal and vertical FOV of each sensor, in its actual mounted orientation, to trust any angle I derived from a pixel position.",
      "I measured it the direct way: camera fixed at a known distance from a flat wall marked at even intervals, sighting the extreme visible marks and solving the subtended angle from simple trigonometry. That gave real fov_horizontal_deg / fov_vertical_deg values per camera — 34.0°×57.0° for one unit, 35.6°×58.2° for the other — which now live in the app's camera_specs.json as the source of truth for every bearing calculation downstream.",
      "Each camera also needed a yaw/tilt orientation ('cone' in the code) so its pixel grid maps onto real compass bearings and elevation angles — set once during setup and stored in cone_orientations.json.",
    ],
    layout: "diagram",
    diagram: "calibration-wall",
    tags: ["Calibration", "Trigonometry", "camera_specs.json"],
  },
  {
    id: "detection",
    kicker: "04 — Detection Pipeline",
    title: "Finding a thin white line in a noisy blue sky",
    body: [
      "A contrail is a faint, thin, high-contrast streak against a sky that has its own gradients, sensor noise, and JPEG artefacts. A naive brightness threshold picks up compression noise as readily as an actual contrail — so detection became a staged pipeline, each stage narrowing down what's left.",
      "Bright-region extraction → sky masking → edge detection → frame-to-frame motion → morphological top-hat filtering to isolate thin linear structures → dark-sky suppression → line-bank scanning to confirm a real elongated streak rather than a blob of noise.",
      "Every stage is independently visualised during development, which made it possible to see exactly where a false positive was entering the pipeline instead of just staring at a final yes/no.",
    ],
    layout: "gallery",
    media: [
      { type: "image", src: "/images/visual-sky-radar/pipeline-01-bright.png", alt: "Bright-region extraction", caption: "1 · Bright" },
      { type: "image", src: "/images/visual-sky-radar/pipeline-02-sky-mask.png", alt: "Sky masking", caption: "2 · Sky mask" },
      { type: "image", src: "/images/visual-sky-radar/pipeline-03-edges.png", alt: "Edge detection", caption: "3 · Edges" },
      { type: "image", src: "/images/visual-sky-radar/pipeline-04-motion.png", alt: "Motion detection", caption: "4 · Motion" },
      { type: "image", src: "/images/visual-sky-radar/pipeline-05-tophat.png", alt: "Morphological top-hat filter", caption: "5 · Top-hat" },
      { type: "image", src: "/images/visual-sky-radar/pipeline-07-contrail.png", alt: "Final contrail mask", caption: "7 · Contrail mask" },
    ],
    tags: ["OpenCV", "Image Processing", "Morphology"],
  },
  {
    id: "filter-tuning",
    kicker: "05 — Filter Optimisation",
    title: "Sweeping parameters until the noise disappears",
    body: [
      "Each stage has a free parameter or two — the Gaussian brightness sigma, the morphological kernel size, the line-opening length — and none of them have an obvious 'correct' value on paper. I swept them systematically against real recorded footage and compared outputs side by side.",
      "Below: the same brightness-extraction stage at four different sigma values. Too small and the contrail fragments into noise; too large and it smears into the surrounding sky gradient. The working value sits in a narrow band in between — the kind of thing you only find by testing, not by deriving.",
    ],
    layout: "gallery",
    media: [
      { type: "image", src: "/images/visual-sky-radar/filter-sigma-08.png", alt: "Sigma 8", caption: "σ = 8 — too fragmented" },
      { type: "image", src: "/images/visual-sky-radar/filter-sigma-15.png", alt: "Sigma 15", caption: "σ = 15" },
      { type: "image", src: "/images/visual-sky-radar/filter-sigma-25.png", alt: "Sigma 25", caption: "σ = 25 — usable" },
      { type: "image", src: "/images/visual-sky-radar/filter-sigma-40.png", alt: "Sigma 40", caption: "σ = 40 — over-smoothed" },
    ],
    tags: ["Parameter Sweep", "Gaussian Filtering"],
  },
  {
    id: "line-bank",
    kicker: "06 — Line Confirmation",
    title: "A bank of line detectors, not a single threshold",
    body: [
      "The last confirmation stage runs a bank of directional line-opening filters at different lengths and orientations, then combines them — a single filter length either missed short contrail segments or let short noise streaks through, so I settled on running several in parallel and taking their union.",
    ],
    layout: "gallery",
    media: [
      { type: "image", src: "/images/visual-sky-radar/filter-line-open-60.png", alt: "Line opening length 60", caption: "opening length 60" },
      { type: "image", src: "/images/visual-sky-radar/filter-line-open-80.png", alt: "Line opening length 80", caption: "opening length 80" },
      { type: "image", src: "/images/visual-sky-radar/filter-multiline-bank.png", alt: "Combined multi-line bank result", caption: "combined multi-line bank" },
    ],
    tags: ["Line Detection", "Filter Banks"],
  },
  {
    id: "synthetic",
    kicker: "07 — Synthetic Test Feeds",
    title: "Testing without waiting for a plane to fly over",
    body: [
      "Real contrail sightings are intermittent and weather-dependent, which is a slow feedback loop for iterating on a detector. I built synthetic feeds with injected aircraft and contrail shapes to test the pipeline on demand and validate against a known ground truth before ever pointing it at the sky.",
    ],
    layout: "image-right",
    media: [
      { type: "image", src: "/images/visual-sky-radar/synthetic-feed-1.png", alt: "Synthetic test feed frame" },
    ],
    tags: ["Synthetic Data", "Testing"],
  },
  {
    id: "app",
    kicker: "08 — The Application",
    title: "From research script to a live Qt6 application",
    body: [
      "The working pipeline moved from a Python prototype into a native C++17 / Qt6 application with FFmpeg-based RTSP ingestion, so it can run continuously against live camera feeds rather than pre-recorded clips. The Python side still hosts the terrain-cache rendering, OpenSky polling, and the analysis tooling used to validate results.",
      "The two-camera setup, its FOV calibration, and its cone orientation all live in versioned JSON config files — camera_specs.json and cone_orientations.json — so re-pointing or re-calibrating a station doesn't require touching code, just re-running the wall calibration and updating a couple of numbers.",
    ],
    layout: "text-only",
    tags: ["C++17", "Qt6", "FFmpeg", "RTSP"],
  },
  {
    id: "results",
    kicker: "09 — Where It Stands",
    title: "A working two-station detection & tracking pipeline",
    body: [
      "The system reliably detects contrails and bright aircraft against a range of sky conditions, calibrates each camera's real field of view from a simple physical measurement, and cross-references detections with live ADS-B traffic. Triangulated 3D position estimates from the two stations are the current frontier — the geometry is in place; the next iteration is tightening detection timing sync between the two feeds to shrink triangulation error.",
    ],
    layout: "text-only",
    tags: ["Status", "Next Steps"],
  },
];
