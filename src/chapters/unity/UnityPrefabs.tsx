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

type Shot = { id: string; x: number; y: number };

export function UnityPrefabs() {
  const [shots, setShots] = useState<Shot[]>([]);

  const spawn = (x: number, y: number) => {
    setShots((list) => [...list, { id: `s${list.length}-${x.toFixed(0)}-${y.toFixed(0)}`, x, y }]);
  };

  return (
    <Chapter
      kicker="Unity · U6"
      title="Prefabs and spawning"
      lede="A prefab is a saved recipe. Instantiate makes a live copy. Destroy removes one."
    >
      <Takeaway>
        Build the shot once, save it as a prefab, then spawn copies at runtime.
        Destroy them when their job is done so the scene does not fill up.
      </Takeaway>

      <section className="prose">
        <p>
          Drag an object into the Project window to make a prefab. Edit the
          prefab, and the copies can pick up the change. At runtime you do not
          place them by hand. You call Instantiate.
        </p>
        <TermList
          items={[
            {
              term: "Prefab",
              text: "A reusable object recipe: mesh, collider, script, and numbers.",
            },
            {
              term: "Instantiate",
              text: "Create a live copy at a position and rotation.",
            },
            {
              term: "Destroy",
              text: "Remove a live copy. You can pass a delay so a shot dies after two seconds.",
            },
          ]}
        />
        <Compare
          leftTitle="Place in the scene"
          left="Fine for a floor or a camera. You know it belongs in this level."
          rightTitle="Spawn from a prefab"
          right="Fine for shots, coins, and enemies. Count is unknown until the player acts."
        />
        <ScriptBlock
          lang="C#"
          label="Shooter"
          lines={[
            "using UnityEngine;",
            "",
            "public class Shooter : MonoBehaviour",
            "{",
            "    public GameObject shotPrefab;",
            "    public float life = 2f;",
            "",
            "    void Update()",
            "    {",
            "        if (!Input.GetButtonDown(\"Fire1\")) return;",
            "",
            "        GameObject shot = Instantiate(",
            "            shotPrefab,",
            "            transform.position,",
            "            transform.rotation",
            "        );",
            "        Destroy(shot, life);",
            "    }",
            "}",
          ]}
          does="On Fire1, make a copy of shotPrefab at this object’s position, then destroy that copy after life seconds. Assign the prefab in the Inspector. The original asset stays in the Project. Only the copies are live."
        />
      </section>

      <Callout title="Empty slot" tone="warn">
        If shotPrefab is none, Instantiate has nothing to copy. The field must
        point at a prefab, not an empty hole.
      </Callout>

      <Lab
        title="Click to instantiate"
        explain="Click the dark stage to spawn a shot copy. Each click is like Instantiate. Clear destroys every live copy. The count is how many you made."
        controls={
          <>
            <button type="button" className="btn" onClick={() => setShots([])}>
              Destroy all
            </button>
            <div className="stat-row">
              <Stat label="Shots" value={String(shots.length)} />
              <Stat label="Prefab" value="shot" />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "gun", x: 12, y: 16, w: 30, h: 22, color: "#8aa0b4", label: "gun" },
            ...shots.map((s) => ({
              id: s.id,
              x: s.x,
              y: s.y,
              w: 16,
              h: 16,
              color: "#e8c36a",
              label: "•",
            })),
          ]}
          onStageClick={spawn}
          caption="Click the stage to spawn. Clear removes every live copy. The count is how many Instantiate calls you made."
        />
      </Lab>

      <TryThis
        items={[
          "Click four times. The shot count should be 4.",
          "Click Destroy all. Instantiated copies go away. The gun stays.",
          "Spawn again after a clear. New ids, same recipe. That is a prefab.",
        ]}
      />

      <Quiz
        id="unity-prefabs"
        questions={[
          {
            prompt: "A prefab is:",
            choices: [
              "A lighting preset only.",
              "A saved, reusable object recipe you can spawn many times.",
              "The Game view.",
              "A replacement for Update.",
            ],
            answer: 1,
            why: "Edit the recipe once. Instantiate makes live copies when you need them.",
            wrongs: [
              "Lights can live on a prefab, but the prefab is the whole object.",
              "",
              "Game view is what the player sees.",
              "Update still runs on scripts attached to copies.",
            ],
          },
          {
            prompt: "Instantiate does what at runtime?",
            choices: [
              "Deletes the original prefab asset.",
              "Creates a live copy of the prefab in the open scene.",
              "Locks the Inspector.",
              "Loads a new Unity project.",
            ],
            answer: 1,
            why: "The asset stays in the Project. The copy is the one that moves and collides.",
            wrongs: [
              "The source prefab remains. You are cloning, not deleting.",
              "",
              "The Inspector still works.",
              "You stay in the same project and usually the same scene.",
            ],
          },
          {
            prompt: "Destroy(shot, 2f) means:",
            choices: [
              "The prefab asset is gone forever.",
              "That live copy is removed after two seconds.",
              "Time.deltaTime becomes 2.",
              "The camera is disabled.",
            ],
            answer: 1,
            why: "Destroy targets an instance. The delay keeps the shot on screen briefly.",
            wrongs: [
              "Destroying an instance does not delete the prefab asset.",
              "",
              "deltaTime is still the frame length.",
              "The camera is a different object.",
            ],
          },
          {
            prompt: "You reach for a prefab when:",
            choices: [
              "The object must exist exactly once and never move, like a named manager you placed.",
              "You need many of the same thing, and you do not know the count until play.",
              "You want to turn off gravity for the whole project.",
              "You are renaming the scene.",
            ],
            answer: 1,
            why: "Shots, enemies, pickups: same recipe, unknown count. That is Instantiate.",
            wrongs: [
              "A one-off you placed can stay in the scene. No need to spawn it.",
              "",
              "Gravity is a physics setting, not a prefab job.",
              "Scene names are unrelated to spawning copies.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
