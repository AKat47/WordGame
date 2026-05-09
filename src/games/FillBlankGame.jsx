import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { shade } from "../utils/color";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import Mascot from "../components/Mascot";
import BigButton from "../components/BigButton";
import { splitSentence } from "../utils/ai";

/* ─── Split seed sentence into before/after the blank ───────────── */
function generateSentence({ word, seedSentence }) {
  return Promise.resolve(splitSentence(seedSentence, word));
}

/* ─── Animated dots ──────────────────────────────────────────────── */
function ThinkingDots({ color }) {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
      <style>{`@keyframes dotB{0%,80%,100%{transform:scale(0.6);opacity:.3}40%{transform:scale(1);opacity:1}}`}</style>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: color,
          display: "inline-block",
          animation: `dotB 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </span>
  );
}

/* ─── Main game ──────────────────────────────────────────────────── */
export default function FillBlankGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();

  // sentenceParts come from Claude; start null while loading
  const [parts, setParts]     = useState(q.sentenceParts); // may be null
  const [loading, setLoading] = useState(!q.sentenceParts);
  const [error, setError]     = useState(null);
  const [pick, setPick]       = useState(null);

  /* ── Fetch sentence from Claude on mount if not pre-generated ── */
  useEffect(() => {
    if (q.sentenceParts) return; // already have parts (e.g. hardcoded question)
    let cancelled = false;

    (async () => {
      try {
        const result = await generateSentence({
          word:         q.word,
          meaning:      q.meaning,
          seedSentence: q.sentence,
        });
        if (!cancelled) {
          setParts(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          // Fallback: parse seed sentence into before/after
          const s   = q.sentence ?? "";
          const idx = s.toLowerCase().indexOf(q.word.toLowerCase());
          if (idx >= 0) {
            setParts({ before: s.slice(0, idx), after: s.slice(idx + q.word.length) });
          } else {
            setParts({ before: "The word is ", after: "." });
          }
          setError("Couldn't generate a new sentence — using the original one.");
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const choose = (opt) => {
    if (answered || !parts) return;
    setPick(opt);
    setTimeout(() => onAnswer(opt === q.correct, opt), 300);
  };

  /* ── Loading state ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, fontFamily: FONT_SANS }}>
        <Mascot size={90} mood="think" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: t.inkSoft, fontSize: 15, fontStyle: "italic", fontFamily: FONT_SERIF }}>
          Writing a sentence <ThinkingDots color={t.primary} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 18, fontFamily: FONT_SANS }}>

      {/* Prompt */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase", marginBottom: 8 }}>
          Finish the story
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: t.ink }}>
          Tap the word that fits
        </div>
      </div>

      {/* Sentence card */}
      {error && (
        <div style={{ fontSize: 11, color: t.inkSoft, fontStyle: "italic", textAlign: "center" }}>
          {error}
        </div>
      )}
      <div style={{
        background: "#FFFDF5",
        border: `1.5px solid ${t.line}`,
        borderLeft: `5px solid ${t.primary}`,
        borderRadius: 12, padding: "16px 18px",
        fontFamily: FONT_SERIF, fontSize: 18, lineHeight: 1.7, color: t.ink,
      }}>
        {parts.before}
        <span style={{
          display: "inline-block", minWidth: 90, textAlign: "center",
          borderBottom: `2.5px dashed ${pick ? t.primary : t.inkFaint}`,
          color: pick ? t.primary : "transparent",
          fontWeight: 800, padding: "0 6px", margin: "0 2px",
          fontStyle: "normal",
        }}>
          {pick || "___"}
        </span>
        {parts.after}
      </div>

      {/* Options grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.options.map((opt, i) => {
          const selected  = pick === opt;
          const isCorrect = answered && opt === q.correct;
          const isWrong   = answered && selected && opt !== q.correct;
          const border    = isCorrect ? t.sage : isWrong ? t.red : selected ? t.primary : t.line;

          return (
            <div key={i} onClick={() => choose(opt)} style={{
              background: t.card,
              border: `2.5px solid ${border}`,
              borderRadius: 14, padding: "14px 10px",
              textAlign: "center",
              cursor: answered ? "default" : "pointer",
              boxShadow: `0 3px 0 ${border === t.line ? t.line : shade(border)}`,
              fontSize: 17, fontWeight: 800, color: t.ink,
              fontFamily: FONT_SERIF,
              transition: "border-color 150ms",
            }}>
              {opt}
            </div>
          );
        })}
      </div>

      {/* Regenerate button (only before answering) */}
      {!answered && (
        <div style={{ textAlign: "center" }}>
          <BigButton
            ghost small
            onClick={() => {
              setParts(null);
              setPick(null);
              setLoading(true);
              setError(null);
              generateSentence({ word: q.word, meaning: q.meaning, seedSentence: q.sentence })
                .then(r => { setParts(r); setLoading(false); })
                .catch(() => {
                  const s = q.sentence ?? "";
                  const idx = s.toLowerCase().indexOf(q.word.toLowerCase());
                  setParts(idx >= 0
                    ? { before: s.slice(0, idx), after: s.slice(idx + q.word.length) }
                    : { before: "The word is ", after: "." });
                  setError("Using original sentence.");
                  setLoading(false);
                });
            }}
          >
            ✨ New sentence
          </BigButton>
        </div>
      )}
    </div>
  );
}
