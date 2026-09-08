import { CHAPTERS } from "../content/nav";
import { Steps } from "../components/UI";

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
        Short lesson. Live experiment. Quick check. Drag a slider until the
        picture matches the idea.
      </p>

      <Steps
        items={[
          "Read the takeaway and the cards. Skip the rest on a first pass if you want.",
          "Use the lab. The try-this list tells you which sliders matter.",
          "Answer the four questions. Progress stays in this browser.",
        ]}
      />

      <h2 className="home-h">What you will be able to do</h2>
      <ul className="skill-grid">
        <li>Split trend, season, and leftover memory.</li>
        <li>See when a slope is fine and the standard error is not.</li>
        <li>Read ACF and PACF well enough to propose an ARMA.</li>
        <li>Find hidden cycles on a periodogram, then smooth it.</li>
        <li>Describe a filter by its gain.</li>
        <li>Forecast with bands that actually grow.</li>
        <li>Trace an input shock into an output.</li>
        <li>Spot the same clocks inside Unity and Godot.</li>
      </ul>

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
