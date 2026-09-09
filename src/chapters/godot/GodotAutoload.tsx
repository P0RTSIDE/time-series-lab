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

export function GodotAutoload() {
  const [coins, setCoins] = useState(0);
  const [room, setRoom] = useState<"hall" | "yard">("hall");
  const [taken, setTaken] = useState({ hall: false, yard: false });

  const here = room === "hall";
  const coinOut = here ? taken.hall : taken.yard;
  const grab = () => {
    if (coinOut) return;
    setCoins((n) => n + 1);
    setTaken((t) => (here ? { ...t, hall: true } : { ...t, yard: true }));
  };

  const actors = [
    { id: "floor", x: 50, y: 0, w: 420, h: 16, color: here ? "#3d6a7a" : "#4a8aaa", label: here ? "Hall" : "Yard" },
    { id: "door", x: 82, y: 12, w: 36, h: 36, color: "#5a9ec9", label: "Door" },
    ...(coinOut
      ? []
      : [{ id: "coin", x: here ? 22 : 48, y: 14, w: 22, h: 22, color: "#7eb6e8", label: "C" }]),
  ];

  return (
    <Chapter
      kicker="Godot · G8"
      title="Autoload and groups"
      lede="A Game singleton outlives the room. Groups tag nodes. change_scene_to_file swaps the tree."
    >
      <Takeaway>
        Autoload is a node that does not die when the scene changes. Put coins
        and flags there. The room can go. The count stays.
      </Takeaway>

      <section className="prose">
        <p>
          Register a script named Game as an Autoload. It is a node the tree
          never frees on a scene change. Rooms then read Game.coins. Groups
          are tags you put on nodes, then you can find every coin at once.
        </p>
        <TermList
          items={[
            {
              term: "Autoload",
              text: "A singleton in the tree from boot. Game.coins += 1 from any room.",
            },
            {
              term: "Groups",
              text: "Tags on nodes. get_tree().get_nodes_in_group(\"coins\") is every live coin.",
            },
            {
              term: "change_scene_to_file",
              text: "Drops the current room tree and loads another. Autoloads stay.",
            },
          ]}
        />
        <Compare
          leftTitle="Room node"
          left="Dies with the scene. A var coins on the hall root resets when you enter the yard."
          rightTitle="Game autoload"
          right="Lives for the run. The yard can add a coin the hall already counted."
        />
        <ScriptBlock
          lang="GDScript"
          label="Room that uses Game"
          lines={[
            "extends Node2D",
            "",
            "func _ready() -> void:",
            "    $Label.text = str(Game.coins)",
            "    $Door.pressed.connect(_go_other)",
            "    add_to_group(\"rooms\")",
            "",
            "func _on_coin_body_entered(_body: Node2D) -> void:",
            "    Game.coins += 1",
            "    $Coin.queue_free()",
            "",
            "func _go_other() -> void:",
            "    get_tree().change_scene_to_file(\"yard.tscn\")",
          ]}
          does="Show the shared count, grab a coin into Game, then swap rooms. Game.gd is an Autoload with var coins: int = 0. The hall tree is gone. The integer is not."
        />
      </section>

      <Callout title="Week-one trap" tone="warn">
        A score on the room root looks fine until the next scene. If the number
        must survive a door, it belongs on Game, not on the hall.
      </Callout>

      <Lab
        title="Two rooms, one count"
        explain="Hall and yard are two rooms. Pick up a coin, take the door, and the count stays. That persistent number is the fake Autoload."
        controls={
          <>
            <button type="button" className="btn" onClick={() => setRoom(here ? "yard" : "hall")}>
              {here ? "Enter yard" : "Enter hall"}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setCoins(0);
                setTaken({ hall: false, yard: false });
              }}
            >
              Reset run
            </button>
            <div className="stat-row">
              <Stat label="Game.coins" value={String(coins)} />
              <Stat label="Room" value={here ? "hall" : "yard"} />
            </div>
          </>
        }
      >
        <Playfield
          actors={actors}
          onStageClick={(x) => {
            if (x > 72) setRoom(here ? "yard" : "hall");
            else grab();
          }}
          caption="Pick up the coin, then take the door. The count is the fake Autoload. It stays."
        />
      </Lab>

      <TryThis
        items={[
          "Grab the hall coin. Game.coins should be 1.",
          "Enter the yard. The hall is gone. The count is still 1.",
          "Grab the yard coin, go back. Two coins, and the hall coin stays taken.",
        ]}
      />

      <Quiz
        id="godot-autoload"
        questions={[
          {
            prompt: "An Autoload is useful for coins because:",
            choices: [
              "It deletes every scene.",
              "The node stays alive when change_scene_to_file drops the room.",
              "It replaces CollisionShape2D.",
              "It turns off groups.",
            ],
            answer: 1,
            why: "The room tree dies. Game does not. Store the count there.",
            wrongs: [
              "Scenes still load. Autoload is the part that survives them.",
              "",
              "Hit boxes stay on bodies. Autoload is shared state.",
              "Groups still tag nodes. Autoload is a different tool.",
            ],
          },
          {
            prompt: "change_scene_to_file does this to the current room:",
            choices: [
              "Keeps every node and adds the new scene beside it.",
              "Frees the current scene tree, then loads the new file. Autoloads remain.",
              "Only hides the camera.",
              "Clears the Input Map.",
            ],
            answer: 1,
            why: "The hall is gone. Anything you still need must live on Game or in a file.",
            wrongs: [
              "It is a swap, not a stack of both rooms.",
              "",
              "The whole room tree goes, not just the view.",
              "Action names stay. Only the scene nodes are replaced.",
            ],
          },
          {
            prompt: "get_nodes_in_group(\"coins\") returns:",
            choices: [
              "Every node currently in that group.",
              "The Autoload list.",
              "Only nodes that have a Sprite2D.",
              "A packed scene recipe.",
            ],
            answer: 0,
            why: "Groups are tags. Add coins to the group, then free or count them in one loop.",
            wrongs: [
              "",
              "Autoloads are registered separately. Groups are tags on any node.",
              "A group does not care about sprites. It is a name you assign.",
              "A packed scene is preload. The group is live nodes.",
            ],
          },
          {
            prompt: "A var coins on the hall root will:",
            choices: [
              "Survive entering the yard.",
              "Reset when the hall scene is freed, so the yard starts at zero.",
              "Become an Autoload by itself.",
              "Block change_scene_to_file.",
            ],
            answer: 1,
            why: "The hall node dies with the scene. Put the integer on Game if the run continues.",
            wrongs: [
              "Only Autoload (or a save) keeps a number across a scene swap.",
              "",
              "You register Autoload in project settings. A room var is not that.",
              "The scene still changes. You just lose the number.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
