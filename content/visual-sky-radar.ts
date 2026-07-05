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
    id: "third-camera",
    kicker: "09 — A Third Eye",
    title: "Adding a third camera to break the ambiguity",
    body: [
      "Two stations fix a target where their bearings cross, but that intersection is only as sharp as the angle between them. When an aircraft sits near the line joining the two cameras, the fix smears out along the line of sight and the depth estimate becomes almost meaningless.",
      "I added a third station, offset from the 4.3 km baseline of the first two, so every point in the shared airspace is now seen from three well-separated directions. The redundant bearing removes the near-baseline ambiguity and enables outlier rejection: if one camera disagrees with the other two, the fix is still solved from the remaining pair.",
      "On the same simulated pass, the 1-σ horizontal uncertainty at the crossing point drops from roughly 480 m with two cameras to about 190 m with three.",
    ],
    layout: "image-right",
    media: [
      {
        type: "image",
        src: "/images/visual-sky-radar/three-camera-geometry.png",
        alt: "Plan-view sketch of three camera stations triangulating an aircraft",
        caption: "Three well-separated bearings shrink the triangulation uncertainty ellipse.",
        fit: "contain",
      },
    ],
    tags: ["Triangulation", "Third Station", "Outlier Rejection"],
  },
  {
    id: "angle-calibration",
    kicker: "10 — Fine Alignment",
    title: "Calibrating out the residual angle offsets",
    body: [
      "Even with each camera's field of view measured against the wall, small mounting errors remain — a fraction of a degree of yaw or tilt that the setup procedure can't catch. Over a few kilometres of range, half a degree is tens of metres of position error, so those residual offsets had to go.",
      "Instead of re-surveying the mounts, I let the aircraft calibrate the cameras: for every detection I could match to a known ADS-B track, I computed the bearing the camera should have reported and compared it to the bearing it did report. Fitting a constant azimuth/elevation offset per camera that minimises those residuals across hundreds of matched detections pins the misalignment down directly in the coordinate frame that matters.",
      "After applying the fitted offsets, the bearing-residual RMS collapsed from about 1.78° to 0.31° — most of what's left is genuine detection noise rather than a fixed pointing bias.",
    ],
    layout: "image-left",
    media: [
      {
        type: "image",
        src: "/images/visual-sky-radar/calibration-residuals.png",
        alt: "Scatter of bearing residuals vs ADS-B truth, before and after calibration",
        caption: "Bearing residuals vs. ADS-B truth, before and after fitting a per-camera offset.",
        fit: "contain",
      },
    ],
    tags: ["Calibration", "ADS-B Ground Truth", "Least Squares"],
  },
  {
    id: "kalman",
    kicker: "11 — Prediction",
    title: "A Kalman filter to fuse motion with noisy fixes",
    body: [
      "A raw triangulated position jumps around from frame to frame — each fix carries a metre or two of bearing noise, and a plain frame-by-frame track looks like a scatter plot. But an aircraft doesn't teleport; it flies a smooth, roughly constant-velocity path, and that prior is information worth using.",
      "I introduced a constant-velocity Kalman filter that carries a position-and-velocity state: it predicts where the target should be on the next frame from its motion model, then corrects that prediction with the incoming triangulated measurement, weighting the two by their relative uncertainty. The track stays smooth through noisy fixes and coasts sensibly through the occasional dropped detection.",
    ],
    layout: "image-right",
    media: [
      {
        type: "image",
        src: "/images/visual-sky-radar/kalman-track.png",
        alt: "Kalman-filtered estimate tracking through noisy triangulated measurements",
        caption: "The constant-velocity estimate rides through noisy fixes toward the true track.",
        fit: "contain",
      },
    ],
    tags: ["Kalman Filter", "State Estimation", "Sensor Fusion"],
  },
  {
    id: "ukf",
    kicker: "12 — Nonlinear Upgrade",
    title: "Going unscented for the nonlinear geometry",
    body: [
      "The linear Kalman filter fuses positions cleanly, but the actual measurements aren't positions — they're bearings, and the map from a 3D position to a pair of camera angles is distinctly nonlinear. Linearising it around the current estimate is fine while the target flies straight, but through a banked turn the linearisation error grows and the filter lags and overshoots.",
      "So I swapped the linear update for an Unscented Kalman Filter: instead of linearising, it propagates a small set of deterministically-chosen sigma points through the true nonlinear bearing model and reconstructs the mean and covariance from where they land — capturing the curvature the linear filter throws away.",
      "Across a scripted trajectory with a mid-pass turn, 3D position RMSE dropped from about 214 m with the linear filter to 118 m with the UKF, and the error spike through the turn itself shrank from roughly 560 m to 230 m.",
    ],
    layout: "image-left",
    media: [
      {
        type: "image",
        src: "/images/visual-sky-radar/ukf-comparison.png",
        alt: "Position-error-over-time comparison of linear KF versus unscented KF",
        caption: "3D position error over a pass with a banked turn: linear KF vs. unscented KF.",
        fit: "contain",
      },
    ],
    tags: ["Unscented Kalman Filter", "Sigma Points", "Nonlinear Estimation"],
  },
  {
    id: "results",
    kicker: "13 — Where It Stands",
    title: "A three-station, filtered tracking pipeline",
    body: [
      "The system now runs three calibrated ground stations, detects contrails and bright aircraft across a range of sky conditions, and cross-references every detection against live ADS-B traffic. Residual pointing offsets are calibrated out against matched tracks, and triangulated fixes are fused through an unscented Kalman filter into a smooth 3D track that holds up through turns and dropped frames.",
      "The current frontier is timing: tightening detection synchronisation between the three feeds so the bearings fused at each instant belong to exactly the same moment — the largest remaining source of triangulation error.",
    ],
    layout: "text-only",
    tags: ["Status", "Next Steps"],
  },
];
