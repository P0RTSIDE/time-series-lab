import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { explainCodeLine } from "../lib/codeExplain";
import { markQuiz } from "../lib/progress";
import { M } from "./MathTex";

export function Takeaway({ children }: { children: ReactNode }) {
  return <p className="takeaway">{children}</p>;
}

export function Cards({ children }: { children: ReactNode }) {
  return <div className="term-grid">{children}</div>;
}

export function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="term-card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export function TermList({
  items,
}: {
  items: { term: string; text: ReactNode }[];
}) {
  return (
    <dl className="term-list">
      {items.map((item) => (
        <div key={item.term} className="term-row">
          <dt>{item.term}</dt>
          <dd>{item.text}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Compare({
  leftTitle,
  rightTitle,
  left,
  right,
}: {
  leftTitle: string;
  rightTitle: string;
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="compare">
      <div>
        <h3>{leftTitle}</h3>
        <div>{left}</div>
      </div>
      <div>
        <h3>{rightTitle}</h3>
        <div>{right}</div>
      </div>
    </div>
  );
}

export function Formula({ expr, plain }: { expr: string; plain: string }) {
  return (
    <figure className="formula">
      <M block expr={expr} />
      <figcaption>{plain}</figcaption>
    </figure>
  );
}

export function TryThis({ items }: { items: string[] }) {
  return (
    <div className="try-this">
      <h3>Try this</h3>
      <ol>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

export function ScriptBlock({
  label,
  lang,
  lines,
  does,
  notes,
}: {
  label: string;
  lang: string;
  lines: string[];
  does: string;
  notes?: (string | null | undefined)[];
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const text = lines.join("\n");

  const noteFor = (i: number) => {
    const custom = notes?.[i];
    if (custom != null && custom !== "") return custom;
    return explainCodeLine(lines[i] ?? "", lang);
  };

  return (
    <figure className="script-block">
      <figcaption>
        <span>{label}</span>
        <span className="script-tools">
          <em>{lang}</em>
          <button
            type="button"
            className="copy"
            onClick={() => {
              void navigator.clipboard.writeText(text);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </span>
      </figcaption>
      <p className="script-hint">Click any line for a plain-language note.</p>
      <pre>
        {lines.map((line, i) => {
          const empty = line.trim() === "";
          const active = open === i;
          return (
            <button
              key={i}
              type="button"
              className={`script-line ${empty ? "empty" : ""} ${active ? "on" : ""}`}
              disabled={empty}
              onClick={() => setOpen(active ? null : i)}
            >
              <span className="script-n">{i + 1}</span>
              <code>{line === "" ? " " : line}</code>
            </button>
          );
        })}
      </pre>
      {open != null && noteFor(open) && (
        <aside className="script-pop" role="status">
          <header>
            <span>Line {open + 1}</span>
            <button type="button" className="copy" onClick={() => setOpen(null)}>
              Close
            </button>
          </header>
          <code>{lines[open] === "" ? " " : lines[open]}</code>
          <p>{noteFor(open)}</p>
        </aside>
      )}
      <p>{does}</p>
    </figure>
  );
}

export function Steps({ items }: { items: string[] }) {
  return (
    <ol className="steps">
      {items.map((item, i) => (
        <li key={item}>
          <span>{i + 1}</span>
          {item}
        </li>
      ))}
    </ol>
  );
}

export function Callout({
  title,
  children,
  tone = "note",
}: {
  title: string;
  children: ReactNode;
  tone?: "note" | "warn" | "tip";
}) {
  return (
    <aside className={`callout callout-${tone}`}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="slider">
      <span>
        {label}
        <b>{format ? format(value) : value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export type QuizQuestion = {
  prompt: string;
  choices: string[];
  answer: number;
  why: string;
  wrongs?: string[];
};

export function Quiz({
  id,
  questions,
  onScore,
}: {
  id: string;
  questions: QuizQuestion[];
  onScore?: (id: string, correct: number, total: number) => void;
}) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [done, setDone] = useState(false);
  const [needAll, setNeedAll] = useState(false);

  useEffect(() => {
    setPicked(Array.from({ length: questions.length }, () => null));
    setDone(false);
    setNeedAll(false);
  }, [id, questions.length]);

  const correct = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <section className="quiz" aria-labelledby={`${id}-quiz`}>
      <h2 id={`${id}-quiz`}>Check yourself</h2>
      <p className="quiz-hint">Pick one for each, then reveal.</p>
      {questions.map((q, i) => (
        <fieldset key={i} className="quiz-q">
          <legend>
            {i + 1}. {q.prompt}
          </legend>
          <div className="choices">
            {q.choices.map((c, j) => {
              const selected = picked[i] === j;
              const show = done;
              const isAns = j === q.answer;
              return (
                <div key={j} className="choice-block">
                  <button
                    type="button"
                    className={`choice ${selected ? "selected" : ""} ${show && isAns ? "right" : ""} ${show && selected && !isAns ? "wrong" : ""}`}
                    onClick={() => {
                      if (done) return;
                      setNeedAll(false);
                      setPicked((prev) => {
                        const next = [...prev];
                        next[i] = j;
                        return next;
                      });
                    }}
                  >
                    {c}
                  </button>
                  {show && (isAns || q.wrongs?.[j]) && (
                    <p className={`choice-why ${isAns ? "ok" : "no"}`}>
                      {isAns ? q.why : q.wrongs?.[j]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className="quiz-actions">
        {!done ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (picked.some((p) => p == null)) {
                  setNeedAll(true);
                  return;
                }
                setNeedAll(false);
                setDone(true);
                const score = picked.filter((p, i) => p === questions[i].answer).length;
                onScore?.(id, score, questions.length);
                markQuiz(id, score, questions.length);
                window.dispatchEvent(new Event("tslab-progress"));
              }}
            >
              Reveal answers
            </button>
            {needAll && (
              <p className="quiz-need">Answer every question first. Then the explanations will show here.</p>
            )}
          </>
        ) : (
          <p className="quiz-score">
            {correct} of {questions.length} correct. Green is right. Notes under the choices explain why.
          </p>
        )}
      </div>
    </section>
  );
}

export function Chapter({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <article className="chapter">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      {children}
    </article>
  );
}

export function Lab({
  title,
  explain,
  children,
  controls,
}: {
  title: string;
  explain?: string;
  children: ReactNode;
  controls: ReactNode;
}) {
  return (
    <section className="lab">
      <header className="lab-head">
        <span className="eyebrow">Interactive lab</span>
        <h2>{title}</h2>
        {explain && <p className="lab-explain">{explain}</p>}
      </header>
      <div className="lab-grid">
        <div className="lab-controls">{controls}</div>
        <div className="lab-stage">{children}</div>
      </div>
    </section>
  );
}
