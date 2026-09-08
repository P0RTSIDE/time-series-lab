import { M } from "../components/MathTex";
import { Chapter } from "../components/UI";

const TERMS: { term: string; def: string; math?: string }[] = [
  {
    term: "Autocorrelation (ACF)",
    def: "Correlation of a series with a lagged copy of itself. The plot of those correlations against lag is the correlogram.",
    math: "\\rho(h)=\\mathrm{Corr}(Y_t,Y_{t+h})",
  },
  {
    term: "Autoregression (AR)",
    def: "A model that writes the present as a linear function of recent past values plus a new shock.",
  },
  {
    term: "Cross-correlation (CCF)",
    def: "Correlation between one series and a lagged copy of another. Used to read lead-lag relationships and transfer-function delays.",
  },
  {
    term: "Frequency / period",
    def: "Period is how many observations a cycle takes. Frequency is the reciprocal: cycles per observation. Monthly annual season is period 12, frequency 1/12.",
  },
  {
    term: "Gain",
    def: "How much a linear filter stretches or shrinks a sinusoid at a given frequency. The modulus of the frequency response.",
  },
  {
    term: "Innovation",
    def: "The one-step prediction error, the part of the new observation that could not be linearly predicted from the past.",
  },
  {
    term: "Invertibility",
    def: "For moving-average models, the condition that lets you recover shocks from past observations. For MA(1), the absolute value of theta is less than 1.",
  },
  {
    term: "Leakage",
    def: "Smear of a cycle’s power into neighboring periodogram frequencies when the sample does not contain an integer number of repeats.",
  },
  {
    term: "Linear filter",
    def: "A replacement of each value by a weighted sum of nearby values. Moving averages, differences, and exponential smoothers are filters.",
  },
  {
    term: "Moving average (MA)",
    def: "A model that writes the present as a linear function of recent shocks. Also, in filtering, a local average of the series.",
  },
  {
    term: "Partial autocorrelation (PACF)",
    def: "Extra correlation at a lag after intervening lags are accounted for. Cuts off after lag p for an AR(p).",
  },
  {
    term: "Periodogram",
    def: "A sample plot of power against Fourier frequencies. A noisy view of the spectral density, usually smoothed.",
  },
  {
    term: "Prewhitening",
    def: "Filtering an input (and the output the same way) so the input looks like white noise, which makes the CCF easier to read as an impulse response.",
  },
  {
    term: "Spectral density",
    def: "A function that distributes the variance of a stationary series across frequencies. Fourier dual of the ACF.",
  },
  {
    term: "Stationarity",
    def: "In the weak sense used here: stable mean, stable variance, and an ACF that depends only on lag, not on calendar time.",
  },
  {
    term: "Transfer function",
    def: "A linear map from an observed input series into an output, plus leftover noise. The weights are the impulse response.",
  },
  {
    term: "White noise",
    def: "Uncorrelated, mean-zero, constant-variance shocks. The leftover you want after a mean model and a correlation model have done their jobs.",
  },
  {
    term: "Yule-Walker",
    def: "Equations that turn autocovariances into AR coefficients. The sample version is a quick estimator of phi.",
  },
];

export function Glossary() {
  return (
    <Chapter
      kicker="Reference"
      title="Glossary"
      lede="Short definitions for the words the chapters keep using. Read these when a term feels slippery, then go back to the lab that made it visible."
    >
      <dl className="glossary">
        {TERMS.map((t) => (
          <div key={t.term} className="gloss-item">
            <dt>{t.term}</dt>
            <dd>
              {t.def}
              {t.math && <M block expr={t.math} />}
            </dd>
          </div>
        ))}
      </dl>
    </Chapter>
  );
}
