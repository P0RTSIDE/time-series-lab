import { CHAPTERS, GAME } from "../content/nav";
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
      <p className="kicker">Two tracks</p>
      <h1>Time series, plus a Unity and Godot crash course</h1>
      <p className="lede">
        The numbered chapters are time series. Unity and Godot sit in their own
        list so you can cram the engines for a game class without mixing the
        two subjects.
      </p>

      <Steps
        items={[
          "Time series: read the takeaway, use the lab, then the four questions.",
          "Game engines: learn the editor words, the script shape, and the two clocks.",
          "Progress stays in this browser.",
        ]}
      />

      <h2 className="home-h">Time series</h2>
      <ol className="course-map">
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <button type="button" className="map-card" onClick={() => go(c.id)}>
              <span className="map-num">{c.num}</span>
              <span className="map-title">{c.title}</span>
              <span className="map-blurb">{c.blurb}</span>
              <span className="map-done">{read.includes(c.id) ? "Visited" : ""}</span>
            </button>
          </li>
        ))}
      </ol>

      <h2 className="home-h">Game engines</h2>
      <ol className="course-map">
        {GAME.map((c) => (
          <li key={c.id}>
            <button type="button" className="map-card" onClick={() => go(c.id)}>
              <span className="map-num">{c.num}</span>
              <span className="map-title">{c.title}</span>
              <span className="map-blurb">{c.blurb}</span>
              <span className="map-done">{read.includes(c.id) ? "Visited" : ""}</span>
            </button>
          </li>
        ))}
      </ol>
    </article>
  );
}
