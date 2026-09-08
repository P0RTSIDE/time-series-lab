import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import { M } from "../components/MathTex";
import { Callout, Chapter, Lab, Quiz, Slider, Stat } from "../components/UI";
import { acf, formatNum, mulberry32, pacf, simulateAR, yuleWalker } from "../lib/ts";

export function AR() {
  const [seed, setSeed] = useState(19);
  const [p, setP] = useState(1);
  const [phi1, setPhi1] = useState(0.7);
  const [phi2, setPhi2] = useState(-0.4);
  const [sigma, setSigma] = useState(1);

  const phi = useMemo(() => {
    if (p === 1) return [phi1];
    return [phi1, phi2];
  }, [p, phi1, phi2]);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 240;
    const y = simulateAR(phi, n, sigma, rng);
    const r = acf(y, 20);
    const pi = pacf(y, 12);
    const yw = yuleWalker(y, p);
    return { y, r, pi, yw, n };
  }, [seed, phi, sigma, p]);

  const stationary =
    p === 1
      ? Math.abs(phi1) < 1
      : Math.abs(phi2) < 1 && Math.abs(phi1) < 1 - phi2;

  return (
    <Chapter
      kicker="Chapter 04"
      title="Autoregressive models"
      lede="An autoregression says the present is a linear function of recent past values, plus a fresh shock. The ACF tails off. The PACF cuts off."
    >
      <section className="prose">
        <h2>AR(1), the workhorse</h2>
        <p>
          The order-1 model is
        </p>
        <M block expr="Y_t = \phi Y_{t-1} + e_t," />
        <p>
          with <M expr="e_t" /> white noise. Stationarity needs <M expr="|\phi|<1" />.
          Then the mean is zero (or a constant if you add an intercept), the
          variance is <M expr="\sigma_e^2/(1-\phi^2)" />, and the ACF is a geometric
          decay:
        </p>
        <M block expr="\rho(h)=\phi^{|h|}." />
        <p>
          Positive <M expr="\phi" /> gives long runs above and below the mean.
          Negative <M expr="\phi" /> makes the series flip-flop. As{" "}
          <M expr="\phi" /> approaches 1, the series starts to look like a random
          walk: wander, no pull home.
        </p>
        <h2>AR(p) and the characteristic polynomial</h2>
        <p>
          Higher order means more lags:
        </p>
        <M block expr="Y_t=\phi_1 Y_{t-1}+\cdots+\phi_p Y_{t-p}+e_t." />
        <p>
          Stationarity is about the roots of{" "}
          <M expr="1-\phi_1 z-\cdots-\phi_p z^p=0" /> lying outside the unit
          circle. For AR(2) a practical checklist is{" "}
          <M expr="|\phi_2|<1" />, <M expr="\phi_1+\phi_2<1" />, and{" "}
          <M expr="\phi_2-\phi_1<1" />.
        </p>
        <h2>Identification with ACF and PACF</h2>
        <p>
          The partial autocorrelation at lag <M expr="k" /> is the extra
          correlation at that lag after you have already accounted for lags 1
          through <M expr="k-1" />. For a true AR(<M expr="p" />):
        </p>
        <ul>
          <li>The ACF tails off (exponentially, or in a damped oscillation).</li>
          <li>The PACF is near zero after lag <M expr="p" />.</li>
        </ul>
        <p>
          That cutoff is why people glance at a PACF to guess <M expr="p" />.
          Yule-Walker equations turn the sample ACF into coefficient estimates.
          Least squares on lagged values is a close alternative.
        </p>
      </section>

      <Callout title="Unit root warning" tone="warn">
        If the fitted phi sits on the edge of 1, think about differencing or a
        random-walk-with-drift story before you trust AR forecasts in levels.
      </Callout>

      <Lab
        title="Watch ACF tail and PACF cutoff"
        controls={
          <>
            <Slider label="Order p" value={p} min={1} max={2} step={1} onChange={setP} />
            <Slider
              label="phi1"
              value={phi1}
              min={-1.2}
              max={1.2}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setPhi1}
            />
            {p === 2 && (
              <Slider
                label="phi2"
                value={phi2}
                min={-1.1}
                max={0.95}
                step={0.05}
                format={(v) => v.toFixed(2)}
                onChange={setPhi2}
              />
            )}
            <Slider
              label="Shock scale"
              value={sigma}
              min={0.4}
              max={2}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setSigma}
            />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <div className="stat-row">
              <Stat label="Stationary?" value={stationary ? "Yes" : "No (or barely)"} />
              <Stat
                label="Yule-Walker"
                value={data.yw.map((v) => formatNum(v)).join(", ")}
              />
            </div>
          </>
        }
      >
        <LineChart series={[{ values: data.y, label: "AR series" }]} xLabel="Time" />
        <div className="two-col">
          <StemChart values={data.r} yLabel="ACF" bands={1.96 / Math.sqrt(data.n)} />
          <StemChart
            values={data.pi}
            yLabel="PACF"
            bands={1.96 / Math.sqrt(data.n)}
            color="#f0b45a"
          />
        </div>
      </Lab>

      <section className="prose">
        <p>
          Keep p = 1 and slide phi1 from 0.2 to 0.9. The ACF stretches farther.
          The PACF stays dominated by lag 1. Switch to p = 2 with phi2 negative
          enough to create a hump. The ACF can oscillate. The PACF should still
          quiet down after lag 2.
        </p>
      </section>

      <Quiz
        id="ar"
        questions={[
          {
            prompt: "For a stationary AR(1), the ACF equals:",
            choices: ["phi at every lag", "phi to the power |h|", "zero after lag 1", "1/(1-phi^2) at every lag"],
            answer: 1,
            why: "rho(h) = phi^{|h|}. The variance formula sigma^2/(1-phi^2) is not the ACF.",
          },
          {
            prompt: "A telltale PACF pattern for AR(p) is:",
            choices: [
              "PACF tails off, ACF cuts off at lag p.",
              "Both cut off at lag 1.",
              "PACF cuts off after lag p, ACF tails off.",
              "PACF is identically 1.",
            ],
            answer: 2,
            why: "That pair of shapes is the classical identification rule for autoregressions.",
          },
          {
            prompt: "Stationarity of AR(1) requires:",
            choices: ["phi greater than 0", "|phi| less than 1", "phi equal to 1", "A seasonal period of 12"],
            answer: 1,
            why: "Roots outside the unit circle reduce to |phi| < 1 in the AR(1) case. phi = 1 is a random walk, not a stationary AR.",
          },
          {
            prompt: "Partial autocorrelation at lag 3 is:",
            choices: [
              "Corr(Y_t, Y_{t-3}) with no adjustment.",
              "The extra association at lag 3 after lags 1 and 2 are accounted for.",
              "The periodogram at frequency 3.",
              "Always equal to phi1.",
            ],
            answer: 1,
            why: "PACF is a sequential, residual correlation. That is why it cuts off once you have included the true order.",
          },
        ]}
      />
    </Chapter>
  );
}
