import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import { M } from "../components/MathTex";
import { Callout, Chapter, Lab, Quiz, Slider, Stat } from "../components/UI";
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
      lede="Sometimes one series is an input you can see, and another is the output it drives. A transfer function is the linear map from input to output, plus a noise series of its own."
    >
      <section className="prose">
        <h2>Input, delay, and echo</h2>
        <p>
          A discrete transfer function model looks like
        </p>
        <M
          block
          expr="Y_t=\mu+\sum_{j=0}^{\infty} v_j X_{t-j}+N_t."
        />
        <p>
          The weights <M expr="v_j" /> are the impulse response: the path{" "}
          <M expr="Y" /> would take if <M expr="X" /> were a single spike and the
          noise were off. A delay (dead time) <M expr="b" /> means the first
          nonzero weight sits at lag <M expr="b" />. A common smooth shape after
          that is a geometric decay,
        </p>
        <M block expr="v_j=0\ (j<b),\qquad v_j=\omega\lambda^{j-b}\ (j\ge b)." />
        <p>
          That is the same family as <M expr="Y" /> remembering a filtered{" "}
          <M expr="X" /> with one AR-like pole. In lag-operator form people write
          a ratio of short polynomials times <M expr="X_{t-b}" />, plus an ARMA
          noise <M expr="N_t" />.
        </p>
        <h2>How you see the weights</h2>
        <p>
          If the input is close to white, the cross-correlation function{" "}
          <M expr="\rho_{XY}(h)" /> is a scaled copy of <M expr="v_h" />. Real
          inputs are autocorrelated, which smears that picture. Prewhitening
          filters both series with a model fitted to <M expr="X" /> first, then
          reads the CCF of the filtered pair. You do not need the algebra to use
          the idea: whiten the input, then look at how the output lines up.
        </p>
        <p>
          After you have a candidate <M expr="v_j" />, the leftover{" "}
          <M expr="N_t=Y_t-\sum v_j X_{t-j}" /> is just another univariate series.
          Model it with everything in chapters 4 through 8.
        </p>
      </section>

      <Callout title="Regression is the memoryless case" tone="note">
        Ordinary regression of Y on contemporaneous X is a transfer function
        with one weight and white (or, more honestly, correlated) noise. Once
        X has delayed echoes, you need the extra weights.
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

      <section className="prose">
        <p>
          A pulse should reappear in Y after the delay, then fade at rate
          lambda. A step should climb toward a new level of about{" "}
          <M expr="\omega/(1-\lambda)" /> after the same delay. Turn the noise
          up and the CCF still hints at the delay, but the later weights get
          harder to see. That is why people prewhiten and why they keep the
          polynomial short.
        </p>
      </section>

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
