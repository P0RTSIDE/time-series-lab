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
];

export const UNITY: ChapterMeta[] = [
  {
    id: "unity",
    num: "U1",
    title: "Editor and objects",
    blurb: "Hierarchy, Inspector, GameObjects, and components.",
  },
  {
    id: "unity-csharp",
    num: "U2",
    title: "C# you will write",
    blurb: "Classes, fields, methods, and MonoBehaviour.",
  },
  {
    id: "unity-time",
    num: "U3",
    title: "Time and the two loops",
    blurb: "Update, FixedUpdate, and Time.deltaTime.",
  },
  {
    id: "unity-input",
    num: "U4",
    title: "Reading input",
    blurb: "Axes, buttons, and the Input Manager.",
  },
  {
    id: "unity-physics",
    num: "U5",
    title: "Bodies and collisions",
    blurb: "Rigidbody, colliders, layers, and bounce.",
  },
  {
    id: "unity-prefabs",
    num: "U6",
    title: "Prefabs and spawning",
    blurb: "Instantiate, destroy, and reusable recipes.",
  },
  {
    id: "unity-ui",
    num: "U7",
    title: "Canvas and UI",
    blurb: "Buttons, text, and hooking UI to a script.",
  },
  {
    id: "unity-scenes",
    num: "U8",
    title: "Scenes and game state",
    blurb: "Load a scene, keep a score, survive a reload.",
  },
  {
    id: "unity-finish",
    num: "U9",
    title: "Motion, sound, and polish",
    blurb: "Coroutines, animation, and a first audio cue.",
  },
];

export const GODOT: ChapterMeta[] = [
  {
    id: "godot",
    num: "G1",
    title: "Nodes and scenes",
    blurb: "The scene tree, typed nodes, and packed scenes.",
  },
  {
    id: "godot-gdscript",
    num: "G2",
    title: "GDScript you will write",
    blurb: "extends, types, @export, and the dollar path.",
  },
  {
    id: "godot-time",
    num: "G3",
    title: "Process clocks",
    blurb: "_ready, _process, and _physics_process.",
  },
  {
    id: "godot-input",
    num: "G4",
    title: "Reading input",
    blurb: "The Input Map, actions, and just-pressed.",
  },
  {
    id: "godot-bodies",
    num: "G5",
    title: "Bodies and collisions",
    blurb: "CharacterBody2D, move_and_slide, and layers.",
  },
  {
    id: "godot-instances",
    num: "G6",
    title: "Instancing scenes",
    blurb: "Packed scenes, spawn, and free.",
  },
  {
    id: "godot-signals",
    num: "G7",
    title: "Signals and UI",
    blurb: "pressed, timeout, and connecting in _ready.",
  },
  {
    id: "godot-autoload",
    num: "G8",
    title: "Autoload and groups",
    blurb: "A game singleton, tags, and changing scenes.",
  },
  {
    id: "godot-finish",
    num: "G9",
    title: "Motion, sound, and polish",
    blurb: "Tween, AnimationPlayer, and a first sound.",
  },
];

export const GAME = [...UNITY, ...GODOT];

export const EXTRA = [
  { id: "playground", title: "Playground" },
  { id: "glossary", title: "Glossary" },
] as const;
