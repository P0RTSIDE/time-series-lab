import { useState } from "react";
import { Pad, Playfield, useKeys } from "../../components/Playfield";
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

export function GodotInput() {
  const [x, setX] = useState(40);
  const [y, setY] = useState(10);
  const [axis, setAxis] = useState(0);
  const [action, setAction] = useState("none");

  const left = () => {
    setAxis(-1);
    setAction("left");
    setX((v) => Math.max(8, v - 8));
  };
  const right = () => {
    setAxis(1);
    setAction("right");
    setX((v) => Math.min(90, v + 8));
  };
  const jump = () => {
    setAction("jump");
    setY(28);
    window.setTimeout(() => {
      setY(10);
      setAction("none");
      setAxis(0);
    }, 220);
  };

  useKeys({
    ArrowLeft: left,
    a: left,
    ArrowRight: right,
    d: right,
    ArrowUp: jump,
    w: jump,
    " ": jump,
  });

  return (
    <Chapter
      kicker="Godot · G4"
      title="Reading input"
      lede="Name actions in the Input Map. Read them with get_axis and is_action_just_pressed."
    >
      <Takeaway>
        Bind keys to action names, then ask for those names. just_pressed is a
        single tap. get_axis is a left-right value from minus one to one.
      </Takeaway>

      <section className="prose">
        <p>
          Open the Input Map and add actions named left, right, and jump. Point
          each at keys or a pad. Scripts then use the names, so you can rebind
          later without touching the mover.
        </p>
        <TermList
          items={[
            {
              term: "Input Map",
              text: "A list of action names. left might be A and the left arrow. The script never lists those keys.",
            },
            {
              term: "get_axis",
              text: "Input.get_axis(\"left\", \"right\") is one float. Negative is left, positive is right, zero is idle.",
            },
            {
              term: "is_action_just_pressed",
              text: "True on the frame the action starts. Use it for jump, shoot, or open. A hold should not retrigger.",
            },
          ]}
        />
        <Compare
          leftTitle="just_pressed"
          left="One shot. Jump, fire, confirm. The next frame it is false even if the key is still down."
          rightTitle="is_action_pressed"
          right="True for the whole hold. Fine for walk. A jump on pressed will fly if you hold the key."
        />
        <ScriptBlock
          lang="GDScript"
          label="Actions, not raw keys"
          lines={[
            "extends CharacterBody2D",
            "",
            "@export var speed: float = 220.0",
            "@export var jump_speed: float = -320.0",
            "",
            "func _physics_process(delta: float) -> void:",
            "    var x: float = Input.get_axis(\"left\", \"right\")",
            "    velocity.x = x * speed",
            "    if not is_on_floor():",
            "        velocity.y += 900.0 * delta",
            "    if Input.is_action_just_pressed(\"jump\") and is_on_floor():",
            "        velocity.y = jump_speed",
            "    move_and_slide()",
          ]}
          does="Each physics tick, read the move axis, apply gravity, and jump only on the tap that starts the action while you are on the floor."
        />
      </section>

      <Callout title="Week-one trap" tone="warn">
        The action name in code must match the Input Map. Jump and jump are
        different if the capitals differ. A misspelled name reads as never pressed.
      </Callout>

      <Lab
        title="Pad, keys, and action state"
        controls={
          <>
            <Pad onLeft={left} onRight={right} onAction={jump} actionLabel="Jump" />
            <div className="stat-row">
              <Stat label="get_axis" value={String(axis)} />
              <Stat label="Action" value={action} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[{ id: "p", x, y, w: 28, h: 28, color: "#7eb6e8", label: "P" }]}
          caption="Arrows or A and D walk. Up, W, space, or Jump is just_pressed."
        />
      </Lab>

      <TryThis
        items={[
          "Tap Left and Right. get_axis should flip between minus one and one.",
          "Press Jump once. The body hops, then the action returns to none.",
          "Hold Jump in your head: just_pressed would not keep adding hops. A hold is pressed, not just_pressed.",
        ]}
      />

      <Quiz
        id="godot-input"
        questions={[
          {
            prompt: "Input.get_axis(\"left\", \"right\") returns:",
            choices: [
              "A scene path.",
              "A float: negative for left, positive for right, zero if neither.",
              "The node color.",
              "True only on the first frame.",
            ],
            answer: 1,
            why: "One number for a stick or two keys. Multiply it by speed for velocity.x.",
            wrongs: [
              "Scene paths are strings for loading, not for sticks.",
              "",
              "Color is modulate or an export. Axis is motion.",
              "That one-frame flag is is_action_just_pressed.",
            ],
          },
          {
            prompt: "Use is_action_just_pressed for jump because:",
            choices: [
              "It repeats every frame you hold, which feels like a charge.",
              "It is true only on the frame the action starts, so one tap is one jump.",
              "It ignores the Input Map.",
              "It only works in _ready.",
            ],
            answer: 1,
            why: "A hold would keep the action pressed. just_pressed fires once, then waits for a release.",
            wrongs: [
              "Repeating while held is is_action_pressed. That would rocket you up.",
              "",
              "It reads the same action names as get_axis.",
              "Read input in _physics_process or _process, not only once at start.",
            ],
          },
          {
            prompt: "The Input Map is there so that:",
            choices: [
              "You hard-code Key.A in every mover.",
              "Scripts ask for action names, and you can rebind keys later.",
              "Physics is disabled.",
              "Scenes cannot instance.",
            ],
            answer: 1,
            why: "left, right, jump are names. The map stores which keys fire them.",
            wrongs: [
              "Raw keys lock you in. Actions keep the script stable.",
              "",
              "Input and physics are separate systems.",
              "Instancing is packed scenes. The map is only bindings.",
            ],
          },
          {
            prompt: "is_action_pressed is the better fit when:",
            choices: [
              "You need a one-shot confirm.",
              "The player is holding walk or aim for many frames.",
              "You are connecting a Button signal.",
              "You want _ready to run twice.",
            ],
            answer: 1,
            why: "A hold is a duration. Walk stays true until they let go.",
            wrongs: [
              "Confirm and jump want just_pressed so they do not stutter.",
              "",
              "A Button uses the pressed signal, not the Input Map poll.",
              "_ready still runs once. Input helpers do not restart it.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
