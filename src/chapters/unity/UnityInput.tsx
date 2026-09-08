import { useState } from "react";
import { Pad, Playfield, useKeys } from "../../components/Playfield";
import {
  Callout,
  Chapter,
  Lab,
  Quiz,
  ScriptBlock,
  Stat,
  Takeaway,
  TermList,
  TryThis,
} from "../../components/UI";

export function UnityInput() {
  const [x, setX] = useState(50);
  const [y, setY] = useState(28);
  const [axisX, setAxisX] = useState(0);
  const [axisY, setAxisY] = useState(0);
  const [jumped, setJumped] = useState(false);

  const nudge = (dx: number, dy: number) => {
    setAxisX(dx);
    setAxisY(dy);
    setX((v) => Math.min(92, Math.max(8, v + dx * 7)));
    setY((v) => Math.min(72, Math.max(8, v + dy * 7)));
    if (dx !== 0 || dy !== 0) setJumped(false);
  };

  const jump = () => {
    setJumped(true);
    setY((v) => Math.min(72, v + 10));
  };

  useKeys({
    ArrowLeft: () => nudge(-1, 0),
    a: () => nudge(-1, 0),
    ArrowRight: () => nudge(1, 0),
    d: () => nudge(1, 0),
    ArrowUp: () => nudge(0, 1),
    w: () => nudge(0, 1),
    ArrowDown: () => nudge(0, -1),
    s: () => nudge(0, -1),
    " ": jump,
  });

  return (
    <Chapter
      kicker="Unity · U4"
      title="Reading input"
      lede="Axes return a float. Buttons fire for one frame. The names must match the Input Manager."
    >
      <Takeaway>
        Input.GetAxis reads a named stick or key pair as a number, usually
        from -1 to 1. GetButtonDown is true only on the press, not the hold.
      </Takeaway>

      <section className="prose">
        <p>
          The old Input Manager maps names to keys. Horizontal is A/D and the
          left stick. Jump is Space by default. Fire1 is the left mouse button.
          If your string does not match a name in that list, you get silence.
        </p>
        <TermList
          items={[
            {
              term: "GetAxis(\"Horizontal\")",
              text: "A smoothed float. Negative is left, positive is right, zero is idle.",
            },
            {
              term: "GetAxisRaw",
              text: "Same names, no smoothing. Useful when you want a hard -1, 0, or 1.",
            },
            {
              term: "GetButtonDown(\"Jump\")",
              text: "True on the first frame of the press. Good for a hop, not a hold.",
            },
            {
              term: "GetButton",
              text: "True for every frame the button stays down. Good for hold-to-run.",
            },
          ]}
        />
        <ScriptBlock
          lang="C#"
          label="Axis walker"
          lines={[
            "using UnityEngine;",
            "",
            "public class AxisWalker : MonoBehaviour",
            "{",
            "    public float speed = 6f;",
            "",
            "    void Update()",
            "    {",
            "        float x = Input.GetAxis(\"Horizontal\");",
            "        float y = Input.GetAxis(\"Vertical\");",
            "        transform.Translate(x * speed * Time.deltaTime, y * speed * Time.deltaTime, 0f);",
            "",
            "        if (Input.GetButtonDown(\"Jump\"))",
            "        {",
            "            Debug.Log(\"Jump pressed, axis X was \" + x);",
            "        }",
            "    }",
            "}",
          ]}
          does="Each frame, read the Horizontal and Vertical axes, then slide. Jump logs once per press. Those three strings must exist in the Input Manager."
        />
      </section>

      <Callout title="Name mismatch" tone="warn">
        The name jump is not the same as Jump. The string is case sensitive.
        Open the Input Manager and copy the name you see.
      </Callout>

      <Lab
        title="Keys, pad, and the axis number"
        controls={
          <>
            <Pad
              onLeft={() => nudge(-1, 0)}
              onRight={() => nudge(1, 0)}
              onUp={() => nudge(0, 1)}
              onAction={jump}
              actionLabel="Jump"
            />
            <button type="button" className="btn" onClick={() => { setAxisX(0); setAxisY(0); setJumped(false); }}>
              Release (axis to 0)
            </button>
            <div className="stat-row">
              <Stat label="Horizontal" value={axisX.toFixed(1)} />
              <Stat label="Vertical" value={axisY.toFixed(1)} />
              <Stat label="Jump down" value={jumped ? "True this press" : "False"} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[{ id: "p", x, y, w: 28, h: 28, color: "#e8b07a", label: "P" }]}
          caption="Arrows or WASD move. Space or Jump is GetButtonDown: one hop, not a hold."
        />
      </Lab>

      <TryThis
        items={[
          "Hold the idea of GetAxis: tap Left and read Horizontal. It should sit at -1.",
          "Press Release. The axis returns to 0, like a stick snapping back.",
          "Tap Jump twice. Each tap is a new GetButtonDown, not one long true.",
        ]}
      />

      <Quiz
        id="unity-input"
        questions={[
          {
            prompt: "Input.GetAxis(\"Horizontal\") returns:",
            choices: [
              "A scene name.",
              "A float, usually from -1 (left) to 1 (right).",
              "A prefab.",
              "True only on the first frame.",
            ],
            answer: 1,
            why: "An axis is a number. You multiply it by speed. Zero means no sideways input.",
            wrongs: [
              "Scene names are strings for LoadScene.",
              "",
              "Prefabs are objects you spawn. An axis is just a number.",
              "That one-frame trick is GetButtonDown, not GetAxis.",
            ],
          },
          {
            prompt: "GetButtonDown is the right call when:",
            choices: [
              "You want a value every frame while the key is held.",
              "You want the action only on the frame the button was pressed.",
              "You need a Rigidbody mass.",
              "You are loading art.",
            ],
            answer: 1,
            why: "A jump or a fire should happen once per press. Down is the edge, not the hold.",
            wrongs: [
              "That hold is GetButton, or GetAxis staying off zero.",
              "",
              "Mass is a Rigidbody field.",
              "Art is an asset. Input is runtime.",
            ],
          },
          {
            prompt: "If GetAxis always returns 0, check:",
            choices: [
              "Whether the string matches an Input Manager name, including capitals.",
              "Whether the camera has a Mesh Filter.",
              "Whether Time.timeScale is a color.",
              "Whether the script is a prefab asset only, never on an object.",
            ],
            answer: 0,
            why: "Unity looks up that exact name. Horizontal works. horizontal often does not.",
            wrongs: [
              "",
              "A mesh does not feed input.",
              "timeScale is a number, and it is not the usual cause of a dead axis.",
              "The script must sit on a live object, but a wrong name is the first check.",
            ],
          },
          {
            prompt: "The default name for left and right in the Input Manager is:",
            choices: [
              "Strafe",
              "Horizontal",
              "MoveX",
              "WASD",
            ],
            answer: 1,
            why: "Horizontal and Vertical ship with Unity. Jump and Fire1 do too.",
            wrongs: [
              "Strafe is not a built-in name.",
              "",
              "MoveX is a name you would add yourself.",
              "WASD are keys bound to Horizontal and Vertical, not the axis name.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
