import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { buildTypedQuestions } from "../data/questions";
import { VOCAB_BOOKS } from "../data/vocab";
import ProgressBar from "../components/ProgressBar";
import FeedbackDrawer from "../components/FeedbackDrawer";
import Icon from "../components/Icon";
import MatchDefinitionGame from "../games/MatchDefinitionGame";
import ListenTapGame       from "../games/ListenTapGame";
import SpellGame           from "../games/SpellGame";
import HangmanGame         from "../games/HangmanGame";

const GAME_MAP = {
  definition: MatchDefinitionGame,
  listen:     ListenTapGame,
  spell:      SpellGame,
  hangman:    HangmanGame,
};

/* ── Web Audio sound effects (no audio files needed) ─────────────── */
function playSound(correct) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (correct) {
      // Pleasant two-note chime: C5 → E5
      [523.25, 659.25].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t0 = ctx.currentTime + i * 0.13;
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.28, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.38);
        osc.start(t0);
        osc.stop(t0 + 0.38);
      });
    } else {
      // Short low buzz
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.value = 140;
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.28);
    }
  } catch { /* audio blocked — silently skip */ }
}

function LessonHeader({ progress, hearts, onExit }) {
  const { theme: t } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px 14px", background: t.bg }}>
      <div onClick={onExit} style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Icon name="x" size={26} color={t.inkFaint}/>
      </div>
      <ProgressBar value={progress} max={1} color={t.sage}/>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Icon name="heart" size={22} color={t.red}/>
        <span style={{ color: t.red, fontWeight: 800, fontSize: 18 }}>{hearts}</span>
      </div>
    </div>
  );
}

export default function LessonRunner({ questions: propQuestions, onExit, onComplete }) {
  const [questions] = useState(() =>
    propQuestions ?? buildTypedQuestions(VOCAB_BOOKS[0].lessons[0], "mix", 5)
  );
  const [idx, setIdx]              = useState(0);
  const [hearts, setHearts]        = useState(5);
  const [answered, setAnswered]    = useState(false);
  const [feedback, setFeedback]    = useState(null);
  const [correctCount, setCorrect] = useState(0);
  const { theme: t } = useTheme();

  const done = idx >= questions.length;

  useEffect(() => {
    if (done) {
      onComplete({
        xp:       20 + correctCount * 6,
        accuracy: Math.round((correctCount / questions.length) * 100),
        words:    questions.length,
      });
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) return null;

  const q        = questions[idx];
  const progress = idx / questions.length;

  const handleAnswer = (correct) => {
    playSound(correct);
    setAnswered(true);
    if (correct) setCorrect(c => c + 1);
    else         setHearts(h => Math.max(0, h - 1));
    setFeedback({
      correct,
      correctAnswer: q.correctLabel || q.correct,
      explanation:   correct ? q.praise : q.explanation,
    });
  };

  const next = () => { setAnswered(false); setFeedback(null); setIdx(i => i + 1); };

  const GameComponent = GAME_MAP[q.type];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg }}>
      <LessonHeader progress={progress} hearts={hearts} onExit={onExit}/>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {GameComponent && <GameComponent key={idx} q={q} onAnswer={handleAnswer} answered={answered}/>}
      </div>
      {feedback && (
        <FeedbackDrawer
          correct={feedback.correct}
          correctAnswer={feedback.correctAnswer}
          explanation={feedback.explanation}
          onContinue={next}
        />
      )}
    </div>
  );
}
