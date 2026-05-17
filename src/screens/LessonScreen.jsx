import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import { buildTypedQuestions } from "../data/questions";
import { loadProgress, saveProgress, syncFromServer, recordGameResult, getGameStat } from "../utils/progress";
import { loadUserWords, syncWordsFromServer } from "../utils/userWords";
import LessonRunner     from "./LessonRunner";
import CompletionScreen from "./CompletionScreen";
import Icon from "../components/Icon";

const ROUNDS = 5;
const MIN_USER_WORDS = 4;

/* ── All games — unique, no duplicates ───────────────────────────── */
const ALL_GAMES = [
  { type: "definition",  emoji: "📖", label: "Word Meaning",  desc: "Pick the correct definition" },
  { type: "listen",      emoji: "🔊", label: "Listen & Tap",  desc: "Hear the word, choose the spelling" },
  { type: "spell",       emoji: "✏️", label: "Spell It Out",  desc: "Build the word from the letter bank" },
  { type: "hangman",     emoji: "🪢", label: "Hangman",       desc: "Guess the word one letter at a time" },
  { type: "unscramble",  emoji: "🔀", label: "Unscramble",    desc: "Rearrange the scrambled letters" },
  { type: "quickmatch",  emoji: "💡", label: "Quick Match",   desc: "Connect words with their meanings" },
  { type: "memorymatch", emoji: "🧠", label: "Memory Match",  desc: "Flip cards to find word-meaning pairs" },
  { type: "wordhunt",    emoji: "🎯", label: "Word Hunt",     desc: "Find hidden words in the letter grid" },
  { type: "wordmaster",  emoji: "👑", label: "Word Master",   desc: "Fill the blank — no meaning hint" },
  { type: "mix",         emoji: "🎲", label: "Full Mix",      desc: "All game types mixed together" },
];

/* ── Theme chooser strip ─────────────────────────────────────────── */
const THEME_ORDER = ["storybook", "forest", "bubblegum", "twilight"];

function ThemeChooser() {
  const { theme: t, themeKey, setThemeKey, THEMES } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {THEME_ORDER.map(key => {
        const th = THEMES[key];
        const active = key === themeKey;
        return (
          <div
            key={key}
            onClick={() => setThemeKey(key)}
            title={th.name}
            style={{
              width: active ? 28 : 22,
              height: active ? 28 : 22,
              borderRadius: "50%",
              background: th.primary,
              border: active ? `3px solid ${t.ink}` : `3px solid transparent`,
              boxShadow: active ? `0 2px 6px ${th.primaryDeep}` : "none",
              cursor: "pointer",
              transition: "width 150ms, height 150ms, border 150ms",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Unified horizontal game card (2-column grid) ───────────────── */
function GameCard({ card, stat, onPlay, disabled }) {
  const { theme: t } = useTheme();
  const [pressed, setPressed] = useState(false);
  const played = stat?.played > 0;

  return (
    <div
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => !disabled && onPlay(card.type)}
      style={{
        background: t.card,
        border: `2px solid ${played ? t.primary : t.line}`,
        borderRadius: 16,
        boxShadow: pressed || disabled ? "none" : `0 4px 0 ${played ? t.primaryDeep : t.line}`,
        transform: pressed && !disabled ? "translateY(4px)" : "none",
        transition: "transform 80ms, box-shadow 80ms",
        padding: "14px 12px",
        display: "flex", alignItems: "center", gap: 10,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {/* Emoji badge */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: played ? t.primarySoft : t.bgDeep,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>
        {card.emoji}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, lineHeight: 1.2 }}>
          {card.label}
        </div>
        <div style={{ fontSize: 11, color: t.inkSoft, marginTop: 3, lineHeight: 1.35 }}>
          {card.desc}
        </div>
        {played && (
          <div style={{ fontSize: 10, color: t.primary, marginTop: 4, fontWeight: 700 }}>
            ★ {stat.bestAccuracy}% best · {stat.played}×
          </div>
        )}
      </div>

      {/* Rds badge */}
      <div style={{
        flexShrink: 0,
        background: t.primarySoft, color: t.primary,
        fontSize: 10, fontWeight: 800,
        padding: "3px 7px", borderRadius: 20, letterSpacing: "0.5px",
      }}>
        {ROUNDS}
      </div>
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

  /* ── Always play from user's own word bank ──────────────────────── */
  const activeLesson = { title: "Word Bank", words: userWords };

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

    const localWords = loadUserWords();
    syncWordsFromServer()
      .then(serverWords => {
        if (serverWords && serverWords.length > localWords.length) {
          setUserWords(serverWords);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const roundCount   = Math.min(ROUNDS, activeLesson.words.length);
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

  const hasEnoughWords = userWords.length >= MIN_USER_WORDS;

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
          {/* Theme palette chips */}
          <div style={{ marginTop: 8 }}>
            <ThemeChooser/>
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
            WordBank
          </div>
        </div>
      </div>

      {/* Prompt to add words if bank is too small */}
      {!hasEnoughWords && (
        <div style={{ margin: "12px 16px 0" }}>
          <div style={{
            padding: "12px 16px", borderRadius: 12,
            background: t.card, border: `1.5px dashed ${t.line}`,
            fontSize: 13, color: t.inkFaint, textAlign: "center", lineHeight: 1.5,
          }}>
            🌱 Add at least {MIN_USER_WORDS} words to your WordBank to start playing
            {userWords.length > 0 && ` (${MIN_USER_WORDS - userWords.length} more needed)`}
          </div>
        </div>
      )}

      {/* All games — 2-column horizontal grid */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ALL_GAMES.map(card => (
            <GameCard
              key={card.type}
              card={card}
              stat={getGameStat(progress, card.type)}
              onPlay={hasEnoughWords ? setPlaying : () => {}}
              disabled={!hasEnoughWords}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
