import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { markQuiz } from "../lib/progress";

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

  useEffect(() => {
    setPicked(questions.map(() => null));
    setDone(false);
  }, [id, questions]);

  const correct = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <section className="quiz" aria-labelledby={`${id}-quiz`}>
      <h2 id={`${id}-quiz`}>Check yourself</h2>
      <p className="lede">Answer, then reveal. Explanations sit under each question.</p>
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
                <button
                  key={j}
                  type="button"
                  className={`choice ${selected ? "selected" : ""} ${show && isAns ? "right" : ""} ${show && selected && !isAns ? "wrong" : ""}`}
                  onClick={() => {
                    if (done) return;
                    setPicked((prev) => {
                      const next = [...prev];
                      next[i] = j;
                      return next;
                    });
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          {done && <p className="why">{q.why}</p>}
        </fieldset>
      ))}
      <div className="quiz-actions">
        {!done ? (
          <button
            type="button"
            className="btn"
            disabled={picked.some((p) => p == null)}
            onClick={() => {
              setDone(true);
              const score = picked.filter((p, i) => p === questions[i].answer).length;
              onScore?.(id, score, questions.length);
              markQuiz(id, score, questions.length);
              window.dispatchEvent(new Event("tslab-progress"));
            }}
          >
            Reveal answers
          </button>
        ) : (
          <p className="quiz-score">
            {correct} of {questions.length} correct
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
  children,
  controls,
}: {
  title: string;
  children: ReactNode;
  controls: ReactNode;
}) {
  return (
    <section className="lab">
      <header className="lab-head">
        <span className="eyebrow">Interactive lab</span>
        <h2>{title}</h2>
      </header>
      <div className="lab-grid">
        <div className="lab-controls">{controls}</div>
        <div className="lab-stage">{children}</div>
      </div>
    </section>
  );
}
