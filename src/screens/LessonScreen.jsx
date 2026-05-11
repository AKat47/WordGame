import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import { VOCAB_BOOKS } from "../data/vocab";
import { buildTypedQuestions } from "../data/questions";
import { loadProgress, saveProgress, syncFromServer, recordGameResult, getGameStat } from "../utils/progress";
import { loadUserWords, syncWordsFromServer } from "../utils/userWords";
import LessonRunner     from "./LessonRunner";
import CompletionScreen from "./CompletionScreen";
import Icon from "../components/Icon";

const BUILTIN_LESSON = VOCAB_BOOKS[0].lessons[0];
const ROUNDS = 5;
const MIN_USER_WORDS = 4; // need ≥4 words for distractors

/* ── Game type cards ─────────────────────────────────────────────── */
const GAME_CARDS = [
  { type: "picture",    emoji: "🖼️",  label: "Picture Match",  desc: "Tap the image that matches the word" },
  { type: "definition", emoji: "📖",  label: "Word Meaning",   desc: "Pick the correct definition" },
  { type: "listen",     emoji: "🔊",  label: "Listen & Tap",   desc: "Hear the word, choose the spelling" },
  { type: "spell",      emoji: "✏️",  label: "Spell It Out",   desc: "Build the word from the letter bank" },
  { type: "fill",       emoji: "✨",  label: "Fill the Blank", desc: "Read a sentence — you complete it" },
  { type: "hangman",    emoji: "🪢",  label: "Hangman",        desc: "Guess the word one letter at a time" },
  { type: "mix",        emoji: "🎲",  label: "Full Lesson",    desc: "All game types mixed together" },
];

/* ── Tiny star-row showing best accuracy ─────────────────────────── */
function AccuracyStars({ accuracy }) {
  const filled = Math.round(accuracy / 20); // 0-100 → 0-5 stars
  return (
    <span style={{ fontSize: 11, letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ opacity: i <= filled ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

function GameCard({ card, stat, onPlay }) {
  const { theme: t } = useTheme();
  const [pressed, setPressed] = useState(false);
  const played = stat.played > 0;

  return (
    <div
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => onPlay(card.type)}
      style={{
        background: t.card, borderRadius: 16,
        border: `2px solid ${played ? t.primary : t.line}`,
        boxShadow: pressed ? "none" : `0 4px 0 ${played ? t.primaryDeep : t.line}`,
        transform: pressed ? "translateY(4px)" : "none",
        transition: "transform 80ms, box-shadow 80ms",
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 32, flexShrink: 0, width: 40, textAlign: "center" }}>{card.emoji}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>{card.label}</div>
        <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 2 }}>{card.desc}</div>

        {/* Progress badge — only shown after at least one play */}
        {played && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
            <AccuracyStars accuracy={stat.bestAccuracy}/>
            <span style={{ fontSize: 11, color: t.inkFaint }}>
              {stat.played}× played · best {stat.bestAccuracy}%
            </span>
          </div>
        )}
      </div>

      {/* Round count pill */}
      <div style={{
        flexShrink: 0,
        background: t.primarySoft,
        color: t.primary,
        fontSize: 11, fontWeight: 800,
        padding: "3px 8px", borderRadius: 20,
        letterSpacing: "0.5px",
      }}>
        {ROUNDS} rds
      </div>

      <Icon name="chevronRight" size={22} color={t.inkFaint}/>
    </div>
  );
}

