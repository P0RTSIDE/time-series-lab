import { useEffect, useRef, useState } from "react";
import { Pad, Playfield, usePlayer } from "../../components/Playfield";
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

const HALL_COINS = [
  { id: "h1", x: 18 },
  { id: "h2", x: 34 },
  { id: "h3", x: 50 },
];
const YARD_COINS = [
  { id: "y1", x: 22 },
  { id: "y2", x: 40 },
  { id: "y3", x: 58 },
];

export function GodotAutoload() {
  const [gameCoins, setGameCoins] = useState(0);
  const [roomScore, setRoomScore] = useState(0);
  const [room, setRoom] = useState<"hall" | "yard">("hall");
  const [gone, setGone] = useState<Record<string, boolean>>({});

  const here = room === "hall";
  const roomCoins = (here ? HALL_COINS : YARD_COINS).filter((c) => !gone[c.id]);
  const taken = useRef<Set<string>>(new Set());
  const atDoor = useRef(false);
  const roomNow = useRef(room);
  roomNow.current = room;

  const grab = (id: string) => {
    if (taken.current.has(id)) return;
    taken.current.add(id);
    setGone((g) => ({ ...g, [id]: true }));
    setGameCoins((n) => n + 1);
    setRoomScore((n) => n + 1);
  };

  const player = usePlayer({
    floor: 16,
    startX: 14,
    onMove: (nx, ny) => {
      const hereNow = roomNow.current === "hall";
      const coins = hereNow ? HALL_COINS : YARD_COINS;
      for (const c of coins) {
        if (taken.current.has(c.id)) continue;
        if (Math.abs(nx - c.x) < 8 && Math.abs(ny - 22) < 16) grab(c.id);
      }
      const nearDoor = nx > 80 && ny < 42;
      if (nearDoor && !atDoor.current) {
        atDoor.current = true;
        enter(hereNow ? "yard" : "hall");
      } else if (!nearDoor) {
        atDoor.current = false;
      }
    },
  });

  useEffect(() => {
    player.place(14);
    atDoor.current = false;
  }, [room]);

  const enter = (next: "hall" | "yard") => {
    setRoom(next);
    setRoomScore(0);
  };

  const freeGroup = () => {
    const ids = here ? HALL_COINS : YARD_COINS;
    for (const c of ids) taken.current.add(c.id);
    setGone((g) => {
      const next = { ...g };
      for (const c of ids) next[c.id] = true;
      return next;
    });
  };

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
        title="What dies with the room, what does not"
        explain="Walk and jump still work. The Game chip stays on screen when you change rooms. That is the Autoload. The room score is a variable on the room itself, so the door sets it back to zero even though Game.coins does not. Walk into a coin or click it. Coins are in the group coins. Free group removes every coin still in this room and does not touch Game. Taken coins stay gone when you come back, because those nodes were freed, not because the Autoload forgot them."
        controls={
          <>
            <Pad
              onLeft={() => player.walk(-1)}
              onRight={() => player.walk(1)}
              onUp={player.jump}
              onAction={player.jump}
              actionLabel="Jump"
            />
            <button type="button" className="btn" onClick={() => enter(here ? "yard" : "hall")}>
              {here ? "Door to yard" : "Door to hall"}
            </button>
            <button type="button" className="btn" onClick={freeGroup} disabled={roomCoins.length === 0}>
              Free coins group
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                taken.current = new Set();
                setGameCoins(0);
                setRoomScore(0);
                setGone({});
                setRoom("hall");
                player.place(14);
              }}
            >
              Reset run
            </button>
            <div className="stat-row">
              <Stat label="Game.coins" value={String(gameCoins)} />
              <Stat label="Room score" value={String(roomScore)} />
              <Stat label="In group" value={String(roomCoins.length)} />
            </div>
          </>
        }
      >
        <Playfield
          height={240}
          actors={[
            { id: "game", x: 18, y: 72, w: 88, h: 28, color: "#1f6f62", label: `Game ${gameCoins}` },
            { id: "local", x: 78, y: 72, w: 88, h: 28, color: here ? "#3d6a7a" : "#4a8aaa", label: `${here ? "Hall" : "Yard"} ${roomScore}` },
            { id: "floor", x: 50, y: 4, w: 520, h: 18, color: here ? "#2c4a44" : "#3d5c38", label: here ? "hall.tscn" : "yard.tscn" },
            {
              id: "door",
              x: 88,
              y: 22,
              w: 36,
              h: 48,
              color: "#c4a574",
              label: "Door",
              onClick: () => enter(here ? "yard" : "hall"),
            },
            { id: "p", x: player.x, y: player.y, w: 24, h: 24, color: "#f2d48a", label: "P" },
            ...roomCoins.map((c) => ({
              id: c.id,
              x: c.x,
              y: 22,
              w: 26,
              h: 26,
              color: "#e8c56b",
              label: "C",
              onClick: () => grab(c.id),
            })),
          ]}
          caption="Walk into a coin or click it. Walk into the door to swap rooms. Game stays. The room score does not."
        />
      </Lab>

      <TryThis
        items={[
          "Walk into two hall coins. Game.coins and the hall score both read 2. Jump still comes back to the floor.",
          "Take the door. Hall score is 0. Game.coins is still 2. The yard has its own coins.",
          "Come back. The hall coins you took are still gone. Free coins group clears the rest without adding to Game.",
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
