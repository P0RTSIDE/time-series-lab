import { useState } from "react";
import { Playfield } from "../../components/Playfield";
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

export function UnityCsharp() {
  const [isAngry, setIsAngry] = useState(false);
  const [angryScale, setAngryScale] = useState(1.4);

  const size = isAngry ? Math.round(28 * angryScale) : 28;
  const color = isAngry ? "#d45a4a" : "#6ec8c4";

  return (
    <Chapter
      kicker="Unity · U2"
      title="C# you will write"
      lede="Public fields, methods, Start, and if/else. The pieces Unity already knows how to call."
    >
      <Takeaway>
        A script is a class on an object. Public fields show in the Inspector.
        Start runs once, so cache GetComponent there, then let if/else pick a
        look each frame.
      </Takeaway>

      <section className="prose">
        <p>
          Unity scripts inherit from MonoBehaviour. You name the class, then
          add fields and methods. Unity calls Start and Update for you. You
          write the rest.
        </p>
        <TermList
          items={[
            {
              term: "Public field",
              text: "A number, bool, or color the Inspector can edit. Change isAngry without opening the script.",
            },
            {
              term: "Method",
              text: "A named action, like void Paint(). Call it from Update, a button, or another script.",
            },
            {
              term: "void Start()",
              text: "Runs once when the object wakes. Grab the Renderer here. Do not call GetComponent every frame.",
            },
            {
              term: "if / else",
              text: "Pick one branch. If the bool is true, use the angry look. Else, use the calm look.",
            },
          ]}
        />
        <ScriptBlock
          lang="C#"
          label="Cube mood"
          lines={[
            "using UnityEngine;",
            "",
            "public class CubeMood : MonoBehaviour",
            "{",
            "    public bool isAngry = false;",
            "    public Color calmColor = Color.cyan;",
            "    public Color angryColor = Color.red;",
            "    public float angryScale = 1.4f;",
            "",
            "    Renderer rend;",
            "",
            "    void Start()",
            "    {",
            "        rend = GetComponent<Renderer>();",
            "    }",
            "",
            "    void Update()",
            "    {",
            "        if (isAngry)",
            "        {",
            "            rend.material.color = angryColor;",
            "            transform.localScale = Vector3.one * angryScale;",
            "        }",
            "        else",
            "        {",
            "            rend.material.color = calmColor;",
            "            transform.localScale = Vector3.one;",
            "        }",
            "    }",
            "}",
          ]}
          does="Once, cache the Renderer. Each frame, if isAngry is on, paint red and grow. Else paint cyan and stay normal size. Tick the box in the Inspector to flip the look."
        />
      </section>

      <Callout title="Week-one trap" tone="warn">
        GetComponent inside Update works, but it asks the same question sixty
        times a second. Ask once in Start and keep the answer.
      </Callout>

      <Lab
        title="A public bool on a cube"
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={isAngry}
                onChange={(e) => setIsAngry(e.target.checked)}
              />
              isAngry (public field)
            </label>
            <Slider
              label="angryScale"
              value={angryScale}
              min={1}
              max={2.2}
              step={0.1}
              format={(v) => v.toFixed(1)}
              onChange={setAngryScale}
            />
            <div className="stat-row">
              <Stat label="Branch" value={isAngry ? "if" : "else"} />
              <Stat label="Size" value={`${size} px`} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[{ id: "cube", x: 50, y: 28, w: size, h: size, color, label: "C" }]}
          caption="The bool picks color. The scale field picks size only on the angry branch."
        />
      </Lab>

      <TryThis
        items={[
          "Tick isAngry. The cube should jump to the if branch: red and larger.",
          "Drag angryScale while angry is on. The else branch ignores that number.",
          "Untick the bool. Color and size snap back. Same script, other branch.",
        ]}
      />

      <Quiz
        id="unity-csharp"
        questions={[
          {
            prompt: "A public field on a MonoBehaviour is useful because:",
            choices: [
              "It hides the value from the Inspector.",
              "The Inspector can edit it on the object without opening the script.",
              "Unity will never call Start.",
              "It replaces the Transform.",
            ],
            answer: 1,
            why: "Public fields are the knobs. Designers (and you) tweak them on the object.",
            wrongs: [
              "Private fields stay hidden. Public is the one that shows.",
              "",
              "Start still runs. Fields do not cancel Unity messages.",
              "Transform is always there. A field is just data on your script.",
            ],
          },
          {
            prompt: "Why cache GetComponent in Start?",
            choices: [
              "Start never runs, so it is a safe place to hide bugs.",
              "So you ask once, then reuse the reference in Update.",
              "GetComponent only works inside Start.",
              "It turns the object into a prefab.",
            ],
            answer: 1,
            why: "Start is the once. Update is the loop. Keep the Renderer in a field.",
            wrongs: [
              "Start runs when the object wakes. That is why we cache there.",
              "",
              "GetComponent works from any method. Start is just the right time.",
              "Prefabs are saved objects. Caching a component is unrelated.",
            ],
          },
          {
            prompt: "if (isAngry) { ... } else { ... } means:",
            choices: [
              "Both blocks run every frame.",
              "Exactly one block runs, based on the bool.",
              "The else runs first.",
              "Unity ignores the bool.",
            ],
            answer: 1,
            why: "A bool is a fork. True takes the first block. False takes else.",
            wrongs: [
              "if/else is a choice, not a stack of both.",
              "",
              "The if is tested first. else is the fallback.",
              "The bool is the whole point of the test.",
            ],
          },
          {
            prompt: "A method is:",
            choices: [
              "A named action you can call, such as void Paint().",
              "The same thing as a scene.",
              "Only allowed on the camera.",
              "A replacement for the Inspector.",
            ],
            answer: 0,
            why: "Methods are verbs. Fields are nouns. Update is a method Unity calls for you.",
            wrongs: [
              "",
              "A scene is a level or menu. A method lives inside a class.",
              "Any script on any object can have methods.",
              "The Inspector edits fields. Methods run when something calls them.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
