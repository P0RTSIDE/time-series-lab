import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import {
  Callout,
  Card,
  Cards,
  Chapter,
  Compare,
  Formula,
  Lab,
  Quiz,
  Slider,
  Stat,
  Takeaway,
  TryThis,
} from "../components/UI";
import { acf, formatNum, lerpSeries, rigidBody, tweenSeries } from "../lib/ts";
import type { EaseKind } from "../lib/ts";

export function Godot() {
  const [ticks, setTicks] = useState(60);
  const [frames, setFrames] = useState(30);
  const [kind, setKind] = useState<EaseKind>("out");
  const [duration, setDuration] = useState(40);
  const [target, setTarget] = useState(4);
  const [moveToward, setMoveToward] = useState(0.22);

  const data = useMemo(() => {
    const n = 160;
    const start = 20;
    const tween = tweenSeries(n, start, duration, target, kind);
    const seek = new Array(n).fill(0);
    for (let t = 1; t < n; t++) {
      const goal = t >= start ? target : 0;
      seek[t] = seek[t - 1] + moveToward * (goal - seek[t - 1]);
    }
    const seconds = 5;
    const nPhys = Math.max(2, Math.round(seconds * ticks));
    const nRend = Math.max(2, Math.round(seconds * frames));
    const tPhys = Array.from({ length: nPhys }, (_, i) => (i / (nPhys - 1)) * seconds);
    const tRend = Array.from({ length: nRend }, (_, i) => (i / (nRend - 1)) * seconds);
    const input = tPhys.map((t) => (t >= 0.6 && t <= 1.8 ? 1 : 0));
    const body = rigidBody(tPhys, input, 12, 2.8);
    const drawn = lerpSeries(tPhys, body.pos, tRend);
    return {
      tween,
      seek,
      body: body.pos,
      drawn,
      rho: acf(seek, 16),
      n,
    };
  }, [ticks, frames, kind, duration, target, moveToward]);

  return (
    <Chapter
      kicker="Chapter 11"
      title="Time series in Godot"
      lede="Same two clocks as Unity, plus tweens: a transfer function you draw by hand."
    >
      <Takeaway>
        Collisions on the physics clock. Fades and UI on the idle clock. A tween
        is a planned echo of a one-sample start.
      </Takeaway>

      <section className="prose">
        <h2>Two calendars</h2>
        <Compare
          leftTitle="Physics ticks"
          left="Fixed timer. Bodies and contacts belong here."
          rightTitle="Idle frames"
          right="As often as a picture can be drawn. Fades, UI, cosmetic bob."
        />
        <h2>Tween vs move-toward</h2>
        <Formula
          expr="Y_t=A+(B-A)\,e((t-t_0)/d)"
          plain="Start event at t0. Arrive at B after duration d. Linear, ease-out, or an S."
        />
        <Cards>
          <Card title="Tween">
            Finishes on time. Impulse response you chose. Presentation, not contact.
          </Card>
          <Card title="Move-toward">
            Each tick takes a fraction of the remaining gap. AR(1) toward a target.
          </Card>
        </Cards>
      </section>

      <Callout title="Easing is not physics" tone="tip">
        A tween hits B on schedule even if something collided. Use the physics
        clock for things that must agree with other bodies.
      </Callout>

      <Lab
        title="Tweens, move-toward, and a second clock"
        controls={
          <>
            <div className="seg">
              {(
                [
                  ["linear", "Linear"],
                  ["out", "Ease out"],
                  ["inout", "Ease in-out"],
                ] as const
              ).map(([k, lab]) => (
                <button
                  key={k}
                  type="button"
                  className={kind === k ? "on" : ""}
                  onClick={() => setKind(k)}
                >
                  {lab}
                </button>
              ))}
            </div>
            <Slider
              label="Tween duration (steps)"
              value={duration}
              min={8}
              max={80}
              step={2}
              onChange={setDuration}
            />
            <Slider
              label="Target height"
              value={target}
              min={1}
              max={7}
              step={0.5}
              format={(v) => v.toFixed(1)}
              onChange={setTarget}
            />
            <Slider
              label="Move-toward fraction"
              value={moveToward}
              min={0.04}
              max={0.6}
              step={0.02}
              format={(v) => v.toFixed(2)}
              onChange={setMoveToward}
            />
            <Slider
              label="Physics ticks per second"
              value={ticks}
              min={20}
              max={120}
              step={5}
              onChange={setTicks}
            />
            <Slider
              label="Idle frames per second"
              value={frames}
              min={15}
              max={90}
              step={3}
              onChange={setFrames}
            />
            <Stat label="Tween vs seek ACF(1)" value={formatNum(data.rho[1])} />
          </>
        }
      >
        <LineChart
          series={[
            { values: data.tween, label: "Tween to a target", color: "#7ee0c6" },
            { values: data.seek, label: "Move toward the same target", color: "#f0b45a" },
          ]}
          xLabel="Steps"
        />
        <StemChart values={data.rho} yLabel="ACF of move-toward" bands={1.96 / Math.sqrt(data.n)} />
        <LineChart
          series={[
            { values: data.body, label: "Physics body", color: "#8ab4f8" },
            { values: data.drawn, label: "Idle-frame reconstruction", color: "#7ee0c6" },
          ]}
          xLabel="Samples (different clocks)"
        />
      </Lab>

      <TryThis
        items={[
          "Switch easing. The tween always finishes on time.",
          "Lower the move-toward fraction. It creeps, and the ACF stays high.",
          "Bottom plot: physics on one grid, idle frames on another.",
        ]}
      />

      <Quiz
        id="godot"
        questions={[
          {
            prompt: "Idle frames and physics ticks should be treated as:",
            choices: [
              "The same sampling calendar.",
              "Two clocks that need an explicit conversion when they meet.",
              "Proof the series is nonstationary.",
              "A replacement for the periodogram.",
            ],
            answer: 1,
            why: "They are different sampling rates of related series. Crossing them without interpolation or a shared time base creates aliasing and stair-steps.",
          },
          {
            prompt: "A tween from A to B after a one-sample start is:",
            choices: [
              "White noise.",
              "A designed impulse response, a short transfer function.",
              "An AR(12) by definition.",
              "Only valid if the ACF is zero.",
            ],
            answer: 1,
            why: "The start event is the impulse. The easing curve is the weight sequence that follows.",
          },
          {
            prompt: "Move-toward with a small fraction each tick behaves like:",
            choices: [
              "A high-pass difference.",
              "An AR(1) pulled toward a target, so it has long memory.",
              "A raw unsmoothed periodogram.",
              "Seasonal differencing at lag 12.",
            ],
            answer: 1,
            why: "Each step keeps most of the last value and adds a little of the gap. That is exponential approach, the same family as AR(1).",
          },
          {
            prompt: "Why keep collisions on the physics clock, not the idle clock?",
            choices: [
              "Idle frames are always slower.",
              "A variable step changes the discrete dynamics, so contacts would depend on hitching.",
              "Tweens cannot run during physics.",
              "The ACF is undefined on the physics clock.",
            ],
            answer: 1,
            why: "Irregular steps are a different numerical method each frame. Fixed ticks keep the same difference equation.",
          },
        ]}
      />
    </Chapter>
  );
}
