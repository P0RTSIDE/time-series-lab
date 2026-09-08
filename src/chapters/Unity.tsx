import { useMemo, useState } from "react";
import { LineChart } from "../components/Charts";
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
  TermList,
  TryThis,
} from "../components/UI";

export function Unity() {
  const [speed, setSpeed] = useState(4);
  const [usePhysics, setUsePhysics] = useState(false);
  const [hasBody, setHasBody] = useState(true);
  const [hasScript, setHasScript] = useState(true);
  const [hasRenderer, setHasRenderer] = useState(true);

  const path = useMemo(() => {
    const n = 80;
    return Array.from({ length: n }, (_, i) => {
      const t = i / 12;
      if (!hasScript) return 0;
      const drive = Math.max(0, Math.sin(t) * speed);
      return usePhysics && hasBody ? Math.round(drive * 2) / 2 : drive;
    });
  }, [speed, usePhysics, hasBody, hasScript]);

  const can = {
    see: hasRenderer,
    move: hasScript,
    collide: hasBody,
  };

  return (
    <Chapter
      kicker="Unity · U1"
      title="Editor and objects"
      lede="First Unity lesson: the editor panes, GameObjects, and components. Nine lessons in this track. No time series here."
    >
      <Takeaway>
        Everything you see is a GameObject wearing components. A script is just
        one more component that talks to the others.
      </Takeaway>

      <section className="prose">
        <h2>The editor in three panes</h2>
        <TermList
          items={[
            {
              term: "Hierarchy",
              text: "The list of objects in the open scene: camera, light, player, floor.",
            },
            {
              term: "Scene / Game",
              text: "Scene is the edit view. Game is what the player would see.",
            },
            {
              term: "Inspector",
              text: "The selected object’s components and their numbers. Change speed here without opening the script.",
            },
            {
              term: "Project",
              text: "Your assets: art, scenes, and scripts. Drag one onto an object to attach it.",
            },
          ]}
        />
        <p>
          A GameObject is an empty named slot. It always has a Transform
          (position, rotation, scale). Everything else is optional: a mesh so
          you can see it, a collider so it can bump things, a Rigidbody so
          physics owns the motion, a script so your rules run.
        </p>

        <h2>C# you need in week one</h2>
        <p>
          Unity scripts are C# classes that inherit from MonoBehaviour. Public
          fields show up in the Inspector. Methods Unity calls for you have
          fixed names. You do not call Update yourself.
        </p>
        <ScriptBlock
          lang="C#"
          label="A first mover"
          lines={[
            "using UnityEngine;",
            "",
            "public class Mover : MonoBehaviour",
            "{",
            "    public float speed = 6f;",
            "",
            "    void Update()",
            "    {",
            "        float x = Input.GetAxis(\"Horizontal\");",
            "        transform.Translate(x * speed * Time.deltaTime, 0f, 0f);",
            "    }",
            "}",
          ]}
          does="Each picture, read the left-right stick or keys, and slide the object. Multiply by the frame duration so speed stays in units per second, not units per frame."
        />
        <TermList
          items={[
            {
              term: "void Start()",
              text: "Runs once when the object wakes. Good for grabbing references.",
            },
            {
              term: "void Update()",
              text: "Runs every displayed frame. Input, animation, UI, most gameplay feel.",
            },
            {
              term: "void FixedUpdate()",
              text: "Runs on the physics clock. Forces, Rigidbody velocity, anything collisions must agree on.",
            },
            {
              term: "Time.deltaTime",
              text: "Seconds since the last Update. Use it when you move in Update so a slow machine does not crawl.",
            },
          ]}
        />
        <Compare
          leftTitle="Move the Transform"
          left="Fine for a menu cursor or a kinematic prop. You are the one writing the new position."
          rightTitle="Move a Rigidbody"
          right="Set velocity or add a force inside FixedUpdate. Let physics resolve the step so it does not tunnel through walls."
        />
        <p>
          Prefabs are reusable objects. Edit the prefab once and every copy
          updates. Instantiating one at runtime is how you spawn bullets or
          enemies. Scenes are separate levels or menus. Load another scene when
          the round ends.
        </p>
      </section>

      <Callout title="Week-one traps" tone="warn">
        Forgetting to attach the script. Moving a Rigidbody in Update and
        watching jitter. Using GetComponent every frame instead of once in
        Start. Hard-coding Input strings that do not match the Input map.
      </Callout>

      <Lab
        title="What this object can do"
        controls={
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={hasRenderer}
                onChange={(e) => setHasRenderer(e.target.checked)}
              />
              Mesh renderer (you can see it)
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={hasBody}
                onChange={(e) => setHasBody(e.target.checked)}
              />
              Rigidbody (physics owns motion)
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={hasScript}
                onChange={(e) => setHasScript(e.target.checked)}
              />
              Mover script
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={usePhysics}
                onChange={(e) => setUsePhysics(e.target.checked)}
              />
              Drive from FixedUpdate
            </label>
            <Slider
              label="Speed"
              value={speed}
              min={0}
              max={8}
              step={0.5}
              format={(v) => v.toFixed(1)}
              onChange={setSpeed}
            />
            <div className="stat-row">
              <Stat label="Visible" value={can.see ? "Yes" : "No"} />
              <Stat label="Scripted" value={can.move ? "Yes" : "No"} />
              <Stat label="Physics body" value={can.collide ? "Yes" : "No"} />
            </div>
          </>
        }
      >
        <LineChart
          series={[
            {
              values: path,
              label: hasScript ? "Position this frame" : "No script, no motion",
            },
          ]}
          xLabel="Frames"
        />
      </Lab>

      <TryThis
        items={[
          "Uncheck the script. The object exists but nothing moves it.",
          "Turn on FixedUpdate drive. The path looks chunkier, like physics ticks.",
          "Uncheck the renderer in your head: the object can still move, you just would not see it.",
        ]}
      />

      <Quiz
        id="unity"
        questions={[
          {
            prompt: "A script in Unity is usually:",
            choices: [
              "A separate program you run beside the editor.",
              "A component on a GameObject, written as a C# MonoBehaviour.",
              "The same thing as a scene.",
              "Only allowed on the camera.",
            ],
            answer: 1,
            why: "You attach the script to an object. Unity then calls Start, Update, and friends on that instance.",
          },
          {
            prompt: "Time.deltaTime is there so that:",
            choices: [
              "Physics never runs.",
              "Motion is in units per second, not units per frame.",
              "Input is disabled.",
              "Prefabs cannot be instantiated.",
            ],
            answer: 1,
            why: "A slow frame lasts longer. Multiplying by that duration keeps speed honest.",
          },
          {
            prompt: "FixedUpdate is the usual home for:",
            choices: [
              "UI text only.",
              "Rigidbody forces and other physics-owned motion.",
              "Loading a new scene.",
              "Importing art.",
            ],
            answer: 1,
            why: "Physics steps on a fixed clock. Putting forces there keeps collisions consistent.",
          },
          {
            prompt: "A prefab is:",
            choices: [
              "A saved, reusable object recipe you can spawn many times.",
              "A lighting setting.",
              "A replacement for C#.",
              "The Game view.",
            ],
            answer: 0,
            why: "Edit the prefab, and copies can pick up the change. Instantiating it is how you spawn at runtime.",
          },
        ]}
      />
    </Chapter>
  );
}
