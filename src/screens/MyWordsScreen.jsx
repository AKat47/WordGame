import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import Icon from "../components/Icon";
import BigButton from "../components/BigButton";
import { fetchAllDefinitions } from "../utils/ai";
import {
  loadUserWords,
  saveUserWords,
  syncWordsFromServer,
} from "../utils/userWords";
import { VOCAB_BOOKS } from "../data/vocab";

/* ─── Flatten all built-in vocab into a single word list ─────────── */
function getVocabSeed() {
  const seen = new Set();
  const out  = [];
  for (const book of VOCAB_BOOKS) {
    for (const lesson of book.lessons) {
      for (const w of lesson.words) {
        if (!seen.has(w.word)) { seen.add(w.word); out.push(w); }
      }
    }
  }
  return out;
}

/* ─── Only show user-added words here ───────────────────────────── */
function getAllWords() {
  return loadUserWords();
}

/* ─── Free Dictionary API: fetch definition ──────────────────────── */
async function fetchMeaning(word) {
  return fetchDefinition(word);
}

/* ─── Input field ────────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, multiline, rightLabel, onRightLabel, disabled }) {
  const { theme: t } = useTheme();
  const [focused, setFocused] = useState(false);
  const border = focused ? t.primary : t.line;
  const commonStyle = {
    width: "100%", padding: "12px 14px",
    border: `2px solid ${border}`, borderRadius: 10,
    background: t.bg, color: t.ink,
    fontSize: 16, fontFamily: FONT_SANS,
    outline: "none", resize: "none",
    transition: "border-color 150ms",
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px" }}>
          {label}
        </div>
        {rightLabel && (
          <div onClick={onRightLabel} style={{
            fontSize: 12, fontWeight: 800, color: t.primary,
            letterSpacing: "1px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 14 }}>✦</span> {rightLabel}
          </div>
        )}
      </div>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...commonStyle, lineHeight: 1.5 }}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={commonStyle}
        />
      )}
    </div>
  );
}

/* ─── Meanings picker ────────────────────────────────────────────── */
function MeaningsPicker({ groups, onPick, onClose, theme: t }) {
  const POS_LABEL = { noun:"noun", verb:"verb", adjective:"adj.", adverb:"adv.", other:"other" };
  return (
    <div style={{
      marginTop: 8, border: `1.5px solid ${t.primary}`,
      borderRadius: 12, overflow: "hidden", background: t.bg,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 12px", background: t.primarySoft,
        fontSize: 11, fontWeight: 800, color: t.primaryDeep, letterSpacing: "1px",
      }}>
        TAP A MEANING TO USE IT
        <span onClick={onClose} style={{ cursor: "pointer", fontSize: 16, color: t.inkFaint }}>×</span>
      </div>
      <div style={{ maxHeight: 260, overflow: "auto" }}>
        {groups.map(({ partOfSpeech, definitions }) => (
          <div key={partOfSpeech}>
            <div style={{
              padding: "6px 12px 2px",
              fontSize: 10, fontWeight: 800, color: t.inkFaint,
              letterSpacing: "1.5px", textTransform: "uppercase",
              background: t.card,
            }}>
              {POS_LABEL[partOfSpeech] ?? partOfSpeech}
            </div>
            {definitions.map((def, i) => (
              <div
                key={i}
                onClick={() => onPick(def)}
                style={{
                  padding: "10px 14px",
                  borderTop: `1px solid ${t.line}`,
                  fontSize: 14, color: t.ink, lineHeight: 1.45,
                  cursor: "pointer",
                  transition: "background 120ms",
                }}
                onMouseEnter={e => e.currentTarget.style.background = t.primarySoft}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                {def}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Add Word bottom sheet ──────────────────────────────────────── */
function AddWordSheet({ onAdd, onCancel }) {
  const { theme: t } = useTheme();
  const [word, setWord]           = useState("");
  const [meaning, setMeaning]     = useState("");
  const [example, setExample]     = useState("");
  const [emoji, setEmoji]         = useState("");
  const [filling, setFilling]     = useState(false);
  const [fillError, setFillError] = useState("");
  const [groups, setGroups]       = useState(null); // meanings picker

  const handleAiFill = async () => {
    const trimmed = word.trim();
    if (!trimmed) { setFillError("Type a word first!"); return; }
    setFilling(true);
    setFillError("");
    setGroups(null);
    try {
      const allGroups = await fetchAllDefinitions(trimmed);
      const total = allGroups.reduce((s, g) => s + g.definitions.length, 0);
      if (total === 1) {
        // Only one meaning — fill directly, no picker needed
        setMeaning(allGroups[0].definitions[0]);
      } else {
        setGroups(allGroups);
      }
    } catch {
      setFillError("Couldn't fetch definitions — check your connection.");
    } finally {
      setFilling(false);
    }
  };

  const canAdd = word.trim() && meaning.trim();

  return (
    <>
      {/* Backdrop */}
      <div onClick={onCancel} style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 10,
      }}/>

      {/* Sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: t.card,
        borderRadius: "20px 20px 0 0",
        padding: "0 20px 32px",
        zIndex: 11,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
        animation: "slideUp 280ms cubic-bezier(.2,1,.3,1)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: t.line }}/>
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, marginBottom: 20, marginTop: 8 }}>
          Add a new word
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field
            label="WORD"
            value={word}
            onChange={v => { setWord(v); setFillError(""); }}
            placeholder=""
          />

          <Field
            label="MEANING"
            value={meaning}
            onChange={setMeaning}
            placeholder=""
            multiline
            rightLabel={filling ? "Fetching…" : "AI FILL"}
            onRightLabel={handleAiFill}
            disabled={filling}
          />

          {fillError && (
            <div style={{ fontSize: 12, color: t.red, marginTop: -8 }}>{fillError}</div>
          )}

          {groups && (
            <MeaningsPicker
              groups={groups}
              theme={t}
              onPick={def => { setMeaning(def); setGroups(null); }}
              onClose={() => setGroups(null)}
            />
          )}

          <Field
            label="EXAMPLE (optional)"
            value={example}
            onChange={setExample}
            placeholder="A sentence using this word…"
            multiline
          />

          {/* Emoji picker */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px" }}>
              PICTURE EMOJI (optional)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="e.g. 🌟"
                maxLength={4}
                style={{
                  width: 70, padding: "10px 12px",
                  border: `2px solid ${t.line}`, borderRadius: 10,
                  background: t.bg, color: t.ink,
                  fontSize: 24, textAlign: "center",
                  outline: "none", fontFamily: FONT_SANS,
                }}
              />
              <div style={{ fontSize: 12, color: t.inkSoft, lineHeight: 1.4 }}>
                Optional visual hint for the word.<br/>
                Tap and paste any emoji 🎉
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <BigButton ghost onClick={onCancel} style={{ flex: 1 }}>Cancel</BigButton>
          <BigButton
            onClick={() => canAdd && onAdd({ word: word.trim(), meaning: meaning.trim(), sentence: example.trim(), image: emoji.trim() || "📖" })}
            disabled={!canAdd}
            style={{ flex: 1 }}
          >
            Add Word
          </BigButton>
        </div>
      </div>
    </>
  );
}

/* ─── Word card ──────────────────────────────────────────────────── */
function WordCard({ w, onRemove }) {
  const { theme: t } = useTheme();
  return (
    <div style={{
      background: t.card,
      border: `1.5px solid ${t.line}`,
      borderRadius: 14, padding: "14px 16px",
      position: "relative",
    }}>
      <div style={{ fontWeight: 800, fontSize: 17, color: t.ink, fontFamily: FONT_SERIF }}>{w.word}</div>
      <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 2 }}>{w.meaning}</div>
      {w.sentence && (
        <div style={{ fontSize: 12, color: t.inkFaint, fontStyle: "italic", marginTop: 4, fontFamily: FONT_SERIF }}>
          "{w.sentence}"
        </div>
      )}
      <div
        onClick={() => onRemove(w.word)}
        style={{
          position: "absolute", top: 12, right: 12,
          width: 24, height: 24, display: "flex",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: t.inkFaint,
          fontSize: 16, fontWeight: 700,
        }}
      >
        ×
      </div>
    </div>
  );
}

/* ─── Main screen ────────────────────────────────────────────────── */
export default function MyWordsScreen({ onBack }) {
  const { theme: t } = useTheme();
  const [words, setWords]       = useState(getAllWords);
  const [search, setSearch]     = useState("");
  const [showAdd, setShowAdd]   = useState(false);

  // Three-way sync on mount:
  //   new user (both empty) → seed from built-in vocab + push to server
  //   server > local        → pull server words down
  //   local  > server       → push cached words up
  useEffect(() => {
    const localWords = loadUserWords();
    syncWordsFromServer().then(serverWords => {
      const server = serverWords ?? [];

      if (server.length === 0 && localWords.length === 0) {
        // Brand-new user — seed with all built-in vocab
        const seed = getVocabSeed();
        saveUserWords(seed);   // saves locally + pushes to MongoDB
        setWords(seed);
      } else if (server.length > localWords.length) {
        // Server is ahead — pull down
        saveUserWords(server);
        setWords(server);
      } else if (localWords.length > server.length) {
        // Local is ahead — push up
        saveUserWords(localWords);
      }
      // Equal → already in sync
    }).catch(() => {});
  }, []);

  const filtered = words.filter(w =>
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.meaning.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (newWord) => {
    const updated = [newWord, ...loadUserWords()];
    saveUserWords(updated);
    setWords(ws => [newWord, ...ws]);
    setShowAdd(false);
  };

  const handleRemove = (wordStr) => {
    // Only allow removing user-added words (not built-in vocab)
    const updatedUser = loadUserWords().filter(w => w.word !== wordStr);
    saveUserWords(updatedUser);
    setWords(ws => ws.filter(w => w.word !== wordStr));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, fontFamily: FONT_SANS, position: "relative" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 16px 10px",
        borderBottom: `1px solid ${t.line}`,
        background: t.bg,
      }}>
        <div onClick={onBack} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Icon name="chevronLeft" size={26} color={t.ink}/>
        </div>
        <div style={{ flex: 1, fontSize: 22, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>
          My Words
        </div>
        <div
          onClick={() => setShowAdd(true)}
          style={{
            background: t.primary, color: "#fff",
            padding: "8px 16px", borderRadius: 10,
            fontWeight: 800, fontSize: 13, letterSpacing: "1px",
            cursor: "pointer", boxShadow: `0 3px 0 ${t.primaryDeep}`,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          + ADD
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "12px 16px 8px" }}>
        <div style={{ position: "relative" }}>
          <Icon name="search" size={18} color={t.inkFaint}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search words…"
            style={{
              width: "100%", padding: "11px 14px 11px 38px",
              border: `1.5px solid ${t.line}`, borderRadius: 12,
              background: t.card, color: t.ink,
              fontSize: 15, fontFamily: FONT_SANS, outline: "none",
            }}
          />
        </div>
      </div>

      {/* Word list */}
      <div style={{ flex: 1, overflow: "auto", padding: "4px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: t.inkFaint, padding: "40px 0", fontStyle: "italic", fontFamily: FONT_SERIF }}>
            No words found.
          </div>
        )}
        {filtered.map((w, i) => (
          <WordCard key={w.word + i} w={w} onRemove={handleRemove}/>
        ))}
      </div>

      {/* Bottom sheet overlay */}
      {showAdd && (
        <AddWordSheet onAdd={handleAdd} onCancel={() => setShowAdd(false)}/>
      )}
    </div>
  );
}
