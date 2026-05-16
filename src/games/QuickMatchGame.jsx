import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";
import { shuffle } from "../utils/shuffle";

/** Two-column matching: tap a word, then tap its meaning to connect them. */
export default function QuickMatchGame({ q, onAnswer }) {
  const { theme: t } = useTheme();
  const [shuffledMeanings] = useState(() => shuffle(q.pairs.map(p => p.meaning)));
  const [selectedWord, setSelectedWord] = useState(null);
  const [matched, setMatched]           = useState({});  // { word: meaning }
  const [wrongPair, setWrongPair]       = useState(null); // "word:meaning"

  const wordFor = (meaning) => q.pairs.find(p => p.meaning === meaning)?.word;

  const tapWord = (word) => {
    if (matched[word]) return;
    setSelectedWord(w => (w === word ? null : word));
  };

  const tapMeaning = (meaning) => {
    if (!selectedWord || matched[wordFor(meaning)]) return;
    const correct = wordFor(meaning) === selectedWord;
    if (correct) {
      const next = { ...matched, [selectedWord]: meaning };
      setMatched(next);
      setSelectedWord(null);
      if (Object.keys(next).length === q.pairs.length) {
        setTimeout(() => onAnswer(true), 400);
      }
    } else {
      setWrongPair(`${selectedWord}:${meaning}`);
      setTimeout(() => { setWrongPair(null); setSelectedWord(null); }, 650);
    }
  };

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft }}>
        TAP A WORD, THEN ITS MEANING
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {/* Words */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {q.pairs.map(({ word }) => {
            const isMatched  = !!matched[word];
            const isSelected = selectedWord === word;
            const isWrong    = wrongPair?.startsWith(word + ":");
            let bg = t.card, border = t.line, color = t.ink;
            if (isMatched)   { bg = t.sageSoft; border = t.sageDeep; color = t.sageDeep; }
            else if (isWrong)  { bg = t.redSoft;  border = t.red;      color = t.red; }
            else if (isSelected){ bg = t.primarySoft; border = t.primary; }
            return (
              <div key={word} onClick={() => tapWord(word)} style={{
                padding: "12px 10px", borderRadius: 12, minHeight: 52,
                background: bg, border: `2px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 800, color,
                fontFamily: FONT_SERIF, textAlign: "center",
                cursor: isMatched ? "default" : "pointer",
                transition: "all 150ms",
                opacity: isMatched ? 0.65 : 1,
                boxShadow: isSelected ? `0 3px 0 ${t.primaryDeep}` : "none",
              }}>
                {isMatched ? "✓ " : ""}{word}
              </div>
            );
          })}
        </div>

        {/* Meanings */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {shuffledMeanings.map((meaning) => {
            const word      = wordFor(meaning);
            const isMatched = matched[word] === meaning;
            const isWrong   = wrongPair?.endsWith(":" + meaning);
            let bg = t.card, border = t.line, color = t.ink;
            if (isMatched) { bg = t.sageSoft; border = t.sageDeep; color = t.sageDeep; }
            else if (isWrong) { bg = t.redSoft; border = t.red; color = t.red; }
            return (
              <div key={meaning} onClick={() => tapMeaning(meaning)} style={{
                padding: "10px 8px", borderRadius: 12, minHeight: 52,
                background: bg, border: `2px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color,
                textAlign: "center", lineHeight: 1.35,
                cursor: (isMatched || !selectedWord) ? "default" : "pointer",
                transition: "all 150ms",
                opacity: isMatched ? 0.65 : 1,
              }}>
                {meaning}
              </div>
            );
          })}
        </div>
      </div>

      {Object.keys(matched).length === q.pairs.length && (
        <div style={{ textAlign: "center", fontSize: 20, fontWeight: 800, color: t.sageDeep }}>
          🎉 All matched!
        </div>
      )}
    </div>
  );
}
