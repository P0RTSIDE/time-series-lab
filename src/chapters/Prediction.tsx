import { useMemo, useState } from "react";
import { LineChart } from "../components/Charts";
import { M } from "../components/MathTex";
import { Callout, Chapter, Lab, Quiz, Slider, Stat } from "../components/UI";
import {
  formatNum,
  forecastAR,
  mulberry32,
  residualSigma,
  simulateAR,
  yuleWalker,
} from "../lib/ts";

export function Prediction() {
  const [seed, setSeed] = useState(14);
  const [phi, setPhi] = useState(0.75);
  const [horizon, setHorizon] = useState(18);
  const [origin, setOrigin] = useState(170);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 200;
    const y = simulateAR([phi], n, 1, rng);
    const o = Math.min(origin, n - 1);
    const past = y.slice(0, o);
    const future = y.slice(o);
    const yw = yuleWalker(past, 1);
    const sig = residualSigma(past, yw);
    const fc = forecastAR(past, yw, horizon, sig);
    const shown = past.concat(fc.point);
    const truth = past.concat(future.slice(0, horizon));
    const lo = new Array(past.length).fill(Number.NaN).concat(fc.lo);
    const hi = new Array(past.length).fill(Number.NaN).concat(fc.hi);
    const cover = fc.point.filter((_, i) => {
      const t = future[i];
      return t != null && t >= fc.lo[i] && t <= fc.hi[i];
    }).length;
    return { shown, truth, lo, hi, yw, sig, o, cover, h: Math.min(horizon, future.length) };
  }, [seed, phi, horizon, origin]);

  return (
    <Chapter
      kicker="Chapter 08"
      title="Prediction of time series"
      lede="A forecast is a guess of the future given the past. The best linear guess uses the same dependence you already met. The interval around it should grow as you look farther ahead."
    >
      <section className="prose">
        <h2>The best linear predictor</h2>
        <p>
          Write <M expr="\hat Y_{t+h|t}" /> for the forecast of time{" "}
          <M expr="t+h" /> made at time <M expr="t" />. Among linear functions of
          the observed past, the minimizer of mean squared error is the
          projection of <M expr="Y_{t+h}" /> onto that past. For a zero-mean
          stationary AR(1),
        </p>
        <M block expr="\hat Y_{t+h|t}=\phi^h Y_t." />
        <p>
          The forecast fades toward the mean. For a general AR(<M expr="p" />),
          iterate the recursion, replacing unknown future values by forecasts
          already made (the chain rule of linear prediction).
        </p>
        <h2>How uncertainty grows</h2>
        <p>
          One-step errors are the shocks <M expr="e_{t+1}" /> if the model is
          right. Multi-step errors pile those shocks with weights called psi
          weights (the MA(\infty) coefficients). For AR(1),
        </p>
        <M
          block
          expr="\mathrm{Var}(Y_{t+h}-\hat Y_{t+h|t})=\sigma_e^2\frac{1-\phi^{2h}}{1-\phi^2}."
        />
        <p>
          As <M expr="h" /> grows, the variance climbs toward the unconditional
          variance of the series. A 95% interval that ignores that climb is
          decoration, not a forecast.
        </p>
        <p>
          If <M expr="\phi" /> is near 1, the fade is slow and the interval stays
          wide for a long time: you have not seen a strong pull back to the
          center. If <M expr="\phi" /> is near 0, you should confess ignorance
          after a few steps and just quote the mean.
        </p>
        <h2>What this lab does</h2>
        <p>
          A hidden AR(1) is generated. You choose an origin, estimate phi from
          the past only (Yule-Walker), then forecast. The shaded band is a
          nominal 95% interval from the psi-weight formula. The gold line is the
          unused future, so you can see calibration with your own eyes.
        </p>
      </section>

      <Callout title="Intervals assume the model" tone="warn">
        These bands do not include uncertainty about phi, about the order, or
        about a sudden level shift. Real-world coverage is usually thinner than
        the picture suggests. Treat them as “if this AR is true.”
      </Callout>

      <Lab
        title="AR forecasts from a chosen origin"
        controls={
          <>
            <Slider
              label="True phi"
              value={phi}
              min={0.1}
              max={0.95}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setPhi}
            />
            <Slider
              label="Forecast origin"
              value={origin}
              min={80}
              max={199}
              step={1}
              onChange={setOrigin}
            />
            <Slider
              label="Horizon"
              value={horizon}
              min={4}
              max={40}
              step={1}
              onChange={setHorizon}
            />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <div className="stat-row">
              <Stat label="Estimated phi" value={formatNum(data.yw[0])} />
              <Stat label="Residual sigma" value={formatNum(data.sig)} />
              <Stat
                label="Future points inside band"
                value={`${data.cover} / ${data.h}`}
              />
            </div>
          </>
        }
      >
        <LineChart
          series={[
            { values: data.truth, label: "Held-out future", color: "#f0b45a" },
            { values: data.shown, label: "Past and forecast", color: "#7ee0c6" },
          ]}
          bands={[{ lo: data.lo, hi: data.hi }]}
          forecastFrom={data.o}
          xLabel="Time"
        />
      </Lab>

      <section className="prose">
        <p>
          Move the origin. The forecast always starts at the last observed level
          and slides toward zero (this lab uses a zero-mean AR). Raise phi and
          the slide is slower, the band wider for longer. That is the whole
          geometry of linear prediction for a stationary autoregression.
        </p>
      </section>

      <Quiz
        id="prediction"
        questions={[
          {
            prompt: "For a stationary zero-mean AR(1), the h-step forecast is:",
            choices: ["Always zero", "phi^h times the last observation", "The last observation, for every h", "The periodogram peak"],
            answer: 1,
            why: "Each extra step multiplies by phi, so the predictor geometrically forgets the present.",
          },
          {
            prompt: "As the horizon grows, a correct AR interval should:",
            choices: [
              "Stay the same width as the one-step interval.",
              "Shrink to a point.",
              "Widen toward the width implied by the unconditional variance.",
              "Become a seasonal dummy.",
            ],
            answer: 2,
            why: "Far ahead, you know little beyond the stationary distribution of the series.",
          },
          {
            prompt: "The one-step prediction error, if the AR model is correct, is:",
            choices: [
              "The seasonal component.",
              "The innovation, the new shock.",
              "Always larger than the 10-step error.",
              "Independent of sigma.",
            ],
            answer: 1,
            why: "That is why residual sigma estimates the one-step error scale.",
          },
          {
            prompt: "Why might a plotted 95% band miss more than 5% of future points?",
            choices: [
              "Because phi was estimated, the order may be wrong, and the world can shift.",
              "Because forecasts are exactly the mean for all h.",
              "Because the ACF is always zero.",
              "Because linear filters have gain 1.",
            ],
            answer: 0,
            why: "Parameter uncertainty and misspecification are extra sources of error that the psi-weight formula ignores.",
          },
        ]}
      />
    </Chapter>
  );
}
