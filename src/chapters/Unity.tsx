import { useMemo, useState } from "react";
import { LineChart } from "../components/Charts";
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
import {
  formatNum,
  lerpSeries,
  rigidBody,
  sampleHold,
  std,
} from "../lib/ts";

export function Unity() {
  const [physHz, setPhysHz] = useState(50);
  const [renderHz, setRenderHz] = useState(60);
  const [damp, setDamp] = useState(0.18);
  const [friction, setFriction] = useState(3.2);
  const [hold, setHold] = useState(1.4);
  const [interp, setInterp] = useState(true);

  const data = useMemo(() => {
    const seconds = 6;
    const nPhys = Math.max(2, Math.round(seconds * physHz));
    const nRend = Math.max(2, Math.round(seconds * renderHz));
    const tPhys = Array.from({ length: nPhys }, (_, i) => (i / (nPhys - 1)) * seconds);
    const tRend = Array.from({ length: nRend }, (_, i) => (i / (nRend - 1)) * seconds);
    const input = tPhys.map((t) => (t >= 0.8 && t <= 0.8 + hold ? 1 : 0));
    const body = rigidBody(tPhys, input, 14, friction);
    const held = sampleHold(tPhys, body.pos, tRend);
    const lerped = lerpSeries(tPhys, body.pos, tRend);
    const displayed = interp ? lerped : held;
    const camera: number[] = [];
    let cam = displayed[0] ?? 0;
    for (const p of displayed) {
      cam = cam + damp * (p - cam);
      camera.push(cam);
    }
    const stairErr = held.map((p, i) => p - lerped[i]);
    return {
      body,
      displayed,
      camera,
      stairJitter: std(stairErr),
      followLag: std(displayed.map((p, i) => p - camera[i])),
    };
  }, [physHz, renderHz, damp, friction, hold, interp]);

  return (
    <Chapter
      kicker="Chapter 10"
      title="Time series in Unity"
      lede="Two clocks: a fixed physics tick, and a frame whenever the picture is ready. Sampling, filters, and forecasts all live in that split."
    >
      <Takeaway>
        Move on the physics clock. Draw between the last two poses. Follow with
        a smoother, not a snap.
      </Takeaway>

      <section className="prose">
        <h2>Two clocks, one path</h2>
        <Compare
          leftTitle="Physics"
          left="Regular step. Same difference equation every tick. Collisions stay honest."
          rightTitle="Display"
          right="Irregular. Waits on the screen and on hitching. A dropped frame is a bigger step."
        />
        <Formula
          expr="X_{\mathrm{draw}}(t)=(1-\alpha)X_k+\alpha X_{k+1}"
          plain="Blend the last two physics poses. A linear filter that fills the gaps."
        />
        <Cards>
          <Card title="Follow camera">
            EWMA with another name. Tight: more weight on now. Loose: later turns.
          </Card>
          <Card title="Netcode">
            Predict a few steps, then treat the server surprise as a residual.
          </Card>
        </Cards>
      </section>

      <Callout title="Plot against seconds" tone="note">
        A hitch is a spike in step size, not a trend. Plotting against frame
        index warps the clock.
      </Callout>

      <Lab
        title="Fixed physics, uneven pictures, follow camera"
        controls={
          <>
            <Slider
              label="Physics ticks per second"
              value={physHz}
              min={20}
              max={90}
              step={5}
              onChange={setPhysHz}
            />
            <Slider
              label="Display frames per second"
              value={renderHz}
              min={24}
              max={120}
              step={2}
              onChange={setRenderHz}
            />
            <Slider
              label="Camera follow weight"
              value={damp}
              min={0.04}
              max={0.7}
              step={0.02}
              format={(v) => v.toFixed(2)}
              onChange={setDamp}
            />
            <Slider
              label="Drag"
              value={friction}
              min={0.4}
              max={8}
              step={0.2}
              format={(v) => v.toFixed(1)}
              onChange={setFriction}
            />
            <Slider
              label="Input hold (seconds)"
              value={hold}
              min={0.3}
              max={3}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setHold}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={interp}
                onChange={(e) => setInterp(e.target.checked)}
              />
              Interpolate between physics poses
            </label>
            <div className="stat-row">
              <Stat label="Stair-step jitter" value={formatNum(data.stairJitter, 3)} />
              <Stat label="Camera lag (SD)" value={formatNum(data.followLag, 3)} />
            </div>
          </>
        }
      >
        <LineChart
          series={[
            { values: data.body.pos, label: "Physics body", color: "#8ab4f8" },
          ]}
          xLabel="Physics ticks"
        />
        <LineChart
          series={[
            { values: data.displayed, label: "What the frame shows", color: "#7ee0c6" },
            { values: data.camera, label: "Follow camera", color: "#f0b45a" },
          ]}
          xLabel="Display frames"
        />
      </Lab>

      <TryThis
        items={[
          "Physics at 20, display at 60, interpolation off: hold, then jump.",
          "Turn interpolation on. The jumps shrink.",
          "Raise camera weight to lock on. Lower it for a late, smooth turn.",
        ]}
      />

      <Quiz
        id="unity"
        questions={[
          {
            prompt: "Unity’s physics clock is most like:",
            choices: [
              "An irregularly sampled series.",
              "A fixed-rate discretization of a dynamical system.",
              "A periodogram of the frame rate.",
              "An MA(1) fitted to screen brightness.",
            ],
            answer: 1,
            why: "A fixed interval is a regular sample of the continuous motion. The display clock is the irregular one.",
          },
          {
            prompt: "Drawing the last physics pose with no interpolation tends to:",
            choices: [
              "Remove all serial correlation.",
              "Create visible stair-steps when the two clocks disagree.",
              "Force the camera gain to 1.",
              "Make the ACF cutoff at lag 12.",
            ],
            answer: 1,
            why: "You are holding the last sample until the next one arrives. That is a zero-order hold, and it looks like steps.",
          },
          {
            prompt: "A follow camera that keeps most of its last position is:",
            choices: [
              "A high-pass difference filter.",
              "A low-pass smoother, so it lags turning points.",
              "A unit-root random walk.",
              "Unrelated to any idea in this course.",
            ],
            answer: 1,
            why: "Heavy memory is exponential smoothing. Gain is high at low frequencies and the phase is late.",
          },
          {
            prompt: "Client prediction plus a server correction is closest to:",
            choices: [
              "Seasonal dummy regression.",
              "Forecasting a few steps, then treating the surprise as a residual.",
              "A raw periodogram with no smoothing.",
              "White noise by definition.",
            ],
            answer: 1,
            why: "You project the local state forward, then the server tells you the innovation you missed.",
          },
        ]}
      />
    </Chapter>
  );
}
