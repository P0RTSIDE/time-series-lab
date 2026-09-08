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
      lede="The clock is part of the data. Today is tied to yesterday, and one series can lead another."
    >
      <Takeaway>
        Shuffle a spreadsheet of people and the story holds. Shuffle rainfall by
        month and the story dies.
      </Takeaway>

      <section className="prose">
        <h2>Two kinds of relationship</h2>
        <Cards>
          <Card title="Autocorrelation">
            The series vs its own past. High yesterday, high today.
          </Card>
          <Card title="Cross-correlation">
            One series vs another, with a delay. Heat follows cold snaps.
          </Card>
        </Cards>
        <Formula
          expr="\rho_X(h)=\mathrm{Corr}(X_t, X_{t+h})"
          plain="How much X lines up with itself h steps later."
        />
        <Formula
          expr="\rho_{XY}(h)=\mathrm{Corr}(X_t, Y_{t+h})"
          plain="Positive h: Y follows X. Negative h: X follows Y."
        />
        <h2>A shared climb is not a link</h2>
        <Compare
          leftTitle="Looks related"
          left="Two series both drift up. A scatter of Y vs X looks tight."
          rightTitle="Often fake"
          right="The clock drove both. Remove the trend, or look at changes, before you believe it."
        />
      </section>

      <Callout title="Habit" tone="tip">
        Plot against time first. A correlation number with no time plot is easy
        to misread.
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

      <TryThis
        items={[
          "Turn trend up and the lag link down. Both climb, but the CCF smears.",
          "Turn trend down and the lag link up. A spike appears near your delay.",
          "That spike is a link through time, not just a shared climb.",
        ]}
      />

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
