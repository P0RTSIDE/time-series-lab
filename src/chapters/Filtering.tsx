import { useMemo, useState } from "react";
import { LineChart, SpectrumChart } from "../components/Charts";
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
  addTrendSeason,
  convolve,
  difference,
  differenceGain,
  ewma,
  filterGain,
  formatNum,
  movingAverageWeights,
  mulberry32,
  periodogram,
  simulateAR,
  smoothPeriodogram,
} from "../lib/ts";

export function Filtering() {
  const [seed, setSeed] = useState(8);
  const [kind, setKind] = useState<"ma" | "diff" | "ewma">("ma");
  const [width, setWidth] = useState(7);
  const [alpha, setAlpha] = useState(0.25);
  const [lag, setLag] = useState(1);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 220;
    const core = simulateAR([0.25], n, 0.7, rng);
    const y = addTrendSeason(core, 3, 0.02, 2.4, 12);
    let filtered: number[];
    const freqs = Array.from({ length: 80 }, (_, i) => (i + 1) / 200);
    let gain: number[];
    if (kind === "ma") {
      const weights = movingAverageWeights(width);
      filtered = convolve(y, weights, true);
      gain = filterGain(weights, freqs, false);
    } else if (kind === "diff") {
      filtered = difference(y, lag);
      gain = differenceGain(freqs, lag);
    } else {
      filtered = ewma(y, alpha);
      const w = [alpha];
      for (let j = 1; j < 30; j++) w.push(alpha * (1 - alpha) ** j);
      gain = filterGain(w, freqs, true);
    }
    const pgY = periodogram(y);
    const finite = filtered.filter((v) => Number.isFinite(v));
    const pgF = periodogram(finite);
    return {
      y,
      filtered,
      freqs,
      gain,
      pgY,
      smY: smoothPeriodogram(pgY.spec, 2),
      smF: smoothPeriodogram(pgF.spec, 2),
      freqF: pgF.freq,
    };
  }, [seed, kind, width, alpha, lag]);

  return (
    <Chapter
      kicker="Chapter 07"
      title="Linear filtering"
      lede="A filter is a weighted sum of nearby values. Some cycles pass. Some get crushed."
    >
      <Takeaway>
        Time domain: convolution. Frequency domain: multiply by a gain curve.
      </Takeaway>

      <section className="prose">
        <h2>Weights, then gain</h2>
        <Formula
          expr="\tilde Y_t=\sum_j \psi_j Y_{t-j}"
          plain="Feed in a spike and the output is the weight sequence. That is the impulse response."
        />
        <Compare
          leftTitle="Moving average"
          left="Low-pass. Keeps slow motion. Damps jitter. Can ring and invent faint wiggles."
          rightTitle="First difference"
          right="High-pass. Kills a line. Boosts fast changes. Gain is zero at frequency 0."
        />
        <Formula
          expr="|H(\omega)|=\Big|\sum_j\psi_j e^{-i\omega j}\Big|"
          plain="Gain near 0: that cycle dies. Gain near 1 or more: it passes or gets louder."
        />
        <Cards>
          <Card title="Two-sided average">
            Less delay. Needs future values. Bad at the live endpoint.
          </Card>
          <Card title="Exponential smooth">
            Uses only the past, so it lags turns. Smaller alpha, heavier memory.
          </Card>
        </Cards>
      </section>

      <Callout title="Pretty is not a model" tone="tip">
        Differencing prepares an ARMA. Smoothing is often just display. Do not
        confuse a smooth curve with a fitted stochastic model.
      </Callout>

      <Lab
        title="Low-pass, high-pass, and gain"
        controls={
          <>
            <div className="seg">
              {(
                [
                  ["ma", "Moving average"],
                  ["diff", "Difference"],
                  ["ewma", "Exponential smooth"],
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
            {kind === "ma" && (
              <Slider label="Window width" value={width} min={3} max={21} step={2} onChange={setWidth} />
            )}
            {kind === "diff" && (
              <Slider label="Difference lag" value={lag} min={1} max={12} step={1} onChange={setLag} />
            )}
            {kind === "ewma" && (
              <Slider
                label="Alpha (weight on now)"
                value={alpha}
                min={0.05}
                max={0.8}
                step={0.05}
                format={(v) => v.toFixed(2)}
                onChange={setAlpha}
              />
            )}
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <Stat
              label="Filter"
              value={
                kind === "ma"
                  ? `${width}-point average`
                  : kind === "diff"
                    ? `lag ${lag} difference`
                    : `EWMA ${formatNum(alpha)}`
              }
            />
          </>
        }
      >
        <LineChart
          series={[
            { values: data.y, label: "Original", color: "#8ab4f8" },
            { values: data.filtered, label: "Filtered", color: "#7ee0c6" },
          ]}
          xLabel="Time"
        />
        <LineChart
          series={[{ values: data.gain, label: "Gain |H|", color: "#f0b45a" }]}
          xLabel="Frequency index (low to high)"
          yLabel="Gain"
        />
        <SpectrumChart
          freq={data.pgY.freq}
          spec={data.smY}
          overlay={{ freq: data.freqF, spec: data.smF, label: "Filtered spectrum" }}
        />
      </Lab>

      <TryThis
        items={[
          "Moving average: yearly wiggle flattens, gain falls as frequency rises.",
          "Lag-12 difference: a hole at the seasonal frequency.",
          "Exponential smooth: smaller alpha, later chase.",
        ]}
      />

      <Quiz
        id="filtering"
        questions={[
          {
            prompt: "A linear filter is:",
            choices: [
              "Any nonlinear transformation of Y.",
              "A weighted sum of the series at nearby times.",
              "The same as a periodogram.",
              "A method that always removes seasonality perfectly.",
            ],
            answer: 1,
            why: "Time-invariant linear filters are convolutions. That is the whole class.",
          },
          {
            prompt: "First differencing is a high-pass filter because:",
            choices: [
              "It boosts low frequencies and kills jitter.",
              "Its gain is near zero at low frequency and larger at high frequency.",
              "It is two-sided.",
              "It estimates an MA(1).",
            ],
            answer: 1,
            why: "A linear trend (frequency near 0) disappears. Fast wiggles get relatively larger.",
          },
          {
            prompt: "The gain |H(ω)| tells you:",
            choices: [
              "The ACF at lag ω.",
              "How strongly a cycle at that frequency is passed or damped.",
              "The forecast origin.",
              "Whether the series is invertible.",
            ],
            answer: 1,
            why: "Gain is the modulus of the frequency response. Phase tells you about delay.",
          },
          {
            prompt: "A two-sided moving average, compared with exponential smoothing:",
            choices: [
              "Can be computed at the last live observation with no delay.",
              "Has less phase lag in the middle of the sample, but needs future values.",
              "Is not a linear filter.",
              "Always has gain 2 at every frequency.",
            ],
            answer: 1,
            why: "Symmetric windows are nicer for historical display and cannot be used at the endpoint of a realtime series without extra assumptions.",
          },
        ]}
      />
    </Chapter>
  );
}
