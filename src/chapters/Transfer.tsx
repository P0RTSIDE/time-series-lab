import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import {
  Callout,
  Chapter,
  Formula,
  Lab,
  Quiz,
  Slider,
  Stat,
  Takeaway,
  TermList,
  TryThis,
} from "../components/UI";
import {
  ccf,
  formatNum,
  mulberry32,
  pulseInput,
  simulateAR,
  stepInput,
  transferResponse,
} from "../lib/ts";

export function Transfer() {
  const [seed, setSeed] = useState(2);
  const [mode, setMode] = useState<"pulse" | "step">("pulse");
  const [delay, setDelay] = useState(3);
  const [omega, setOmega] = useState(1.2);
  const [lambda, setLambda] = useState(0.65);
  const [noise, setNoise] = useState(0.25);
  const [at, setAt] = useState(40);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 160;
    const x = mode === "pulse" ? pulseInput(n, at, 1) : stepInput(n, at, 1);
    const nse = simulateAR([0.35], n, noise, rng);
    const y = transferResponse(x, delay, omega, lambda, nse);
    const weights = Array.from({ length: 20 }, (_, j) =>
      j < delay ? 0 : omega * lambda ** (j - delay),
    );
    const cross = ccf(x, y, 20);
    return { x, y, weights, cross };
  }, [seed, mode, delay, omega, lambda, noise, at]);

  return (
    <Chapter
      kicker="Chapter 09"
      title="Transfer function models"
      lede="X is an input you can see. Y is the output it drives, plus leftover noise."
    >
      <Takeaway>
        The weights are the path Y would take if X were a single spike and the
        noise were off.
      </Takeaway>

      <section className="prose">
        <h2>Delay, then fade</h2>
        <Formula
          expr="Y_t=\mu+\sum_{j=0}^{\infty} v_j X_{t-j}+N_t"
          plain="v_j is the impulse response. First nonzero weight sits at the delay b."
        />
        <Formula
          expr="v_j=0\ (j<b),\quad v_j=\omega\lambda^{j-b}\ (j\ge b)"
          plain="Wait b steps, then a geometric echo. Same family as one AR-like pole on a filtered X."
        />
        <TermList
          items={[
            {
              term: "White input",
              text: "The CCF is a scaled copy of the weights. Easy to read.",
            },
            {
              term: "Sticky input",
              text: "The CCF smears. Whiten X first, filter Y the same way, then look.",
            },
            {
              term: "Leftover N",
              text: "After you subtract the filtered input, treat N like any other series.",
            },
            {
              term: "Plain regression",
              text: "One weight, no delay. Fine until X has echoes.",
            },
          ]}
        />
      </section>

      <Callout title="One weight is the memoryless case" tone="note">
        Y on contemporaneous X is a transfer function with a single v_0. Delayed
        echoes need the extra weights.
      </Callout>

      <Lab
        title="Impulse and step responses"
        controls={
          <>
            <div className="seg">
              <button
                type="button"
                className={mode === "pulse" ? "on" : ""}
                onClick={() => setMode("pulse")}
              >
                Pulse input
              </button>
              <button
                type="button"
                className={mode === "step" ? "on" : ""}
                onClick={() => setMode("step")}
              >
                Step input
              </button>
            </div>
            <Slider label="Delay b" value={delay} min={0} max={10} step={1} onChange={setDelay} />
            <Slider
              label="Impact omega"
              value={omega}
              min={0.2}
              max={2.2}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setOmega}
            />
            <Slider
              label="Decay lambda"
              value={lambda}
              min={0.1}
              max={0.92}
              step={0.02}
              format={(v) => v.toFixed(2)}
              onChange={setLambda}
            />
            <Slider
              label="Noise scale"
              value={noise}
              min={0}
              max={1.2}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setNoise}
            />
            <Slider label="Input time" value={at} min={10} max={80} step={1} onChange={setAt} />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <Stat label="First nonzero weight" value={`v_${delay} = ${formatNum(omega)}`} />
          </>
        }
      >
        <LineChart
          series={[
            { values: data.x, label: "Input X", color: "#8ab4f8" },
            { values: data.y, label: "Output Y", color: "#7ee0c6" },
          ]}
          xLabel="Time"
        />
        <StemChart
          values={data.weights}
          yLabel="Impulse weights v"
          xLabel="Lag"
          color="#f0b45a"
        />
        <StemChart
          values={data.cross.map((c) => c.value)}
          xStart={-20}
          xLabel="Lag of Y after X"
          yLabel="CCF"
          color="#7ee0c6"
        />
      </Lab>

      <TryThis
        items={[
          "Pulse: Y jumps after the delay, then fades at lambda.",
          "Step: Y climbs toward about omega / (1 - lambda).",
          "Raise noise. The CCF still hints at the delay. Later weights get messy.",
        ]}
      />

      <Quiz
        id="transfer"
        questions={[
          {
            prompt: "The impulse response v_j is:",
            choices: [
              "The periodogram of X.",
              "The effect on Y of a one-unit spike in X, j steps later.",
              "Always zero after lag 1.",
              "The PACF of the noise.",
            ],
            answer: 1,
            why: "That is the definition of the linear weights in the transfer function.",
          },
          {
            prompt: "A delay b means:",
            choices: [
              "Y moves before X.",
              "The first chance for X to affect Y is b observations later.",
              "The noise is an MA(b).",
              "The spectrum is zero below frequency b.",
            ],
            answer: 1,
            why: "Dead time. In the lab, the output sits still until t = input time + b.",
          },
          {
            prompt: "Prewhitening is used because:",
            choices: [
              "It removes the need for any noise model.",
              "Autocorrelated inputs smear the CCF, so you filter X (and Y the same way) before reading lags.",
              "It estimates a unit root.",
              "It forces lambda to be 1.",
            ],
            answer: 1,
            why: "When X is white, CCF traces v_j. When X is sticky, CCF is a blur of those weights.",
          },
          {
            prompt: "After subtracting the filtered input from Y, you should:",
            choices: [
              "Stop. The leftover must be ignored.",
              "Treat the leftover N_t as a univariate time series and model its correlation.",
              "Always difference 12 times.",
              "Set every forecast to zero.",
            ],
            answer: 1,
            why: "The transfer function explains the part of Y that X can linearly explain. The rest is still a time series.",
          },
        ]}
      />
    </Chapter>
  );
}
