import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import {
  Callout,
  Card,
  Cards,
  Chapter,
  Formula,
  Lab,
  Quiz,
  Slider,
  Stat,
  Steps,
  Takeaway,
  TryThis,
} from "../components/UI";
import { acf, formatNum, mulberry32, pacf, simulateARMA } from "../lib/ts";

export function ARMA() {
  const [seed, setSeed] = useState(5);
  const [phi, setPhi] = useState(0.55);
  const [theta, setTheta] = useState(0.5);
  const [useAR, setUseAR] = useState(true);
  const [useMA, setUseMA] = useState(true);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 260;
    const phis = useAR ? [phi] : [];
    const thetas = useMA ? [theta] : [];
    const y = simulateARMA(phis, thetas, n, 1, rng);
    return { y, r: acf(y, 18), pi: pacf(y, 12), n, phis, thetas };
  }, [seed, phi, theta, useAR, useMA]);

  const maRho1 = theta / (1 + theta * theta);

  return (
    <Chapter
      kicker="Chapter 05"
      title="Autoregressive moving average models"
      lede="An MA is a short echo of the last shock. Mix it with AR and both plots fade instead of cutting off."
    >
      <Takeaway>
        Pure MA: ACF dies after q. Pure AR: PACF dies after p. Mixed: both linger.
      </Takeaway>

      <section className="prose">
        <h2>A one-echo moving average</h2>
        <Formula
          expr="Y_t = e_t + \theta e_{t-1}"
          plain="Always stationary. ACF is zero after lag 1. Invertible when |theta| is under 1."
        />
        <Formula
          expr="\rho(1)=\frac{\theta}{1+\theta^2}"
          plain="The only nonzero lag. Two thetas can share this number. Invertibility picks one."
        />
        <h2>Mix them: ARMA</h2>
        <Formula
          expr="Y_t=\phi Y_{t-1}+e_t+\theta e_{t-1}"
          plain="AR gives an ACF tail. MA gives a PACF tail. Few parameters, no sharp cutoff."
        />
        <Steps
          items={[
            "Make it look stationary: detrend, difference, destationize season.",
            "Read ACF and PACF. Write down a short list of (p, q).",
            "Fit, then check residual ACF. Leftover bars mean you are short a term.",
            "Keep the simpler model once residuals look white.",
          ]}
        />
        <Cards>
          <Card title="ARIMA">
            Same idea after differencing.
          </Card>
          <Card title="SARIMA">
            Extra factors at lag 12 or 4. Same logic, seasonal clock.
          </Card>
        </Cards>
      </section>

      <Callout title="Cancellation" tone="note">
        phi almost equal to minus theta is nearly white noise. Extra parameters
        that cancel are a costume, not a better model.
      </Callout>

      <Lab
        title="Pure AR, pure MA, and mixed ARMA(1,1)"
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={useAR}
                onChange={(e) => setUseAR(e.target.checked)}
              />
              Include AR(1)
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={useMA}
                onChange={(e) => setUseMA(e.target.checked)}
              />
              Include MA(1)
            </label>
            <Slider
              label="phi"
              value={phi}
              min={-0.9}
              max={0.9}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setPhi}
            />
            <Slider
              label="theta"
              value={theta}
              min={-0.9}
              max={0.9}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setTheta}
            />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <div className="stat-row">
              <Stat label="Model" value={`ARMA(${useAR ? 1 : 0},${useMA ? 1 : 0})`} />
              <Stat label="MA theory rho(1)" value={formatNum(maRho1)} />
              <Stat label="Sample ACF(1)" value={formatNum(data.r[1])} />
            </div>
          </>
        }
      >
        <LineChart series={[{ values: data.y, label: "Series" }]} xLabel="Time" />
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
          "MA only: ACF dies after 1, PACF tails.",
          "AR only: the reverse.",
          "Both on: both plots linger. Set phi near minus theta: it looks like noise.",
        ]}
      />

      <Quiz
        id="arma"
        questions={[
          {
            prompt: "An MA(1) series is always:",
            choices: [
              "Nonstationary.",
              "Stationary, with ACF zero after lag 1.",
              "Invertible, no matter how large theta is.",
              "The same as an AR(1).",
            ],
            answer: 1,
            why: "Finite MA models are stationary. Invertibility is the extra |theta| < 1 condition. The ACF cutoff is the identification mark.",
          },
          {
            prompt: "For a mixed ARMA(1,1) you typically see:",
            choices: [
              "ACF and PACF both tailing off.",
              "Both cutting off at lag 1.",
              "A flat periodogram only.",
              "PACF spikes at every seasonal lag and nowhere else.",
            ],
            answer: 0,
            why: "Each side of the model prevents a sharp cutoff on the other plot.",
          },
          {
            prompt: "Invertibility of MA(1) is important because:",
            choices: [
              "Otherwise the mean does not exist.",
              "Otherwise two different thetas can share a correlation structure, and shocks are hard to recover from Y.",
              "It forces phi to be zero.",
              "It removes the need for a periodogram.",
            ],
            answer: 1,
            why: "The pair theta and 1/theta can produce the same ACF. Invertibility picks the version that writes e_t in terms of past Y.",
          },
          {
            prompt: "After you estimate an ARMA, the residual ACF should look like:",
            choices: [
              "The original ACF.",
              "White noise, aside from chance spikes.",
              "A linear trend.",
              "A single spike at the seasonal period only, by design.",
            ],
            answer: 1,
            why: "The model is supposed to have absorbed the linear dependence. Leftover residual correlation means the specification is still short.",
          },
        ]}
      />
    </Chapter>
  );
}
