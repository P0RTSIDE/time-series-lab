import { useEffect, useRef, useState } from "react";

export type Actor = {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  label?: string;
  onClick?: () => void;
};

export function Playfield({
  actors,
  height = 220,
  onStageClick,
  caption,
}: {
  actors: Actor[];
  height?: number;
  onStageClick?: (x: number, y: number) => void;
  caption?: string;
}) {
  return (
    <div className="play-wrap">
      <div
        className="playfield"
        style={{ height }}
        onClick={(e) => {
          if (!onStageClick) return;
          const box = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - box.left) / box.width) * 100;
          const y = (1 - (e.clientY - box.top) / box.height) * 100;
          onStageClick(Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y)));
        }}
      >
        {actors.map((a) => (
          <div
            key={a.id}
            className="actor"
            style={{
              left: `${a.x}%`,
              bottom: `${a.y}%`,
              width: a.w ?? 28,
              height: a.h ?? 28,
              background: a.color ?? "#e8b07a",
              pointerEvents: a.onClick ? "auto" : "none",
              cursor: a.onClick ? "pointer" : undefined,
            }}
            onClick={(e) => {
              if (!a.onClick) return;
              e.stopPropagation();
              a.onClick();
            }}
          >
            {a.label}
          </div>
        ))}
      </div>
      {caption && <p className="play-cap">{caption}</p>}
    </div>
  );
}

export function Pad({
  onLeft,
  onRight,
  onUp,
  onAction,
  actionLabel = "Jump",
}: {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="pad">
      {onLeft && (
        <button type="button" onClick={onLeft}>
          Left
        </button>
      )}
      {onRight && (
        <button type="button" onClick={onRight}>
          Right
        </button>
      )}
      {onUp && (
        <button type="button" onClick={onUp}>
          Up
        </button>
      )}
      {onAction && (
        <button type="button" className="pad-go" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/** Walk and jump shared by later labs, so movement stays after it is introduced. */
export function usePlayer(opts?: {
  canJump?: boolean;
  floor?: number;
  startX?: number;
  step?: number;
  onMove?: (x: number, y: number) => void;
}) {
  const floor = opts?.floor ?? 16;
  const step = opts?.step ?? 7;
  const canJump = opts?.canJump !== false;
  const startX = opts?.startX ?? 28;
  const onMoveRef = useRef(opts?.onMove);
  onMoveRef.current = opts?.onMove;

  const [x, setX] = useState(startX);
  const [y, setY] = useState(floor);
  const [onFloor, setOnFloor] = useState(true);
  const pos = useRef({ x: startX, y: floor });
  const air = useRef(false);
  const timer = useRef<number | null>(null);

  const publish = (nx: number, ny: number) => {
    pos.current = { x: nx, y: ny };
    onMoveRef.current?.(nx, ny);
  };

  const place = (nx: number) => {
    if (timer.current != null) window.clearTimeout(timer.current);
    timer.current = null;
    air.current = false;
    setOnFloor(true);
    setX(nx);
    setY(floor);
    pos.current = { x: nx, y: floor };
  };

  const walk = (dir: number) => {
    const nx = Math.min(90, Math.max(8, pos.current.x + dir * step));
    setX(nx);
    publish(nx, pos.current.y);
  };

  const jump = () => {
    if (!canJump || air.current) return;
    air.current = true;
    setOnFloor(false);
    let vy = 6.2;
    const tick = () => {
      vy -= 0.55;
      const next = pos.current.y + vy;
      if (next <= floor) {
        air.current = false;
        setOnFloor(true);
        setY(floor);
        publish(pos.current.x, floor);
        timer.current = null;
        return;
      }
      setY(next);
      publish(pos.current.x, next);
      timer.current = window.setTimeout(tick, 28);
    };
    tick();
  };

  useKeys(
    canJump
      ? {
          ArrowLeft: () => walk(-1),
          a: () => walk(-1),
          ArrowRight: () => walk(1),
          d: () => walk(1),
          ArrowUp: jump,
          w: jump,
        }
      : {
          ArrowLeft: () => walk(-1),
          a: () => walk(-1),
          ArrowRight: () => walk(1),
          d: () => walk(1),
        },
  );

  useEffect(() => {
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    };
  }, []);

  return { x, y, onFloor, walk, jump, place };
}

export function useKeys(map: Record<string, () => void>) {
  const mapRef = useRef(map);
  mapRef.current = map;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const fn = mapRef.current[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
