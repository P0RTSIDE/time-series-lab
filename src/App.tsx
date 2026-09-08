import { useEffect, useMemo, useState, type ComponentType } from "react";
import { AR } from "./chapters/AR";
import { ARMA } from "./chapters/ARMA";
import { Filtering } from "./chapters/Filtering";
import { Glossary } from "./chapters/Glossary";
import { Godot } from "./chapters/Godot";
import { GodotAutoload } from "./chapters/godot/GodotAutoload";
import { GodotBodies } from "./chapters/godot/GodotBodies";
import { GodotFinish } from "./chapters/godot/GodotFinish";
import { GodotInput } from "./chapters/godot/GodotInput";
import { GodotInstances } from "./chapters/godot/GodotInstances";
import { GodotScript } from "./chapters/godot/GodotScript";
import { GodotSignals } from "./chapters/godot/GodotSignals";
import { GodotTime } from "./chapters/godot/GodotTime";
import { Home } from "./chapters/Home";
import { Playground } from "./chapters/Playground";
import { Prediction } from "./chapters/Prediction";
import { Regression } from "./chapters/Regression";
import { Relationships } from "./chapters/Relationships";
import { Spectral } from "./chapters/Spectral";
import { Transfer } from "./chapters/Transfer";
import { Unity } from "./chapters/Unity";
import { Univariate } from "./chapters/Univariate";
import { UnityCsharp } from "./chapters/unity/UnityCsharp";
import { UnityFinish } from "./chapters/unity/UnityFinish";
import { UnityInput } from "./chapters/unity/UnityInput";
import { UnityPhysics } from "./chapters/unity/UnityPhysics";
import { UnityPrefabs } from "./chapters/unity/UnityPrefabs";
import { UnityScenes } from "./chapters/unity/UnityScenes";
import { UnityTime } from "./chapters/unity/UnityTime";
import { UnityUI } from "./chapters/unity/UnityUI";
import { CHAPTERS, EXTRA, GAME, GODOT, UNITY } from "./content/nav";
import { loadProgress, markRead, type Progress } from "./lib/progress";

const ALL = [...CHAPTERS, ...GAME];

const PAGES: Record<string, ComponentType> = {
  relationships: Relationships,
  univariate: Univariate,
  regression: Regression,
  ar: AR,
  arma: ARMA,
  spectral: Spectral,
  filtering: Filtering,
  prediction: Prediction,
  transfer: Transfer,
  unity: Unity,
  "unity-csharp": UnityCsharp,
  "unity-time": UnityTime,
  "unity-input": UnityInput,
  "unity-physics": UnityPhysics,
  "unity-prefabs": UnityPrefabs,
  "unity-ui": UnityUI,
  "unity-scenes": UnityScenes,
  "unity-finish": UnityFinish,
  godot: Godot,
  "godot-gdscript": GodotScript,
  "godot-time": GodotTime,
  "godot-input": GodotInput,
  "godot-bodies": GodotBodies,
  "godot-instances": GodotInstances,
  "godot-signals": GodotSignals,
  "godot-autoload": GodotAutoload,
  "godot-finish": GodotFinish,
  playground: Playground,
  glossary: Glossary,
};

const VALID = new Set(["home", ...ALL.map((c) => c.id), ...EXTRA.map((e) => e.id)]);

function routeFromHash(): string {
  const raw = window.location.hash.replace(/^#\/?/, "") || "home";
  return VALID.has(raw) ? raw : "home";
}

function neighbors(route: string) {
  const pack = CHAPTERS.some((c) => c.id === route)
    ? CHAPTERS
    : UNITY.some((c) => c.id === route)
      ? UNITY
      : GODOT.some((c) => c.id === route)
        ? GODOT
        : [];
  const idx = pack.findIndex((c) => c.id === route);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? pack[idx - 1] : null,
    next: idx < pack.length - 1 ? pack[idx + 1] : null,
  };
}

