import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import BigButton from "../components/BigButton";

const ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
];

/** Crossword-style: meaning shown as clue, type the answer letter by letter on a mini keyboard. */
export default function WordPuzzleGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [typed, setTyped] = useState([]);

  const addLetter = (l) => {
    if (answered || typed.length >= q.correct.length) return;
    setTyped(p => [...p, l.toLowerCase()]);
  };

  const backspace = () => {
    if (answered) return;
    setTyped(p => p.slice(0, -1));
  };

  const submit = () => {
    const built = typed.join("");
    onAnswer(built.toLowerCase() === q.correct.toLowerCase());
  };

  const wordLen = q.correct.length;
  const filled  = typed.length === wordLen;

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Clue */}
      <div style={{
        background: t.primarySoft, border: `1.5px solid ${t.primary}`,
        borderRadius: 14, padding: "14px 18px",
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: t.primaryDeep, marginBottom: 6 }}>
          ACROSS CLUE
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: t.ink, lineHeight: 1.4, fontFamily: FONT_SERIF }}>
          {q.meaning}
        </div>
      </div>

      {/* Letter slots */}
      <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
        {Array.from({ length: wordLen }, (_, i) => (
          <div key={i} style={{
            width: Math.max(30, Math.min(42, 280 / wordLen)),
            height: 44, borderRadius: 8,
            border: `2.5px solid ${typed[i] ? t.primary : t.line}`,
            background: typed[i] ? t.primarySoft : t.card,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: t.ink,
            fontFamily: FONT_SERIF,
            transition: "border-color 120ms, background 120ms",
          }}>
            {typed[i]?.toUpperCase() ?? ""}
          </div>
        ))}
      </div>

      {/* Mini keyboard */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}>
        {ROWS.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 4 }}>
            {row.map(l => (
              <div key={l} onClick={() => addLetter(l)} style={{
                width: 28, height: 36, borderRadius: 6,
                background: t.card, border: `1.5px solid ${t.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, color: t.ink,
                cursor: "pointer", userSelect: "none",
                boxShadow: `0 2px 0 ${t.line}`,
                fontFamily: FONT_SANS,
              }}>
                {l}
              </div>
            ))}
            {ri === 2 && (
              <div onClick={backspace} style={{
                padding: "0 8px", height: 36, borderRadius: 6,
                background: t.card, border: `1.5px solid ${t.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, color: t.inkSoft,
                cursor: "pointer", userSelect: "none",
                boxShadow: `0 2px 0 ${t.line}`,
                fontFamily: FONT_SANS,
              }}>
                ⌫
              </div>
            )}
          </div>
        ))}
      </div>

      <BigButton onClick={submit} disabled={!filled || answered} style={{ width: "100%" }}>
        Check Word
      </BigButton>
    </div>
  );
}
