import { CHAPTERS, GODOT, UNITY } from "../content/nav";
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
      <p className="kicker">Three tracks</p>
      <h1>Time series, plus Unity and Godot crash courses</h1>
      <p className="lede">
        Nine time series lessons, then nine Unity lessons and nine Godot
        lessons. The game tracks teach the editor, the script, and a playable
        loop. They are not time series chapters.
      </p>

      <Steps
        items={[
          "Time series: read the takeaway, use the lab, then the four questions.",
          "Unity and Godot: copy the script into a new object, then use the on-page stage.",
          "Progress stays in this browser.",
        ]}
      />

      <h2 className="home-h">Time series</h2>
      <Map items={CHAPTERS} go={go} read={read} />

      <h2 className="home-h">Unity</h2>
      <Map items={UNITY} go={go} read={read} />

      <h2 className="home-h">Godot</h2>
      <Map items={GODOT} go={go} read={read} />
    </article>
  );
}

function Map({
  items,
  go,
  read,
}: {
  items: { id: string; num: string; title: string; blurb: string }[];
  go: (id: string) => void;
  read: string[];
}) {
  return (
    <ol className="course-map">
      {items.map((c) => (
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
  );
}
