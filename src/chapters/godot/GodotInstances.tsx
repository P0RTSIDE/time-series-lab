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

type Coin = { id: string; x: number; y: number };

export function GodotInstances() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [nextId, setNextId] = useState(1);

  const spawn = (x: number, y: number) => {
    if (coins.length >= 16) return;
    const id = `c${nextId}`;
    setNextId((n) => n + 1);
    setCoins((list) => [...list, { id, x, y }]);
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
        title="Spawn and clear"
        controls={
          <>
            <button type="button" className="btn" onClick={() => setCoins([])}>
              Clear (queue_free)
            </button>
            <div className="stat-row">
              <Stat label="Children" value={String(coins.length)} />
              <Stat label="Cap" value="16" />
            </div>
          </>
        }
      >
        <Playfield
          actors={coins.map((c) => ({
            id: c.id,
            x: c.x,
            y: c.y,
            w: 22,
            h: 22,
            color: "#7eb6e8",
            label: "C",
          }))}
          onStageClick={spawn}
          caption="Click the stage to instance a coin. Clear frees every child."
        />
      </Lab>

      <TryThis
        items={[
          "Click three times. The child count should be 3.",
          "Click Clear. The count drops to 0. That is queue_free on each copy.",
          "Fill the stage, then clear. The recipe is still there. Spawn again.",
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
