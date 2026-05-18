import { useState, useEffect, useRef } from "react";
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
  { type: "memorymatch", emoji: "🧠", label: "Memory Match",  desc: "Flip cards to match pairs" },
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

/* ── Game card — full-width single column ────────────────────────── */
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
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 14,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {/* Emoji */}
      <div style={{ fontSize: 32, flexShrink: 0, width: 40, textAlign: "center" }}>
        {card.emoji}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>
          {card.label}
        </div>
        <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 2 }}>
          {card.desc}
        </div>
        {played && (
          <div style={{ fontSize: 11, color: t.inkFaint, marginTop: 4 }}>
            ★ {stat.bestAccuracy}% best · {stat.played}× played
          </div>
        )}
      </div>

      {/* Rds badge */}
      <div style={{
        flexShrink: 0,
        background: t.primarySoft, color: t.primary,
        fontSize: 11, fontWeight: 800,
        padding: "3px 8px", borderRadius: 20, letterSpacing: "0.5px",
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

  /* ── Scroll position save/restore when entering/leaving a game ──── */
  const scrollRef   = useRef(null); // ref to the scrollable list container
  const savedScroll = useRef(0);

  /* ── Always play from user's own word bank ──────────────────────── */
  const activeLesson = { title: "Word Bank", words: userWords };

  /* ── Sync progress + user words from MongoDB on mount ───────────── */
  useEffect(() => {
    let mounted = true; // BUG-01/05: guard against StrictMode double-fire & early unmount

    syncFromServer()
      .then(serverData => {
        if (!mounted) return;
        if (serverData) {
          // BUG-04: only overwrite local progress if server has equal or more XP
          const local = loadProgress();
          if (serverData.xp >= (local.xp ?? 0)) {
            localStorage.setItem("wordgarden_progress", JSON.stringify(serverData));
            setProgress(serverData);
          }
        }
        setSynced(true);
      })
      .catch(() => { if (mounted) setSynced(true); });

    const localWords = loadUserWords();
    syncWordsFromServer()
      .then(serverWords => {
        if (!mounted) return;
        if (serverWords && serverWords.length > localWords.length) {
          setUserWords(serverWords);
        }
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const roundCount   = Math.min(ROUNDS, activeLesson.words.length);
  const getQuestions = (type) => buildTypedQuestions(activeLesson, type, roundCount);

  /* Save scroll before entering a game; restore after exiting */
  const startPlaying = (type) => {
    savedScroll.current = scrollRef.current?.scrollTop ?? 0;
    setPlaying(type);
  };

  const stopPlaying = () => {
    setPlaying(null);
    // Restore scroll on next paint after the list re-mounts
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = savedScroll.current;
    });
  };

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
        onExit={stopPlaying}
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

      {/* All games — single column list */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "12px 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {ALL_GAMES.map(card => (
          <GameCard
            key={card.type}
            card={card}
            stat={getGameStat(progress, card.type)}
            onPlay={hasEnoughWords ? startPlaying : () => {}}
            disabled={!hasEnoughWords}
          />
        ))}
      </div>
    </div>
  );
}
