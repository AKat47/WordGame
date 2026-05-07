import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";
import BigButton from "../components/BigButton";

export default function SpellGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [picked, setPicked]       = useState([]);          // indices into q.letters (in order picked)
  const [available, setAvailable] = useState(() => q.letters.map((_, i) => i));

  const pickLetter = (idx) => {
    if (answered || !available.includes(idx)) return;
    setPicked(p => [...p, idx]);
    setAvailable(a => a.filter(x => x !== idx));
  };

  const unpickSlot = (slot) => {
    if (answered) return;
    const letterIdx = picked[slot];
    setPicked(p => p.filter((_, s) => s !== slot));
    setAvailable(a => [...a, letterIdx]);
  };

  const submit = () => {
    const built = picked.map(i => q.letters[i]).join("");
    onAnswer(built === q.correct, built);
  };

  const wordLen = q.correct.length;
  const filled  = picked.length === wordLen;

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Prompt */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
          Spell the word for
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: t.ink, lineHeight: 1.25 }}>
          "{q.meaning}"
        </div>
      </div>

      {/* Letter slots */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {Array.from({ length: wordLen }, (_, s) => {
          const letter = picked[s] !== undefined ? q.letters[picked[s]] : "";
          return (
            <div key={s} onClick={() => letter && unpickSlot(s)} style={{
              width: 36, height: 48, borderRadius: 8,
              border: `2px solid ${letter ? t.primary : t.line}`,
              background: letter ? t.primarySoft : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: t.ink,
              fontFamily: FONT_SERIF,
              cursor: letter ? "pointer" : "default",
            }}>
              {letter}
            </div>
          );
        })}
      </div>

      {/* Letter bank */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 10px" }}>
        {q.letters.map((l, i) => {
          const used = !available.includes(i);
          return (
            <div key={i} onClick={() => pickLetter(i)} style={{
              width: 42, height: 50, borderRadius: 10,
              background: used ? t.bgDeep : t.card,
              border: `2px solid ${t.line}`,
              boxShadow: used ? "none" : `0 3px 0 ${t.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800,
              color: used ? t.inkFaint : t.ink,
              fontFamily: FONT_SERIF,
              cursor: used ? "default" : "pointer",
              opacity: used ? 0.3 : 1,
            }}>
              {used ? "" : l}
            </div>
          );
        })}
      </div>

      <BigButton onClick={submit} disabled={!filled || answered} style={{ width: "100%" }}>
        Check
      </BigButton>
    </div>
  );
}
