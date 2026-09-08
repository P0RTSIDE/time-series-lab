import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import { M } from "../components/MathTex";
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
      lede="Split a series into slow drift, a calendar repeat, and leftover noise. The leftover usually still remembers the past."
    >
      <Takeaway>
        Fit the obvious mean first. Then treat the leftovers as their own series.
      </Takeaway>

      <section className="prose">
        <h2>Three pieces</h2>
        <Formula
          expr="Y_t = T_t + S_t + \varepsilon_t"
          plain="Trend plus season plus irregular. Start here before you reach for ARMA."
        />
        <TermList
          items={[
            {
              term: "Trend",
              text: "Slow level. Often a line, sometimes a gentle curve.",
            },
            {
              term: "Season",
              text: "A known repeat: 12 for months, 7 for weekdays.",
            },
            {
              term: "Irregular",
              text: "What is left. Rarely white. Inspect its ACF.",
            },
            {
              term: "A cheap season",
              text: "A sine and cosine at period d. Extra harmonics sharpen corners.",
            },
          ]}
        />
        <Formula
          expr="S_t = a\cos(2\pi t/d)+b\sin(2\pi t/d)"
          plain="d is the period. One pair is a smooth wave. More pairs add edges."
        />
        <h2>Leftovers still have a clock</h2>
        <p>
          After you fit a line, look at the leftover ACF the same way as in
          chapter 1. Each bar is “this residual vs the residual h steps ago.”
          For white leftovers, bars after lag 0 should bounce inside{" "}
          <M expr="\pm 1.96/\sqrt{n}" />. A slow decay means the errors still
          remember the past: your usual standard errors are too tight, and an
          ARMA model can still take that leftover signal.
        </p>
        <p>
          Two leftover shapes ask for different next steps. Spikes at 12, 24, 36
          mean you missed a season. A smooth fade with no seasonal grid means
          serial correlation, often an AR(1).
        </p>
      </section>

      <Callout title="White is about memory, not size" tone="note">
        A wild, jagged series can be white. A calm series can be highly
        autocorrelated. The claim is “uncorrelated over time,” not “small.”
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

      <TryThis
        items={[
          "AR near zero, strong season: leftover ACF spikes at the period.",
          "Season at zero, high AR: leftover ACF decays smoothly.",
          "Spikes want seasonal terms. A smooth decay wants an AR model.",
        ]}
      />

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
