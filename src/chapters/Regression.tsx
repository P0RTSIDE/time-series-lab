import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import { M } from "../components/MathTex";
import { Callout, Chapter, Lab, Quiz, Slider, Stat } from "../components/UI";
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
      lede="A linear mean can still be the right story when the residuals remember the past. The coefficient is often fine. The usual standard error is not."
    >
      <section className="prose">
        <h2>The model</h2>
        <p>
          Consider
        </p>
        <M block expr="Y_t=\beta_0+\beta_1 X_t+\varepsilon_t,\qquad \varepsilon_t=\phi\varepsilon_{t-1}+a_t." />
        <p>
          The mean of <M expr="Y" /> given <M expr="X" /> is still a line. Ordinary
          least squares (OLS) is typically consistent for <M expr="\beta_1" /> when{" "}
          <M expr="X" /> is well behaved and <M expr="|\phi|<1" />. What fails is
          the textbook variance formula, which pretends neighboring residuals
          carry no shared information.
        </p>
        <p>
          Under AR(1) errors and slowly changing <M expr="X" />, the variance of
          the slope is inflated by about
        </p>
        <M block expr="\frac{1+\phi}{1-\phi}." />
        <p>
          At <M expr="\phi=0.8" /> that factor is 9. A naive interval can be three
          times too narrow. You will “find” significance that is only leftover
          memory in the errors.
        </p>
        <h2>What people do about it</h2>
        <ul>
          <li>
            <strong>Generalized least squares.</strong> Transform the data so the
            new errors look white (Cochrane-Orcutt and Prais-Winsten are the AR(1)
            versions), then run OLS on the transformed series.
          </li>
          <li>
            <strong>Corrected standard errors.</strong> Keep the OLS coefficients
            and replace the variance estimate with a HAC estimator (Newey-West is
            the common name), which allows residual correlation out to a chosen
            lag.
          </li>
          <li>
            <strong>Model the errors.</strong> Fit the regression and an ARMA
            residual model together. That is a close cousin of the transfer
            function chapter.
          </li>
        </ul>
        <p>
          All three ideas share one diagnosis: the mean model and the dependence
          model are different jobs. Mixing them up produces overconfident science.
        </p>
      </section>

      <Callout title="Effective sample size" tone="warn">
        Persistent errors mean neighboring observations are partly repeats of the
        same surprise. A series of length 200 with high phi can behave like far
        fewer independent points. That is why intervals must widen.
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

      <section className="prose">
        <p>
          The residual ACF is the giveaway. If it is loud and you still quote
          ordinary OLS standard errors, you are reporting a precision you did not
          earn. GLS or HAC errors are the repair, not a different slope religion.
        </p>
      </section>

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
