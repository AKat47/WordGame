import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";
import { shuffle } from "../utils/shuffle";

/** Flip cards to find word + meaning pairs. Classic memory game. */
export default function MemoryMatchGame({ q, onAnswer }) {
  const { theme: t } = useTheme();

  const [cards] = useState(() => {
    const all = [];
    q.pairs.forEach(({ word, meaning }) => {
      all.push({ id: `${word}_w`, label: word,    match: word, isWord: true });
      all.push({ id: `${word}_m`, label: meaning, match: word, isWord: false });
    });
    return shuffle(all);
  });

  const [faceUp,  setFaceUp]  = useState(new Set()); // currently flipped
  const [matched, setMatched] = useState(new Set()); // permanently matched
  const [locked,  setLocked]  = useState(false);

  const flip = (card) => {
    if (locked || faceUp.has(card.id) || matched.has(card.id)) return;

    const next = new Set(faceUp);
    next.add(card.id);
    setFaceUp(next);

    const open = cards.filter(c => next.has(c.id) && !matched.has(c.id));
    if (open.length < 2) return;

    setLocked(true);
    const [a, b] = open;

    if (a.match === b.match) {
      setTimeout(() => {
        const m = new Set(matched);
        m.add(a.id); m.add(b.id);
        setMatched(m);
        setFaceUp(new Set());
        setLocked(false);
        if (m.size === cards.length) setTimeout(() => onAnswer(true), 400);
      }, 500);
    } else {
      setTimeout(() => { setFaceUp(new Set()); setLocked(false); }, 900);
    }
  };

  return (
    <div style={{ padding: "8px 20px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, marginBottom: 14 }}>
        FLIP & MATCH — FIND WORD + MEANING PAIRS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {cards.map(card => {
          const isMatched = matched.has(card.id);
          const isUp      = faceUp.has(card.id) || isMatched;
          return (
            <div
              key={card.id}
              onClick={() => flip(card)}
              style={{ height: 84, perspective: "600px", cursor: isMatched ? "default" : "pointer" }}
            >
              <div style={{
                width: "100%", height: "100%",
                position: "relative",
                transformStyle: "preserve-3d",
                transition: "transform 0.38s cubic-bezier(.4,0,.2,1)",
                transform: isUp ? "rotateY(180deg)" : "rotateY(0)",
              }}>
                {/* Back (face-down) */}
                <div style={{
                  position: "absolute", inset: 0,
                  backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                  background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDeep})`,
                  borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>
                  🌸
                </div>
                {/* Front (face-up) */}
                <div style={{
                  position: "absolute", inset: 0,
                  backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: isMatched ? t.sageSoft : t.card,
                  border: `2px solid ${isMatched ? t.sageDeep : t.primary}`,
                  borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 8, textAlign: "center",
                  fontSize: card.isWord ? 14 : 11,
                  fontWeight: 800,
                  fontFamily: card.isWord ? FONT_SERIF : "inherit",
                  color: isMatched ? t.sageDeep : t.ink,
                  lineHeight: 1.3,
                }}>
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: t.inkFaint }}>
        {matched.size / 2} / {q.pairs.length} pairs found
      </div>
    </div>
  );
}
