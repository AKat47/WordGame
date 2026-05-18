import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import BigButton from "../components/BigButton";

const MAX_WRONG = 6;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

/* ── Hangman SVG drawing ─────────────────────────────────────────── */
function HangmanDrawing({ wrong }) {
  const { theme: t } = useTheme();
  const stroke = { stroke: t.ink, strokeWidth: 3, strokeLinecap: "round" };
  // Reduced from 160×180 → 130×145 to save vertical space on small screens
  return (
    <svg viewBox="0 0 160 180" width={130} height={130} style={{ display: "block", margin: "0 auto" }}>
      {/* Gallows */}
      <line x1="20" y1="170" x2="140" y2="170" {...stroke}/>
      <line x1="60" y1="170" x2="60" y2="10"  {...stroke}/>
      <line x1="60" y1="10"  x2="110" y2="10" {...stroke}/>
      <line x1="110" y1="10" x2="110" y2="30" {...stroke}/>
      {/* Head */}
      {wrong >= 1 && <circle cx="110" cy="44" r="14" fill="none" {...stroke}/>}
      {/* Body */}
      {wrong >= 2 && <line x1="110" y1="58" x2="110" y2="110" {...stroke}/>}
      {/* Left arm */}
      {wrong >= 3 && <line x1="110" y1="70" x2="85"  y2="95"  {...stroke}/>}
      {/* Right arm */}
      {wrong >= 4 && <line x1="110" y1="70" x2="135" y2="95"  {...stroke}/>}
      {/* Left leg */}
      {wrong >= 5 && <line x1="110" y1="110" x2="85" y2="140" {...stroke}/>}
      {/* Right leg */}
      {wrong >= 6 && <line x1="110" y1="110" x2="135" y2="140" {...stroke}/>}
      {/* Face — only when dead */}
      {wrong >= MAX_WRONG && <>
        <line x1="104" y1="39" x2="108" y2="43" {...stroke} strokeWidth={2}/>
        <line x1="108" y1="39" x2="104" y2="43" {...stroke} strokeWidth={2}/>
        <line x1="112" y1="39" x2="116" y2="43" {...stroke} strokeWidth={2}/>
        <line x1="116" y1="39" x2="112" y2="43" {...stroke} strokeWidth={2}/>
        <path d="M 104 50 Q 110 46 116 50" fill="none" {...stroke} strokeWidth={2}/>
      </>}
    </svg>
  );
}

/* ── Main game ───────────────────────────────────────────────────── */
export default function HangmanGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const word    = q.word.toLowerCase();
  const letters = new Set(word.split(""));

  const [guessed, setGuessed] = useState(new Set());
  const [done,    setDone]    = useState(false);

  const wrong   = [...guessed].filter(l => !letters.has(l)).length;
  const won     = [...letters].every(l => guessed.has(l));
  const lost    = wrong >= MAX_WRONG;
  const isOver  = won || lost;

  /* Fire onAnswer when game ends */
  useEffect(() => {
    if (isOver && !done) {
      setDone(true);
      setTimeout(() => onAnswer(won, q.word), 900);
    }
  }, [isOver]);

  const guess = (letter) => {
    if (answered || isOver || guessed.has(letter)) return;
    setGuessed(prev => new Set([...prev, letter]));
  };

  /* Hearts remaining */
  const heartsLeft = MAX_WRONG - wrong;

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 10, fontFamily: FONT_SANS, overflowY: "auto" }}>

      {/* Prompt */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>
          Guess the word
        </div>
        <div style={{ fontSize: 14, color: t.inkSoft, fontStyle: "italic", fontFamily: FONT_SERIF }}>
          Hint: {q.meaning}
        </div>
      </div>

      {/* Drawing */}
      <div style={{ background: t.card, border: `1.5px solid ${t.line}`, borderRadius: 16, padding: "10px 0 4px" }}>
        <HangmanDrawing wrong={wrong}/>
        {/* Chances left */}
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: wrong >= 4 ? t.red : t.inkSoft, paddingBottom: 8 }}>
          {lost ? "No more chances!" : `${heartsLeft} chance${heartsLeft !== 1 ? "s" : ""} left`}
        </div>
      </div>

      {/* Word blanks */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "4px 0" }}>
        {word.split("").map((letter, i) => {
          const revealed = guessed.has(letter) || lost;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, fontFamily: FONT_SERIF,
                color: lost && !guessed.has(letter) ? t.red : t.ink,
              }}>
                {revealed ? letter.toUpperCase() : ""}
              </div>
              <div style={{ width: 32, height: 3, borderRadius: 2, background: revealed ? t.primary : t.inkFaint }}/>
            </div>
          );
        })}
      </div>

      {/* Win/Lose message */}
      {isOver && (
        <div style={{
          textAlign: "center", padding: "10px 16px", borderRadius: 12,
          background: won ? t.sageSoft : t.redSoft,
          border: `1.5px solid ${won ? t.sage : t.red}`,
          fontSize: 15, fontWeight: 800, color: won ? t.sageDeep : t.red,
          fontFamily: FONT_SERIF,
        }}>
          {won ? `🎉 "${q.word}" — ${q.meaning}!` : `The word was "${q.word}"`}
        </div>
      )}

      {/* Alphabet keyboard — smaller keys so all 26 fit in 2 rows on narrow screens */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
        {ALPHABET.map(letter => {
          const isGuessed = guessed.has(letter);
          const isCorrect = isGuessed && letters.has(letter);
          const isWrong   = isGuessed && !letters.has(letter);
          return (
            <div key={letter} onClick={() => guess(letter)} style={{
              width: 32, height: 36, borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, fontFamily: FONT_SERIF,
              textTransform: "uppercase",
              background: isCorrect ? t.sage : isWrong ? t.redSoft : t.card,
              border: `2px solid ${isCorrect ? t.sageDeep : isWrong ? t.red : t.line}`,
              color: isCorrect ? "#fff" : isWrong ? t.red : t.ink,
              opacity: isGuessed ? 0.5 : 1,
              cursor: isGuessed || isOver ? "default" : "pointer",
              boxShadow: isGuessed ? "none" : `0 2px 0 ${t.line}`,
              transition: "all 100ms",
            }}>
              {letter}
            </div>
          );
        })}
      </div>
    </div>
  );
}
