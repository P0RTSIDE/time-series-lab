import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
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
      lede="Today is a mix of recent past plus a new shock. The ACF fades. The PACF stops."
    >
      <Takeaway>
        PACF cutoff tells you the order. ACF length tells you how sticky the
        memory is.
      </Takeaway>

      <section className="prose">
        <h2>AR(1) in one screen</h2>
        <Formula
          expr="Y_t = \phi Y_{t-1} + e_t"
          plain="Need |phi| under 1 or it will not stay put. ACF is phi to the power |h|."
        />
        <Compare
          leftTitle="phi positive"
          left="Long runs above and below the mean."
          rightTitle="phi negative"
          right="The series flip-flops. Near 1, it starts to wander like a random walk."
        />
        <h2>More lags, same idea</h2>
        <Formula
          expr="Y_t=\phi_1 Y_{t-1}+\cdots+\phi_p Y_{t-p}+e_t"
          plain="AR(2) checklist: |phi2| < 1, phi1+phi2 < 1, and phi2-phi1 < 1."
        />
        <p>
          PACF is partial autocorrelation. At lag 3 it is the leftover
          association between today and three steps ago after you have already
          accounted for lags 1 and 2. That is why an AR(p) PACF cuts off: once
          you include the true lags, later bars have nothing extra to say. The
          ACF still tails off, because those later lags are implied by the
          earlier ones (phi to a power, or a damped wiggle).
        </p>
        <Cards>
          <Card title="ACF">
            Tails off. Length of the fade is how sticky the memory is.
          </Card>
          <Card title="PACF">
            Extra correlation after earlier lags are removed. Near zero after p.
          </Card>
        </Cards>
      </section>

      <Callout title="If phi sits on 1" tone="warn">
        Differencing or a random-walk-with-drift story first. Do not trust level
        forecasts from an AR that is barely holding on.
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

      <TryThis
        items={[
          "p = 1, slide phi1 from 0.2 to 0.9. ACF stretches. PACF stays a lag-1 spike.",
          "p = 2 with a negative phi2. ACF can wiggle. PACF should go quiet after 2.",
        ]}
      />

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
