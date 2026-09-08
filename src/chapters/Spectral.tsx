import { useMemo, useState } from "react";
import { LineChart, SpectrumChart } from "../components/Charts";
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
  arSpectrum,
  formatNum,
  mulberry32,
  periodogram,
  sineWave,
  smoothPeriodogram,
  whiteNoise,
} from "../lib/ts";

export function Spectral() {
  const [seed, setSeed] = useState(21);
  const [p1, setP1] = useState(20);
  const [p2, setP2] = useState(8);
  const [a1, setA1] = useState(1.4);
  const [a2, setA2] = useState(0.7);
  const [noise, setNoise] = useState(0.9);
  const [smooth, setSmooth] = useState(2);
  const [phi, setPhi] = useState(0.6);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 256;
    const e = whiteNoise(n, noise, rng);
    const y = sineWave(n, p1, a1).map((v, t) => v + sineWave(n, p2, a2)[t] + e[t]);
    const pg = periodogram(y);
    const sm = smoothPeriodogram(pg.spec, smooth);
    const peakI = sm.reduce((b, v, i) => (v > sm[b] ? i : b), 0);
    const theo = arSpectrum([phi], 1, pg.freq);
    const scale =
      theo.reduce((s, v) => s + v, 0) === 0
        ? 1
        : sm.reduce((s, v) => s + v, 0) / theo.reduce((s, v) => s + v, 0);
    return {
      y,
      pg,
      sm,
      peakPeriod: pg.period[peakI],
      peakFreq: pg.freq[peakI],
      theo: theo.map((v) => v * scale),
    };
  }, [seed, p1, p2, a1, a2, noise, smooth, phi]);

  return (
    <Chapter
      kicker="Chapter 06"
      title="Spectral analysis"
      lede="Time domain: how today depends on yesterday. Frequency domain: which cycles are in the mix, and how loud."
    >
      <Takeaway>
        ACF and spectrum are partners. Peaks are just easier to see on this
        side of the pair.
      </Takeaway>

      <section className="prose">
        <h2>The words</h2>
        <TermList
          items={[
            {
              term: "Period",
              text: "How many steps between repeats. Monthly year: 12.",
            },
            {
              term: "Frequency",
              text: "Reciprocal. Two cycles a year in monthly data: 1/6.",
            },
            {
              term: "Amplitude",
              text: "Height of the wave. Squares into power.",
            },
            {
              term: "Leakage",
              text: "Off-grid periods spill into neighbors. Short records lie more.",
            },
          ]}
        />
        <h2>The periodogram</h2>
        <Formula
          expr="I(\omega_k)=\frac{1}{n}\left|\sum_{t=1}^{n}(Y_t-\bar Y)e^{-i\omega_k t}\right|^2"
          plain="A hidden wave of period n/k spikes at frequency k/n. Raw plot is noisy. Smooth nearby bars to see the shape."
        />
        <p>
          How to read it: the horizontal axis is frequency (cycles per
          observation). The vertical axis is power. A hidden yearly cycle in
          monthly data should spike near 1/12. The raw periodogram chatters.
          Average a few neighbors (smoothing) to see the shape. Positive AR(1)
          piles power at low frequency (slow wander). Negative phi piles it
          near 1/2 (flip-flop).
        </p>
      </section>

      <Callout title="Frequency 0 is the trend corner" tone="tip">
        Loud low-frequency power often means you skipped a trend. Detrend first
        if you came here looking for real cycles.
      </Callout>

      <Lab
        title="Two hidden cycles and a noisy periodogram"
        controls={
          <>
            <Slider label="Period 1" value={p1} min={6} max={48} step={1} onChange={setP1} />
            <Slider
              label="Amplitude 1"
              value={a1}
              min={0}
              max={2.5}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setA1}
            />
            <Slider label="Period 2" value={p2} min={4} max={30} step={1} onChange={setP2} />
            <Slider
              label="Amplitude 2"
              value={a2}
              min={0}
              max={2.5}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setA2}
            />
            <Slider
              label="Noise scale"
              value={noise}
              min={0.1}
              max={2.4}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setNoise}
            />
            <Slider
              label="Smoothing half-width"
              value={smooth}
              min={0}
              max={8}
              step={1}
              onChange={setSmooth}
            />
            <Slider
              label="AR(1) overlay phi"
              value={phi}
              min={-0.9}
              max={0.9}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setPhi}
            />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <div className="stat-row">
              <Stat label="Smoothed peak period" value={formatNum(data.peakPeriod, 1)} />
              <Stat label="Peak frequency" value={formatNum(data.peakFreq, 3)} />
            </div>
          </>
        }
      >
        <LineChart series={[{ values: data.y, label: "Series with two cycles" }]} xLabel="Time" />
        <SpectrumChart
          freq={data.pg.freq}
          spec={data.sm}
          overlay={{ freq: data.pg.freq, spec: data.theo, label: "Scaled AR(1) shape" }}
          yLabel="Smoothed power"
        />
        <p className="chart-caption">
          The dashed overlay is an AR(1) spectral shape, scaled to the same total
          mass. It is a comparison curve, not a fit to this two-cycle series.
        </p>
      </Lab>

      <TryThis
        items={[
          "Drop the noise. Peaks should sit near your two periods.",
          "Raise noise, then raise smoothing. Spikes drown, then a shape returns.",
          "Off-grid periods leak a little. That is the discrete record, not a broken idea.",
        ]}
      />

      <Quiz
        id="spectral"
        questions={[
          {
            prompt: "Frequency 1/12 in monthly data is a cycle of period:",
            choices: ["1 month", "12 months", "12 years", "2 months"],
            answer: 1,
            why: "Period is the reciprocal of frequency in cycles per observation. One-twelfth cycle per month is a 12-month cycle.",
          },
          {
            prompt: "The raw periodogram is:",
            choices: [
              "A consistent estimator with no need to smooth.",
              "A noisy sample version of the spectrum, usually smoothed before you trust the shape.",
              "Identical to the PACF.",
              "Defined only for AR(1) series.",
            ],
            answer: 1,
            why: "Ordinates have large variance. Local averaging is the classical fix.",
          },
          {
            prompt: "An AR(1) with phi near +0.8 has extra spectral power:",
            choices: [
              "Near frequency 1/2.",
              "At every Fourier frequency equally.",
              "At low frequencies.",
              "Only at seasonal lags.",
            ],
            answer: 2,
            why: "Positive persistence is slow motion, which is low-frequency energy.",
          },
          {
            prompt: "Leakage is:",
            choices: [
              "When the ACF is negative.",
              "Power spilling into neighboring frequencies because the true cycle does not fit an integer number of repeats in the sample.",
              "A unit root.",
              "The same as invertibility.",
            ],
            answer: 1,
            why: "Finite records and a discrete frequency grid smear a tone that is off-grid.",
          },
        ]}
      />
    </Chapter>
  );
}
