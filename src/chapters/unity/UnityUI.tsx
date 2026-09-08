import { useState } from "react";
import { Playfield } from "../../components/Playfield";
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

export function UnityUI() {
  const [score, setScore] = useState(0);

  return (
    <Chapter
      kicker="Unity · U7"
      title="Canvas and UI"
      lede="A Canvas holds buttons and text. A Button calls a public method. TMP draws the number."
    >
      <Takeaway>
        UI lives on a Canvas. Wire the Button On Click list to a public method
        on your script. That method updates a TMP text field you assigned.
      </Takeaway>

      <section className="prose">
        <p>
          World objects sit in the scene. UI sits on a Canvas so it can stick
          to the screen. A Button has an On Click list in the Inspector. You
          drop an object there, pick a public method, and a press calls it.
        </p>
        <TermList
          items={[
            {
              term: "Canvas",
              text: "The root for screen UI. Buttons and text are children of it.",
            },
            {
              term: "Button On Click",
              text: "A list of public methods to run when the player presses. No Update polling needed.",
            },
            {
              term: "TMP_Text",
              text: "TextMeshPro text. Assign it in the Inspector, then set .text in code.",
            },
          ]}
        />
        <ScriptBlock
          lang="C#"
          label="Score board"
          lines={[
            "using UnityEngine;",
            "using TMPro;",
            "",
            "public class ScoreBoard : MonoBehaviour",
            "{",
            "    public TMP_Text scoreLabel;",
            "    int score;",
            "",
            "    void Start()",
            "    {",
            "        score = 0;",
            "        Refresh();",
            "    }",
            "",
            "    public void AddPoint()",
            "    {",
            "        score += 1;",
            "        Refresh();",
            "    }",
            "",
            "    void Refresh()",
            "    {",
            "        scoreLabel.text = \"Score: \" + score;",
            "    }",
            "}",
          ]}
          does="Start zeros the score and writes the label. AddPoint is public so a Button On Click can call it. Each press adds one and refreshes the TMP text. Assign scoreLabel in the Inspector."
        />
      </section>

      <Callout title="Private methods stay hidden" tone="note">
        On Click can only see public methods. If AddPoint is private, the
        Button cannot pick it.
      </Callout>

      <Lab
        title="A button that writes the score"
        controls={
          <>
            <button type="button" className="btn" onClick={() => setScore((n) => n + 1)}>
              Score +1
            </button>
            <button type="button" className="btn" onClick={() => setScore(0)}>
              Reset
            </button>
            <div className="stat-row">
              <Stat label="score field" value={String(score)} />
              <Stat label="TMP text" value={`Score: ${score}`} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "panel", x: 50, y: 36, w: 120, h: 48, color: "#d8c48a", label: `Score: ${score}` },
            { id: "hint", x: 50, y: 12, w: 88, h: 22, color: "#8aa0b4", label: "Canvas" },
          ]}
          caption="The button stands in for On Click. The panel stands in for TMP text on a Canvas."
        />
      </Lab>

      <TryThis
        items={[
          "Press Score +1 three times. The panel text should match the field.",
          "Reset. The label should return to Score: 0, like Start calling Refresh.",
          "Imagine the method is private. The Button list would not offer it.",
        ]}
      />

      <Quiz
        id="unity-ui"
        questions={[
          {
            prompt: "A Canvas is:",
            choices: [
              "A physics material.",
              "The root object that holds screen UI such as buttons and text.",
              "Another name for a Rigidbody.",
              "A scene-loading API.",
            ],
            answer: 1,
            why: "UI children sit under a Canvas so they can pin to the screen.",
            wrongs: [
              "Physics materials live on colliders.",
              "",
              "A Rigidbody is for motion, not menus.",
              "Loading scenes is SceneManager.",
            ],
          },
          {
            prompt: "A Button On Click list calls:",
            choices: [
              "Any private method on any asset.",
              "A public method you assign on a live object.",
              "FixedUpdate only.",
              "GetComponent every frame for you.",
            ],
            answer: 1,
            why: "You pick the object, then a public method such as AddPoint. One press, one call.",
            wrongs: [
              "Private methods do not show in that list.",
              "",
              "On Click is event wiring, not the physics loop.",
              "You still cache your own references in Start.",
            ],
          },
          {
            prompt: "TMP_Text is used to:",
            choices: [
              "Play a jump sound.",
              "Show a string on the UI, such as a score.",
              "Spawn prefabs.",
              "Set gravity.",
            ],
            answer: 1,
            why: "You assign the text component, then write scoreLabel.text when the number changes.",
            wrongs: [
              "Sound is AudioSource.",
              "",
              "Spawning is Instantiate.",
              "Gravity is on the physics body or project settings.",
            ],
          },
          {
            prompt: "Why make AddPoint public?",
            choices: [
              "So Time.deltaTime can see it.",
              "So the Button On Click menu can list it and call it.",
              "So the mesh becomes a collider.",
              "So DontDestroyOnLoad runs automatically.",
            ],
            answer: 1,
            why: "The Inspector event list only offers public methods. That is the hook.",
            wrongs: [
              "deltaTime does not care about method access.",
              "",
              "Colliders are components, not method scopes.",
              "DontDestroyOnLoad is a SceneManager topic, and it is a call you write.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
