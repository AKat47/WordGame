import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import { VOCAB_BOOKS } from "../data/vocab";
import Icon from "../components/Icon";
import BigButton from "../components/BigButton";
import { fetchDefinition } from "../utils/ai";

/* ── Seed word list from vocab ───────────────────────────────────── */
function seedWords() {
  const words = [];
  for (const book of VOCAB_BOOKS)
    for (const lesson of book.lessons)
      for (const w of lesson.words)
        words.push({ word: w.word, meaning: w.meaning, sentence: w.sentence ?? "" });
  return words;
}

/* ── Free Dictionary API: fetch definition ───────────────────────── */
async function fetchMeaning(word) {
  return fetchDefinition(word);
}

/* ── Styled input / textarea ─────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, multiline, rightSlot, disabled }) {
  const { theme: t } = useTheme();
  const [focused, setFocused] = useState(false);

  const base = {
    width: "100%", padding: "12px 14px",
    border: `2px solid ${focused ? t.primary : t.line}`,
    borderRadius: 10, background: t.bg,
    color: t.ink, fontSize: 16,
    fontFamily: FONT_SANS, outline: "none",
    resize: "none", transition: "border-color 150ms",
    opacity: disabled ? 0.55 : 1,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px" }}>{label}</div>
        {rightSlot}
      </div>
      {multiline
        ? <textarea rows={3} value={value} placeholder={placeholder} disabled={disabled}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...base, lineHeight: 1.5 }}/>
        : <input value={value} placeholder={placeholder} disabled={disabled}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={base}/>
      }
    </div>
  );
}

/* ── Add Word bottom sheet ───────────────────────────────────────── */
function AddWordSheet({ onAdd, onCancel }) {
  const { theme: t } = useTheme();
  const [word,     setWord]     = useState("");
  const [meaning,  setMeaning]  = useState("");
  const [sentence, setSentence] = useState("");
  const [filling,  setFilling]  = useState(false);
  const [fillErr,  setFillErr]  = useState("");

  const doAiFill = async () => {
    const w = word.trim();
    if (!w) { setFillErr("Type a word first!"); return; }
    setFilling(true);
    setFillErr("");
    try {
      const def = await fetchMeaning(w);
      setMeaning(def);
    } catch (e) {
      console.error("AI Fill error:", e);
      setFillErr("Couldn't reach AI — check your connection.");
    } finally {
      setFilling(false);
    }
  };

  const canAdd = word.trim() && meaning.trim();

  return (
    <>
      <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)", zIndex: 10 }}/>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: t.card, borderRadius: "20px 20px 0 0",
        padding: "0 20px 36px", zIndex: 11,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
        animation: "slideUp 260ms cubic-bezier(.2,1,.3,1)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: t.line }}/>
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, margin: "8px 0 20px" }}>
          Add a new word
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="WORD" value={word} onChange={v => { setWord(v); setFillErr(""); }} placeholder=""/>

          <Field
            label="MEANING" value={meaning} onChange={setMeaning}
            placeholder="" multiline disabled={filling}
            rightSlot={
              <div onClick={doAiFill} style={{
                fontSize: 12, fontWeight: 800,
                color: filling ? t.inkFaint : t.primary,
                cursor: filling ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 4,
                userSelect: "none",
              }}>
                {filling
                  ? <><Spinner color={t.primary}/> Fetching…</>
                  : <><span style={{ fontSize: 14 }}>✦</span> AI FILL</>
                }
              </div>
            }
          />

          {fillErr && <div style={{ fontSize: 12, color: t.red, marginTop: -8 }}>{fillErr}</div>}

          <Field label="EXAMPLE (optional)" value={sentence} onChange={setSentence}
            placeholder="A sentence using this word…" multiline/>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <BigButton ghost onClick={onCancel} style={{ flex: 1 }}>Cancel</BigButton>
          <BigButton
            disabled={!canAdd}
            onClick={() => canAdd && onAdd({ word: word.trim(), meaning: meaning.trim(), sentence: sentence.trim() })}
            style={{ flex: 1 }}
          >
            Add Word
          </BigButton>
        </div>
      </div>
    </>
  );
}

/* ── Tiny spinner ────────────────────────────────────────────────── */
function Spinner({ color }) {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{
        display: "inline-block", width: 12, height: 12,
        border: `2px solid ${color}33`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}/>
    </>
  );
}

/* ── Word card ───────────────────────────────────────────────────── */
function WordCard({ w, onRemove }) {
  const { theme: t } = useTheme();
  return (
    <div style={{ background: t.card, border: `1.5px solid ${t.line}`, borderRadius: 14, padding: "14px 16px", position: "relative" }}>
      <div style={{ fontWeight: 800, fontSize: 17, color: t.ink, fontFamily: FONT_SERIF }}>{w.word}</div>
      <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 3 }}>{w.meaning}</div>
      {w.sentence && (
        <div style={{ fontSize: 12, color: t.inkFaint, fontStyle: "italic", marginTop: 5, fontFamily: FONT_SERIF }}>"{w.sentence}"</div>
      )}
      <div onClick={() => onRemove(w.word)} style={{
        position: "absolute", top: 12, right: 14,
        color: t.inkFaint, fontSize: 20, fontWeight: 700,
        cursor: "pointer", lineHeight: 1, padding: "2px 6px",
      }}>×</div>
    </div>
  );
}

/* ── Main Screen ─────────────────────────────────────────────────── */
export default function AddWordsScreen({ onBack }) {
  const { theme: t } = useTheme();
  const [words,   setWords]   = useState(seedWords);
  const [search,  setSearch]  = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = words.filter(w =>
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.meaning.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, fontFamily: FONT_SANS, position: "relative" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px", borderBottom: `1px solid ${t.line}`, background: t.bg }}>
        <div onClick={onBack} style={{ cursor: "pointer", padding: "4px", display: "flex" }}>
          <Icon name="chevronLeft" size={26} color={t.ink}/>
        </div>
        <div style={{ flex: 1, fontSize: 22, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>My Words</div>
        <div onClick={() => setShowAdd(true)} style={{
          background: t.primary, color: "#fff",
          padding: "8px 16px", borderRadius: 10,
          fontWeight: 800, fontSize: 13, cursor: "pointer",
          boxShadow: `0 3px 0 ${t.primaryDeep}`,
        }}>
          + ADD
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 16px 6px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search words…" style={{
          width: "100%", padding: "11px 14px",
          border: `1.5px solid ${t.line}`, borderRadius: 12,
          background: t.card, color: t.ink,
          fontSize: 15, fontFamily: FONT_SANS, outline: "none",
        }}/>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: "auto", padding: "4px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0
          ? <div style={{ textAlign: "center", color: t.inkFaint, padding: "40px 0", fontStyle: "italic", fontFamily: FONT_SERIF }}>No words found.</div>
          : filtered.map((w, i) => <WordCard key={w.word + i} w={w} onRemove={word => setWords(ws => ws.filter(x => x.word !== word))}/>)
        }
      </div>

      {showAdd && <AddWordSheet onAdd={w => { setWords(ws => [w, ...ws]); setShowAdd(false); }} onCancel={() => setShowAdd(false)}/>}
    </div>
  );
}
