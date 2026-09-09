/** Plain-language notes for a single source line. Blank lines return "". */
export function explainCodeLine(line: string, lang: string): string {
  const raw = line.trim();
  if (!raw) return "";

  const isCs = /c#/i.test(lang);
  const isGd = /gdscript/i.test(lang);

  if (raw === "{" || raw === "}" || raw === "};") {
    return "Braces group a block. Everything between them belongs to the class or method above.";
  }

  if (isCs || (!isGd && !isCs)) {
    if (/^using\s+UnityEngine/.test(raw)) {
      return "Pulls in Unity's built-in types: Transform, Input, Time, MonoBehaviour, and the rest.";
    }
    if (/^using\s+/.test(raw)) {
      return "Imports a library so this file can use its types without writing the full path.";
    }
    if (/^public\s+class\s+\w+\s*:\s*MonoBehaviour/.test(raw)) {
      return "Defines a Unity script class. MonoBehaviour means Unity can attach it to a GameObject and call Start, Update, and friends.";
    }
    if (/^public\s+class\s+/.test(raw)) {
      return "Starts a named class. Other scripts can create or talk to this type.";
    }
    if (/^\[SerializeField\]/.test(raw)) {
      return "Shows a private field in the Inspector so you can edit it without making it public to other scripts.";
    }
    if (/^public\s+(float|int|bool|string|Color|Vector\d|GameObject|Transform|Rigidbody|AudioSource|Animator)/.test(raw)) {
      return "A public field. It appears in the Inspector. Change the value there while the game runs.";
    }
    if (/^void\s+Start\s*\(/.test(raw)) {
      return "Unity calls Start once when the object wakes. Use it to grab components and set starting values.";
    }
    if (/^void\s+Awake\s*\(/.test(raw)) {
      return "Awake runs even earlier than Start, once per object. Good for self-setup before other scripts ask for you.";
    }
    if (/^void\s+Update\s*\(/.test(raw)) {
      return "Unity calls Update every displayed frame. Input, animation, and most feel-driven motion live here.";
    }
    if (/^void\s+FixedUpdate\s*\(/.test(raw)) {
      return "Unity calls FixedUpdate on the physics clock. Put Rigidbody forces and collision-sensitive motion here.";
    }
    if (/^void\s+OnCollisionEnter/.test(raw)) {
      return "Runs when this collider first bumps another. Use it for hits, pickups, and damage.";
    }
    if (/^void\s+OnTriggerEnter/.test(raw)) {
      return "Runs when something enters a trigger collider. The object can pass through; you still get the event.";
    }
    if (/^IEnumerator\s+/.test(raw) || /StartCoroutine/.test(raw)) {
      return "A coroutine: a method that can pause with yield and resume later, useful for timed flashes and waits.";
    }
    if (/WaitForSeconds/.test(raw)) {
      return "Pauses the coroutine for a number of seconds, then continues on the next lines.";
    }
    if (/GetComponent</.test(raw)) {
      return "Looks on this GameObject for a component of that type. Cache it in Start so you are not searching every frame.";
    }
    if (/Input\.GetAxis/.test(raw)) {
      return "Reads a named axis from the Input Manager as a float, usually from -1 to 1. Horizontal is left and right.";
    }
    if (/Input\.GetAxisRaw/.test(raw)) {
      return "Same as GetAxis, but with no smoothing. You get a hard -1, 0, or 1.";
    }
    if (/Input\.GetButtonDown/.test(raw)) {
      return "True only on the first frame the button is pressed. Good for jump or fire, not for holding.";
    }
    if (/Input\.GetButton\b/.test(raw)) {
      return "True every frame the button stays down. Good for hold-to-run.";
    }
    if (/Input\.GetKey/.test(raw)) {
      return "Checks a keyboard key directly. Fine for prototypes. Named actions are easier to remap later.";
    }
    if (/Time\.deltaTime/.test(raw)) {
      return "Seconds since the last Update. Multiply motion by this so a slow machine does not crawl and a fast one does not teleport.";
    }
    if (/Time\.fixedDeltaTime/.test(raw)) {
      return "Seconds between physics steps. Use this inside FixedUpdate the same way you use deltaTime in Update.";
    }
    if (/transform\.Translate/.test(raw)) {
      return "Moves the Transform by that offset. You are writing the new pose yourself, not asking physics to do it.";
    }
    if (/transform\.position/.test(raw)) {
      return "The object's world position. Reading it tells you where you are. Assigning it teleports the object.";
    }
    if (/\.velocity\s*=/.test(raw) || /AddForce/.test(raw)) {
      return "Drives a Rigidbody. Physics then resolves the step so collisions stay consistent.";
    }
    if (/Instantiate\s*\(/.test(raw)) {
      return "Spawns a copy of a prefab into the scene. Returns the new object so you can place or parent it.";
    }
    if (/Destroy\s*\(/.test(raw)) {
      return "Removes a GameObject (or component) from the scene. Optional second argument delays the removal.";
    }
    if (/DontDestroyOnLoad/.test(raw)) {
      return "Keeps this object when a new scene loads. Typical home for score, audio, or a game manager.";
    }
    if (/SceneManager\.LoadScene/.test(raw)) {
      return "Loads another scene by name or index. Everything not marked DontDestroyOnLoad is cleared.";
    }
    if (/Debug\.Log/.test(raw)) {
      return "Prints a message to the Console. Handy while you learn what a line is doing.";
    }
    if (/yield\s+return/.test(raw)) {
      return "Hands control back to Unity until the wait finishes, then this method continues.";
    }
    if (/AudioSource|\.Play\s*\(/.test(raw)) {
      return "Starts a sound (or animation). One shot for a hit cue, loop for music.";
    }
    if (/^if\s*\(/.test(raw)) {
      return "Runs the next block only when the condition is true.";
    }
    if (/^else\b/.test(raw)) {
      return "The fallback branch when the if above was false.";
    }
    if (/^for\s*\(/.test(raw) || /^foreach\s*\(/.test(raw) || /^while\s*\(/.test(raw)) {
      return "Repeats the block. for and foreach walk a count or a list. while keeps going until the condition fails.";
    }
    if (/^return\b/.test(raw)) {
      return "Leaves the method early. Nothing after this line in the same method runs.";
    }
    if (/new\s+Vector/.test(raw)) {
      return "Builds a 2D or 3D vector of numbers. Position, direction, and scale often use these.";
    }
  }

  if (isGd || (!isCs && isGd) || /gdscript/i.test(lang)) {
    if (/^extends\s+/.test(raw)) {
      return "This script is that node type. The first line must match the node you attach it to.";
    }
    if (/^@export\b/.test(raw)) {
      return "Shows this variable in the Inspector. You can tweak it on the node without editing the script.";
    }
    if (/^@onready\b/.test(raw)) {
      return "Fills the variable when the node is ready, after children exist. Safer than grabbing them too early.";
    }
    if (/^func\s+_ready\s*\(/.test(raw)) {
      return "Godot calls _ready once after this node and its children exist. Connect signals here.";
    }
    if (/^func\s+_process\s*\(/.test(raw)) {
      return "Runs every idle frame. Visuals, UI, and non-physics motion. delta is seconds since last call.";
    }
    if (/^func\s+_physics_process\s*\(/.test(raw)) {
      return "Runs on the physics tick. CharacterBody2D motion and move_and_slide belong here.";
    }
    if (/^func\s+/.test(raw)) {
      return "Defines a function you can call from this script, a signal, or another node.";
    }
    if (/Input\.get_axis/.test(raw)) {
      return "Reads two Input Map actions as a float from -1 to 1. Often left and right, or up and down.";
    }
    if (/Input\.is_action_just_pressed/.test(raw)) {
      return "True only on the frame the action starts. Use it for jump or a single press, not a hold.";
    }
    if (/Input\.is_action_pressed/.test(raw)) {
      return "True every frame the action stays down. Good for hold-to-run.";
    }
    if (/velocity\./.test(raw) || /velocity\s*=/.test(raw)) {
      return "The body's speed vector. You write it, then move_and_slide turns it into motion against walls.";
    }
    if (/move_and_slide\s*\(/.test(raw)) {
      return "Applies velocity, slides along colliders, and updates is_on_floor. Call it once per physics tick.";
    }
    if (/is_on_floor\s*\(/.test(raw)) {
      return "True when the CharacterBody2D is standing on a floor collider after move_and_slide.";
    }
    if (/\$\w+/.test(raw)) {
      return "The dollar path grabs a child node by name. The name must match the child in the scene tree.";
    }
    if (/preload\s*\(/.test(raw) || /\.instantiate\s*\(/.test(raw)) {
      return "Loads a packed scene and creates a live copy. Then add_child puts it in the tree.";
    }
    if (/add_child\s*\(/.test(raw)) {
      return "Parents the new node under this one so it appears in the scene and starts running.";
    }
    if (/queue_free\s*\(/.test(raw)) {
      return "Schedules this node for deletion at a safe moment. Prefer this over free during gameplay.";
    }
    if (/\.connect\s*\(/.test(raw) || /\.connect\(/.test(raw)) {
      return "Hooks a signal to a function. When the event fires, that function runs.";
    }
    if (/emit_signal|\.emit\s*\(/.test(raw)) {
      return "Fires a signal so connected listeners can react.";
    }
    if (/change_scene_to_file|change_scene_to_packed/.test(raw)) {
      return "Swaps to another scene. Autoload singletons survive. Normal nodes in the old scene do not.";
    }
    if (/create_tween|\.tween_/.test(raw)) {
      return "Starts a short animation of a property over time: move, fade, scale, or flash.";
    }
    if (/^if\s+/.test(raw) || /^elif\s+/.test(raw)) {
      return "Runs the indented block only when the condition is true.";
    }
    if (/^else\s*:/.test(raw)) {
      return "The fallback when the if or elif above was false.";
    }
    if (/^for\s+/.test(raw) || /^while\s+/.test(raw)) {
      return "Repeats the indented block. for walks a range or list. while keeps going until the condition fails.";
    }
    if (/^return\b/.test(raw)) {
      return "Leaves the function early.";
    }
    if (/^var\s+/.test(raw)) {
      return "Declares a variable. The optional type after the colon catches mistakes early.";
    }
  }

  if (/^\w+\s*=/.test(raw) || /^\w+\.\w+\s*=/.test(raw)) {
    return "Stores a value in that name or property so later lines can use it.";
  }

  return "Part of the script above. Click nearby lines for more specific notes, or read the summary under the block.";
}
