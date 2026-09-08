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
  acf,
  ar1VarianceInflation,
  formatNum,
  mulberry32,
  olsInterceptSlope,
  residuals,
  simulateAR,
} from "../lib/ts";

export function Regression() {
  const [seed, setSeed] = useState(3);
  const [beta, setBeta] = useState(1.2);
  const [phi, setPhi] = useState(0.7);
  const [sigma, setSigma] = useState(0.9);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 160;
    const x = simulateAR([0.35], n, 1, rng);
    const e = simulateAR([phi], n, sigma, rng);
    const y = x.map((xi, i) => 0.5 + beta * xi + e[i]);
    const fit = olsInterceptSlope(x, y);
    const resid = residuals(x, y, fit.b0, fit.b1);
    const infl = ar1VarianceInflation(phi);
    const seNaive = fit.se1;
    const seCorr = seNaive * Math.sqrt(infl);
    return { x, y, resid, fit, infl, seNaive, seCorr, n, rho: acf(resid, 16) };
  }, [seed, beta, phi, sigma]);

  const zNaive = Math.abs(data.fit.b1 - beta) / (data.seNaive || 1e-8);
  const zCorr = Math.abs(data.fit.b1 - beta) / (data.seCorr || 1e-8);

  return (
    <Chapter
      kicker="Chapter 03"
      title="Regression with correlated errors"
      lede="The line can still be right. The usual standard error is the part that lies."
    >
      <Takeaway>
        OLS often nails the slope. It still quotes a precision you did not earn
        if the residuals remember each other.
      </Takeaway>

      <section className="prose">
        <h2>A line, plus sticky errors</h2>
        <Formula
          expr="Y_t=\beta_0+\beta_1 X_t+\varepsilon_t,\quad \varepsilon_t=\phi\varepsilon_{t-1}+a_t"
          plain="Mean is still a line. Errors are AR(1). The slope can be fine. The textbook SE is not."
        />
        <Formula
          expr="\frac{1+\phi}{1-\phi}"
          plain="Rough variance inflation when X is sticky. At phi = 0.8 this is 9, so SEs about triple."
        />
        <h2>Three repairs, one diagnosis</h2>
        <TermList
          items={[
            {
              term: "GLS",
              text: "Transform so the new errors look white, then run OLS. Cochrane-Orcutt is the AR(1) version.",
            },
            {
              term: "HAC SEs",
              text: "Keep the OLS slope. Widen the SE (Newey-West) to allow leftover lags.",
            },
            {
              term: "Model the errors",
              text: "Fit the line and an ARMA leftover together. Cousin of transfer functions.",
            },
            {
              term: "The shared point",
              text: "Mean model and dependence model are different jobs. Mix them up and you get overconfident science.",
            },
          ]}
        />
      </section>

      <Callout title="Effective sample size" tone="warn">
        High phi means neighbors are partly the same surprise. Length 200 can
        behave like far fewer independent points. Intervals must widen.
      </Callout>

      <Lab
        title="Naive versus AR(1)-aware slope uncertainty"
        controls={
          <>
            <Slider
              label="True slope"
              value={beta}
              min={0}
              max={2.5}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setBeta}
            />
            <Slider
              label="Error AR(1) phi"
              value={phi}
              min={-0.4}
              max={0.95}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setPhi}
            />
            <Slider
              label="Error noise scale"
              value={sigma}
              min={0.3}
              max={2}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setSigma}
            />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <div className="stat-row">
              <Stat label="OLS slope" value={formatNum(data.fit.b1)} />
              <Stat label="Naive SE" value={formatNum(data.seNaive, 3)} />
              <Stat label="Corrected SE" value={formatNum(data.seCorr, 3)} />
              <Stat label="Inflation" value={formatNum(data.infl)} />
            </div>
            <p className="tiny">
              Distance from truth in naive SE units: {formatNum(zNaive)}. In
              corrected SE units: {formatNum(zCorr)}. Raise phi and redraw a few
              times. The estimate stays near the truth more often than the naive
              interval would have you believe is “exact,” but the naive interval
              is the one that is too short.
            </p>
          </>
        }
      >
        <LineChart
          series={[
            { values: data.y, label: "Y" },
            { values: data.x.map((v) => 0.5 + beta * v), label: "True mean", dashed: true, color: "#8ab4f8" },
          ]}
          xLabel="Time"
        />
        <StemChart values={data.rho} yLabel="Residual ACF" bands={1.96 / Math.sqrt(data.n)} />
      </Lab>

      <TryThis
        items={[
          "Raise phi and redraw a few times. The slope stays near the truth.",
          "Watch the naive SE stay tight while the corrected SE grows.",
          "A loud residual ACF means you have not earned the skinny interval.",
        ]}
      />

      <Quiz
        id="regression"
        questions={[
          {
            prompt: "With stationary AR(1) errors, OLS for the slope is usually:",
            choices: [
              "Inconsistent, so you must never use it.",
              "Still reasonable for the coefficient, but with the wrong default SE.",
              "Unbiased only if phi is negative.",
              "Identical to the periodogram ordinate.",
            ],
            answer: 1,
            why: "The mean parameters can still be estimated well. The classical variance formula assumes uncorrelated residuals, which is false here.",
          },
          {
            prompt: "If phi is 0.8, the AR(1) variance inflation (1+phi)/(1-phi) is:",
            choices: ["1.8", "0.25", "9", "0.8"],
            answer: 2,
            why: "(1.8)/(0.2) = 9. Standard errors scale with the square root, so they roughly triple.",
          },
          {
            prompt: "Cochrane-Orcutt / Prais-Winsten are methods that:",
            choices: [
              "Delete every other observation.",
              "Transform the regression so the new errors are closer to white, then apply OLS.",
              "Replace Y with its periodogram.",
              "Force the slope to equal one.",
            ],
            answer: 1,
            why: "They are feasible GLS procedures for AR(1) errors: quasi-difference the data using an estimate of phi.",
          },
          {
            prompt: "HAC (Newey-West) standard errors:",
            choices: [
              "Change the OLS coefficients to GLS coefficients.",
              "Keep OLS coefficients and widen (or adjust) the SE to allow residual correlation.",
              "Remove seasonality automatically.",
              "Are only valid for white noise.",
            ],
            answer: 1,
            why: "HAC is a variance estimator. It does not re-estimate the mean the way GLS does.",
          },
        ]}
      />
    </Chapter>
  );
}
