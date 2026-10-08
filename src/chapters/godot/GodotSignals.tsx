import { useEffect, useRef, useState } from "react";
import { Pad, Playfield, usePlayer } from "../../components/Playfield";
import {
  Callout,
  Chapter,
  Compare,
  Lab,
  Quiz,
  ScriptBlock,
  Stat,
  Takeaway,
  TermList,
  TryThis,
} from "../../components/UI";

export function GodotSignals() {
  const [score, setScore] = useState(0);
  const [ticks, setTicks] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [pollHold, setPollHold] = useState(false);
  const [links, setLinks] = useState(1);
  const [holding, setHolding] = useState(false);
  const [log, setLog] = useState<string[]>(["Nothing fired yet."]);
  const linksRef = useRef(links);
  const pollRef = useRef(pollHold);
  linksRef.current = links;
  pollRef.current = pollHold;

  const note = (line: string) => setLog((prev) => [line, ...prev].slice(0, 4));
  const inZone = useRef(false);

  const player = usePlayer({
    floor: 12,
    startX: 18,
    onMove: (nx, ny) => {
      const near = Math.abs(nx - 76) < 9 && ny < 30;
      if (near && !inZone.current) {
        inZone.current = true;
        setScore((s) => s + 1);
        note("body_entered: +1");
      } else if (!near && inZone.current) {
        inZone.current = false;
        note("body_exited");
      }
    },
  });

  const onPressed = () => {
    const n = linksRef.current;
    setScore((s) => s + n);
    note(n === 1 ? "pressed: +1" : `pressed fired ${n} handlers: +${n}`);
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      setTicks((n) => n + 1);
      setPulse((p) => !p);
      if (pollRef.current) {
        setScore((s) => s + 1);
        note("timeout poll: +1 (asking every beat)");
      } else {
        note("timeout: pulse only");
      }
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  const holdTimer = useRef<number | null>(null);
  const holdEnd = () => {
    setHolding(false);
    if (holdTimer.current != null) {
      window.clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
  };
  const holdStart = () => {
    setHolding(true);
    if (pollRef.current) {
      setScore((s) => s + 1);
      note("hold poll: +1 while down");
      holdTimer.current = window.setInterval(() => {
        setScore((s) => s + 1);
        note("hold poll: +1 while down");
      }, 280);
    } else {
      onPressed();
    }
  };

  return (
    <Chapter
      kicker="Godot · G7"
      title="Signals and UI"
      lede="A Button emits pressed. A Timer emits timeout. Connect both in _ready so you do not poll."
    >
      <Takeaway>
        Connect pressed and timeout in _ready. A signal fires once per event.
        A hold is not a press. Score on pressed, not on every timer tick.
      </Takeaway>

      <section className="prose">
        <p>
          A signal is a shout: I was pressed, I timed out, a body entered.
          You connect a function to that shout. Godot calls you when it
          happens. You do not ask every frame.
        </p>
        <TermList
          items={[
            {
              term: "pressed",
              text: "The Button signal. Fires once when the click or confirm starts, not while held.",
            },
            {
              term: "timeout",
              text: "The Timer signal. Fires when the wait ends. Restart or set autostart if you need a beat.",
            },
            {
              term: "connect in _ready",
              text: "$Button.pressed.connect(_on_pressed). Children exist, so the path is safe.",
            },
          ]}
        />
        <Compare
          leftTitle="Signal"
          left="Something happened once. Other nodes react. Best for UI, timers, and pickups."
          rightTitle="Poll"
          right="You ask every frame. Fine for a held walk axis. Wrong for a score button."
        />
        <ScriptBlock
          lang="GDScript"
          label="Button and timer"
          lines={[
            "extends Node2D",
            "",
            "var score: int = 0",
            "",
            "func _ready() -> void:",
            "    $Button.pressed.connect(_on_pressed)",
            "    $Timer.timeout.connect(_on_timeout)",
            "    $Timer.start()",
            "",
            "func _on_pressed() -> void:",
            "    score += 1",
            "    $Label.text = str(score)",
            "",
            "func _on_timeout() -> void:",
            "    $Pulse.visible = not $Pulse.visible",
          ]}
          does="Once, hook the button and the timer. A press adds to score. A timeout only flips a pulse. Holding the button does not keep adding."
        />
      </section>

      <Callout title="Week-one trap" tone="warn">
        Connecting in _process stacks a new link every frame. One click then
        fires twenty functions. Connect in _ready, once.
      </Callout>

      <Lab
        title="One press, a live timer, stacked connects"
        explain="Walk and jump are still here. The timer is already running. Each timeout flips the pulse and writes a line. It does not add score unless you turn on polling. Click the button for a pressed signal: one click, one point. Walk into the area for body_entered, which fires once until you leave. Connect again and the same click runs every handler you stacked. Hold is different from pressed: with polling on, holding the button keeps adding."
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={pollHold}
                onChange={(e) => setPollHold(e.target.checked)}
              />
              Poll score on timeout and on hold
            </label>
            <button type="button" className="btn" onClick={() => setLinks((n) => Math.min(4, n + 1))}>
              Connect pressed again
            </button>
            <button type="button" className="btn ghost" onClick={() => setLinks(1)}>
              Reset to one connect
            </button>
            <button
              type="button"
              className="btn"
              onMouseDown={holdStart}
              onMouseUp={holdEnd}
              onMouseLeave={holdEnd}
            >
              {holding ? "Holding" : "Hold button"}
            </button>
            <Pad
              onLeft={() => player.walk(-1)}
              onRight={() => player.walk(1)}
              onUp={player.jump}
              onAction={player.jump}
              actionLabel="Jump"
            />
            <div className="stat-row">
              <Stat label="Score" value={String(score)} />
              <Stat label="Timeouts" value={String(ticks)} />
              <Stat label="pressed handlers" value={String(links)} />
            </div>
          </>
        }
      >
        <Playfield
          height={240}
          actors={[
            {
              id: "btn",
              x: 22,
              y: 62,
              w: 72,
              h: 32,
              color: "#7eb6e8",
              label: "Button",
              onClick: onPressed,
            },
            {
              id: "tmr",
              x: 50,
              y: 62,
              w: 32,
              h: 32,
              color: pulse ? "#f4fff9" : "#245e52",
              label: pulse ? "on" : "off",
            },
            {
              id: "score",
              x: 78,
              y: 78,
              w: 64,
              h: 24,
              color: "#1c232b",
              label: String(score),
            },
            { id: "floor", x: 50, y: 0, w: 520, h: 12, color: "#4a7a8c", label: "" },
            {
              id: "zone",
              x: 76,
              y: 16,
              w: 36,
              h: 28,
              color: inZone.current ? "#f0d48a" : "#3d5a4a",
              label: "area",
            },
            { id: "p", x: player.x, y: player.y, w: 24, h: 24, color: "#f2d48a", label: "P" },
          ]}
          caption="Walk and jump as before. Button is pressed. The area fires body_entered once. The square is the timer."
        />
        <ul className="lab-log">
          {log.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ul>
      </Lab>

      <TryThis
        items={[
          "Watch the log. Timeout lines appear on their own. Score stays put.",
          "Click Button three times. Three pressed lines, score 3.",
          "Connect pressed again, then click once. One click adds 2. Reset the connect, turn on poll, and watch timeout start adding.",
          "Walk into the area. Score goes up once. Walk out and back in. body_entered fires again. Jump still lands on the floor.",
        ]}
      />

      <Quiz
        id="godot-signals"
        questions={[
          {
            prompt: "Connect Button.pressed in _ready because:",
            choices: [
              "_ready runs every frame, so the link stays fresh.",
              "The child exists once, and one connection is enough.",
              "Signals only work before the node is in the tree.",
              "pressed is not a signal.",
            ],
            answer: 1,
            why: "Children are alive in _ready. One connect, then every later press calls you.",
            wrongs: [
              "_ready is once. Connecting in a loop is how you get double fires.",
              "",
              "The node is already in the tree when _ready runs.",
              "pressed is the Button signal. timeout is the Timer one.",
            ],
          },
          {
            prompt: "A score button should use pressed, not a hold poll, because:",
            choices: [
              "Signals cannot add numbers.",
              "pressed fires once per click, so one tap is one point.",
              "Timers cannot run if you use signals.",
              "_process is forbidden in UI scenes.",
            ],
            answer: 1,
            why: "A hold is many frames. Polling would keep adding. The signal is the tap.",
            wrongs: [
              "Your handler can add to score. The signal is only the trigger.",
              "",
              "A Timer can still emit timeout next to a Button.",
              "You may still animate in _process. The click itself is a signal.",
            ],
          },
          {
            prompt: "Timer.timeout is useful when:",
            choices: [
              "You need a beat or a delay, and a function should run then.",
              "You want to read get_axis.",
              "You are saving a packed scene.",
              "You need gravity.",
            ],
            answer: 0,
            why: "Start the timer, connect timeout, do the work in the handler.",
            wrongs: [
              "",
              "Axes are Input. A timeout is a clock event.",
              "Saving a scene is an editor act, not a signal.",
              "Gravity is velocity on a body, each physics tick.",
            ],
          },
          {
            prompt: "Connecting the same signal every _process frame will:",
            choices: [
              "Do nothing.",
              "Stack handlers, so one press can fire many times.",
              "Delete the Button.",
              "Freeze delta at zero.",
            ],
            answer: 1,
            why: "Each connect adds another call. That is the double-score bug.",
            wrongs: [
              "It does something: it multiplies the handler.",
              "",
              "The Button stays. You just over-subscribe it.",
              "delta is still the frame gap. Connections do not zero it.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
