import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";

const TIME_LIMIT = 10;

export default function WordChallengeGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected]  = useState(null);

  useEffect(() => {
    if (answered) return;
    const id = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { clearInterval(id); onAnswer(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [answered]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (opt) => {
    if (answered) return;
    setSelected(opt);
    onAnswer(opt === q.correct);
  };

  const pct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timeLeft > 6 ? t.sage : timeLeft > 3 ? t.gold : t.red;

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Countdown bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: t.line, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: timerColor,
            transition: "width 1s linear, background 500ms",
            borderRadius: 4,
          }}/>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: timerColor, minWidth: 26, textAlign: "right" }}>
          {timeLeft}
        </div>
      </div>

      {/* Word prompt */}
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, marginBottom: 10 }}>
          WHAT DOES THIS WORD MEAN?
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>
          {q.word}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          const isCorrect  = opt === q.correct;
          const isSelected = opt === selected;
          let bg = t.card, border = t.line, color = t.ink;
          if (answered) {
            if (isCorrect)        { bg = t.sageSoft; border = t.sageDeep; color = t.sageDeep; }
            else if (isSelected)  { bg = t.redSoft;  border = t.red;      color = t.red; }
          }
          return (
            <div key={i} onClick={() => pick(opt)} style={{
              padding: "14px 16px", borderRadius: 14,
              background: bg, border: `2px solid ${border}`,
              fontSize: 14, fontWeight: 700, color, lineHeight: 1.4,
              cursor: answered ? "default" : "pointer",
              transition: "background 150ms, border-color 150ms",
            }}>
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}
