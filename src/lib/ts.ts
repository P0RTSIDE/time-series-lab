export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normal(rng: Rng): number {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function mean(y: number[]): number {
  if (y.length === 0) return 0;
  return y.reduce((s, v) => s + v, 0) / y.length;
}

export function variance(y: number[], sample = true): number {
  if (y.length < 2) return 0;
  const m = mean(y);
  const ss = y.reduce((s, v) => s + (v - m) ** 2, 0);
  return ss / (sample ? y.length - 1 : y.length);
}

export function std(y: number[]): number {
  return Math.sqrt(variance(y));
}

export function whiteNoise(n: number, sigma: number, rng: Rng): number[] {
  return Array.from({ length: n }, () => sigma * normal(rng));
}

export function linspace(n: number, start = 0, step = 1): number[] {
  return Array.from({ length: n }, (_, i) => start + i * step);
}

export function simulateAR(
  phi: number[],
  n: number,
  sigma: number,
  rng: Rng,
  burn = 80,
): number[] {
  const p = phi.length;
  const e = whiteNoise(n + burn, sigma, rng);
  const y = new Array(n + burn).fill(0);
  for (let t = p; t < y.length; t++) {
    let v = e[t];
    for (let i = 0; i < p; i++) v += phi[i] * y[t - 1 - i];
    y[t] = v;
  }
  return y.slice(burn);
}

export function simulateMA(
  theta: number[],
  n: number,
  sigma: number,
  rng: Rng,
  burn = 40,
): number[] {
  const q = theta.length;
  const e = whiteNoise(n + burn + q, sigma, rng);
  const y = new Array(n + burn).fill(0);
  for (let t = 0; t < y.length; t++) {
    let v = e[t + q];
    for (let i = 0; i < q; i++) v += theta[i] * e[t + q - 1 - i];
    y[t] = v;
  }
  return y.slice(burn);
}

export function simulateARMA(
  phi: number[],
  theta: number[],
  n: number,
  sigma: number,
  rng: Rng,
  burn = 100,
): number[] {
  const p = phi.length;
  const q = theta.length;
  const total = n + burn;
  const e = whiteNoise(total + q, sigma, rng);
  const y = new Array(total).fill(0);
  for (let t = 0; t < total; t++) {
    let v = e[t + q];
    for (let i = 0; i < q; i++) v += theta[i] * e[t + q - 1 - i];
    for (let i = 0; i < p; i++) {
      if (t - 1 - i >= 0) v += phi[i] * y[t - 1 - i];
    }
    y[t] = v;
  }
  return y.slice(burn);
}

export function addTrendSeason(
  y: number[],
  intercept: number,
  slope: number,
  seasonalAmp: number,
  period: number,
  seasonalPhase = 0,
): number[] {
  return y.map((v, t) => {
    const trend = intercept + slope * t;
    const seas =
      seasonalAmp * Math.sin((2 * Math.PI * t) / period + seasonalPhase);
    return v + trend + seas;
  });
}

export function acf(y: number[], maxLag: number): number[] {
  const n = y.length;
  const m = mean(y);
  let den = 0;
  for (let t = 0; t < n; t++) den += (y[t] - m) ** 2;
  if (den === 0) return Array.from({ length: maxLag + 1 }, () => 0);
  const out = new Array(maxLag + 1).fill(0);
  for (let h = 0; h <= maxLag; h++) {
    let num = 0;
    for (let t = 0; t < n - h; t++) num += (y[t] - m) * (y[t + h] - m);
    out[h] = num / den;
  }
  return out;
}

export function ccf(x: number[], y: number[], maxLag: number): { lag: number; value: number }[] {
  const n = Math.min(x.length, y.length);
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let sx = 0;
  let sy = 0;
  for (let t = 0; t < n; t++) {
    sx += (x[t] - mx) ** 2;
    sy += (y[t] - my) ** 2;
  }
  const den = Math.sqrt(sx * sy) || 1;
  const out: { lag: number; value: number }[] = [];
  for (let h = -maxLag; h <= maxLag; h++) {
    let num = 0;
    if (h >= 0) {
      for (let t = 0; t < n - h; t++) num += (x[t] - mx) * (y[t + h] - my);
    } else {
      for (let t = 0; t < n + h; t++) num += (x[t - h] - mx) * (y[t] - my);
    }
    out.push({ lag: h, value: num / den });
  }
  return out;
}

export function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let k = 0; k < n; k++) {
    let max = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[max][k])) max = i;
    }
    [M[k], M[max]] = [M[max], M[k]];
    const pivot = M[k][k];
    if (Math.abs(pivot) < 1e-12) return new Array(n).fill(0);
    for (let j = k; j <= n; j++) M[k][j] /= pivot;
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const f = M[i][k];
      for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j];
    }
  }
  return M.map((row) => row[n]);
}

