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

const FLOOR = 10;

export function GodotBodies() {
  const [x, setX] = useState(36);
  const [y, setY] = useState(FLOOR);
  const [onFloor, setOnFloor] = useState(true);
  const [hasBody, setHasBody] = useState(true);

  const walk = (dir: number) => {
    if (!hasBody) return;
    setX((v) => Math.min(88, Math.max(10, v + dir * 7)));
  };

  const jump = () => {
    if (!hasBody || !onFloor) return;
    let vy = 6.4;
    setOnFloor(false);
    const tick = () => {
      setY((cur) => {
        vy -= 0.55;
        const next = cur + vy;
        if (next <= FLOOR) {
          setOnFloor(true);
          return FLOOR;
        }
        window.setTimeout(tick, 28);
        return next;
      });
    };
    tick();
  };

  useKeys({
    ArrowLeft: () => walk(-1),
    a: () => walk(-1),
    ArrowRight: () => walk(1),
    d: () => walk(1),
    ArrowUp: jump,
    w: jump,
    " ": jump,
  });

  return (
    <Chapter
      kicker="Godot · G5"
      title="Bodies and collisions"
      lede="CharacterBody2D owns velocity. move_and_slide applies it. is_on_floor says you can jump."
    >
      <Takeaway>
        Write velocity, then call move_and_slide. Godot resolves walls and the
        floor. Without a body, that velocity has nowhere to go.
      </Takeaway>

      <section className="prose">
        <p>
          You set velocity each physics tick. move_and_slide turns that vector
          into motion and stops you on the floor. A CollisionShape2D child is
          the hit box.
        </p>
        <TermList
          items={[
            {
              term: "velocity",
              text: "Pixels per second you intend. x for walk, y for jump and gravity.",
            },
            {
              term: "move_and_slide",
              text: "Applies velocity, slides along walls, and updates is_on_floor.",
            },
            {
              term: "is_on_floor",
              text: "True after a slide that hit a floor. Gate your jump on this.",
            },
          ]}
        />
        <Compare
          leftTitle="CharacterBody2D"
          left="You write velocity. Best for a player you steer. move_and_slide lives here."
          rightTitle="RigidBody2D"
          right="Physics owns the motion. Good for crates and balls. Do not also call move_and_slide."
        />
        <ScriptBlock
          lang="GDScript"
          label="Walk, gravity, jump"
          lines={[
            "extends CharacterBody2D",
            "",
            "@export var speed: float = 200.0",
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
          does="Each physics tick, set walk speed, add gravity while airborne, jump only from the floor, then let the body slide against colliders."
        />
      </section>

      <Callout title="Week-one trap" tone="warn">
        Skip move_and_slide and velocity stays a wish. Skip is_on_floor and jump fires in midair.
      </Callout>

      <Lab
        title="Jump, gravity, floor"
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={hasBody}
                onChange={(e) => setHasBody(e.target.checked)}
              />
              CharacterBody2D (can slide)
            </label>
            <Pad onLeft={() => walk(-1)} onRight={() => walk(1)} onAction={jump} actionLabel="Jump" />
            <div className="stat-row">
              <Stat label="On floor" value={onFloor ? "Yes" : "No"} />
              <Stat label="Body" value={hasBody ? "Slide" : "None"} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "floor", x: 50, y: 0, w: 420, h: 16, color: "#4a7a8c", label: "Floor" },
            { id: "p", x, y, w: 28, h: 28, color: hasBody ? "#7eb6e8" : "#3d5a6a", label: "P" },
          ]}
          caption="Jump from the floor. Untick the body and the same press does nothing."
        />
      </Lab>

      <TryThis
        items={[
          "Jump with a body. The arc is one upward kick, then gravity, then a land.",
          "Walk at the peak of a jump. You still slide, you just are not on the floor.",
          "Untick the body and press Jump. Velocity has no move_and_slide, so nothing moves.",
        ]}
      />

      <Quiz
        id="godot-bodies"
        questions={[
          {
            prompt: "move_and_slide should run in:",
            choices: [
              "_ready only.",
              "_physics_process, on a CharacterBody2D.",
              "The Inspector, as a checkbox.",
              "Any node, with no body attached.",
            ],
            answer: 1,
            why: "The body owns velocity. The physics tick applies it against colliders.",
            wrongs: [
              "_ready is once. Sliding is every physics tick.",
              "",
              "The Inspector edits exports. The method still has to run in code.",
              "A Sprite2D has no velocity. The method belongs on the body.",
            ],
          },
          {
            prompt: "is_on_floor is true when:",
            choices: [
              "You set velocity.y by hand to zero.",
              "The last move_and_slide hit a floor collider.",
              "The scene has any StaticBody2D, anywhere.",
              "You exported a bool named floor.",
            ],
            answer: 1,
            why: "The flag is a result of the slide, not a guess. Gate jump on it.",
            wrongs: [
              "Zeroing y does not mean you landed. The slide reports the floor.",
              "",
              "A floor in another room does not count. Only what you just hit.",
              "An export is a knob. is_on_floor is computed.",
            ],
          },
          {
            prompt: "Gravity belongs in _physics_process because:",
            choices: [
              "UI text needs it.",
              "It changes velocity, and the body should step on the physics clock.",
              "delta is always zero there.",
              "Signals cannot connect otherwise.",
            ],
            answer: 1,
            why: "Add to velocity.y each physics tick, then slide. Collisions stay consistent.",
            wrongs: [
              "Labels do not fall. Gravity is a body concern.",
              "",
              "delta is the physics step length, not zero.",
              "Signals connect in _ready. Gravity is unrelated.",
            ],
          },
          {
            prompt: "A CollisionShape2D child is there so that:",
            choices: [
              "The body has a hit box. Without it, move_and_slide has nothing to hit with.",
              "The sprite becomes a sound.",
              "_process is disabled.",
              "The Input Map clears itself.",
            ],
            answer: 0,
            why: "The body is a type. The shape is the outline. You need both.",
            wrongs: [
              "",
              "Audio is AudioStreamPlayer. The shape is collision only.",
              "_process still runs. The shape does not cancel idle frames.",
              "Input bindings stay put. Shapes do not edit the map.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
