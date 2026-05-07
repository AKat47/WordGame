import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { shade } from "../utils/color";
import { FONT_SERIF } from "../data/themes";
import Icon from "../components/Icon";

export default function ListenTapGame({ q, onAnswer, answered }) {
  const { theme: t } = useTheme();
  const [pick, setPick]       = useState(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1400);
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(q.word);
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  // Auto-play on mount
  useEffect(() => { play(); }, []);

  const choose = (opt) => {
    if (answered) return;
    setPick(opt);
    setTimeout(() => onAnswer(opt === q.correct, opt), 300);
  };

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes ripple { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.4);opacity:0} }
        @keyframes pulseSpeaker { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
      `}</style>

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft, textTransform: "uppercase" }}>
        Tap what you hear
      </div>

      {/* Speaker button */}
      <div onClick={play} style={{
        alignSelf: "center", width: 140, height: 140, borderRadius: "50%",
        background: t.primary, boxShadow: `0 6px 0 ${t.primaryDeep}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative",
        animation: playing ? "pulseSpeaker 1s ease-in-out infinite" : "none",
      }}>
        <Icon name="speaker" size={68} color="#fff"/>
        {playing && [0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute",
            inset: -12 - i * 10,
            borderRadius: "50%",
            border: `3px solid ${t.primary}`,
            opacity: 0.5 - i * 0.15,
            animation: `ripple 1.4s ease-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: t.inkSoft, fontWeight: 700, letterSpacing: "1px" }}>
        TAP TO PLAY AGAIN
      </div>

      {/* Word options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.options.map((opt, i) => {
          const selected  = pick === opt;
          const isCorrect = answered && opt === q.correct;
          const isWrong   = answered && selected && opt !== q.correct;
          const border    = isCorrect ? t.sage : isWrong ? t.red : selected ? t.primary : t.line;

          return (
            <div key={i} onClick={() => choose(opt)} style={{
              background: t.card, border: `2.5px solid ${border}`,
              borderRadius: 14, padding: "18px 10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: answered ? "default" : "pointer",
              boxShadow: `0 3px 0 ${border === t.line ? t.line : shade(border)}`,
              fontSize: 18, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF,
            }}>
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}
