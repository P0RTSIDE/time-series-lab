import { CHAPTERS } from "../content/nav";

export function Home({
  go,
  read,
}: {
  go: (id: string) => void;
  read: string[];
}) {
  return (
    <article className="chapter home">
      <p className="kicker">A self-study course</p>
      <h1>Learn time series by watching it move</h1>
      <p className="lede">
        This lab walks through the core of univariate and input-output time series
        analysis. Each chapter pairs a short lesson with a live experiment. Drag a
        slider, watch the series change, then check whether the idea stuck.
      </p>

      <section className="prose">
        <h2>What you will be able to do</h2>
        <ul>
          <li>Separate trend, seasonality, and leftover serial correlation.</li>
          <li>See why ordinary regression standard errors fail when errors remember the past.</li>
          <li>Read ACF and PACF plots well enough to propose an ARMA model.</li>
          <li>Find hidden cycles with a periodogram, then smooth it.</li>
          <li>Describe a linear filter by its gain at each frequency.</li>
          <li>Produce forecasts with honest uncertainty bands.</li>
          <li>Trace how an input shock travels into an output series.</li>
        </ul>
        <h2>How to use the lab</h2>
        <p>
          Work in order the first time. Later, jump around. Progress is stored in
          this browser, so you can close the tab and return. There is no login and
          no server. The Playground at the end is for mixing ideas once you have
          language for them.
        </p>
        <p>
          Notation stays close to a first course: a time index, lags described
          in words when it helps, and Greek letters for parameters. Formulas are
          there to name a mechanism, not to replace the pictures.
        </p>
      </section>

      <ol className="course-map">
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <button type="button" className="map-card" onClick={() => go(c.id)}>
              <span className="map-num">{c.num}</span>
              <span className="map-title">{c.title}</span>
              <span className="map-blurb">{c.blurb}</span>
              {read.includes(c.id) && <span className="map-done">Visited</span>}
            </button>
          </li>
        ))}
      </ol>
    </article>
  );
}
