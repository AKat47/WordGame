/* ── Free Dictionary API helper ───────────────────────────────────── *
 * Uses https://dictionaryapi.dev — completely free, no API key,       *
 * open-source (Wiktionary data). Works in any browser.                *
 * ------------------------------------------------------------------- */

/**
 * Fetch a plain-English definition for a word.
 * Returns the first definition found, cleaned up for a child reader.
 *
 * @param {string} word
 * @returns {Promise<string>}
 */
export async function fetchDefinition(word) {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
  );

  if (res.status === 404) {
    throw new Error(`No definition found for "${word}".`);
  }
  if (!res.ok) {
    throw new Error(`Dictionary API error ${res.status}`);
  }

  const data = await res.json();

  // Walk meanings → definitions and return the first non-empty one
  for (const entry of data) {
    for (const meaning of entry.meanings ?? []) {
      const def = meaning.definitions?.[0]?.definition;
      if (def) {
        // Strip leading "Of, relating to…" style prefixes and trim
        return def.replace(/^(Of|Relating|Pertaining)\b[^.]*[.;]\s*/i, "").trim();
      }
    }
  }

  throw new Error(`Definition not available for "${word}".`);
}

/**
 * Split a sentence into {before, after} around the first occurrence of word.
 * Used by FillBlankGame so no AI call is needed for sentence generation.
 *
 * @param {string} sentence  e.g. "The benevolent king shared his grain."
 * @param {string} word      e.g. "benevolent"
 * @returns {{ before: string, after: string }}
 */
export function splitSentence(sentence, word) {
  const idx = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) {
    // Word not found verbatim — put blank at end as fallback
    return { before: sentence + " ", after: "" };
  }
  return {
    before: sentence.slice(0, idx),
    after:  sentence.slice(idx + word.length),
  };
}
