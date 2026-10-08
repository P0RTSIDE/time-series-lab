import { useRef, useState } from "react";
import { Pad, Playfield, usePlayer } from "../../components/Playfield";
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
  const [coin, setCoin] = useState(true);
  const taken = useRef(false);

  const player = usePlayer({
    floor: 14,
    startX: 20,
    onMove: (nx, ny) => {
      if (taken.current) return;
      if (Math.abs(nx - 68) < 8 && ny < 32) {
        taken.current = true;
        setCoin(false);
        setScore((n) => n + 1);
      }
    },
  });

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
        explain="Walk and jump are still here. The score panel stays on the screen while you move, the way a Canvas sticks to the view. The button stands in for On Click. Walking into the coin calls the same public method."
        controls={
          <>
            <Pad
              onLeft={() => player.walk(-1)}
              onRight={() => player.walk(1)}
              onUp={player.jump}
              onAction={player.jump}
              actionLabel="Jump"
            />
            <button type="button" className="btn" onClick={() => setScore((n) => n + 1)}>
              Score +1
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setScore(0);
                taken.current = false;
                setCoin(true);
              }}
            >
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
            { id: "panel", x: 50, y: 70, w: 120, h: 36, color: "#d8c48a", label: `Score: ${score}` },
            { id: "hint", x: 18, y: 70, w: 70, h: 22, color: "#8aa0b4", label: "Canvas" },
            { id: "floor", x: 50, y: 0, w: 520, h: 12, color: "#4a7a8c", label: "" },
            ...(coin
              ? [{ id: "coin", x: 68, y: 18, w: 22, h: 22, color: "#e8c56b", label: "+1" }]
              : []),
            { id: "p", x: player.x, y: player.y, w: 24, h: 24, color: "#e8b07a", label: "P" },
          ]}
          caption="The panel stays put while you walk. The button and the coin both add to the same score."
        />
      </Lab>

      <TryThis
        items={[
          "Walk into the coin. The panel goes up by 1 and stays on screen. Jump still lands on the floor.",
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