/** Durbin-Levinson PACF from sample ACF. */
export function pacf(y: number[], maxLag: number): number[] {
  const r = acf(y, maxLag);
  const phi: number[] = [1];
  if (maxLag === 0) return phi;
  const pac = new Array(maxLag + 1).fill(0);
  pac[0] = 1;
  const phiPrev: number[] = [];
  for (let k = 1; k <= maxLag; k++) {
    let num = r[k];
    for (let j = 1; j < k; j++) num -= (phiPrev[j - 1] ?? 0) * r[k - j];
    let den = 1;
    for (let j = 1; j < k; j++) den -= (phiPrev[j - 1] ?? 0) * r[j];
    const phikk = den === 0 ? 0 : num / den;
    const phiCurr = new Array(k).fill(0);
    for (let j = 1; j < k; j++) {
      phiCurr[j - 1] = (phiPrev[j - 1] ?? 0) - phikk * (phiPrev[k - j - 1] ?? 0);
    }
    phiCurr[k - 1] = phikk;
    pac[k] = phikk;
    phiPrev.length = 0;
    phiPrev.push(...phiCurr);
  }
  return pac;
}

export function yuleWalker(y: number[], p: number): number[] {
  if (p <= 0) return [];
  const r = acf(y, p);
  const R = Array.from({ length: p }, (_, i) =>
    Array.from({ length: p }, (_, j) => r[Math.abs(i - j)]),
  );
  const rhs = r.slice(1, p + 1);
  return solve(R, rhs);
}

export function olsInterceptSlope(
  x: number[],
  y: number[],
): { b0: number; b1: number; se0: number; se1: number; sigma: number; n: number } {
  const n = Math.min(x.length, y.length);
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += x[i];
    sy += y[i];
    sxx += x[i] * x[i];
    sxy += x[i] * y[i];
  }
  const den = n * sxx - sx * sx;
  const b1 = den === 0 ? 0 : (n * sxy - sx * sy) / den;
  const b0 = (sy - b1 * sx) / n;
  let sse = 0;
  for (let i = 0; i < n; i++) {
    const resid = y[i] - (b0 + b1 * x[i]);
    sse += resid * resid;
  }
  const sigma2 = n > 2 ? sse / (n - 2) : 0;
  const sxxc = sxx - (sx * sx) / n;
  const se1 = sxxc === 0 ? 0 : Math.sqrt(sigma2 / sxxc);
  const se0 = Math.sqrt(sigma2 * (1 / n + (sx / n) ** 2 / (sxxc || 1)));
  return { b0, b1, se0, se1, sigma: Math.sqrt(Math.max(sigma2, 0)), n };
}

export function residuals(x: number[], y: number[], b0: number, b1: number): number[] {
  return y.map((yi, i) => yi - (b0 + b1 * x[i]));
}

/** Inflation of OLS slope variance under AR(1) errors, large-sample approximation. */
export function ar1VarianceInflation(phi: number): number {
  const p = Math.max(-0.99, Math.min(0.99, phi));
  return (1 + p) / (1 - p);
}

export function periodogram(y: number[]): { freq: number[]; spec: number[]; period: number[] } {
  const n = y.length;
  const m = mean(y);
  const half = Math.floor(n / 2);
  const freq: number[] = [];
  const spec: number[] = [];
  const period: number[] = [];
  for (let k = 1; k <= half; k++) {
    let re = 0;
    let im = 0;
    const omega = (2 * Math.PI * k) / n;
    for (let t = 0; t < n; t++) {
      const z = y[t] - m;
      re += z * Math.cos(omega * t);
      im += z * Math.sin(omega * t);
    }
    freq.push(k / n);
    spec.push((re * re + im * im) / n);
    period.push(n / k);
  }
  return { freq, spec, period };
}

