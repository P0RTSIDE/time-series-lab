import { useState } from "react";
import { Pad, Playfield, useKeys } from "../../components/Playfield";
import {
  Callout,
  Chapter,
  Lab,
  Quiz,
  ScriptBlock,
  Slider,
  Stat,
  Takeaway,
  TermList,
  TryThis,
} from "../../components/UI";

function tintHex(t: number) {
  const r = Math.round(90 + t * 0.4);
  const g = Math.round(160 + t * 0.5);
  const b = Math.round(200 + t * 0.2);
  return `rgb(${r}, ${g}, ${b})`;
}

export function GodotScript() {
  const [x, setX] = useState(28);
  const [speed, setSpeed] = useState(180);
  const [tint, setTint] = useState(40);

  const step = speed / 40;
  const color = tintHex(tint);
  const move = (dir: number) => setX((v) => Math.min(90, Math.max(8, v + dir * step)));

  useKeys({
    ArrowLeft: () => move(-1),
    a: () => move(-1),
    ArrowRight: () => move(1),
    d: () => move(1),
  });

  return (
    <Chapter
      kicker="Godot · G2"
      title="GDScript you will write"
      lede="extends, typed vars, @export, and the dollar path. The four pieces of a first node script."
    >
      <Takeaway>
        A script extends a node type. @export puts a knob in the Inspector.
        The dollar sign finds a child by name. Types catch mix-ups early.
      </Takeaway>

      <section className="prose">
        <p>
          Attach the script to the root node. The first line must match that
          type. Then name your numbers, mark the ones you want to tweak, and
          grab children once.
        </p>
        <TermList
          items={[
            {
              term: "extends",
              text: "The node this script is. CharacterBody2D if you need velocity. Node2D if you only need a position.",
            },
            {
              term: "@export",
              text: "Shows the variable in the Inspector. Change speed on the node, not in the script.",
            },
            {
              term: "$Child",
              text: "A child named Child. $Sprite2D.modulate is the sprite tint. The name must match.",
            },
            {
              term: "Typed var",
              text: "var speed: float = 180.0. Godot then refuses a string in that slot.",
            },
          ]}
        />
        <ScriptBlock
          lang="GDScript"
          label="A first mover"
          lines={[
            "extends Node2D",
            "",
            "@export var speed: float = 180.0",
            "@export var tint: Color = Color(0.49, 0.71, 0.91)",
            "",
            "@onready var sprite: Sprite2D = $Sprite2D",
            "",
            "func _process(delta: float) -> void:",
            "    var x: float = Input.get_axis(\"left\", \"right\")",
            "    position.x += x * speed * delta",
            "    sprite.modulate = tint",
          ]}
          does="Each frame, read the left-right axis, slide the node, and paint the child sprite with the exported color. @onready fills sprite after the child exists."
        />
      </section>

      <Callout title="Week-one trap" tone="warn">
        $Sprite2D looks up a child named Sprite2D. Rename the child and the
        path breaks. The error names the missing node.
      </Callout>

      <Lab
        title="Exported speed and tint"
        controls={
          <>
            <Slider label="speed" value={speed} min={40} max={320} step={10} onChange={setSpeed} />
            <Slider label="tint" value={tint} min={0} max={80} step={1} onChange={setTint} />
            <Pad onLeft={() => move(-1)} onRight={() => move(1)} />
            <div className="stat-row">
              <Stat label="Step" value={step.toFixed(1)} />
              <Stat label="Child" value="$Sprite2D" />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "p", x, y: 14, w: 36, h: 36, color: "#5a9ec9", label: "P" },
            { id: "s", x, y: 28, w: 22, h: 22, color, label: "S" },
          ]}
          caption="P is the root. S is the child sprite. The sliders are the Inspector."
        />
      </Lab>

      <TryThis
        items={[
          "Drag speed up, then tap Right. The root and child travel farther.",
          "Drag tint. Only the child sprite changes color.",
          "Drop speed near 40. Same keys, a crawl. That is the export doing its job.",
        ]}
      />

      <Quiz
        id="godot-gdscript"
        questions={[
          {
            prompt: "extends CharacterBody2D means:",
            choices: [
              "The script is a loose file with no node.",
              "This script is that body type, so it owns velocity and move_and_slide.",
              "The scene cannot have children.",
              "Signals are turned off.",
            ],
            answer: 1,
            why: "The first line is the node. Methods like move_and_slide only exist on a body.",
            wrongs: [
              "A script always sits on a node of the type it extends.",
              "",
              "Children are a tree question, not an extends question.",
              "extends does not touch signals.",
            ],
          },
          {
            prompt: "@export on a variable means:",
            choices: [
              "The game cannot start.",
              "The Inspector can edit that value on the node.",
              "The node is hidden.",
              "The variable cannot have a type.",
            ],
            answer: 1,
            why: "Exports are knobs. Designers (and you) tweak them on the selected node.",
            wrongs: [
              "Exports do not block play. They only surface a field.",
              "",
              "Visibility is modulate or hide(). Export is an Inspector flag.",
              "You can write @export var speed: float. Types and exports mix.",
            ],
          },
          {
            prompt: "$Sprite2D means:",
            choices: [
              "A random sprite in the project.",
              "The child of this node named Sprite2D.",
              "The current scene file.",
              "A built-in color.",
            ],
            answer: 1,
            why: "The dollar path walks from the node that owns the script. The name must match.",
            wrongs: [
              "It is a named child, not a search of every sprite.",
              "",
              "The scene file is the packed tree. $ is a live child lookup.",
              "Colors are Color(...) or a Color export.",
            ],
          },
          {
            prompt: "var speed: float = 180.0 is useful because:",
            choices: [
              "Godot then knows the slot is a number and will refuse a string.",
              "It hides the variable from every function.",
              "It disables _process.",
              "It turns the node into a Timer.",
            ],
            answer: 0,
            why: "A type is a promise. The editor flags a bad assignment before you play.",
            wrongs: [
              "",
              "The variable is still in scope for the script. Type is not privacy.",
              "_process still runs. Types do not cancel callbacks.",
              "The node type comes from extends, not from one variable.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
