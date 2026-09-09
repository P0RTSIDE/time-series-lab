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

const FLOOR = 10;

export function UnityPhysics() {
  const [x, setX] = useState(30);
  const [y, setY] = useState(FLOOR);
  const [vy, setVy] = useState(0);
  const [useBody, setUseBody] = useState(true);
  const [gravity, setGravity] = useState(0.7);
  const [jumpSpeed, setJumpSpeed] = useState(8);

  const grounded = y <= FLOOR + 0.2 && vy <= 0;

  const jump = () => {
    if (useBody) {
      if (grounded) setVy(jumpSpeed);
    } else {
      setY((v) => Math.min(82, v + jumpSpeed * 2.4));
    }
  };

  const tick = () => {
    if (useBody) {
      const nextVy = vy - gravity;
      const nextY = y + nextVy;
      if (nextY <= FLOOR) {
        setY(FLOOR);
        setVy(0);
      } else {
        setY(nextY);
        setVy(nextVy);
      }
    } else {
      setY((v) => v - gravity * 4);
    }
  };

  const slide = (dir: number) => {
    setX((v) => Math.min(90, Math.max(10, v + dir * 6)));
  };

  useKeys({
    ArrowLeft: () => slide(-1),
    a: () => slide(-1),
    ArrowRight: () => slide(1),
    d: () => slide(1),
    " ": jump,
    ArrowUp: jump,
  });

  return (
    <Chapter
      kicker="Unity · U5"
      title="Bodies and collisions"
      lede="A collider is the shape. A Rigidbody is the motion. Velocity asks physics. Translate writes a new spot."
    >
      <Takeaway>
        Add a collider so things can hit. Add a Rigidbody if physics should own
        the move. Set velocity for a jump. Translate is a teleport.
      </Takeaway>

      <section className="prose">
        <Compare
          leftTitle="Rigidbody velocity"
          left="You set a speed. FixedUpdate integrates it, gravity pulls, the collider stops on the floor."
          rightTitle="transform.Translate"
          right="You pick the next point. Nothing stops you. Easy to walk through a wall or sink through a floor."
        />
        <ScriptBlock
          lang="C#"
          label="Hopper"
          lines={[
            "using UnityEngine;",
            "",
            "public class Hopper : MonoBehaviour",
            "{",
            "    public float jumpSpeed = 6f;",
            "    public bool useRigidbody = true;",
            "",
            "    Rigidbody body;",
            "",
            "    void Start()",
            "    {",
            "        body = GetComponent<Rigidbody>();",
            "    }",
            "",
            "    void Update()",
            "    {",
            "        if (!Input.GetButtonDown(\"Jump\")) return;",
            "",
            "        if (useRigidbody)",
            "        {",
            "            Vector3 v = body.velocity;",
            "            v.y = jumpSpeed;",
            "            body.velocity = v;",
            "        }",
            "        else",
            "        {",
            "            transform.Translate(0f, 1.2f, 0f);",
            "        }",
            "    }",
            "}",
          ]}
          does="On Jump, either write velocity.y and let physics carry the arc, or Translate up once. Pair this with a collider on the player and a collider on the floor. Tick useRigidbody in the Inspector."
        />
      </section>

      <Callout title="Missing pieces" tone="warn">
        A Rigidbody with no collider falls through everything. A collider with
        no Rigidbody is a static wall. Translate on a body is how jitter starts.
      </Callout>

      <Lab
        title="Jump, gravity, floor"
        explain="The player can jump. Gravity pulls it down. With Rigidbody style it lands on the floor strip. With Translate style it can sink through, which is the usual bug when you skip physics."
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={useBody}
                onChange={(e) => {
                  setUseBody(e.target.checked);
                  setY(FLOOR);
                  setVy(0);
                }}
              />
              Use Rigidbody style
            </label>
            <Slider label="Gravity" value={gravity} min={0.2} max={1.4} step={0.1} format={(v) => v.toFixed(1)} onChange={setGravity} />
            <Slider label="Jump speed" value={jumpSpeed} min={3} max={12} step={0.5} format={(v) => v.toFixed(1)} onChange={setJumpSpeed} />
            <Pad onLeft={() => slide(-1)} onRight={() => slide(1)} onAction={jump} actionLabel="Jump" />
            <button type="button" className="btn" onClick={tick}>
              Physics step
            </button>
            <div className="stat-row">
              <Stat label="Grounded" value={grounded ? "Yes" : "No"} />
              <Stat label="vy" value={useBody ? vy.toFixed(1) : "none"} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "floor", x: 50, y: 0, w: 420, h: 18, color: "#5a6570", label: "floor" },
            { id: "p", x, y: Math.max(-8, y), w: 26, h: 26, color: "#e8b07a", label: "P" },
          ]}
          caption="Rigidbody style lands on the floor. Translate style can sink through it."
        />
      </Lab>

      <TryThis
        items={[
          "Jump, then tap Physics step until you land. Velocity should hit zero on the floor.",
          "Untick Rigidbody style, Jump, then step. The cube can pass the floor.",
          "Raise gravity and jump again. The arc should get shorter.",
        ]}
      />

      <Quiz
        id="unity-physics"
        questions={[
          {
            prompt: "A Rigidbody is there so that:",
            choices: [
              "The object can be named.",
              "Physics owns the motion: velocity, gravity, and collision response.",
              "The Inspector hides all fields.",
              "Update stops running.",
            ],
            answer: 1,
            why: "Without a body, a collider is just a static shape. The body is the moving mass.",
            wrongs: [
              "The name is on the GameObject.",
              "",
              "The Inspector still shows your fields.",
              "Update still runs. Physics just uses FixedUpdate for the step.",
            ],
          },
          {
            prompt: "A collider is:",
            choices: [
              "The mesh you see, always.",
              "The shape used for hits and overlap.",
              "A replacement for C#.",
              "The audio listener.",
            ],
            answer: 1,
            why: "You can see a mesh and still have no collider. Hits use the collider, not the picture.",
            wrongs: [
              "A mesh is for drawing. You can hide a collider or use a simpler shape.",
              "",
              "C# still writes the rules.",
              "Audio is a different component.",
            ],
          },
          {
            prompt: "Setting velocity versus Translate:",
            choices: [
              "They are the same call.",
              "Velocity is a speed physics integrates. Translate writes a new position now.",
              "Translate is the only way to jump.",
              "Velocity disables gravity forever.",
            ],
            answer: 1,
            why: "Velocity asks the next physics step. Translate skips that conversation.",
            wrongs: [
              "One is a physics request. The other is a teleport.",
              "",
              "A jump is usually velocity.y on the body.",
              "Gravity still applies unless you turn it off on the body.",
            ],
          },
          {
            prompt: "Why can Translate sink through a floor?",
            choices: [
              "Floors never have colliders.",
              "You moved the Transform yourself, so the physics step did not resolve the hit.",
              "GetAxis returns a string.",
              "Start never cached the Renderer.",
            ],
            answer: 1,
            why: "Collisions are resolved when the body moves. A raw Transform write can skip that.",
            wrongs: [
              "Floors should have colliders. The move style is the issue.",
              "",
              "GetAxis is still a float.",
              "This is about motion, not color.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
