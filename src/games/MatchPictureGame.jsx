import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { shade } from "../utils/color";
import { FONT_SERIF } from "../data/themes";
import Mascot from "../components/Mascot";

export default function MatchPictureGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [pick, setPick] = useState(null);

  const choose = (value) => {
    if (answered) return;
    setPick(value);
    setTimeout(() => onAnswer(value === q.correct, value), 300);
  };

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Prompt */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
          Which of these is
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: t.ink, lineHeight: 1.25 }}>{q.word}</div>
      </div>

      {/* Mascot + hint bubble (shows definition, not the sentence) */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 8 }}>
        <Mascot size={80} mood="think"/>
        <div style={{
          background: t.card, padding: "10px 14px", borderRadius: 14,
          border: `2px solid ${t.line}`, position: "relative",
          fontSize: 15, fontStyle: "italic", color: t.inkSoft,
          fontFamily: FONT_SERIF, maxWidth: 220,
        }}>
          {q.meaning}
          <div style={{
            position: "absolute", left: -8, bottom: 14, width: 0, height: 0,
            borderTop: "8px solid transparent", borderBottom: "8px solid transparent",
            borderRight: `8px solid ${t.line}`,
          }}/>
        </div>
      </div>

      {/* Option grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {q.options.map((opt) => {
          const selected = pick === opt.value;
          const isCorrect = answered && opt.value === q.correct;
          const isWrong   = answered && selected && opt.value !== q.correct;
          const border    = isCorrect ? t.sage : isWrong ? t.red : selected ? t.primary : t.line;

          return (
            <div key={opt.value} onClick={() => choose(opt.value)} style={{
              background: t.card, border: `3px solid ${border}`, borderRadius: 16,
              padding: "20px 10px 14px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8,
              cursor: answered ? "default" : "pointer",
              boxShadow: `0 3px 0 ${border === t.line ? t.line : shade(border)}`,
              transform: selected ? "translateY(1px)" : "none",
              transition: "transform 80ms",
            }}>
              <div style={{ fontSize: 56 }}>{opt.emoji || "❓"}</div>
              {/* Only reveal word label after answering */}
              {answered && (
                <div style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? t.sage : isWrong ? t.red : t.inkSoft }}>
                  {opt.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
