import { useMemo, useState } from "react";
import { LineChart } from "../components/Charts";
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
  Takeaway,
  TryThis,
} from "../components/UI";
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
      lede="The best linear guess uses the same memory you already met. The band should grow as you look farther ahead."
    >
      <Takeaway>
        Far enough ahead, you mostly know the mean. An interval that stays
        skinny is decoration.
      </Takeaway>

      <section className="prose">
        <h2>Fade toward the center</h2>
        <Formula
          expr="\hat Y_{t+h|t}=\phi^h Y_t"
          plain="Zero-mean AR(1). Each extra step multiplies by phi. For AR(p), recurse and plug forecasts into later lags."
        />
        <Formula
          expr="\mathrm{Var}(Y_{t+h}-\hat Y_{t+h|t})=\sigma_e^2\frac{1-\phi^{2h}}{1-\phi^2}"
          plain="One-step error is the shock. Multi-step errors pile up. Variance climbs toward the series variance."
        />
        <Cards>
          <Card title="phi near 1">
            Slow fade. Wide band for a long time. Weak pull home.
          </Card>
          <Card title="phi near 0">
            Confess ignorance after a few steps. Just quote the mean.
          </Card>
        </Cards>
      </section>

      <Callout title="If this AR is true" tone="warn">
        Bands ignore uncertainty about phi, about the order, and about a sudden
        shift. Real coverage is usually thinner than the picture.
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

      <TryThis
        items={[
          "Move the origin. The forecast starts at the last point and slides toward zero.",
          "Raise phi. The slide slows and the band stays wide longer.",
          "Gold is unused future. Count how often it sits inside the band.",
        ]}
      />

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