/* ── Header strip with total XP, streak, gems ────────────────────── */
function ProgressHeader({ progress, synced }) {
  const { theme: t } = useTheme();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "8px 18px",
      background: t.primarySoft,
      borderBottom: `1px solid ${t.line}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 15 }}>⭐</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: t.primaryDeep }}>{progress.xp} XP</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 15 }}>🔥</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: t.primaryDeep }}>{progress.streak}d streak</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 15 }}>💎</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: t.primaryDeep }}>{progress.gems}</span>
      </div>
      {/* Sync status dot — far right */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: synced ? t.sage : t.gold,
          display: "inline-block",
        }}/>
        <span style={{ fontSize: 10, color: t.inkFaint }}>
          {synced ? "synced" : "syncing…"}
        </span>
      </div>
    </div>
  );
}

/* ── Main screen ─────────────────────────────────────────────────── */
export default function LessonScreen({ onGoAddWords, onGoStats, onProgressChange }) {
  const { theme: t } = useTheme();
  const [playing,    setPlaying]    = useState(null);
  const [completion, setCompletion] = useState(null);
  const [progress,   setProgress]   = useState(() => loadProgress());
  const [synced,     setSynced]     = useState(false);
  const [userWords,  setUserWords]  = useState(() => loadUserWords());
  const [useMyWords, setUseMyWords] = useState(false);

  /* ── Active lesson — built-in or user's own words ───────────────── */
  const myWordsLesson = { title: "My Words", words: userWords };
  const activeLesson  = (useMyWords && userWords.length >= MIN_USER_WORDS)
    ? myWordsLesson
    : BUILTIN_LESSON;

  /* ── Sync progress + user words from MongoDB on mount ───────────── */
  useEffect(() => {
    syncFromServer()
      .then(serverData => {
        if (serverData) {
          localStorage.setItem("wordgarden_progress", JSON.stringify(serverData));
          setProgress(serverData);
        }
        setSynced(true);
      })
      .catch(() => setSynced(true));

    // Only pull server words if server has MORE than local (cross-device add).
    // Never restore deleted words by overwriting a smaller local list.
    const localWords = loadUserWords();
    syncWordsFromServer()
      .then(serverWords => {
        if (serverWords && serverWords.length > localWords.length) {
          setUserWords(serverWords);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const roundCount  = Math.min(ROUNDS, activeLesson.words.length);
  const getQuestions = (type) => buildTypedQuestions(activeLesson, type, roundCount);

  const handleComplete = (stats) => {
    const updated = recordGameResult(progress, playing, stats);
    saveProgress(updated);
    setProgress(updated);
    onProgressChange?.(updated);
    setCompletion({ stats, progress: updated });
    setPlaying(null);
  };

  if (playing) {
    return (
      <LessonRunner
        questions={getQuestions(playing)}
        onExit={() => setPlaying(null)}
        onComplete={handleComplete}
      />
    );
  }

  if (completion) {
    return (
      <CompletionScreen
        stats={completion.stats}
        totalProgress={completion.progress}
        onContinue={() => setCompletion(null)}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, fontFamily: FONT_SANS }}>

      {/* XP / streak / gems bar */}
      <ProgressHeader progress={progress} synced={synced}/>

      {/* Title row */}
      <div style={{
        padding: "14px 20px 10px",
        borderBottom: `1px solid ${t.line}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: t.inkSoft, letterSpacing: "2px" }}>WORD GARDEN</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, marginTop: 2 }}>
            Choose a game
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <div onClick={onGoStats} style={{
            background: t.card, color: t.ink,
            padding: "9px 12px", borderRadius: 12,
            fontWeight: 800, fontSize: 13,
            cursor: "pointer", boxShadow: `0 3px 0 ${t.line}`,
            border: `1.5px solid ${t.line}`,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            📊
          </div>
          <div onClick={onGoAddWords} style={{
            background: t.primary, color: "#fff",
            padding: "9px 16px", borderRadius: 12,
            fontWeight: 800, fontSize: 13,
            cursor: "pointer", boxShadow: `0 3px 0 ${t.primaryDeep}`,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Icon name="book" size={16} color="#fff"/>
            My Words
          </div>
        </div>
      </div>

      {/* My Words lesson toggle — only shown if user has enough words */}
      <div style={{ margin: "12px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        {userWords.length >= MIN_USER_WORDS && (
          <div style={{ display: "flex", background: t.card, borderRadius: 12, padding: 4, border: `1.5px solid ${t.line}` }}>
            {[{ key: false, label: "📚 Lessons" }, { key: true, label: "🌱 My Words" }].map(({ key, label }) => (
              <div
                key={String(key)}
                onClick={() => setUseMyWords(key)}
                style={{
                  flex: 1, textAlign: "center", padding: "8px 0",
                  borderRadius: 9, cursor: "pointer",
                  background: useMyWords === key ? t.primary : "transparent",
                  color: useMyWords === key ? "#fff" : t.inkSoft,
                  fontWeight: 800, fontSize: 13, transition: "background 150ms",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Teaser if user has some but not enough words yet */}
        {userWords.length > 0 && userWords.length < MIN_USER_WORDS && (
          <div style={{
            padding: "8px 14px", borderRadius: 12,
            background: t.card, border: `1.5px dashed ${t.line}`,
            fontSize: 12, color: t.inkFaint,
          }}>
            🌱 Add {MIN_USER_WORDS - userWords.length} more word{MIN_USER_WORDS - userWords.length !== 1 ? "s" : ""} to unlock My Words games
          </div>
        )}
      </div>

      {/* Game cards */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {GAME_CARDS.map(card => (
          <GameCard
            key={card.type}
            card={card}
            stat={getGameStat(progress, card.type)}
            onPlay={setPlaying}
          />
        ))}
      </div>
    </div>
  );
}
