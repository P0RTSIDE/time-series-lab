import { useState } from "react";
import { Pad, Playfield, usePlayer } from "../../components/Playfield";
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
} from "../../components/UI";

type Spawn = {
  id: string;
  kind: "coin" | "slime";
  x: number;
  y: number;
  worth: number;
  inTree: boolean;
};

const WORTH_COLOR = ["#9fd0f2", "#7eb6e8", "#4f97d4", "#2f78b8", "#1d5c94"];

function hit(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy < 11 * 11;
}

export function GodotInstances() {
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [nextId, setNextId] = useState(1);
  const [worth, setWorth] = useState(1);
  const [kind, setKind] = useState<"coin" | "slime">("coin");
  const [parentOnSpawn, setParentOnSpawn] = useState(true);
  const [score, setScore] = useState(0);
  const [stung, setStung] = useState(0);

  const player = usePlayer({
    floor: 14,
    startX: 46,
    onMove: (nx, ny) => setSpawns((list) => resolve(nx, ny, list)),
  });

  const inTree = spawns.filter((c) => c.inTree);
  const orphans = spawns.filter((c) => !c.inTree);

  const resolve = (nx: number, ny: number, list: Spawn[]) => {
    const touched = list.filter((c) => c.inTree && hit(nx, ny, c.x, c.y));
    if (touched.length === 0) return list;
    const gained = touched.filter((c) => c.kind === "coin").reduce((s, c) => s + c.worth, 0);
    const slimes = touched.filter((c) => c.kind === "slime").length;
    if (gained) setScore((s) => s + gained);
    if (slimes) setStung((n) => n + slimes);
    const ids = new Set(touched.map((c) => c.id));
    return list.filter((c) => !ids.has(c.id));
  };

  const spawn = (x: number, y: number) => {
    if (spawns.length >= 14) return;
    if (hit(player.x, player.y, x, y)) return;
    const id = `n${nextId}`;
    setNextId((n) => n + 1);
    setSpawns((list) => [...list, { id, kind, x, y, worth, inTree: parentOnSpawn }]);
  };

  const parentOrphans = () => {
    setSpawns((list) => resolve(player.x, player.y, list.map((c) => ({ ...c, inTree: true }))));
  };

  return (
    <Chapter
      kicker="Godot · G6"
      title="Instancing scenes"
      lede="A packed scene is a reusable tree. instantiate, add_child, then queue_free when it is done."
    >
      <Takeaway>
        preload holds the recipe. instantiate makes a live copy. add_child
        puts it in the tree. queue_free removes it after the current frame.
      </Takeaway>

      <section className="prose">
        <p>
          Save a coin as its own scene. The level script loads that packed
          scene, makes a copy, sets a position, and adds it as a child. That
          is spawn. When the player grabs it, the coin frees itself.
        </p>
        <TermList
          items={[
            {
              term: "preload",
              text: "Loads the packed scene with the script. const Coin := preload(\"coin.tscn\").",
            },
            {
              term: "instantiate",
              text: "Builds a new node tree from that recipe. Each copy is its own instance.",
            },
            {
              term: "add_child",
              text: "Parents the copy so it ticks, draws, and can hear signals.",
            },
            {
              term: "queue_free",
              text: "Marks the node to leave after this frame. Safer than an instant delete mid-loop.",
            },
          ]}
        />
        <Compare
          leftTitle="One scene, many copies"
          left="Edit the coin scene once. Every instance picks up the art and the pickup script."
          rightTitle="Hand-placed duplicates"
          right="Fine for two trees. Painful for a bag of coins. Instance when the count is not known in the editor."
        />
        <ScriptBlock
          lang="GDScript"
          label="Click to spawn"
          lines={[
            "extends Node2D",
            "",
            "const Coin := preload(\"coin.tscn\")",
            "",
            "func _unhandled_input(event: InputEvent) -> void:",
            "    if event is InputEventMouseButton and event.pressed:",
            "        var coin := Coin.instantiate()",
            "        coin.position = get_global_mouse_position()",
            "        add_child(coin)",
            "",
            "func clear_coins() -> void:",
            "    for node in get_tree().get_nodes_in_group(\"coins\"):",
            "        node.queue_free()",
          ]}
          does="On a click, make a coin from the packed scene, place it at the mouse, and parent it. Clear walks the coins group and frees each one."
        />
      </section>

      <Callout title="Week-one trap" tone="warn">
        instantiate without add_child leaves a ghost. It exists in memory and
        never appears. Free the instance, or parent it.
      </Callout>

      <Lab
        title="Two packed scenes, one level"
        explain="Walk and jump are still here from the body lesson. Pick a packed scene, then click the stage to instantiate it. Coin and slime are different recipes. Worth is copied onto that instance only. Walk or jump P into a copy that was add_child'd: a coin adds its own worth and frees itself, a slime stings and frees itself. Turn add_child off and the copy is an orphan. It counts, but P cannot touch it until you parent it."
        controls={
          <>
            <div className="seg">
              <button type="button" className={kind === "coin" ? "on" : ""} onClick={() => setKind("coin")}>
                coin.tscn
              </button>
              <button type="button" className={kind === "slime" ? "on" : ""} onClick={() => setKind("slime")}>
                slime.tscn
              </button>
            </div>
            <Slider
              label="Coin worth on next copy"
              value={worth}
              min={1}
              max={5}
              step={1}
              onChange={setWorth}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={parentOnSpawn}
                onChange={(e) => setParentOnSpawn(e.target.checked)}
              />
              add_child on spawn
            </label>
            <button type="button" className="btn" onClick={parentOrphans} disabled={orphans.length === 0}>
              Parent orphans
            </button>
            <Pad
              onLeft={() => player.walk(-1)}
              onRight={() => player.walk(1)}
              onUp={player.jump}
              onAction={player.jump}
              actionLabel="Jump"
            />
            <div className="stat-row">
              <Stat label="In the tree" value={String(inTree.length)} />
              <Stat label="Orphans" value={String(orphans.length)} />
              <Stat label="Score" value={String(score)} />
              <Stat label="Stings" value={String(stung)} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "floor", x: 50, y: 0, w: 520, h: 14, color: "#4a7a8c", label: "Floor" },
            { id: "p", x: player.x, y: player.y, w: 26, h: 26, color: "#f2d48a", label: "P" },
            ...inTree.map((c) => ({
              id: c.id,
              x: c.x,
              y: c.y,
              w: c.kind === "slime" ? 30 : 22,
              h: c.kind === "slime" ? 22 : 22,
              color: c.kind === "slime" ? "#d45a4a" : WORTH_COLOR[c.worth - 1],
              label: c.kind === "slime" ? "S" : String(c.worth),
            })),
          ]}
          onStageClick={spawn}
          caption="Click empty space to instance the selected scene. Walk or jump into it. Orphans never draw."
        />
        <ul className="lab-log">
          <li>Level children: Player{inTree.length ? `, ${inTree.map((c) => (c.kind === "slime" ? "Slime" : `Coin ${c.worth}`)).join(", ")}` : ""}</li>
          <li>{orphans.length ? `${orphans.length} instantiated but not add_child'd, so they are not in that list.` : "No orphans. Every instance was parented."}</li>
        </ul>
      </Lab>

      <TryThis
        items={[
          "Spawn a worth-5 coin and a worth-1 coin. Walk into each. Score jumps by that copy, not by the slider.",
          "Switch to slime.tscn, spawn one, walk into it. Stings go up. That is a different packed scene, not a recolored coin.",
          "Turn add_child off, click twice, and walk through that spot. Nothing happens until you parent the orphans.",
          "Jump still leaves the floor and comes back down. A coin you clicked up high is only collected if you reach it.",
        ]}
      />

      <Quiz
        id="godot-instances"
        questions={[
          {
            prompt: "preload(\"coin.tscn\") is:",
            choices: [
              "A live coin already in the tree.",
              "The packed recipe you can instantiate many times.",
              "A signal named coin.",
              "The Input Map.",
            ],
            answer: 1,
            why: "preload stores the scene resource. instantiate is what makes a copy.",
            wrongs: [
              "The live node appears after instantiate and add_child.",
              "",
              "Signals are events. preload is a resource lookup.",
              "The Input Map binds actions, not scenes.",
            ],
          },
          {
            prompt: "add_child is required because:",
            choices: [
              "It saves the project.",
              "The instance only ticks and draws once it has a parent in the tree.",
              "It types the variable as float.",
              "It connects every signal in the game.",
            ],
            answer: 1,
            why: "An orphan instance sits in memory. Parenting puts it in the scene tree.",
            wrongs: [
              "Saving is an editor act. add_child is runtime.",
              "",
              "Types come from your var line. Parenting is hierarchy.",
              "You still connect signals yourself, usually in _ready.",
            ],
          },
          {
            prompt: "queue_free is safer than an instant delete because:",
            choices: [
              "It waits until the frame can let the node go.",
              "It copies the node first.",
              "It only works on Autoloads.",
              "It disables delta.",
            ],
            answer: 0,
            why: "Other code may still be using the node this frame. The queue waits.",
            wrongs: [
              "",
              "Freeing removes it. Instancing is how you copy.",
              "Any node can queue_free. Autoload is a different lifetime.",
              "delta is the frame gap. Freeing does not touch clocks.",
            ],
          },
          {
            prompt: "A packed scene is closest to:",
            choices: [
              "A reusable node tree you can instance, like a prefab.",
              "A single number export.",
              "The physics server.",
              "A replacement for GDScript.",
            ],
            answer: 0,
            why: "Save the tree once. Instance it whenever you need another coin or enemy.",
            wrongs: [
              "",
              "An export is one field. A packed scene is a whole tree.",
              "Physics runs bodies. Scenes are structure.",
              "The instance still needs its scripts. The scene is the tree.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
