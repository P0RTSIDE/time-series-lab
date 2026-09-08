import { useMemo, useState } from "react";
import { LineChart } from "../components/Charts";
import {
  Callout,
  Card,
  Cards,
  Chapter,
  Compare,
  Lab,
  Quiz,
  ScriptBlock,
  Slider,
  Stat,
  Takeaway,
  TryThis,
} from "../components/UI";

export function Godot() {
  const [speed, setSpeed] = useState(180);
  const [useSignals, setUseSignals] = useState(true);
  const [hasBody, setHasBody] = useState(true);
  const [hasSprite, setHasSprite] = useState(true);
  const [jump, setJump] = useState(false);

  const path = useMemo(() => {
    const n = 80;
    let y = 0;
    let v = 0;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!hasBody) {
        out.push(0);
        continue;
      }
      if (jump && i === 10) v = 7;
      v -= 0.35;
      y += v * (speed / 400);
      if (y < 0) {
        y = 0;
        v = 0;
      }
      out.push(y);
    }
    return out;
  }, [speed, hasBody, jump]);

  return (
    <Chapter
      kicker="Game engines · G1"
      title="Godot basics"
      lede="A crash course for a game class: nodes, scenes, GDScript, and signals. Separate from the time series track."
    >
      <Takeaway>
        A Godot scene is a tree of nodes. A script sits on one node and talks
        to its children. Signals are how nodes shout “I was pressed” without
        polling every frame.
      </Takeaway>

      <section className="prose">
        <h2>Nodes, not GameObjects</h2>
        <p>
          Unity hangs components on an empty object. Godot makes the type the
          node itself: a Sprite2D is a node, a CharacterBody2D is a node, a
          Timer is a node. You nest them. A player might be a CharacterBody2D
          with a Sprite2D and a CollisionShape2D as children.
        </p>
        <Cards>
          <Card title="Scene tree">
            The live list of nodes. Parent transforms move the children.
          </Card>
          <Card title="Inspector">
            The selected node’s exported numbers. Same job as Unity’s Inspector.
          </Card>
          <Card title="FileSystem">
            Your art, scenes, and scripts. A scene file is a reusable packed
            tree, like a prefab.
          </Card>
          <Card title="2D / 3D / Script">
            Edit the world, or the script on the selected node.
          </Card>
        </Cards>

        <h2>GDScript you need in week one</h2>
        <p>
          GDScript is Python-like: indentation matters, types are optional but
          worth adding. A script extends a node type. Godot calls _ready once
          and _process or _physics_process every tick. The dollar sign grabs a
          child by name.
        </p>
        <ScriptBlock
          lang="GDScript"
          label="A first side-scroller body"
          lines={[
            "extends CharacterBody2D",
            "",
            "@export var speed := 200.0",
            "@export var jump_speed := -320.0",
            "",
            "func _physics_process(delta: float) -> void:",
            "    var x := Input.get_axis(\"left\", \"right\")",
            "    velocity.x = x * speed",
            "    if not is_on_floor():",
            "        velocity.y += 900.0 * delta",
            "    if Input.is_action_just_pressed(\"jump\") and is_on_floor():",
            "        velocity.y = jump_speed",
            "    move_and_slide()",
          ]}
          does="Each physics tick, read the move axis, apply gravity, jump if you just pressed the action and you are on the floor, then let Godot resolve the slide against walls."
        />
        <Cards>
          <Card title="_ready()">
            Once, after the node and its children exist. Connect signals here.
          </Card>
          <Card title="_process(delta)">
            Every idle frame. Visuals, UI, non-physics motion.
          </Card>
          <Card title="_physics_process(delta)">
            Fixed physics tick. CharacterBody2D and move_and_slide live here.
          </Card>
          <Card title="@export">
            Shows the variable in the Inspector, like a public field in Unity.
          </Card>
        </Cards>
        <Compare
          leftTitle="Signals"
          left="A button emits pressed. You connect that to a function. No need to ask ‘are they clicking?’ every frame."
          rightTitle="Polling"
          right="Input.is_action_pressed is polling. Fine for hold-to-run. Use a signal for one-shot UI and timers."
        />
        <p>
          Instancing a packed scene is Godot’s spawn. Groups are tags. The
          animation player is a node you point at other nodes’ properties.
          If you already know Unity: GameObject plus components maps to a
          small node tree. C# MonoBehaviour maps to a GDScript that extends
          the root node. Prefab maps to a saved scene.
        </p>
      </section>

      <Callout title="Week-one traps" tone="warn">
        Script extends the wrong type (Sprite2D vs CharacterBody2D). Forgetting
        move_and_slide, so velocity never becomes motion. Connecting a signal
        twice in _ready and getting double jumps. Child names that do not match
        the dollar path.
      </Callout>

      <Lab
        title="A tiny jump"
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={hasSprite}
                onChange={(e) => setHasSprite(e.target.checked)}
              />
              Sprite child (you can see it)
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={hasBody}
                onChange={(e) => setHasBody(e.target.checked)}
              />
              CharacterBody2D root
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={useSignals}
                onChange={(e) => setUseSignals(e.target.checked)}
              />
              Jump from a signal (not a hold)
            </label>
            <Slider
              label="Move speed"
              value={speed}
              min={60}
              max={320}
              step={10}
              onChange={setSpeed}
            />
            <button
              type="button"
              className="btn"
              onClick={() => setJump((v) => !v)}
            >
              {jump ? "Reset jump" : "Fire jump"}
            </button>
            <div className="stat-row">
              <Stat label="Visible" value={hasSprite ? "Yes" : "Invisible body"} />
              <Stat label="Can slide" value={hasBody ? "Yes" : "No body"} />
              <Stat label="Jump style" value={useSignals ? "Signal" : "Poll"} />
            </div>
          </>
        }
      >
        <LineChart
          series={[
            {
              values: path,
              label: hasBody ? "Height" : "No body, no move_and_slide",
            },
          ]}
          xLabel="Physics ticks"
        />
      </Lab>

      <TryThis
        items={[
          "Fire jump with a body. The arc is gravity plus one upward kick.",
          "Uncheck the body. Velocity has nowhere to go.",
          "Signal vs poll: a jump should be a press, not a hold. That is why buttons emit a signal.",
        ]}
      />

      <Quiz
        id="godot"
        questions={[
          {
            prompt: "A Godot scene is best thought of as:",
            choices: [
              "A single C# file.",
              "A tree of nodes you can save and instance.",
              "The physics server only.",
              "A replacement for art.",
            ],
            answer: 1,
            why: "The scene file is a packed node tree, close to a Unity prefab plus hierarchy.",
          },
          {
            prompt: "move_and_slide should run in:",
            choices: [
              "_ready only.",
              "_physics_process, on a CharacterBody2D.",
              "The FileSystem dock.",
              "Any node, any time, with no body.",
            ],
            answer: 1,
            why: "The body owns velocity. The physics tick applies it against colliders.",
          },
          {
            prompt: "@export on a variable means:",
            choices: [
              "The game cannot start.",
              "The Inspector can edit that value on the node.",
              "The node is hidden.",
              "Signals are disabled.",
            ],
            answer: 1,
            why: "Same idea as a public field on a Unity MonoBehaviour.",
          },
          {
            prompt: "A signal is useful when:",
            choices: [
              "You want to ask every frame if a button is down.",
              "Something happened once and other nodes should react.",
              "You need a new mesh.",
              "You are writing only shaders.",
            ],
            answer: 1,
            why: "Pressed, timeout, body_entered are events. Connect them instead of polling.",
          },
        ]}
      />
    </Chapter>
  );
}
