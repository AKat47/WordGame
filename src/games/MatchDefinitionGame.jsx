import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { shade } from "../utils/color";
import { FONT_SERIF } from "../data/themes";

export default function MatchDefinitionGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [pick, setPick] = useState(null);

  const choose = (opt) => {
    if (answered) return;
    setPick(opt);
    setTimeout(() => onAnswer(opt === q.correct, opt), 300);
  };

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Prompt */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
          What does this word mean?
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: t.ink, lineHeight: 1.25, fontFamily: FONT_SERIF }}>
          {q.word}
        </div>
      </div>

      {/* Sentence card */}
      <div style={{
        background: "#FFFDF5", border: `1.5px solid ${t.line}`,
        borderLeft: `6px solid ${t.primary}`, borderRadius: 10,
        padding: "14px 16px", fontFamily: FONT_SERIF,
        fontSize: 16, lineHeight: 1.45, color: t.ink, fontStyle: "italic",
      }}>
        {q.sentenceParts.before}
        <span style={{
          background: t.goldSoft, fontStyle: "normal", fontWeight: 800,
          padding: "1px 4px", borderRadius: 4, color: t.goldDeep,
        }}>
          {q.word}
        </span>
        {q.sentenceParts.after}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          const selected  = pick === opt;
          const isCorrect = answered && opt === q.correct;
          const isWrong   = answered && selected && opt !== q.correct;
          const border    = isCorrect ? t.sage : isWrong ? t.red : selected ? t.primary : t.line;

          return (
            <div key={i} onClick={() => choose(opt)} style={{
              background: t.card, border: `2.5px solid ${border}`,
              borderRadius: 14, padding: "14px",
              display: "flex", alignItems: "center", gap: 12,
              cursor: answered ? "default" : "pointer",
              boxShadow: `0 3px 0 ${border === t.line ? t.line : shade(border)}`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                border: `2px solid ${border}`, color: border,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 13, flexShrink: 0,
              }}>
                {String.fromCharCode(65 + i)}
              </div>
              <div style={{ fontSize: 14, color: t.ink, lineHeight: 1.4, flex: 1 }}>{opt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
