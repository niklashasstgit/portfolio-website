import { Chapter } from "./types";

export const thermalCorrelationChapters: Chapter[] = [
  {
    id: "problem",
    kicker: "01 — The Problem",
    title: "A thermal model is only a guess until it meets test data",
    body: [
      "Every spacecraft is thermally modelled long before it flies — a geometric mathematical model (GMM) and a thermal mathematical model (TMM) predict how the structure will heat and cool in orbit. But the model always disagrees with reality by some margin: material properties, contact conductances, and radiative couplings are uncertain inputs, and the only way to know how far off they are is to compare against actual thermal-vacuum test data.",
      "Traditionally, closing that gap — 'model correlation' — is done by a thermal engineer hand-tuning a handful of parameters, rerunning the simulation, and eyeballing the fit. It works, but it's slow, and it doesn't tell you how confident you should be in the final numbers.",
      "This thesis, done at Airbus Defence and Space, builds an automated, statistically grounded alternative using Sentinel-2 as the real-world validation case.",
    ],
    media: [
      {
        type: "image",
        src: "/images/thermal-correlation/sentinel2-liftoff.jpg",
        alt: "Sentinel-2 satellite launch on a Vega rocket at night",
        caption: "Sentinel-2 launch. Image: ESA.",
      },
    ],
    layout: "image-right",
    tags: ["Spacecraft Thermal Design", "Model Correlation"],
  },
  {
    id: "spacecraft",
    kicker: "02 — The Test Case",
    title: "Sentinel-2: a real spacecraft, a real thermal-vacuum test",
    body: [
      "Sentinel-2 is part of the EU/ESA Copernicus Earth-observation programme, built by Airbus Defence and Space. Its thermal-vacuum test campaign produced the ground-truth temperature data this thesis correlates against — a case where the 'right answer' actually exists and was measured, not assumed.",
    ],
    media: [
      {
        type: "image",
        src: "/images/thermal-correlation/sentinel2-model.jpg",
        alt: "Sentinel-2 satellite model",
        caption: "Sentinel-2 spacecraft. Image: ESA / Airbus Defence and Space.",
      },
      {
        type: "image",
        src: "/images/thermal-correlation/sentinel2-block-diagram.jpg",
        alt: "Sentinel-2 spacecraft block diagram",
        caption: "Spacecraft subsystem block diagram. Image: ESA / Airbus Defence and Space.",
      },
    ],
    layout: "gallery",
    tags: ["Sentinel-2", "Copernicus", "Thermal-Vacuum Test"],
  },
  {
    id: "bayesian",
    kicker: "03 — The Approach",
    title: "Bayesian inference instead of hand-tuning",
    body: [
      "Rather than search for a single 'best' set of correlation parameters, the method treats them as unknowns with a probability distribution: start from a prior belief about plausible ranges (material properties, contact conductances), then use MCMC sampling to update that belief against the measured test-chamber temperatures.",
      "The output isn't one number per parameter — it's a posterior distribution, which tells you both the most likely value and how confident you can be in it. Parameters the test data doesn't actually constrain well stay wide; parameters the data pins down tightly narrow sharply.",
    ],
    media: [
      {
        type: "image",
        src: "/images/thermal-correlation/bayesian-priors.png",
        alt: "Prior distributions for correlation parameters",
        caption: "Prior distributions before any test data is incorporated.",
      },
      {
        type: "image",
        src: "/images/thermal-correlation/bayesian-posterior-evolution.png",
        alt: "Posterior distribution evolution across MCMC iterations",
        caption: "Posterior evolution across sampling iterations.",
      },
    ],
    layout: "gallery",
    tags: ["Bayesian Inference", "MCMC"],
  },
  {
    id: "surrogate",
    kicker: "04 — Making It Fast Enough",
    title: "A neural-network surrogate stands in for the thermal solver",
    body: [
      "MCMC needs tens of thousands of model evaluations — running the full finite-difference thermal solver that many times isn't practical. So a neural-network surrogate is trained to approximate the solver's output across the parameter space, then that surrogate is what the sampler actually queries.",
      "The surrogate has to be trustworthy before it's trusted: trained on solver-generated samples, then validated by comparing its predictions against real solver runs it never saw during training.",
    ],
    media: [
      {
        type: "image",
        src: "/images/thermal-correlation/surrogate-training-loss.png",
        alt: "Surrogate model training loss curve",
        caption: "Surrogate training loss.",
      },
      {
        type: "image",
        src: "/images/thermal-correlation/surrogate-scatter-start.png",
        alt: "Surrogate prediction scatter, before tuning",
        caption: "Prediction accuracy — before.",
      },
      {
        type: "image",
        src: "/images/thermal-correlation/surrogate-scatter-end.png",
        alt: "Surrogate prediction scatter, after tuning",
        caption: "Prediction accuracy — after.",
      },
    ],
    layout: "gallery",
    tags: ["Neural Network", "Surrogate Model", "PyTorch"],
  },
  {
    id: "sensitivity",
    kicker: "05 — Which Parameters Actually Matter",
    title: "Sensitivity analysis before spending sampling budget",
    body: [
      "Not every input parameter meaningfully affects the predicted temperatures at every sensor node. A sensitivity analysis ranks parameters by how much they move the outputs, which both explains the physics and avoids wasting sampling effort on parameters that barely matter.",
    ],
    media: [
      {
        type: "image",
        src: "/images/thermal-correlation/sensitivity-tornado.png",
        alt: "Tornado plot of parameter sensitivity across thermal nodes",
        caption: "Sensitivity ranking across selected thermal nodes.",
      },
      {
        type: "image",
        src: "/images/thermal-correlation/sensitivity-correlation.png",
        alt: "Correlation matrix between parameters",
        caption: "Cross-parameter correlation matrix.",
      },
    ],
    layout: "gallery",
    tags: ["Sensitivity Analysis"],
  },
  {
    id: "tool",
    kicker: "06 — SPOCK",
    title: "Packaging the method into a usable tool",
    body: [
      "The pipeline — case generation, surrogate training, Bayesian sampling, sensitivity analysis, and a heuristic best-of-batch search — is wrapped in a PyQt5 GUI (SPOCK) so it can be run by a thermal engineer without touching the underlying Python, and so the method outlives the thesis.",
    ],
    layout: "text-only",
    tags: ["PyQt5", "Tooling"],
  },
  {
    id: "results",
    kicker: "07 — Result",
    title: "A quantified, automated correlation with real validation data",
    body: [
      "Correlated against the Sentinel-2 thermal-vacuum test data, the pipeline replaces a manual, subjective tuning process with a repeatable one that reports its own confidence — turning 'this model looks about right' into a distribution you can defend.",
    ],
    media: [
      {
        type: "image",
        src: "/images/thermal-correlation/evaluation-9.png",
        alt: "Final evaluation results",
        caption: "Final correlated model vs. test data.",
      },
    ],
    layout: "image-right",
    tags: ["Validation", "Result"],
  },
];