export function smoothPeriodogram(spec: number[], halfWidth: number): number[] {
  if (halfWidth <= 0) return spec.slice();
  return spec.map((_, i) => {
    let s = 0;
    let c = 0;
    for (let j = i - halfWidth; j <= i + halfWidth; j++) {
      if (j >= 0 && j < spec.length) {
        s += spec[j];
        c += 1;
      }
    }
    return s / c;
  });
}

export function arSpectrum(phi: number[], sigma: number, freqs: number[]): number[] {
  return freqs.map((f) => {
    const w = 2 * Math.PI * f;
    let re = 1;
    let im = 0;
    for (let j = 0; j < phi.length; j++) {
      const a = (j + 1) * w;
      re -= phi[j] * Math.cos(a);
      im += phi[j] * Math.sin(a);
    }
    const den = re * re + im * im;
    return den === 0 ? 0 : (sigma * sigma) / den;
  });
}

export function maSpectrum(theta: number[], sigma: number, freqs: number[]): number[] {
  return freqs.map((f) => {
    const w = 2 * Math.PI * f;
    let re = 1;
    let im = 0;
    for (let j = 0; j < theta.length; j++) {
      const a = (j + 1) * w;
      re += theta[j] * Math.cos(a);
      im -= theta[j] * Math.sin(a);
    }
    return sigma * sigma * (re * re + im * im);
  });
}

export function convolve(y: number[], weights: number[], center = true): number[] {
  const k = weights.length;
  const off = center ? Math.floor(k / 2) : 0;
  const out = new Array(y.length).fill(Number.NaN);
  for (let t = 0; t < y.length; t++) {
    let s = 0;
    let ok = true;
    for (let j = 0; j < k; j++) {
      const i = t - off + j;
      if (i < 0 || i >= y.length) {
        ok = false;
        break;
      }
      s += weights[j] * y[i];
    }
    if (ok) out[t] = s;
  }
  return out;
}

export function movingAverageWeights(width: number): number[] {
  const w = Math.max(1, Math.floor(width));
  return Array.from({ length: w }, () => 1 / w);
}

export function difference(y: number[], lag = 1): number[] {
  const out = new Array(y.length).fill(Number.NaN);
  for (let t = lag; t < y.length; t++) out[t] = y[t] - y[t - lag];
  return out;
}

export function ewma(y: number[], alpha: number): number[] {
  const a = Math.max(0.01, Math.min(0.99, alpha));
  const out = new Array(y.length);
  out[0] = y[0];
  for (let t = 1; t < y.length; t++) out[t] = a * y[t] + (1 - a) * out[t - 1];
  return out;
}

export function filterGain(weights: number[], freqs: number[], causal = false): number[] {
  const off = causal ? 0 : Math.floor(weights.length / 2);
  return freqs.map((f) => {
    const w = 2 * Math.PI * f;
    let re = 0;
    let im = 0;
    for (let j = 0; j < weights.length; j++) {
      const lag = j - off;
      re += weights[j] * Math.cos(-w * lag);
      im += weights[j] * Math.sin(-w * lag);
    }
    return Math.hypot(re, im);
  });
}

export function differenceGain(freqs: number[], lag = 1): number[] {
  return freqs.map((f) => {
    const w = 2 * Math.PI * f;
    return Math.hypot(1 - Math.cos(w * lag), Math.sin(w * lag));
  });
}

export function forecastAR(
  y: number[],
  phi: number[],
  horizon: number,
  sigma: number,
): { point: number[]; lo: number[]; hi: number[] } {
  const p = phi.length;
  const hist = y.slice();
  const point: number[] = [];
  const psi = [1];
  for (let h = 1; h <= horizon; h++) {
    let pred = 0;
    for (let i = 0; i < p; i++) {
      const lag = hist.length - 1 - i;
      pred += phi[i] * (lag >= 0 ? hist[lag] : 0);
    }
    hist.push(pred);
    point.push(pred);
    if (h > 1) {
      let next = 0;
      for (let i = 0; i < p && i < psi.length; i++) next += phi[i] * psi[psi.length - 1 - i];
      psi.push(next);
    }
  }
  const lo: number[] = [];
  const hi: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    let mse = 0;
    for (let j = 0; j < h; j++) mse += psi[j] ** 2;
    const se = sigma * Math.sqrt(mse);
    lo.push(point[h - 1] - 1.96 * se);
    hi.push(point[h - 1] + 1.96 * se);
  }
  return { point, lo, hi };
}

