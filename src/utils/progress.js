/* ── Progress tracker ────────────────────────────────────────────── *
 * Two-layer persistence:                                              *
 *  1. localStorage  — instant reads/writes, works offline             *
 *  2. MongoDB (via API server) — cross-device, durable                *
 *                                                                     *
 * Strategy:                                                           *
 *  • loadProgress()  → returns localStorage data immediately          *
 *  • syncFromServer() → fetches Mongo data; caller updates React state *
 *  • saveProgress()  → writes localStorage + fires async Mongo PUT    *
 * ------------------------------------------------------------------- */

const STORAGE_KEY  = "wordgarden_progress";
const USER_ID_KEY  = "wordgarden_userId";
const API_BASE     = "/api";               // proxied to localhost:3001 by Vite

/* ── Default shapes ─────────────────────────────────────────────── */
const DEFAULT_GAME_STAT = {
  played: 0, bestAccuracy: 0, totalCorrect: 0, totalQuestions: 0,
};

const DEFAULT_PROGRESS = {
  xp: 0, gems: 0, streak: 0, lastPlayedDate: null, gameStats: {},
  history: [], // [{ date:"YYYY-MM-DD", type, xp, accuracy, correct, total }]
};

/* ── User identity (anonymous UUID, persisted in localStorage) ───── */
export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    // Simple UUID v4 without a library
    id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

/* ── Local storage helpers ──────────────────────────────────────── */

/** Read progress from localStorage instantly (never throws). */
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS, gameStats: {} };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROGRESS, gameStats: {} };
  }
}

/** Write to localStorage + fire-and-forget PUT to Mongo. */
export function saveProgress(progress) {
  // 1. Synchronous local write — never blocks the UI
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* ignore */ }

  // 2. Async remote write — silently swallowed on failure (offline / server down)
  pushToServer(progress).catch(() => {});
}

/* ── Server helpers ─────────────────────────────────────────────── */

/**
 * Fetch progress from MongoDB.
 * Returns the stored data, or null if no record exists yet.
 * Throws on network / server errors so the caller can decide what to do.
 */
export async function syncFromServer() {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/progress/${userId}`);
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();   // null  →  no record yet;  object  →  saved progress
}

/**
 * Push progress to MongoDB (upsert).
 * Fire-and-forget — saveProgress() calls this internally.
 */
export async function pushToServer(progress) {
  const userId = getUserId();
  await fetch(`${API_BASE}/progress/${userId}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(progress),
  });
}

/* ── Pure helpers (no I/O) ──────────────────────────────────────── */

/**
 * Return a new progress object reflecting a completed game session.
 * Does NOT call saveProgress — caller must do that.
 */
export function recordGameResult(progress, type, stats) {
  const today = new Date().toDateString();

  // Streak
  let { streak } = progress;
  if (progress.lastPlayedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    streak = progress.lastPlayedDate === yesterday.toDateString() ? streak + 1 : 1;
  }

  // Per-game stats
  const prev    = progress.gameStats?.[type] ?? { ...DEFAULT_GAME_STAT };
  const correct = Math.round((stats.accuracy / 100) * stats.words);

  const isoDate = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const entry   = { date: isoDate, type, xp: stats.xp, accuracy: stats.accuracy, correct, total: stats.words };
  const history = [...(progress.history || []), entry].slice(-365); // keep 1 year

  return {
    ...progress,
    xp:             progress.xp + stats.xp,
    gems:           progress.gems + Math.floor(stats.xp / 20),
    streak,
    lastPlayedDate: today,
    history,
    gameStats: {
      ...progress.gameStats,
      [type]: {
        played:         prev.played + 1,
        bestAccuracy:   Math.max(prev.bestAccuracy, stats.accuracy),
        totalCorrect:   prev.totalCorrect + correct,
        totalQuestions: prev.totalQuestions + stats.words,
      },
    },
  };
}

/** Get the per-game stat object for a type (never null). */
export function getGameStat(progress, type) {
  return progress.gameStats?.[type] ?? { ...DEFAULT_GAME_STAT };
}
