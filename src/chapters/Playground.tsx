import { useMemo, useState } from "react";
import { LineChart, StemChart, SpectrumChart } from "../components/Charts";
import { Chapter, Lab, Slider, Stat } from "../components/UI";
import {
  acf,
  addTrendSeason,
  formatNum,
  mulberry32,
  pacf,
  periodogram,
  simulateARMA,
  smoothPeriodogram,
  std,
  yuleWalker,
} from "../lib/ts";

export function Playground() {
  const [seed, setSeed] = useState(1);
  const [phi, setPhi] = useState(0.5);
  const [theta, setTheta] = useState(0.3);
  const [slope, setSlope] = useState(0);
  const [amp, setAmp] = useState(0);
  const [period, setPeriod] = useState(12);
  const [smooth, setSmooth] = useState(2);

  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const n = 256;
    const core = simulateARMA([phi], [theta], n, 1, rng);
    const y = addTrendSeason(core, 0, slope, amp, period);
    const r = acf(y, 20);
    const pi = pacf(y, 12);
    const pg = periodogram(y);
    const sm = smoothPeriodogram(pg.spec, smooth);
    const yw = yuleWalker(y, 1);
    return { y, r, pi, pg, sm, yw, n, s: std(y) };
  }, [seed, phi, theta, slope, amp, period, smooth]);

  return (
    <Chapter
      kicker="Sandbox"
      title="Playground"
      lede="Mix an ARMA core with a line and a seasonal wave. Read the time plot, the correlogram, and the periodogram together. This is the diagnostic habit the rest of the course is training."
    >
      <Lab
        title="Compose a series"
        controls={
          <>
            <Slider
              label="AR phi"
              value={phi}
              min={-0.9}
              max={0.9}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setPhi}
            />
            <Slider
              label="MA theta"
              value={theta}
              min={-0.9}
              max={0.9}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setTheta}
            />
            <Slider
              label="Trend slope"
              value={slope}
              min={-0.03}
              max={0.06}
              step={0.005}
              format={(v) => v.toFixed(3)}
              onChange={setSlope}
            />
            <Slider
              label="Seasonal amplitude"
              value={amp}
              min={0}
              max={4}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setAmp}
            />
            <Slider label="Seasonal period" value={period} min={4} max={24} step={1} onChange={setPeriod} />
            <Slider label="Spectrum smooth" value={smooth} min={0} max={8} step={1} onChange={setSmooth} />
            <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
              Draw a new sample
            </button>
            <div className="stat-row">
              <Stat label="Sample SD" value={formatNum(data.s)} />
              <Stat label="Yule-Walker phi" value={formatNum(data.yw[0])} />
              <Stat label="ACF(1)" value={formatNum(data.r[1])} />
            </div>
          </>
        }
      >
        <LineChart series={[{ values: data.y, label: "Constructed series" }]} xLabel="Time" />
        <div className="two-col">
          <StemChart values={data.r} yLabel="ACF" bands={1.96 / Math.sqrt(data.n)} />
          <StemChart
            values={data.pi}
            yLabel="PACF"
            bands={1.96 / Math.sqrt(data.n)}
            color="#f0b45a"
          />
        </div>
        <SpectrumChart freq={data.pg.freq} spec={data.sm} />
      </Lab>
    </Chapter>
  );
}
