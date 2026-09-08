import { useMemo, useState } from "react";

export type LineSeries = {
  values: number[];
  color?: string;
  label?: string;
  dashed?: boolean;
  width?: number;
};

type Band = { lo: number[]; hi: number[]; color?: string };

function extent(series: LineSeries[], bands?: Band[]): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const s of series) {
    for (const v of s.values) {
      if (Number.isFinite(v)) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }
  }
  if (bands) {
    for (const b of bands) {
      for (const v of b.lo) if (Number.isFinite(v)) lo = Math.min(lo, v);
      for (const v of b.hi) if (Number.isFinite(v)) hi = Math.max(hi, v);
    }
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [-1, 1];
  if (lo === hi) return [lo - 1, hi + 1];
  const pad = (hi - lo) * 0.1;
  return [lo - pad, hi + pad];
}

function pathFrom(values: number[], x: (i: number) => number, y: (v: number) => number): string {
  let d = "";
  let drawing = false;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) {
      drawing = false;
      continue;
    }
    d += drawing ? ` L ${x(i)} ${y(v)}` : `M ${x(i)} ${y(v)}`;
    drawing = true;
  }
  return d;
}

export function LineChart({
  series,
  bands,
  height = 230,
  xLabel,
  yLabel,
  forecastFrom,
  xOffset = 0,
  formatIndex,
}: {
  series: LineSeries[];
  bands?: Band[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  forecastFrom?: number;
  xOffset?: number;
  formatIndex?: (i: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const n = Math.max(1, ...series.map((s) => s.values.length), ...(bands ?? []).map((b) => b.hi.length));
  const [ymin, ymax] = useMemo(() => extent(series, bands), [series, bands]);
  const W = 720;
  const H = height;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = xLabel ? 36 : 28;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const x = (i: number) => padL + (i / Math.max(n - 1, 1)) * iw;
  const y = (v: number) => padT + ((ymax - v) / (ymax - ymin)) * ih;
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => ymin + ((ymax - ymin) * i) / ticks);

  return (
    <div className="chart-wrap">
      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - padL) / iw) * (n - 1));
          if (i >= 0 && i < n) setHover(i);
        }}
      >
        <rect x={0} y={0} width={W} height={H} className="chart-bg" rx="10" />
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={padL - 8} y={y(t) + 3} className="chart-tick" textAnchor="end">
              {Math.abs(t) >= 100 ? t.toFixed(0) : t.toFixed(1)}
            </text>
          </g>
        ))}
        {forecastFrom != null && forecastFrom < n && (
          <rect
            x={x(forecastFrom)}
            y={padT}
            width={x(n - 1) - x(forecastFrom)}
            height={ih}
            className="chart-forecast"
          />
        )}
        {bands?.map((b, bi) => {
          let d = "";
          for (let i = 0; i < b.hi.length; i++) {
            if (!Number.isFinite(b.hi[i])) continue;
            d += `${i === 0 ? "M" : "L"} ${x(i)} ${y(b.hi[i])} `;
          }
          for (let i = b.lo.length - 1; i >= 0; i--) {
            if (!Number.isFinite(b.lo[i])) continue;
            d += `L ${x(i)} ${y(b.lo[i])} `;
          }
          return <path key={bi} d={d} fill={b.color ?? "rgba(126,224,198,0.16)"} stroke="none" />;
        })}
        {series.map((s, si) => (
          <path
            key={si}
            d={pathFrom(s.values, x, y)}
            fill="none"
            stroke={s.color ?? (si === 0 ? "#7ee0c6" : si === 1 ? "#f0b45a" : "#8ab4f8")}
            strokeWidth={s.width ?? 1.7}
            strokeDasharray={s.dashed ? "5 4" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} className="chart-hover" />
            {series.map((s, si) =>
              Number.isFinite(s.values[hover]) ? (
                <circle
                  key={si}
                  cx={x(hover)}
                  cy={y(s.values[hover])}
                  r={3.2}
                  fill={s.color ?? (si === 0 ? "#7ee0c6" : si === 1 ? "#f0b45a" : "#8ab4f8")}
                />
              ) : null,
            )}
          </g>
        )}
        {yLabel && (
          <text
            transform={`translate(14 ${padT + ih / 2}) rotate(-90)`}
            className="chart-axis-label"
            textAnchor="middle"
          >
            {yLabel}
          </text>
        )}
        {xLabel && (
          <text x={padL + iw / 2} y={H - 8} className="chart-axis-label" textAnchor="middle">
            {xLabel}
          </text>
        )}
      </svg>
      <div className="chart-legend">
        {series.map((s, i) =>
          s.label ? (
            <span key={i} className="legend-item">
              <i
                style={{
                  background: s.color ?? (i === 0 ? "#7ee0c6" : i === 1 ? "#f0b45a" : "#8ab4f8"),
                }}
              />
              {s.label}
            </span>
          ) : null,
        )}
        {hover != null && (
          <span className="legend-hover">
            {formatIndex ? formatIndex(hover) : `t = ${hover + xOffset}`}
            {series.map((s, i) =>
              Number.isFinite(s.values[hover])
                ? `  ${s.label ?? i}: ${s.values[hover].toFixed(2)}`
                : "",
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export function StemChart({
  values,
  height = 200,
  bands,
  xStart = 0,
  yLabel,
  xLabel = "Lag",
  color = "#7ee0c6",
}: {
  values: number[];
  height?: number;
  bands?: number;
  xStart?: number;
  yLabel?: string;
  xLabel?: string;
  color?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const n = values.length;
  const max = Math.max(0.2, ...values.map((v) => Math.abs(v)), bands ?? 0);
  const W = 720;
  const H = height;
  const padL = 48;
  const padR = 16;
  const padT = 14;
  const padB = 32;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const x = (i: number) => padL + ((i + 0.5) / n) * iw;
  const y0 = padT + ih / 2;
  const y = (v: number) => y0 - (v / max) * (ih / 2);

  return (
    <div className="chart-wrap">
      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.floor(((px - padL) / iw) * n);
          if (i >= 0 && i < n) setHover(i);
        }}
      >
        <rect x={0} y={0} width={W} height={H} className="chart-bg" rx="10" />
        <line x1={padL} x2={W - padR} y1={y0} y2={y0} className="chart-axis" />
        {bands != null && (
          <>
            <line x1={padL} x2={W - padR} y1={y(bands)} y2={y(bands)} className="chart-band" />
            <line x1={padL} x2={W - padR} y1={y(-bands)} y2={y(-bands)} className="chart-band" />
          </>
        )}
        {values.map((v, i) => (
          <g key={i} opacity={hover == null || hover === i ? 1 : 0.35}>
            <line
              x1={x(i)}
              x2={x(i)}
              y1={y0}
              y2={y(v)}
              stroke={color}
              strokeWidth={hover === i ? 2.4 : 1.6}
            />
            <circle cx={x(i)} cy={y(v)} r={hover === i ? 3.4 : 2.4} fill={color} />
          </g>
        ))}
        <text x={padL - 8} y={y(max) + 3} className="chart-tick" textAnchor="end">
          {max.toFixed(1)}
        </text>
        <text x={padL - 8} y={y(-max) + 3} className="chart-tick" textAnchor="end">
          {(-max).toFixed(1)}
        </text>
        {yLabel && (
          <text
            transform={`translate(14 ${padT + ih / 2}) rotate(-90)`}
            className="chart-axis-label"
            textAnchor="middle"
          >
            {yLabel}
          </text>
        )}
        <text x={padL + iw / 2} y={H - 8} className="chart-axis-label" textAnchor="middle">
          {xLabel}
        </text>
      </svg>
      <div className="chart-legend">
        {hover != null && (
          <span className="legend-hover">
            {xLabel} {hover + xStart}: {values[hover].toFixed(3)}
          </span>
        )}
      </div>
    </div>
  );
}

export function SpectrumChart({
  freq,
  spec,
  overlay,
  height = 220,
  yLabel = "Power",
}: {
  freq: number[];
  spec: number[];
  overlay?: { freq: number[]; spec: number[]; label?: string; color?: string };
  height?: number;
  yLabel?: string;
}) {
  return (
    <LineChart
      height={height}
      xLabel="Frequency (cycles per observation)"
      yLabel={yLabel}
      formatIndex={(i) => `f = ${freq[i]?.toFixed(3) ?? i}`}
      series={[
        { values: spec, label: "Periodogram", color: "#f0b45a" },
        ...(overlay
          ? [{ values: overlay.spec, label: overlay.label ?? "Spectrum", color: overlay.color ?? "#7ee0c6", dashed: true }]
          : []),
      ]}
    />
  );
}