export function residualSigma(y: number[], phi: number[]): number {
  const p = phi.length;
  let sse = 0;
  let c = 0;
  for (let t = p; t < y.length; t++) {
    let pred = 0;
    for (let i = 0; i < p; i++) pred += phi[i] * y[t - 1 - i];
    sse += (y[t] - pred) ** 2;
    c += 1;
  }
  return c > 0 ? Math.sqrt(sse / c) : 1;
}

export function transferResponse(
  input: number[],
  delay: number,
  omega: number,
  lambda: number,
  noise: number[],
): number[] {
  const n = input.length;
  const signal = new Array(n).fill(0);
  for (let t = 0; t < n; t++) {
    let s = 0;
    for (let j = 0; j <= t; j++) {
      if (j < delay) continue;
      const w = omega * lambda ** (j - delay);
      const x = input[t - j] ?? 0;
      s += w * x;
    }
    signal[t] = s + (noise[t] ?? 0);
  }
  return signal;
}

export function pulseInput(n: number, at: number, height = 1): number[] {
  return Array.from({ length: n }, (_, t) => (t === at ? height : 0));
}

export function stepInput(n: number, at: number, height = 1): number[] {
  return Array.from({ length: n }, (_, t) => (t >= at ? height : 0));
}

export function sineWave(n: number, period: number, amp: number, phase = 0): number[] {
  return Array.from({ length: n }, (_, t) => amp * Math.sin((2 * Math.PI * t) / period + phase));
}

export function formatNum(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return "n/a";
  const ax = Math.abs(x);
  if (ax !== 0 && (ax >= 1000 || ax < 0.01)) return x.toExponential(2);
  return x.toFixed(digits);
}

export function maxAbs(y: number[]): number {
  return y.reduce((m, v) => (Number.isFinite(v) ? Math.max(m, Math.abs(v)) : m), 0);
}

export function finitePairs(a: number[], b?: number[]): { i: number; a: number; b?: number }[] {
  const out: { i: number; a: number; b?: number }[] = [];
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i])) continue;
    if (b && !Number.isFinite(b[i])) continue;
    out.push(b ? { i, a: a[i], b: b[i] } : { i, a: a[i] });
  }
  return out;
}

export function sampleHold(tSrc: number[], ySrc: number[], tQuery: number[]): number[] {
  return tQuery.map((t) => {
    if (tSrc.length === 0) return 0;
    let i = 0;
    while (i + 1 < tSrc.length && tSrc[i + 1] <= t) i += 1;
    return ySrc[i] ?? 0;
  });
}

export function lerpSeries(tSrc: number[], ySrc: number[], tQuery: number[]): number[] {
  return tQuery.map((t) => {
    if (tSrc.length === 0) return 0;
    if (t <= tSrc[0]) return ySrc[0];
    if (t >= tSrc[tSrc.length - 1]) return ySrc[ySrc.length - 1];
    let i = 0;
    while (i + 1 < tSrc.length && tSrc[i + 1] < t) i += 1;
    const t0 = tSrc[i];
    const t1 = tSrc[i + 1];
    const a = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
    return ySrc[i] * (1 - a) + ySrc[i + 1] * a;
  });
}

export function rigidBody(
  times: number[],
  input: number[],
  accel: number,
  friction: number,
): { pos: number[]; vel: number[] } {
  const pos = new Array(times.length).fill(0);
  const vel = new Array(times.length).fill(0);
  for (let i = 1; i < times.length; i++) {
    const dt = times[i] - times[i - 1];
    const u = input[i] ?? 0;
    const v = vel[i - 1] + (accel * u - friction * vel[i - 1]) * dt;
    vel[i] = v;
    pos[i] = pos[i - 1] + v * dt;
  }
  return { pos, vel };
}

export type EaseKind = "linear" | "out" | "inout";

export function ease01(u: number, kind: EaseKind): number {
  const t = Math.max(0, Math.min(1, u));
  if (kind === "linear") return t;
  if (kind === "out") return 1 - (1 - t) * (1 - t);
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

export function tweenSeries(
  n: number,
  startAt: number,
  duration: number,
  height: number,
  kind: EaseKind,
): number[] {
  return Array.from({ length: n }, (_, t) => {
    if (t < startAt) return 0;
    const u = (t - startAt) / Math.max(duration, 1);
    if (u >= 1) return height;
    return height * ease01(u, kind);
  });
}
