import { useEffect, useMemo, useState } from "react";
import { AR } from "./chapters/AR";
import { ARMA } from "./chapters/ARMA";
import { Filtering } from "./chapters/Filtering";
import { Glossary } from "./chapters/Glossary";
import { Godot } from "./chapters/Godot";
import { Home } from "./chapters/Home";
import { Playground } from "./chapters/Playground";
import { Prediction } from "./chapters/Prediction";
import { Regression } from "./chapters/Regression";
import { Relationships } from "./chapters/Relationships";
import { Spectral } from "./chapters/Spectral";
import { Transfer } from "./chapters/Transfer";
import { Unity } from "./chapters/Unity";
import { Univariate } from "./chapters/Univariate";
import { CHAPTERS, EXTRA, GAME } from "./content/nav";
import { loadProgress, markRead, type Progress } from "./lib/progress";

const ALL = [...CHAPTERS, ...GAME];

const VALID = new Set([
  "home",
  ...ALL.map((c) => c.id),
  ...EXTRA.map((e) => e.id),
]);

function routeFromHash(): string {
  const raw = window.location.hash.replace(/^#\/?/, "") || "home";
  return VALID.has(raw) ? raw : "home";
}

function neighbors(route: string) {
  const pack = CHAPTERS.some((c) => c.id === route) ? CHAPTERS : GAME;
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

  const quizNote = useMemo(() => {
    const scores = Object.values(progress.quizzes);
    if (scores.length === 0) return "No quizzes yet";
    const c = scores.reduce((s, q) => s + q.correct, 0);
    const t = scores.reduce((s, q) => s + q.total, 0);
    return `${c} / ${t} quiz items`;
  }, [progress]);

  const tsRead = progress.read.filter((id) => CHAPTERS.some((c) => c.id === id)).length;
  const gameRead = progress.read.filter((id) => GAME.some((c) => c.id === id)).length;

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
            <em>Plus a Unity and Godot crash course</em>
          </span>
        </button>
        <p className="progress-line">
          {tsRead} of {CHAPTERS.length} time series · {gameRead} of {GAME.length} game
          · {quizNote}
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
          <p className="nav-label">Game engines</p>
          {GAME.map((c) => (
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
          {route === "relationships" && <Relationships />}
          {route === "univariate" && <Univariate />}
          {route === "regression" && <Regression />}
          {route === "ar" && <AR />}
          {route === "arma" && <ARMA />}
          {route === "spectral" && <Spectral />}
          {route === "filtering" && <Filtering />}
          {route === "prediction" && <Prediction />}
          {route === "transfer" && <Transfer />}
          {route === "unity" && <Unity />}
          {route === "godot" && <Godot />}
          {route === "playground" && <Playground />}
          {route === "glossary" && <Glossary />}
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
