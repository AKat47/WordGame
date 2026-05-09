/* ── User words — two-layer persistence ─────────────────────────── *
 *  1. localStorage  — instant reads/writes, works offline            *
 *  2. MongoDB (via API) — cross-device, durable                      *
 * ------------------------------------------------------------------ */

import { getUserId } from "./progress.js";

const STORAGE_KEY = "wordgarden_user_words";
const API_BASE    = "/api";

/* ── localStorage helpers ───────────────────────────────────────── */

export function loadUserWords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveUserWords(words) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(words)); } catch {}
  pushWordsToServer(words).catch(() => {});
}

/* ── Server helpers ─────────────────────────────────────────────── */

export async function syncWordsFromServer() {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/words/${userId}`);
  if (!res.ok) throw new Error(`Server responded ${res.status}`);
  return res.json();   // [] if no record yet
}

async function pushWordsToServer(words) {
  const userId = getUserId();
  await fetch(`${API_BASE}/words/${userId}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(words),
  });
}
