import { useEffect, useRef, useState } from "react";
import { Pad, Playfield, useKeys, usePlayer } from "../../components/Playfield";
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
  const player = usePlayer({ floor: 18, startX: 22 });
  const xRef = useRef(player.x);
  xRef.current = player.x;
  const [lunge, setLunge] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [hits, setHits] = useState(0);
  const [ms, setMs] = useState(520);
  const [useTween, setUseTween] = useState(true);
  const [useAnim, setUseAnim] = useState(true);
  const [useSound, setUseSound] = useState(true);
  const [swing, setSwing] = useState(0);
  const [soundLife, setSoundLife] = useState(0);
  const [soundToken, setSoundToken] = useState(0);
  const [restarts, setRestarts] = useState(0);
  const [enemyHit, setEnemyHit] = useState(false);

  const playSound = () => {
    if (!useSound) return;
    setRestarts((n) => (soundLife > 0.2 ? n + 1 : n));
    setSoundToken((t) => t + 1);
  };

  const attack = () => {
    if (phase !== "idle") return;
    setPhase("windup");
    setSwing((n) => n + 1);
    playSound();
  };

  useKeys({
    " ": attack,
    f: attack,
  });

  useEffect(() => {
    if (swing === 0) return;
    let raf = 0;
    const t0 = performance.now();
    const duration = useTween ? ms : 90;
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / duration);
      const forward = u < 0.42 ? u / 0.42 : Math.max(0, 1 - (u - 0.42) / 0.58);
      const eased = useTween ? forward * forward * (3 - 2 * forward) : forward > 0.5 ? 1 : 0;
      const reach = xRef.current + eased * 34;
      setLunge(eased * 34);
      setPhase(u < 0.42 ? "lunge" : u < 1 ? "return" : "idle");
      setEnemyHit(reach > 64);
      if (u < 1) raf = requestAnimationFrame(step);
      else {
        setHits((n) => n + 1);
        setLunge(0);
        setPhase("idle");
        setEnemyHit(false);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [swing, ms, useTween]);

  useEffect(() => {
    if (soundToken === 0) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / 480);
      setSoundLife(1 - u);
      if (u < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [soundToken]);

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
        title="Lunge, clip, and a sound that can restart"
        explain="Walk and jump are still here. Attack eases P forward from wherever you are standing, then back. That slide is the tween. The word on P is the animation clip: idle, then lunge, then return. The ring is the hit sound. Play sound while the ring is still up and it jumps back to full size, which is play() restarting a sound that was already playing. Turn the tween off and the same attack snaps instead of easing. You can still walk during the swing. A second Attack is ignored until the tween finishes."
        controls={
          <>
            <Slider label="Tween length" value={ms} min={180} max={900} step={20} onChange={setMs} />
            <label className="check">
              <input type="checkbox" checked={useTween} onChange={(e) => setUseTween(e.target.checked)} />
              Tween the lunge
            </label>
            <label className="check">
              <input type="checkbox" checked={useAnim} onChange={(e) => setUseAnim(e.target.checked)} />
              Play slash clip
            </label>
            <label className="check">
              <input type="checkbox" checked={useSound} onChange={(e) => setUseSound(e.target.checked)} />
              Play hit sound
            </label>
            <Pad
              onLeft={() => player.walk(-1)}
              onRight={() => player.walk(1)}
              onUp={player.jump}
              onAction={attack}
              actionLabel="Attack"
            />
            <button type="button" className="btn" onClick={playSound}>
              Play sound
            </button>
            <div className="stat-row">
              <Stat label="Clip" value={useAnim ? phase : "off"} />
              <Stat label="Hits" value={String(hits)} />
              <Stat label="Sound restarts" value={String(restarts)} />
            </div>
          </>
        }
      >
        <Playfield
          height={220}
          actors={[
            ...(soundLife > 0.04
              ? [
                  {
                    id: "snd",
                    x: player.x + lunge + 8,
                    y: 36,
                    w: 18 + soundLife * 54,
                    h: 18 + soundLife * 54,
                    color: `rgba(126, 182, 232, ${0.25 + soundLife * 0.45})`,
                    label: "snd",
                  },
                ]
              : []),
            {
              id: "p",
              x: player.x + lunge,
              y: player.y,
              w: phase === "lunge" && useAnim ? 40 : 28,
              h: 28,
              color: phase === "lunge" && useAnim ? "#f4fff9" : "#7eb6e8",
              label: useAnim ? (phase === "idle" ? "idle" : phase === "lunge" ? "slash" : "back") : "P",
            },
            {
              id: "e",
              x: 78,
              y: 18,
              w: enemyHit ? 34 : 28,
              h: enemyHit ? 34 : 28,
              color: enemyHit ? "#f0d48a" : "#4a8aaa",
              label: enemyHit ? "hit" : "E",
            },
          ]}
          caption="Walk and jump, then Attack eases forward from where you are. Play sound during the ring to restart it."
        />
      </Lab>

      <TryThis
        items={[
          "Walk closer, then Attack with everything on. P eases forward from that spot, the clip name changes, the ring fades, then P eases back. Jump still lands on the floor.",
          "Turn the tween off and attack again. P snaps to the enemy instead of sliding.",
          "Attack, then press Play sound before the ring is gone. Sound restarts goes up and the ring pops back to full size.",
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
