import { useEffect, useRef } from "react";

export type Actor = {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  label?: string;
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
