import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";

/** Harder fill-in-the-blank: sentence shown, pick the word — no meaning clue. */
export default function WordMasterGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [selected, setSelected] = useState(null);

  const pick = (opt) => {
    if (answered) return;
    setSelected(opt);
    onAnswer(opt === q.correct);
  };

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase" }}>
        Fill in the blank
      </div>

      {/* Sentence with blank */}
      <div style={{
        background: t.card, border: `1.5px solid ${t.line}`,
        borderRadius: 16, padding: "20px",
        fontSize: 20, fontFamily: FONT_SERIF, color: t.ink,
        lineHeight: 1.6, textAlign: "center",
      }}>
        {q.sentenceParts.before}
        <span style={{
          display: "inline-block",
          minWidth: 90, borderBottom: `3px solid ${t.primary}`,
          color: t.primary, fontWeight: 800,
          padding: "0 6px",
        }}>
          {answered ? q.correct : "　"}
        </span>
        {q.sentenceParts.after}
      </div>

      {/* Word options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.options.map((opt, i) => {
          const isCorrect  = opt === q.correct;
          const isSelected = opt === selected;
          let bg = t.card, border = t.line, color = t.ink;
          if (answered) {
            if (isCorrect)       { bg = t.sageSoft; border = t.sageDeep; color = t.sageDeep; }
            else if (isSelected) { bg = t.redSoft;  border = t.red;      color = t.red; }
          }
          return (
            <div key={i} onClick={() => pick(opt)} style={{
              padding: "14px 10px", borderRadius: 14,
              background: bg, border: `2px solid ${border}`,
              fontSize: 16, fontWeight: 800, color,
              fontFamily: FONT_SERIF, textAlign: "center",
              cursor: answered ? "default" : "pointer",
              boxShadow: answered ? "none" : `0 3px 0 ${t.line}`,
              transition: "background 150ms",
            }}>
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}
