const KEY = "tslab-progress-v1";

export type Progress = {
  read: string[];
  quizzes: Record<string, { correct: number; total: number }>;
};

function empty(): Progress {
  return { read: [], quizzes: {} };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Progress;
    return {
      read: Array.isArray(parsed.read) ? parsed.read : [],
      quizzes: parsed.quizzes ?? {},
    };
  } catch {
    return empty();
  }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function markRead(id: string): Progress {
  const p = loadProgress();
  if (!p.read.includes(id)) p.read.push(id);
  saveProgress(p);
  return p;
}

export function markQuiz(id: string, correct: number, total: number): Progress {
  const p = loadProgress();
  p.quizzes[id] = { correct, total };
  if (!p.read.includes(id)) p.read.push(id);
  saveProgress(p);
  return p;
}
