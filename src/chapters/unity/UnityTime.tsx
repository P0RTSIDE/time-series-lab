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

export function UnityTime() {
  const [x, setX] = useState(18);
  const [speed, setSpeed] = useState(4);
  const [useDelta, setUseDelta] = useState(true);

  const step = useDelta ? speed * 0.016 * 8 : speed * 2.4;

  const move = (dir: number) => {
    setX((v) => Math.min(90, Math.max(8, v + dir * step)));
  };

  useKeys({
    ArrowLeft: () => move(-1),
    a: () => move(-1),
    ArrowRight: () => move(1),
    d: () => move(1),
  });

  return (
    <Chapter
      kicker="Unity · U3"
      title="Time and the two loops"
      lede="Update paints frames. FixedUpdate steps physics. Time.deltaTime turns a frame into seconds."
    >
      <Takeaway>
        Move in Update with Time.deltaTime so speed is units per second. Put
        forces in FixedUpdate so collisions share one clock.
      </Takeaway>

      <section className="prose">
        <p>
          A fast machine draws more frames. If you add 4 to position every
          Update, that machine races ahead. Multiply by Time.deltaTime (seconds
          since the last Update) and 4 means 4 units per second on every
          machine.
        </p>
        <Compare
          leftTitle="void Update()"
          left="Every displayed frame. Input, animation, UI, most motion you write by hand."
          rightTitle="void FixedUpdate()"
          right="The physics clock. Rigidbody velocity, AddForce, anything colliders must agree on."
        />
        <ScriptBlock
          lang="C#"
          label="A timed step"
          lines={[
            "using UnityEngine;",
            "",
            "public class TimedMover : MonoBehaviour",
            "{",
            "    public float speed = 4f;",
            "    public bool useDeltaTime = true;",
            "    public bool useFixedUpdate = false;",
            "",
            "    void Update()",
            "    {",
            "        if (!useFixedUpdate) Step();",
            "    }",
            "",
            "    void FixedUpdate()",
            "    {",
            "        if (useFixedUpdate) Step();",
            "    }",
            "",
            "    void Step()",
            "    {",
            "        float step = speed;",
            "        if (useDeltaTime)",
            "        {",
            "            step *= Time.deltaTime;",
            "        }",
            "        transform.Translate(step, 0f, 0f);",
            "    }",
            "}",
          ]}
          does="Each chosen loop, slide right. With useDeltaTime on, speed is units per second. Off, speed is units per frame, so a fast machine jumps farther. Time.deltaTime inside FixedUpdate is the physics step length."
        />
      </section>

      <Callout title="Two clocks" tone="note">
        Update can stutter when the frame rate dips. FixedUpdate stays even.
        That is why a jump that uses velocity feels steadier in FixedUpdate.
      </Callout>

      <Lab
        title="One press, two step sizes"
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={useDelta}
                onChange={(e) => setUseDelta(e.target.checked)}
              />
              Multiply by deltaTime
            </label>
            <Slider
              label="Speed"
              value={speed}
              min={1}
              max={10}
              step={0.5}
              format={(v) => v.toFixed(1)}
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
          actors={[{ id: "box", x, y: 22, w: 30, h: 30, color: "#c9a36a", label: "B" }]}
          caption="Untick deltaTime. The same speed number now jumps the box."
        />
      </Lab>

      <TryThis
        items={[
          "Leave deltaTime on and tap Right a few times. The box creeps.",
          "Untick the box and tap Right once. Same speed, a much bigger hop.",
          "Raise speed with deltaTime off. Each press is a teleport.",
        ]}
      />

      <Quiz
        id="unity-time"
        questions={[
          {
            prompt: "Time.deltaTime is:",
            choices: [
              "The name of the current scene.",
              "Seconds since the last Update (or the physics step, inside FixedUpdate).",
              "A bool that freezes input.",
              "The object’s mass.",
            ],
            answer: 1,
            why: "A slow frame lasts longer. Multiply motion by that duration so speed stays honest.",
            wrongs: [
              "Scene names are strings you pass to LoadScene.",
              "",
              "deltaTime does not lock input. It scales a step.",
              "Mass lives on a Rigidbody, not on Time.",
            ],
          },
          {
            prompt: "Update is the usual home for:",
            choices: [
              "Rigidbody forces only.",
              "Input, animation, and most frame-based gameplay.",
              "Importing art.",
              "Saving a prefab.",
            ],
            answer: 1,
            why: "Update matches what the player sees. Read keys here. Drive physics next door.",
            wrongs: [
              "Forces belong in FixedUpdate so the physics clock owns them.",
              "",
              "Art is an asset. Update is a runtime loop.",
              "Prefabs are saved in the editor, not inside Update.",
            ],
          },
          {
            prompt: "If you skip Time.deltaTime in Update, a faster machine will:",
            choices: [
              "Move the same distance per second.",
              "Take more steps per second, so the object jumps farther over time.",
              "Never call Start.",
              "Disable the camera.",
            ],
            answer: 1,
            why: "More frames means more additions. That is the units-per-frame bug.",
            wrongs: [
              "Same distance per second is what deltaTime is for.",
              "",
              "Start still runs once. This bug is about the loop.",
              "The camera is unrelated to frame-scaled motion.",
            ],
          },
          {
            prompt: "FixedUpdate exists so that:",
            choices: [
              "UI text can blink.",
              "Physics steps on a steady clock that collisions can share.",
              "Scripts stop inheriting MonoBehaviour.",
              "GetAxis returns a string.",
            ],
            answer: 1,
            why: "Colliders need a fixed step. Put velocity and forces there.",
            wrongs: [
              "UI can live in Update. FixedUpdate is for physics.",
              "",
              "Your class still extends MonoBehaviour.",
              "GetAxis still returns a float.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
