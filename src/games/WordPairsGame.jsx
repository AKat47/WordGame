import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";
import { shuffle } from "../utils/shuffle";

/** 8-card grid (words + meanings mixed). Tap two matching cards to connect them. */
export default function WordPairsGame({ q, onAnswer }) {
  const { theme: t } = useTheme();

  const [cards] = useState(() => {
    const all = [];
    q.pairs.forEach(({ word, meaning }) => {
      all.push({ id: `${word}_w`, label: word,    match: word, isWord: true });
      all.push({ id: `${word}_m`, label: meaning, match: word, isWord: false });
    });
    return shuffle(all);
  });

  const [selected, setSelected] = useState(null);   // card id
  const [matched,  setMatched]  = useState(new Set());
  const [wrong,    setWrong]    = useState(null);    // [id, id]

  const tap = (card) => {
    if (matched.has(card.id) || wrong?.includes(card.id)) return;
    if (!selected) { setSelected(card.id); return; }
    if (selected === card.id) { setSelected(null); return; }

    const selCard = cards.find(c => c.id === selected);
    const isMatch = selCard.match === card.match && selCard.id !== card.id;

    if (isMatch) {
      const next = new Set(matched);
      next.add(selected); next.add(card.id);
      setMatched(next);
      setSelected(null);
      if (next.size === cards.length) setTimeout(() => onAnswer(true), 400);
    } else {
      setWrong([selected, card.id]);
      setTimeout(() => { setWrong(null); setSelected(null); }, 700);
    }
  };

  return (
    <div style={{ padding: "8px 20px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, marginBottom: 14 }}>
        MATCH WORD + MEANING PAIRS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {cards.map(card => {
          const isMatched  = matched.has(card.id);
          const isSelected = selected === card.id;
          const isWrong    = wrong?.includes(card.id);
          let bg = t.card, border = t.line, color = t.ink;
          if (isMatched)   { bg = t.sageSoft;   border = t.sageDeep;  color = t.sageDeep; }
          else if (isWrong)  { bg = t.redSoft;    border = t.red;       color = t.red; }
          else if (isSelected){ bg = t.primarySoft; border = t.primary; color = t.ink; }
          return (
            <div
              key={card.id}
              onClick={() => !isMatched && tap(card)}
              style={{
                padding: "14px 10px", borderRadius: 14, minHeight: 68,
                background: bg, border: `2px solid ${border}`,
                boxShadow: isSelected ? `0 4px 0 ${t.primaryDeep}` : isMatched ? "none" : `0 3px 0 ${t.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: card.isWord ? 15 : 11,
                fontWeight: card.isWord ? 800 : 600,
                fontFamily: card.isWord ? FONT_SERIF : "inherit",
                color,
                textAlign: "center", lineHeight: 1.3,
                cursor: isMatched ? "default" : "pointer",
                transition: "all 150ms",
                opacity: isMatched ? 0.7 : 1,
              }}
            >
              {isMatched ? "✓ " : ""}{card.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
