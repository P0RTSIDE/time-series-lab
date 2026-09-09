import { useState } from "react";
import { Pad, Playfield, useKeys } from "../../components/Playfield";
import {
  Callout,
  Chapter,
  Lab,
  Quiz,
  ScriptBlock,
  Slider,
  Stat,
  Takeaway,
  TermList,
  TryThis,
} from "../../components/UI";

export function UnityFinish() {
  const [fade, setFade] = useState(1);

  const flashing = fade < 1;
  const flashMix = 1 - fade;
  const body = flashing
    ? `rgb(${232 + Math.round(23 * flashMix)}, ${176 + Math.round(52 * flashMix)}, ${122 + Math.round(40 * flashMix)})`
    : "#e8b07a";
  const hitY = 40 + fade * 22;
  const hitAlpha = Math.round(180 * (1 - fade) + 40);

  const attack = () => setFade(0);

  useKeys({
    " ": attack,
    f: attack,
  });

  return (
    <Chapter
      kicker="Unity · U9"
      title="Motion, sound, and polish"
      lede="A coroutine can wait. An Animator plays a clip. AudioSource.Play starts a hit sound."
    >
      <Takeaway>
        StartCoroutine lets one method pause without freezing the game.
        Pair a short wait with an Animator trigger and a one-shot sound.
      </Takeaway>

      <section className="prose">
        <p>
          Polish is timing. Flash a color, wait a beat, restore the color.
          Play a swing clip. Play a hit sound. None of that should stall
          Update for the rest of the object.
        </p>
        <TermList
          items={[
            {
              term: "StartCoroutine",
              text: "Run an IEnumerator so yield return new WaitForSeconds can pause that method only.",
            },
            {
              term: "Animator",
              text: "A controller of clips. SetTrigger(\"Attack\") starts a swing if that parameter exists.",
            },
            {
              term: "AudioSource.Play",
              text: "Starts the clip on that source. Assign the AudioSource in Start or the Inspector.",
            },
          ]}
        />
        <ScriptBlock
          lang="C#"
          label="Strike"
          lines={[
            "using System.Collections;",
            "using UnityEngine;",
            "",
            "public class Striker : MonoBehaviour",
            "{",
            "    public Animator animator;",
            "    public AudioSource hitSound;",
            "    public float flashSeconds = 0.2f;",
            "",
            "    Renderer rend;",
            "    Color baseColor;",
            "",
            "    void Start()",
            "    {",
            "        rend = GetComponent<Renderer>();",
            "        baseColor = rend.material.color;",
            "    }",
            "",
            "    void Update()",
            "    {",
            "        if (Input.GetButtonDown(\"Fire1\"))",
            "            StartCoroutine(Strike());",
            "    }",
            "",
            "    IEnumerator Strike()",
            "    {",
            "        animator.SetTrigger(\"Attack\");",
            "        hitSound.Play();",
            "        rend.material.color = Color.white;",
            "        yield return new WaitForSeconds(flashSeconds);",
            "        rend.material.color = baseColor;",
            "    }",
            "}",
          ]}
          does="On Fire1, start Strike. The Animator trigger plays the clip, the AudioSource plays the hit, the mesh flashes white, then WaitForSeconds restores the old color. Assign animator and hitSound on the object."
        />
      </section>

      <Callout title="Wait is local" tone="note">
        WaitForSeconds pauses that coroutine. The rest of the game keeps
        running. That is the point: a flash, not a freeze.
      </Callout>

      <Lab
        title="Attack flash and a fading hit"
        explain="Attack flashes the actor, then a hit label appears and fades. The timer is a stand-in for WaitForSeconds in a coroutine."
        controls={
          <>
            <Pad onAction={attack} actionLabel="Attack" />
            <Slider
              label="Hit timer (0 is impact, 1 is gone)"
              value={fade}
              min={0}
              max={1}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setFade}
            />
            <div className="stat-row">
              <Stat label="Flash" value={flashing ? "On" : "Off"} />
              <Stat label="Wait" value={`${(fade * 0.2).toFixed(2)} s`} />
            </div>
          </>
        }
      >
        <Playfield
          actors={[
            { id: "p", x: 38, y: 22, w: 32, h: 32, color: body, label: "P" },
            ...(fade < 0.98
              ? [
                  {
                    id: "hit",
                    x: 62,
                    y: hitY,
                    w: 36,
                    h: 22,
                    color: `rgb(${hitAlpha}, ${Math.round(hitAlpha * 0.7)}, 60)`,
                    label: "hit",
                  },
                ]
              : []),
          ]}
          caption="Attack resets the timer. Drag the slider to step the wait, like WaitForSeconds playing out."
        />
      </Lab>

      <TryThis
        items={[
          "Press Attack. The cube should flash and a hit label should pop.",
          "Drag the timer toward 1. The label rises and fades, then drops off.",
          "Attack again at mid fade. The coroutine in Unity would restart the wait from zero.",
        ]}
      />

      <Quiz
        id="unity-finish"
        questions={[
          {
            prompt: "StartCoroutine with WaitForSeconds will:",
            choices: [
              "Freeze every script in the project.",
              "Pause that method, then continue after the wait, while the game keeps running.",
              "Unload the scene.",
              "Disable Input Manager names.",
            ],
            answer: 1,
            why: "A coroutine is a pause inside one method. Other Updates still tick.",
            wrongs: [
              "Only that enumerator waits. The rest of the game does not freeze.",
              "",
              "Scene loads are SceneManager.",
              "Input names stay as you set them.",
            ],
          },
          {
            prompt: "animator.SetTrigger(\"Attack\") needs:",
            choices: [
              "A trigger parameter named Attack on the Animator controller.",
              "A Rigidbody on the camera.",
              "Time.deltaTime to be zero.",
              "A new Canvas every frame.",
            ],
            answer: 0,
            why: "The string must match a trigger you added on the controller. Then a clip can play.",
            wrongs: [
              "",
              "The camera body is unrelated to a swing clip.",
              "deltaTime should stay normal so the clip can play.",
              "UI is a different system.",
            ],
          },
          {
            prompt: "hitSound.Play() does what?",
            choices: [
              "Writes a new prefab.",
              "Starts the clip assigned to that AudioSource.",
              "Loads RoomB.",
              "Caches GetComponent each frame.",
            ],
            answer: 1,
            why: "Play is a one-shot start. Assign the source and a clip, then call it on the hit.",
            wrongs: [
              "Prefabs are Instantiate.",
              "",
              "Scenes are LoadScene.",
              "Cache in Start. Play just starts audio.",
            ],
          },
          {
            prompt: "A flash in Strike is usually:",
            choices: [
              "A new scene named Flash.",
              "A short color change, then a wait, then the old color.",
              "A replacement for a collider.",
              "The only way to read Horizontal.",
            ],
            answer: 1,
            why: "Set a bright color, wait, restore. That is polish, not a level load.",
            wrongs: [
              "A flash is not a scene swap.",
              "",
              "Colliders still handle hits. Flash is feedback.",
              "Input is still GetAxis or GetButtonDown.",
            ],
          },
        ]}
      />
    </Chapter>
  );
}
