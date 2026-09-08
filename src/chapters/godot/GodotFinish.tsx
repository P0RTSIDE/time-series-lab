import { useState } from "react";
import { Pad, Playfield } from "../../components/Playfield";
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

export function GodotFinish() {
  const [x, setX] = useState(28);
  const [flash, setFlash] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [hits, setHits] = useState(0);
  const [ms, setMs] = useState(160);

  const attack = () => {
    if (phase !== "idle") return;
    setPhase("lunge");
    setFlash(true);
    setX(52);
    window.setTimeout(() => {
      setHits((n) => n + 1);
      setFlash(false);
      setX(28);
      setPhase("idle");
    }, ms);
  };

  return (
    <Chapter
      kicker="Godot · G9"
      title="Motion, sound, and polish"
      lede="Tween eases a property. AnimationPlayer plays a named clip. AudioStreamPlayer fires a sound."
    >
      <Takeaway>
        A tween slides a number over time. An animation clip is a named look.
        A sound player is a node you call play() on. Together they sell the hit.
      </Takeaway>

      <section className="prose">
        <p>
          The mover from earlier already works. Polish is the flash, the lunge,
          and the tick of a hit. You do not need a new body type. You tween a
          property, play a clip, and play a sound on the same press.
        </p>
        <TermList
          items={[
            {
              term: "Tween",
              text: "create_tween() then tween_property. Position, modulate, scale. It eases, then ends.",
            },
            {
              term: "AnimationPlayer",
              text: "A node with named clips: idle, slash. anim.play(\"slash\") on attack.",
            },
            {
              term: "AudioStreamPlayer",
              text: "A node with a stream. hit.play() on the same press as the lunge.",
            },
          ]}
        />
        <Compare
          leftTitle="Tween"
          left="One property, a few lines, good for a poke or a fade. No clip library needed."
          rightTitle="AnimationPlayer"
          right="Several tracks at once: sprite frames, offset, a hit spark. Name the clip and play it."
        />
        <ScriptBlock
          lang="GDScript"
          label="Attack flash"
          lines={[
            "extends Node2D",
            "",
            "@onready var sprite: Sprite2D = $Sprite2D",
            "@onready var anim: AnimationPlayer = $AnimationPlayer",
            "@onready var hit: AudioStreamPlayer = $Hit",
            "",
            "func attack() -> void:",
            "    var tw := create_tween()",
            "    tw.tween_property(sprite, \"position:x\", 24.0, 0.08)",
            "    tw.tween_property(sprite, \"position:x\", 0.0, 0.12)",
            "    sprite.modulate = Color(1.25, 1.25, 1.25)",
            "    tw.finished.connect(func() -> void: sprite.modulate = Color.WHITE)",
            "    anim.play(\"slash\")",
            "    hit.play()",
          ]}
          does="Lunge the sprite, flash it light, play the slash clip, and fire the hit sound. When the tween ends, the tint returns."
        />
      </section>

      <Callout title="Week-one trap" tone="warn">
        play() on a sound that is already playing restarts it. That is fine for
        a hit. For music, use a second player or check is_playing first.
      </Callout>

      <Lab
        title="Attack tween and flash"
        controls={
          <>
            <Slider label="Tween ms" value={ms} min={80} max={360} step={20} onChange={setMs} />
            <Pad onAction={attack} actionLabel="Attack" />
            <div className="stat-row">
              <Stat label="Phase" value={phase} />
              <Stat label="Hits" value={String(hits)} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            {
              id: "p",
              x,
              y: 16,
              w: 28,
              h: 28,
              color: flash ? "#d4eef8" : "#7eb6e8",
              label: "P",
            },
            { id: "e", x: 72, y: 16, w: 28, h: 28, color: "#4a8aaa", label: "E" },
          ]}
          caption="Attack lunges, flashes, then returns. Stretch the tween to see the ease."
        />
      </Lab>

      <TryThis
        items={[
          "Press Attack. P slides in, flashes, and pops back. Hits goes up by one.",
          "Mash while it is mid-lunge. The phase gate ignores a second press.",
          "Raise tween ms and attack again. Same motion, a slower ease.",
        ]}
      />

      <Quiz
        id="godot-finish"
        questions={[
          {
            prompt: "create_tween().tween_property is for:",
            choices: [
              "Loading a new scene.",
              "Easing a property to a value over a short time.",
              "Reading get_axis.",
              "Registering an Autoload.",
            ],
            answer: 1,
            why: "You pick the node, the property, the target, and the duration. Godot eases it.",
            wrongs: [
              "Scene swaps are change_scene_to_file. A tween is a property ride.",
              "",
              "Input is still Input. Tweens do not read keys.",
              "Autoload is project setup. Tweens are runtime motion.",
            ],
          },
          {
            prompt: "AnimationPlayer.play(\"slash\") means:",
            choices: [
              "A named clip on that player starts.",
              "Every sound in the scene plays.",
              "The body loses collision.",
              "delta becomes negative.",
            ],
            answer: 0,
            why: "Clips are names you author. play starts that track set.",
            wrongs: [
              "",
              "Sound is AudioStreamPlayer.play. The animation is visuals and keyed properties.",
              "Collision stays unless a track hides the shape.",
              "delta stays a positive step. Clips do not reverse the clock.",
            ],
          },
          {
            prompt: "AudioStreamPlayer.play() is the usual way to:",
            choices: [
              "Instance a packed scene.",
              "Fire a sound on a beat, a hit, or a UI confirm.",
              "Connect a Button.",
              "Set velocity.y.",
            ],
            answer: 1,
            why: "Put a stream on the node, then play() from the attack or the signal.",
            wrongs: [
              "Spawning is instantiate and add_child.",
              "",
              "Buttons use pressed.connect. The player is audio.",
              "Jump still sets velocity on the body.",
            ],
          },
          {
            prompt: "A flash on hit is often:",
            choices: [
              "A modulate tween or a one-frame color change, then back.",
              "A new Autoload per swing.",
              "A change_scene_to_file to the same room.",
              "Deleting the Input Map.",
            ],
            answer: 0,
            why: "Tint the sprite, then restore. Cheap, readable, and it matches the lunge.",
            wrongs: [
              "",
              "One Game singleton is enough. A swing is not a new global.",
              "Reloading the room is not a flash. It would reset state.",
              "Input bindings stay. Polish does not erase actions.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
