export type ChapterMeta = {
  id: string;
  num: string;
  title: string;
  blurb: string;
};

export const CHAPTERS: ChapterMeta[] = [
  {
    id: "relationships",
    num: "01",
    title: "Time series relationships",
    blurb: "How series depend on their own past and on each other.",
  },
  {
    id: "univariate",
    num: "02",
    title: "Trend, seasonality, and errors",
    blurb: "The classical univariate model and why leftover correlation matters.",
  },
  {
    id: "regression",
    num: "03",
    title: "Regression with correlated errors",
    blurb: "When least squares still works, and when the standard errors lie.",
  },
  {
    id: "ar",
    num: "04",
    title: "Autoregressive models",
    blurb: "AR(1) through AR(p), stationarity, ACF, and PACF.",
  },
  {
    id: "arma",
    num: "05",
    title: "ARMA models",
    blurb: "Moving averages, mixed models, and how to read the correlogram.",
  },
  {
    id: "spectral",
    num: "06",
    title: "Spectral analysis",
    blurb: "Cycles, periodicity, and the periodogram.",
  },
  {
    id: "filtering",
    num: "07",
    title: "Linear filtering",
    blurb: "Smoothing, differencing, and the frequency response.",
  },
  {
    id: "prediction",
    num: "08",
    title: "Prediction of time series",
    blurb: "Best linear forecasts and why uncertainty grows with the horizon.",
  },
  {
    id: "transfer",
    num: "09",
    title: "Transfer function models",
    blurb: "How an input series drives an output, plus noise.",
  },
  {
    id: "unity",
    num: "10",
    title: "Time series in Unity",
    blurb: "Fixed physics ticks, uneven frames, cameras, and prediction.",
  },
  {
    id: "godot",
    num: "11",
    title: "Time series in Godot",
    blurb: "Idle vs physics clocks, tweens as impulse responses, move-toward.",
  },
];

export const EXTRA = [
  { id: "playground", title: "Playground" },
  { id: "glossary", title: "Glossary" },
] as const;
