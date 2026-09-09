import { useState } from "react";
import { Pad, Playfield, useKeys } from "../../components/Playfield";
import {
  Callout,
  Chapter,
  Compare,
  Lab,
  Quiz,
  ScriptBlock,
  Slider,
  Stat,
  Takeaway,
  TryThis,
} from "../../components/UI";

export function GodotTime() {
  const [x, setX] = useState(18);
  const [speed, setSpeed] = useState(160);
  const [useDelta, setUseDelta] = useState(true);

  const step = useDelta ? (speed * 0.016 * 0.5) : speed * 0.12;
  const move = (dir: number) => setX((v) => Math.min(90, Math.max(8, v + dir * step)));

  useKeys({
    ArrowLeft: () => move(-1),
    a: () => move(-1),
    ArrowRight: () => move(1),
    d: () => move(1),
  });

  return (
    <Chapter
      kicker="Godot · G3"
      title="Process clocks"
      lede="_ready runs once. _process paints frames. _physics_process steps the physics clock. delta is the gap."
    >
      <Takeaway>
        Multiply motion by delta so speed is units per second. Put
        CharacterBody2D work in _physics_process so collisions share one clock.
      </Takeaway>

      <section className="prose">
        <p>
          A fast machine draws more frames. If you add 160 to position every
          _process, that machine races ahead. Multiply by delta (seconds since
          the last call) and 160 means 160 pixels per second on every machine.
        </p>
        <Compare
          leftTitle="_process(delta)"
          left="Every idle frame. Input feel, animation, UI, motion you write by hand."
          rightTitle="_physics_process(delta)"
          right="The physics tick. velocity, move_and_slide, anything colliders must agree on."
        />
        <ScriptBlock
          lang="GDScript"
          label="A timed step"
          lines={[
            "extends Node2D",
            "",
            "@export var speed: float = 160.0",
            "@export var use_delta: bool = true",
            "",
            "func _ready() -> void:",
            "    position = Vector2(80, 200)",
            "",
            "func _process(delta: float) -> void:",
            "    var step: float = speed",
            "    if use_delta:",
            "        step *= delta",
            "    position.x += step",
          ]}
          does="Once, park the node. Each frame, slide right. With use_delta on, speed is units per second. Off, speed is units per frame, so a fast machine jumps farther."
        />
      </section>

      <Callout title="Two clocks" tone="note">
        _process can stutter when the frame rate dips. _physics_process stays
        even. A jump that uses velocity feels steadier on the physics clock.
      </Callout>

      <Lab
        title="One press, two step sizes"
        explain="Each press moves the node. With delta on, speed means units per second. With delta off, the same number jumps a raw step every press."
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={useDelta}
                onChange={(e) => setUseDelta(e.target.checked)}
              />
              Multiply by delta
            </label>
            <Slider
              label="Speed"
              value={speed}
              min={40}
              max={280}
              step={10}
              onChange={setSpeed}
            />
            <Pad onLeft={() => move(-1)} onRight={() => move(1)} />
            <div className="stat-row">
              <Stat label="This step" value={step.toFixed(2)} />
              <Stat label="X" value={x.toFixed(0)} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[{ id: "n", x, y: 22, w: 30, h: 30, color: "#7eb6e8", label: "N" }]}
          caption="Untick delta. The same speed number now jumps the node."
        />
      </Lab>

      <TryThis
        items={[
          "Leave delta on and tap Right a few times. The node creeps.",
          "Untick the box and tap Right once. Same speed, a much bigger hop.",
          "Raise speed with delta off. Each press is a teleport.",
        ]}
      />

      <Quiz
        id="godot-time"
        questions={[
          {
            prompt: "delta is:",
            choices: [
              "The name of the current scene.",
              "Seconds since the last _process or _physics_process call.",
              "A bool that freezes input.",
              "The node mass.",
            ],
            answer: 1,
            why: "A slow frame lasts longer. Multiply motion by that duration so speed stays honest.",
            wrongs: [
              "Scene names are strings you pass to change_scene_to_file.",
              "",
              "delta does not lock input. It scales a step.",
              "Mass is a physics property, not the frame gap.",
            ],
          },
          {
            prompt: "_ready() is for:",
            choices: [
              "Every displayed frame.",
              "One-time setup after the node and its children exist.",
              "Only the FileSystem dock.",
              "Replacing move_and_slide.",
            ],
            answer: 1,
            why: "Children are alive when _ready runs. Connect signals and cache $ paths here.",
            wrongs: [
              "That loop is _process. _ready fires once.",
              "",
              "Docks are the editor. _ready is a runtime callback.",
              "move_and_slide still belongs on a body, each physics tick.",
            ],
          },
          {
            prompt: "If you skip delta in _process, a faster machine will:",
            choices: [
              "Move the same distance per second.",
              "Take more steps per second, so the node jumps farther over time.",
              "Never call _ready.",
              "Disable the camera.",
            ],
            answer: 1,
            why: "More frames means more additions. That is the units-per-frame bug.",
            wrongs: [
              "Same distance per second is what delta is for.",
              "",
              "_ready still runs once. This bug is about the loop.",
              "The camera is unrelated to frame-scaled motion.",
            ],
          },
          {
            prompt: "_physics_process exists so that:",
            choices: [
              "UI text can blink.",
              "Physics steps on a steady clock that collisions can share.",
              "Scripts stop using extends.",
              "get_axis returns a string.",
            ],
            answer: 1,
            why: "Colliders need a fixed step. Put velocity and move_and_slide there.",
            wrongs: [
              "UI can live in _process. The physics callback is for bodies.",
              "",
              "Your script still extends a node type.",
              "get_axis still returns a float.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
