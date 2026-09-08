import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import { M } from "../components/MathTex";
import { Callout, Chapter, Lab, Quiz, Slider, Stat } from "../components/UI";
import {
  acf,
  addTrendSeason,
  formatNum,
  mulberry32,
  olsInterceptSlope,
  residuals,
  simulateAR,
} from "../lib/ts";

export function Univariate() {
  const [seed, setSeed] = useState(11);
  const [slope, setSlope] = useState(0.03);
  const [amp, setAmp] = useState(2.2);
  const [period, setPeriod] = useState(12);
  const [phi, setPhi] = useState(0.6);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 200;
    const err = simulateAR([phi], n, 0.8, rng);
    const y = addTrendSeason(err, 4, slope, amp, period);
    const t = y.map((_, i) => i);
    const fit = olsInterceptSlope(t, y);
    const resid = residuals(t, y, fit.b0, fit.b1);
    return { y, resid, fit, rho: acf(resid, 18), n };
  }, [seed, slope, amp, period, phi]);

  return (
    <Chapter
      kicker="Chapter 02"
      title="Univariate models: trend, seasonality, correlated errors"
      lede="The first model of a single series is a sum of slow movement, calendar pattern, and leftover noise. The leftover is rarely white."
    >
      <section className="prose">
        <h2>A working decomposition</h2>
        <p>
          A useful starting point is
        </p>
        <M block expr="Y_t = T_t + S_t + \varepsilon_t." />
        <p>
          <M expr="T_t" /> is trend: a slow level, often a line or a gentle curve.{" "}
          <M expr="S_t" /> is seasonality: a repeating shape with a known period,
          such as 12 for months or 7 for weekdays. <M expr="\varepsilon_t" /> is
          the irregular piece.
        </p>
        <p>
          Trend can be parametric, as in <M expr="T_t=\beta_0+\beta_1 t" />, or
          more flexible. Seasonality can be dummy indicators (one coefficient per
          month) or a short Fourier pair,
        </p>
        <M
          block
          expr="S_t = a\cos(2\pi t/d)+b\sin(2\pi t/d),"
        />
        <p>
          where <M expr="d" /> is the period. Extra harmonics capture sharper
          seasonal corners.
        </p>
        <h2>The irregular piece is a time series too</h2>
        <p>
          After you fit trend and season, the residuals should be inspected as
          their own series. If they are white noise, neighboring residuals are
          uncorrelated and the usual regression formulas are in good shape. If
          they are correlated, two things happen:
        </p>
        <ul>
          <li>The fit can still track the mean, but uncertainty is misstated.</li>
          <li>The leftover correlation is unused signal. An ARMA model can take it.</li>
        </ul>
        <p>
          A quick visual: the residual autocorrelation function. For white noise,
          bars after lag 0 sit inside the rough bands <M expr="\pm 1.96/\sqrt{n}" />.
          Persistent bars mean the errors remember the past.
        </p>
      </section>

      <Callout title="White noise is a claim about dependence" tone="note">
        White noise can look jagged and wild. The definition is not “small.” It
        is “uncorrelated over time, with constant variance.” A calm-looking series
        can still be highly autocorrelated.
      </Callout>

      <Lab
        title="Build a series, then look at leftover ACF"
        controls={
          <>
            <Slider
              label="Trend slope"
              value={slope}
              min={-0.02}
              max={0.08}
              step={0.005}
              format={(v) => v.toFixed(3)}
              onChange={setSlope}
            />
            <Slider
              label="Seasonal amplitude"
              value={amp}
              min={0}
              max={6}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setAmp}
            />
            <Slider
              label="Seasonal period"
              value={period}
              min={4}
              max={24}
              step={1}
              onChange={setPeriod}
            />
            <Slider
              label="Error AR(1) coefficient"
              value={phi}
              min={-0.9}
              max={0.95}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setPhi}
            />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <div className="stat-row">
              <Stat label="Fitted slope" value={formatNum(data.fit.b1, 3)} />
              <Stat label="Residual ACF(1)" value={formatNum(data.rho[1])} />
            </div>
          </>
        }
      >
        <LineChart
          series={[{ values: data.y, label: "Observed series" }]}
          xLabel="Time"
        />
        <p className="chart-caption">
          Residuals after a linear time trend only. Seasonality and AR errors both
          remain visible in the leftover ACF.
        </p>
        <LineChart
          series={[{ values: data.resid, label: "Trend residuals", color: "#f0b45a" }]}
          xLabel="Time"
        />
        <StemChart values={data.rho} yLabel="Residual ACF" bands={1.96 / Math.sqrt(data.n)} />
      </Lab>

      <section className="prose">
        <p>
          Set the AR coefficient near zero and keep a strong season. After
          removing only a line, the residual ACF shows spikes at the seasonal
          period and its multiples. Set season to zero and raise the AR
          coefficient. The residual ACF decays smoothly. Those two leftover
          shapes ask for different next steps: seasonal terms versus a serial
          correlation model.
        </p>
      </section>

      <Quiz
        id="univariate"
        questions={[
          {
            prompt: "In Y_t = T_t + S_t + ε_t, the term S_t is meant to capture:",
            choices: [
              "A one-time level shift.",
              "A repeating calendar or clock pattern.",
              "Forecast error variance.",
              "The spectral density at frequency zero.",
            ],
            answer: 1,
            why: "Seasonality is the periodic component with a known period, such as months or weekdays.",
          },
          {
            prompt: "Residual ACF bars that decay slowly after you fit a trend usually point to:",
            choices: [
              "White noise errors.",
              "A missing seasonal dummy only, never serial correlation.",
              "Correlated errors, often well described by an autoregression.",
              "A periodogram that must be exactly zero.",
            ],
            answer: 2,
            why: "A slow ACF decay is the signature of persistent serial correlation, the AR(1) case being the simplest.",
          },
          {
            prompt: "White noise residuals are defined by:",
            choices: [
              "Small numerical size.",
              "A perfectly linear trend.",
              "Uncorrelated errors with stable variance (and usually mean zero).",
              "A period of exactly 12.",
            ],
            answer: 2,
            why: "Whiteness is about lack of time dependence, not about the series looking quiet.",
          },
          {
            prompt: "Why fit trend and season before modeling ε_t as ARMA?",
            choices: [
              "ARMA models cannot be estimated otherwise.",
              "So the correlation model is not forced to invent a fake cycle or wander to chase a mean that a simpler term could take.",
              "Trend terms cancel the periodogram.",
              "Seasonality makes least squares biased in every case.",
            ],
            answer: 1,
            why: "If you skip an obvious trend or season, the leftover model spends parameters mimicking them, and forecasts get worse in a brittle way.",
          },
        ]}
      />
    </Chapter>
  );
}
