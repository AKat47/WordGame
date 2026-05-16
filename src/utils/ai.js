/* ── Free Dictionary API helper ───────────────────────────────────── *
 * Uses https://dictionaryapi.dev — completely free, no API key,       *
 * open-source (Wiktionary data). Works in any browser.                *
 * ------------------------------------------------------------------- */

/**
 * Fetch all definitions for a word, grouped by part of speech.
 * Returns an array of { partOfSpeech, definitions: string[] }.
 *
 * @param {string} word
 * @returns {Promise<Array<{ partOfSpeech: string, definitions: string[] }>>}
 */
export async function fetchAllDefinitions(word) {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
  );

  if (res.status === 404) throw new Error(`No definition found for "${word}".`);
  if (!res.ok)           throw new Error(`Dictionary API error ${res.status}`);

  const data = await res.json();
  const clean = s => s.replace(/^(Of|Relating|Pertaining)\b[^.]*[.;]\s*/i, "").trim();

  // Collect all definitions grouped by part of speech, deduped
  const map = new Map();
  for (const entry of data) {
    for (const meaning of entry.meanings ?? []) {
      const pos = meaning.partOfSpeech ?? "other";
      if (!map.has(pos)) map.set(pos, []);
      for (const d of meaning.definitions ?? []) {
        if (d.definition) {
          const cleaned = clean(d.definition);
          if (!map.get(pos).includes(cleaned)) map.get(pos).push(cleaned);
        }
      }
    }
  }

  if (!map.size) throw new Error(`Definition not available for "${word}".`);

  return Array.from(map.entries()).map(([partOfSpeech, definitions]) => ({
    partOfSpeech,
    definitions: definitions.slice(0, 4), // cap at 4 per part of speech
  }));
}

/**
 * Fetch a single plain-English definition (first result).
 * @param {string} word
 * @returns {Promise<string>}
 */
export async function fetchDefinition(word) {
  const groups = await fetchAllDefinitions(word);
  return groups[0]?.definitions[0] ?? "";
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
