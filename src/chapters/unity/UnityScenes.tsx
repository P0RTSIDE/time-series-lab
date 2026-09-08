import { useState } from "react";
import { Playfield } from "../../components/Playfield";
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

export function UnityScenes() {
  const [room, setRoom] = useState<"A" | "B">("A");
  const [score, setScore] = useState(0);

  const isA = room === "A";
  const floor = isA ? "#2f6f6a" : "#7a4a32";
  const prop = isA ? "#d8c48a" : "#c9a0d4";

  return (
    <Chapter
      kicker="Unity · U8"
      title="Scenes and game state"
      lede="LoadScene swaps the whole room. DontDestroyOnLoad keeps a score object alive through that swap."
    >
      <Takeaway>
        A scene is a whole place: menu, room, or round. Loading another scene
        throws away objects unless you mark one to survive.
      </Takeaway>

      <section className="prose">
        <TermList
          items={[
            {
              term: "SceneManager.LoadScene",
              text: "Close the current scene and open another by name. Add that scene to Build Settings.",
            },
            {
              term: "DontDestroyOnLoad",
              text: "Keep this object when the scene changes. Use it for score, lives, or a music player.",
            },
          ]}
        />
        <Compare
          leftTitle="Object in the room"
          left="Dies with the scene. Fine for a door, a chair, or a local enemy."
          rightTitle="Object marked to survive"
          right="Still there after LoadScene. Fine for a GameState that holds score."
        />
        <ScriptBlock
          lang="C#"
          label="Door and a kept score"
          lines={[
            "using UnityEngine;",
            "using UnityEngine.SceneManagement;",
            "",
            "public class GameState : MonoBehaviour",
            "{",
            "    public static GameState Instance;",
            "    public int score;",
            "",
            "    void Awake()",
            "    {",
            "        if (Instance != null)",
            "        {",
            "            Destroy(gameObject);",
            "            return;",
            "        }",
            "        Instance = this;",
            "        DontDestroyOnLoad(gameObject);",
            "    }",
            "}",
            "",
            "public class Door : MonoBehaviour",
            "{",
            "    public string nextScene = \"RoomB\";",
            "",
            "    public void Enter()",
            "    {",
            "        SceneManager.LoadScene(nextScene);",
            "    }",
            "}",
          ]}
          does="GameState keeps one score object across loads. A second copy destroys itself. Door.Enter loads RoomB. Hook Enter to a UI Button, or call it when the player touches a trigger. Put GameState in the first scene you play."
        />
      </section>

      <Callout title="Two GameState objects" tone="warn">
        If both rooms contain a GameState, the new one should destroy itself.
        That is the Instance check. Otherwise you get two scores.
      </Callout>

      <Lab
        title="Two rooms, one score"
        controls={
          <>
            <button type="button" className="btn" onClick={() => setScore((n) => n + 1)}>
              Collect (+1)
            </button>
            <button type="button" className="btn" onClick={() => setRoom(isA ? "B" : "A")}>
              Door to Room {isA ? "B" : "A"}
            </button>
            <div className="stat-row">
              <Stat label="Scene" value={`Room ${room}`} />
              <Stat label="Score (kept)" value={String(score)} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "floor", x: 50, y: 0, w: 420, h: 22, color: floor, label: `Room ${room}` },
            { id: "prop", x: isA ? 28 : 72, y: 28, w: 36, h: 36, color: prop, label: isA ? "lamp" : "vase" },
            { id: "door", x: isA ? 78 : 22, y: 20, w: 28, h: 40, color: "#c4b08a", label: "door" },
            { id: "p", x: 50, y: 20, w: 26, h: 26, color: "#e8b07a", label: "P" },
            { id: "hud", x: 50, y: 78, w: 90, h: 24, color: "#d8c48a", label: `Score ${score}` },
          ]}
          caption="The door swaps the room colors and props. The score number stays, like DontDestroyOnLoad."
        />
      </Lab>

      <TryThis
        items={[
          "Collect twice, then use the door. The room changes. The score should still be 2.",
          "Walk the door back. Room A returns. Score still held.",
          "Imagine score lived only on a Room A object. Loading B would wipe it.",
        ]}
      />

      <Quiz
        id="unity-scenes"
        questions={[
          {
            prompt: "SceneManager.LoadScene(\"RoomB\") will:",
            choices: [
              "Tint the current objects without unloading them.",
              "Unload the current scene and open RoomB.",
              "Instantiate a prefab named RoomB only.",
              "Pause Time.deltaTime forever.",
            ],
            answer: 1,
            why: "A scene load is a full swap. Objects not marked to survive are gone.",
            wrongs: [
              "Tinting is a material change. LoadScene replaces the scene.",
              "",
              "Instantiate copies a prefab into the current scene.",
              "Time still runs in the new scene.",
            ],
          },
          {
            prompt: "DontDestroyOnLoad(gameObject) is for:",
            choices: [
              "Hiding the Hierarchy.",
              "Keeping that object when a new scene loads.",
              "Drawing a Canvas.",
              "Reading Horizontal.",
            ],
            answer: 1,
            why: "Score, lives, and music often live on one object that outlasts the room.",
            wrongs: [
              "The Hierarchy still lists it.",
              "",
              "A Canvas is UI. It dies with the scene unless you mark it too.",
              "Input names are unrelated.",
            ],
          },
          {
            prompt: "A score on a normal room object, after LoadScene, is:",
            choices: [
              "Copied automatically.",
              "Gone, because that object was unloaded with the old scene.",
              "Stored in the camera forever.",
              "Converted into a prefab.",
            ],
            answer: 1,
            why: "Unload deletes the old objects. Keep score on a DontDestroyOnLoad object.",
            wrongs: [
              "Nothing copies it unless you write that.",
              "",
              "The camera in the old scene is unloaded too.",
              "Prefabs do not save a live score by themselves.",
            ],
          },
          {
            prompt: "The Instance check on GameState exists so that:",
            choices: [
              "Update runs twice as fast.",
              "A second GameState from the next scene destroys itself, and you keep one score.",
              "Buttons become private.",
              "Colliders turn off.",
            ],
            answer: 1,
            why: "Each scene might include a GameState. Only the first one should survive.",
            wrongs: [
              "The check is about copies, not frame rate.",
              "",
              "Method access is unrelated.",
              "Physics components are unrelated.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
