import { useState } from "react";
import { Pad, Playfield } from "../../components/Playfield";
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

  const press = () => setScore((s) => s + 1);

  const tick = () => {
    setTicks((n) => n + 1);
    setPulse((p) => !p);
    if (pollHold) setScore((s) => s + 1);
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
        title="Press adds, hold does not"
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={pollHold}
                onChange={(e) => setPollHold(e.target.checked)}
              />
              Poll: add score on each timer tick
            </label>
            <Pad onAction={press} actionLabel="Press" />
            <button type="button" className="btn" onClick={tick}>
              Timer tick
            </button>
            <div className="stat-row">
              <Stat label="Score" value={String(score)} />
              <Stat label="Timeouts" value={String(ticks)} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "btn", x: 28, y: 22, w: 56, h: 28, color: "#7eb6e8", label: "Btn" },
            {
              id: "tmr",
              x: 70,
              y: 22,
              w: 28,
              h: 28,
              color: pulse ? "#d4eef8" : "#4a8aaa",
              label: "T",
            },
          ]}
          onStageClick={(x) => {
            if (x < 50) press();
          }}
          caption="Click the button or Press. Tick the timer. Score should stay put unless you poll."
        />
      </Lab>

      <TryThis
        items={[
          "Press three times. Score is 3. Timeouts stay at 0.",
          "Tap Timer tick a few times. The pulse flips. Score does not move.",
          "Tick the poll box, then tick the timer. Score now rides the hold. That is the wrong habit.",
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
