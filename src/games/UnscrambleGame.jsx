import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";
import BigButton from "../components/BigButton";

export default function UnscrambleGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [placed, setPlaced]       = useState([]);          // ordered tile indices
  const [available, setAvailable] = useState(() => q.letters.map((_, i) => i));

  const place = (idx) => {
    if (answered || !available.includes(idx)) return;
    setPlaced(p => [...p, idx]);
    setAvailable(a => a.filter(x => x !== idx));
  };

  const unplace = (slot) => {
    if (answered) return;
    const letterIdx = placed[slot];
    setPlaced(p => p.filter((_, s) => s !== slot));
    setAvailable(a => [...a, letterIdx]);
  };

  const clear = () => {
    setAvailable(q.letters.map((_, i) => i));
    setPlaced([]);
  };

  const submit = () => {
    const built = placed.map(i => q.letters[i]).join("");
    onAnswer(built.toLowerCase() === q.correct.toLowerCase());
  };

  const wordLen  = q.correct.length;
  const filled   = placed.length === wordLen;

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Prompt */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
          Unscramble the word for
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: t.ink, lineHeight: 1.25, fontFamily: FONT_SERIF }}>
          "{q.meaning}"
        </div>
        <div style={{ fontSize: 12, color: t.inkFaint, marginTop: 6 }}>
          {wordLen} letters — tap tiles to build the word
        </div>
      </div>

      {/* Answer slots */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {Array.from({ length: wordLen }, (_, s) => {
          const letter = placed[s] !== undefined ? q.letters[placed[s]] : "";
          return (
            <div
              key={s}
              onClick={() => letter && unplace(s)}
              style={{
                width: 38, height: 50, borderRadius: 8,
                border: `2px solid ${letter ? t.primary : t.line}`,
                background: letter ? t.primarySoft : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, color: t.ink,
                fontFamily: FONT_SERIF,
                cursor: letter ? "pointer" : "default",
                transition: "border-color 120ms, background 120ms",
              }}
            >
              {letter}
            </div>
          );
        })}
      </div>

      {/* Scrambled tile bank */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 10px" }}>
        {q.letters.map((l, i) => {
          const used = !available.includes(i);
          return (
            <div
              key={i}
              onClick={() => place(i)}
              style={{
                width: 44, height: 52, borderRadius: 10,
                background: used ? t.bgDeep : t.card,
                border: `2px solid ${t.line}`,
                boxShadow: used ? "none" : `0 3px 0 ${t.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800,
                color: used ? t.inkFaint : t.ink,
                fontFamily: FONT_SERIF,
                cursor: used ? "default" : "pointer",
                opacity: used ? 0.25 : 1,
                transition: "opacity 120ms",
              }}
            >
              {used ? "" : l}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <BigButton ghost onClick={clear} disabled={answered || placed.length === 0} style={{ flex: 1 }}>
          Clear
        </BigButton>
        <BigButton onClick={submit} disabled={!filled || answered} style={{ flex: 2 }}>
          Check
        </BigButton>
      </div>
    </div>
  );
}