export function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    const onProg = () => setProgress(loadProgress());
    onHash();
    window.addEventListener("hashchange", onHash);
    window.addEventListener("tslab-progress", onProg);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("tslab-progress", onProg);
    };
  }, []);

  useEffect(() => {
    if (route !== "home") setProgress(markRead(route));
    window.scrollTo(0, 0);
  }, [route]);

  const go = (id: string) => {
    const next = VALID.has(id) ? id : "home";
    setRoute(next);
    window.location.hash = `#/${next}`;
    setOpen(false);
  };

  const { prev, next } = neighbors(route);
  const Page = PAGES[route];

  const quizNote = useMemo(() => {
    const scores = Object.values(progress.quizzes);
    if (scores.length === 0) return "No quizzes yet";
    const c = scores.reduce((s, q) => s + q.correct, 0);
    const t = scores.reduce((s, q) => s + q.total, 0);
    return `${c} / ${t} quiz items`;
  }, [progress]);

  const tsRead = progress.read.filter((id) => CHAPTERS.some((c) => c.id === id)).length;
  const unityRead = progress.read.filter((id) => UNITY.some((c) => c.id === id)).length;
  const godotRead = progress.read.filter((id) => GODOT.some((c) => c.id === id)).length;

  return (
    <div className={`shell ${open ? "nav-open" : ""}`}>
      <a className="skip" href="#main">
        Skip to lesson
      </a>
      <aside className="sidebar">
        <button type="button" className="brand" onClick={() => go("home")}>
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>Time Series Lab</strong>
            <em>Plus Unity and Godot crash courses</em>
          </span>
        </button>
        <p className="progress-line">
          {tsRead} of {CHAPTERS.length} time series · {unityRead} of {UNITY.length} Unity ·{" "}
          {godotRead} of {GODOT.length} Godot · {quizNote}
        </p>
        <nav>
          <button type="button" className={route === "home" ? "active" : ""} onClick={() => go("home")}>
            Start here
          </button>
          <p className="nav-label">Time series</p>
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${route === c.id ? "active" : ""} ${progress.read.includes(c.id) ? "seen" : ""}`}
              onClick={() => go(c.id)}
            >
              <span className="n">{c.num}</span>
              {c.title}
            </button>
          ))}
          <p className="nav-label">Unity</p>
          {UNITY.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${route === c.id ? "active" : ""} ${progress.read.includes(c.id) ? "seen" : ""}`}
              onClick={() => go(c.id)}
            >
              <span className="n">{c.num}</span>
              {c.title}
            </button>
          ))}
          <p className="nav-label">Godot</p>
          {GODOT.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${route === c.id ? "active" : ""} ${progress.read.includes(c.id) ? "seen" : ""}`}
              onClick={() => go(c.id)}
            >
              <span className="n">{c.num}</span>
              {c.title}
            </button>
          ))}
          <p className="nav-label">More</p>
          {EXTRA.map((e) => (
            <button
              key={e.id}
              type="button"
              className={route === e.id ? "active" : ""}
              onClick={() => go(e.id)}
            >
              {e.title}
            </button>
          ))}
        </nav>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <button type="button" className="menu" onClick={() => setOpen((v) => !v)} aria-label="Open chapter list">
            Menu
          </button>
          <span className="top-title">
            {route === "home"
              ? "Start here"
              : ALL.find((c) => c.id === route)?.title ??
                EXTRA.find((e) => e.id === route)?.title}
          </span>
        </header>
        <main id="main">
          {route === "home" && <Home go={go} read={progress.read} />}
          {Page && route !== "home" && <Page />}
        </main>
        {(prev || next) && (
          <footer className="pager">
            {prev ? (
              <button type="button" onClick={() => go(prev.id)}>
                <span>Previous</span>
                {prev.title}
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button type="button" onClick={() => go(next.id)}>
                <span>Next</span>
                {next.title}
              </button>
            ) : (
              <span />
            )}
          </footer>
        )}
      </div>
      {open && <button type="button" className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    </div>
  );
}
