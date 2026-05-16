import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";

export default function FlashCardGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [flipped, setFlipped] = useState(false);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase" }}>
        Do you know this word?
      </div>

      {/* 3D flip card */}
      <div
        onClick={() => !answered && setFlipped(f => !f)}
        style={{
          width: "100%", maxWidth: 320, height: 220,
          perspective: "1000px",
          cursor: answered ? "default" : "pointer",
        }}
      >
        <div style={{
          width: "100%", height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.45s cubic-bezier(.4,0,.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>

          {/* Front — word */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: t.card,
            border: `2px solid ${t.line}`,
            borderRadius: 20,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 10, padding: 24,
            boxShadow: `0 6px 0 ${t.line}`,
          }}>
            <div style={{ fontSize: 40 }}>{q.emoji || "📖"}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, textAlign: "center" }}>
              {q.word}
            </div>
            <div style={{ fontSize: 12, color: t.inkFaint, marginTop: 4 }}>Tap to reveal meaning</div>
          </div>

          {/* Back — meaning + example */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: t.primarySoft,
            border: `2px solid ${t.primary}`,
            borderRadius: 20,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 12, padding: 24,
            boxShadow: `0 6px 0 ${t.primaryDeep}`,
          }}>
            <div style={{
              fontSize: 16, fontWeight: 800,
              color: t.ink, textAlign: "center", lineHeight: 1.45,
              fontFamily: FONT_SANS,
            }}>
              {q.meaning}
            </div>
            {q.sentence && (
              <div style={{
                fontSize: 13, color: t.inkSoft,
                fontStyle: "italic", textAlign: "center",
                lineHeight: 1.5, fontFamily: FONT_SERIF,
              }}>
                "{q.sentence}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Self-rating — shown only after flip */}
      {flipped && !answered && (
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button
            onClick={() => onAnswer(false)}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 14,
              background: t.redSoft, border: `2px solid ${t.red}`,
              color: t.red, fontSize: 15, fontWeight: 800,
              fontFamily: FONT_SANS, cursor: "pointer",
            }}
          >
            ✗ Missed it
          </button>
          <button
            onClick={() => onAnswer(true)}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 14,
              background: t.sageSoft, border: `2px solid ${t.sageDeep}`,
              color: t.sageDeep, fontSize: 15, fontWeight: 800,
              fontFamily: FONT_SANS, cursor: "pointer",
            }}
          >
            ✓ Got it!
          </button>
        </div>
      )}

      {!flipped && (
        <div style={{ fontSize: 13, color: t.inkFaint, textAlign: "center" }}>
          Tap the card to flip it
        </div>
      )}
    </div>
  );
}
