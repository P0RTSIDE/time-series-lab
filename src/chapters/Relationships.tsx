import { useMemo, useState } from "react";
import { LineChart, StemChart } from "../components/Charts";
import { M } from "../components/MathTex";
import { Callout, Chapter, Lab, Quiz, Slider, Stat } from "../components/UI";
import {
  acf,
  addTrendSeason,
  ccf,
  formatNum,
  mulberry32,
  simulateAR,
} from "../lib/ts";

export function Relationships() {
  const [seed, setSeed] = useState(7);
  const [sharedTrend, setSharedTrend] = useState(0.04);
  const [lagLink, setLagLink] = useState(0.7);
  const [delay, setDelay] = useState(3);
  const [noise, setNoise] = useState(0.6);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 180;
    const xCore = simulateAR([0.4], n, 1, rng);
    const x = addTrendSeason(xCore, 0, sharedTrend, 0, 12);
    const y = x.map((_, t) => {
      const lagged = t >= delay ? x[t - delay] : 0;
      return sharedTrend * t * 0.85 + lagLink * lagged + noise * (rng() * 2 - 1);
    });
    const rhoX = acf(x, 16);
    const cross = ccf(x, y, 16);
    return { x, y, rhoX, cross };
  }, [seed, sharedTrend, lagLink, delay, noise]);

  return (
    <Chapter
      kicker="Chapter 01"
      title="Time series relationships"
      lede="A time series is a sequence recorded in order. The interesting part is not the average level. It is how today is tied to yesterday, and how one series is tied to another."
    >
      <section className="prose">
        <h2>Order is information</h2>
        <p>
          In a cross section, shuffling the rows should not change the story. In a
          time series, shuffling destroys the story. Rainfall in April belongs next
          to rainfall in May. A stock price at 10:01 belongs next to 10:02. The
          clock (or the calendar) is part of the data.
        </p>
        <p>
          Two basic relationships show up everywhere:
        </p>
        <ul>
          <li>
            <strong>Autocorrelation.</strong> The series is related to its own
            lagged values. If yesterday was high, today tends to be high.
          </li>
          <li>
            <strong>Cross-correlation.</strong> One series leads or lags another.
            Heating demand today may follow temperature two days ago.
          </li>
        </ul>
        <p>
          Write a pair of series as <M expr="\{X_t\}" /> and <M expr="\{Y_t\}" />.
          The lag-<M expr="h" /> autocorrelation of <M expr="X" /> is
        </p>
        <M block expr="\rho_X(h)=\mathrm{Corr}(X_t, X_{t+h})." />
        <p>
          The cross-correlation is
        </p>
        <M block expr="\rho_{XY}(h)=\mathrm{Corr}(X_t, Y_{t+h})." />
        <p>
          A peak at a positive <M expr="h" /> in <M expr="\rho_{XY}(h)" /> means{" "}
          <M expr="Y" /> moves with a delayed copy of <M expr="X" />. A peak at a
          negative lag means the reverse ordering.
        </p>
        <h2>Shared trends look like relationships</h2>
        <p>
          If two series both wander upward, a scatterplot of <M expr="Y_t" /> against{" "}
          <M expr="X_t" /> can look tight even when neither series causes the
          other. That is a spurious relationship: the clock is driving both. You
          will meet a cleaner version of this warning in the regression chapter.
          For now, remember to ask whether the link survives after you remove
          trend, or after you look at changes rather than levels.
        </p>
      </section>

      <Callout title="A useful habit" tone="tip">
        Always plot the series against time first, then plot lags. A pretty
        correlation number without a time plot is easy to misread.
      </Callout>

      <Lab
        title="Shared trend versus a real lag"
        controls={
          <>
            <Slider
              label="Shared trend slope"
              value={sharedTrend}
              min={0}
              max={0.12}
              step={0.005}
              format={(v) => v.toFixed(3)}
              onChange={setSharedTrend}
            />
            <Slider
              label="Lagged link from X to Y"
              value={lagLink}
              min={0}
              max={1.2}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setLagLink}
            />
            <Slider
              label="Delay (observations)"
              value={delay}
              min={0}
              max={10}
              step={1}
              onChange={setDelay}
            />
            <Slider
              label="Noise in Y"
              value={noise}
              min={0.1}
              max={2}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setNoise}
            />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <div className="stat-row">
              <Stat label="ACF of X at lag 1" value={formatNum(data.rhoX[1])} />
              <Stat
                label="CCF peak lag"
                value={String(
                  data.cross.reduce((best, c) =>
                    Math.abs(c.value) > Math.abs(best.value) ? c : best,
                  ).lag,
                )}
              />
            </div>
          </>
        }
      >
        <LineChart
          series={[
            { values: data.x, label: "X", color: "#7ee0c6" },
            { values: data.y, label: "Y", color: "#f0b45a" },
          ]}
          xLabel="Time"
        />
        <StemChart
          values={data.cross.map((c) => c.value)}
          xStart={-16}
          xLabel="Lag of Y after X"
          yLabel="CCF"
          bands={1.96 / Math.sqrt(180)}
          color="#8ab4f8"
        />
      </Lab>

      <section className="prose">
        <p>
          Turn the shared trend up and the lag link down. Both series climb
          together, but the cross-correlation plot becomes smeared instead of
          peaked. Turn the trend down and the lag link up. A spike appears near
          the delay you chose. That spike is a relationship through time, not
          just a shared climb.
        </p>
      </section>

      <Quiz
        id="relationships"
        questions={[
          {
            prompt: "Why is shuffling a time series usually a bad idea?",
            choices: [
              "It changes the mean of the observations.",
              "It erases the order that carries dependence and seasonality.",
              "It always creates a unit root.",
              "It makes the variance infinite.",
            ],
            answer: 1,
            why: "The mean can stay the same after a shuffle. What disappears is the lag structure: autocorrelation, seasonality, and lead-lag links.",
          },
          {
            prompt: "A large CCF at lag h = 4, with X aligned to Y four steps later, suggests:",
            choices: [
              "Y leads X by four observations.",
              "X and Y are independent.",
              "Y follows X after about four observations.",
              "The series have no trend.",
            ],
            answer: 2,
            why: "Corr(X_t, Y_{t+4}) being large means the later Y lines up with the earlier X, so Y follows X.",
          },
          {
            prompt: "Two series that both have a strong upward trend will often:",
            choices: [
              "Have a near-zero contemporaneous correlation.",
              "Look related in levels even if neither drives the other.",
              "Have a periodogram that is exactly flat.",
              "Be impossible to forecast.",
            ],
            answer: 1,
            why: "A shared clock can induce a spurious level relationship. Always ask whether the link remains after detrending or differencing.",
          },
          {
            prompt: "Autocorrelation at lag 1 is a relationship between:",
            choices: [
              "Two different variables at the same time.",
              "A series and a shuffled copy of itself.",
              "A series and its own past, one step back.",
              "The mean and the variance.",
            ],
            answer: 2,
            why: "rho(1) = Corr(X_t, X_{t-1}). That is serial correlation, the most basic time series relationship.",
          },
        ]}
      />
    </Chapter>
  );
}
