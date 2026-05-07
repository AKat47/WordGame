import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { buildTypedQuestions } from "../data/questions";
import { VOCAB_BOOKS } from "../data/vocab";
import ProgressBar from "../components/ProgressBar";
import FeedbackDrawer from "../components/FeedbackDrawer";
import Icon from "../components/Icon";
import MatchPictureGame    from "../games/MatchPictureGame";
import MatchDefinitionGame from "../games/MatchDefinitionGame";
import ListenTapGame       from "../games/ListenTapGame";
import SpellGame           from "../games/SpellGame";
import FillBlankGame       from "../games/FillBlankGame";
import HangmanGame         from "../games/HangmanGame";

const GAME_MAP = {
  picture:    MatchPictureGame,
  definition: MatchDefinitionGame,
  listen:     ListenTapGame,
  spell:      SpellGame,
  fill:       FillBlankGame,
  hangman:    HangmanGame,
};

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

  if (idx >= questions.length) {
    onComplete({
      xp:       20 + correctCount * 6,
      accuracy: Math.round((correctCount / questions.length) * 100),
      words:    questions.length,
    });
    return null;
  }

  const q        = questions[idx];
  const progress = idx / questions.length;

  const handleAnswer = (correct) => {
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
