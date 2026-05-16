import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";
import BigButton from "../components/BigButton";

const DROP_DELAY = 120; // ms between each letter landing

/** Letters animate-drop into view one by one, then user arranges them to spell the word. */
export default function LetterDropGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [placed, setPlaced]     = useState([]);
  const [available, setAvail]   = useState(() => q.letters.map((_, i) => i));
  const [ready, setReady]       = useState(false);
  const [visible, setVisible]   = useState(0); // how many letters have landed

  // Reveal letters one-by-one, then enable interaction
  useEffect(() => {
    if (visible < q.letters.length) {
      const id = setTimeout(() => setVisible(v => v + 1), DROP_DELAY);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => setReady(true), 200);
      return () => clearTimeout(id);
    }
  }, [visible, q.letters.length]);

  const place = (idx) => {
    if (!ready || answered || !available.includes(idx)) return;
    setPlaced(p => [...p, idx]);
    setAvail(a => a.filter(x => x !== idx));
  };

  const unplace = (slot) => {
    if (answered) return;
    const letterIdx = placed[slot];
    setPlaced(p => p.filter((_, s) => s !== slot));
    setAvail(a => [...a, letterIdx]);
  };

  const submit = () => {
    const built = placed.map(i => q.letters[i]).join("");
    onAnswer(built.toLowerCase() === q.correct.toLowerCase());
  };

  const wordLen = q.correct.length;
  const filled  = placed.length === wordLen;

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Prompt */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, marginBottom: 8 }}>
          CATCH THE LETTERS — SPELL THE WORD FOR
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, lineHeight: 1.3 }}>
          "{q.meaning}"
        </div>
      </div>

      {/* Answer slots */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {Array.from({ length: wordLen }, (_, s) => {
          const letter = placed[s] !== undefined ? q.letters[placed[s]] : "";
          return (
            <div key={s} onClick={() => letter && unplace(s)} style={{
              width: 38, height: 50, borderRadius: 8,
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

      {/* Dropping letter bank */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", minHeight: 70, padding: "0 10px" }}>
        {q.letters.map((l, i) => {
          const used        = !available.includes(i);
          const hasLanded   = i < visible;
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
                cursor: (!ready || used) ? "default" : "pointer",
                opacity: hasLanded ? (used ? 0.25 : 1) : 0,
                transform: hasLanded ? "translateY(0)" : "translateY(-24px)",
                transition: `opacity 200ms, transform 250ms cubic-bezier(.2,1.4,.4,1)`,
              }}
            >
              {used ? "" : l}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <BigButton ghost onClick={() => { setAvail(q.letters.map((_,i) => i)); setPlaced([]); }}
          disabled={answered || placed.length === 0} style={{ flex: 1 }}>
          Clear
        </BigButton>
        <BigButton onClick={submit} disabled={!filled || answered} style={{ flex: 2 }}>
          Check
        </BigButton>
      </div>
    </div>
  );
}
