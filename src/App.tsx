import { useEffect, useMemo, useState } from "react";
import { AR } from "./chapters/AR";
import { ARMA } from "./chapters/ARMA";
import { Filtering } from "./chapters/Filtering";
import { Glossary } from "./chapters/Glossary";
import { Home } from "./chapters/Home";
import { Playground } from "./chapters/Playground";
import { Prediction } from "./chapters/Prediction";
import { Regression } from "./chapters/Regression";
import { Relationships } from "./chapters/Relationships";
import { Spectral } from "./chapters/Spectral";
import { Transfer } from "./chapters/Transfer";
import { Univariate } from "./chapters/Univariate";
import { CHAPTERS, EXTRA } from "./content/nav";
import { loadProgress, markRead, type Progress } from "./lib/progress";

const VALID = new Set([
  "home",
  ...CHAPTERS.map((c) => c.id),
  ...EXTRA.map((e) => e.id),
]);

function routeFromHash(): string {
  const raw = window.location.hash.replace(/^#\/?/, "") || "home";
  return VALID.has(raw) ? raw : "home";
}

export function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    const onProg = () => setProgress(loadProgress());
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
    window.location.hash = `#/${id}`;
    setOpen(false);
  };

  const idx = CHAPTERS.findIndex((c) => c.id === route);
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;

  const quizNote = useMemo(() => {
    const scores = Object.values(progress.quizzes);
    if (scores.length === 0) return "No quizzes yet";
    const c = scores.reduce((s, q) => s + q.correct, 0);
    const t = scores.reduce((s, q) => s + q.total, 0);
    return `${c} / ${t} quiz items`;
  }, [progress]);

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
            <em>Learn by moving the series</em>
          </span>
        </button>
        <p className="progress-line">
          {progress.read.filter((id) => CHAPTERS.some((c) => c.id === id)).length} of{" "}
          {CHAPTERS.length} chapters · {quizNote}
        </p>
        <nav>
          <button type="button" className={route === "home" ? "active" : ""} onClick={() => go("home")}>
            Start here
          </button>
          <p className="nav-label">Course</p>
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
              : CHAPTERS.find((c) => c.id === route)?.title ??
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
