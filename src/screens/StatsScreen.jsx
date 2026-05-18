import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import Icon from "../components/Icon";
import { saveProgress } from "../utils/progress";

const DEFAULT_PROGRESS = { xp: 0, gems: 0, streak: 0, lastPlayedDate: null, gameStats: {}, history: [] };

const GAME_LABELS = {
  picture:       { label: "Picture Match",  emoji: "🖼️" },
  definition:    { label: "Word Meaning",   emoji: "📖" },
  listen:        { label: "Listen & Tap",   emoji: "🔊" },
  spell:         { label: "Spell It Out",   emoji: "✏️" },
  fill:          { label: "Fill the Blank", emoji: "✨" },
  hangman:       { label: "Hangman",        emoji: "🪢" },
  unscramble:    { label: "Unscramble",     emoji: "🔀" },
  flashcard:     { label: "Flashcard",      emoji: "🃏" },
  wordchallenge: { label: "Word Challenge", emoji: "⚡" },
  wordmaster:    { label: "Word Master",    emoji: "👑" },
  wordpuzzle:    { label: "Word Puzzle",    emoji: "🧩" },
  letterdrop:    { label: "Letter Drop",    emoji: "🔡" },
  quickmatch:    { label: "Quick Match",    emoji: "💡" },
  memorymatch:   { label: "Memory Match",   emoji: "🧠" },
  wordhunt:      { label: "Word Hunt",      emoji: "🎯" },
  mix:           { label: "Full Mix",       emoji: "🎲" },
};

/* ── Aggregate a history slice ───────────────────────────────────── */
function aggregate(entries) {
  if (!entries.length) return { xp: 0, games: 0, accuracy: 0, correct: 0, total: 0 };
  const xp       = entries.reduce((s, e) => s + (e.xp      ?? 0), 0);
  const correct  = entries.reduce((s, e) => s + (e.correct ?? 0), 0);
  const total    = entries.reduce((s, e) => s + (e.total   ?? 0), 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { xp, games: entries.length, accuracy, correct, total };
}

/* ── Filter helpers ──────────────────────────────────────────────── */
function lastNDays(history, n) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n);
  const cutStr = cutoff.toISOString().slice(0, 10);
  return (history || []).filter(e => e.date >= cutStr);
}

function mostPlayed(history) {
  if (!history?.length) return null;
  const counts = {};
  for (const e of history) counts[e.type] = (counts[e.type] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

/* ── Stat card ───────────────────────────────────────────────────── */
function StatCard({ title, emoji, stats }) {
  const { theme: t } = useTheme();
  return (
    <div style={{
      background: t.card, border: `1.5px solid ${t.line}`,
      borderRadius: 16, padding: "16px 18px",
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: t.inkSoft, letterSpacing: "1px", marginBottom: 12 }}>
        {emoji} {title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <Metric label="XP"       value={stats.xp}                          color="#f59e0b" />
        <Metric label="Games"    value={stats.games}                        color="#6366f1" />
        <Metric label="Accuracy" value={stats.games ? `${stats.accuracy}%` : "—"} color="#10b981" />
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  const { theme: t } = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "8px 4px", background: t.bg, borderRadius: 10 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: FONT_SERIF }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: t.inkFaint, letterSpacing: "1px", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ── Daily activity strip (last 7 days) ──────────────────────────── */
function ActivityStrip({ history }) {
  const { theme: t } = useTheme();
  const days = 7;
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const played  = (history || []).some(e => e.date === dateStr);
    const isToday = i === days - 1;
    return { dateStr, played, isToday, label: d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3) };
  });

  return (
    <div style={{ background: t.card, border: `1.5px solid ${t.line}`, borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: t.inkSoft, letterSpacing: "1px", marginBottom: 12 }}>
        📅 LAST 7 DAYS
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
        {cells.map(({ dateStr, played, isToday, label }) => (
          <div key={dateStr} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: played ? t.primary : t.line,
              border: isToday ? `2px solid ${t.primaryDeep}` : "none",
            }}/>
            <div style={{ fontSize: 10, color: t.inkFaint, fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Game breakdown table (computed from filtered history) ───────── */
function GameBreakdown({ history }) {
  const { theme: t } = useTheme();

  // Build per-type stats from history entries
  const statsMap = {};
  for (const e of (history || [])) {
    if (!e.type) continue;
    if (!statsMap[e.type]) statsMap[e.type] = { played: 0, totalCorrect: 0, totalQuestions: 0 };
    statsMap[e.type].played        += 1;
    statsMap[e.type].totalCorrect  += e.correct ?? 0;
    statsMap[e.type].totalQuestions+= e.total   ?? 0;
  }

  const rows = Object.entries(statsMap)
    .filter(([, s]) => s.played > 0)
    .sort((a, b) => b[1].played - a[1].played);

  if (!rows.length) return null;

  return (
    <div style={{ background: t.card, border: `1.5px solid ${t.line}`, borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: t.inkSoft, letterSpacing: "1px", marginBottom: 12 }}>
        🎮 GAME BREAKDOWN
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(([type, s]) => {
          const info = GAME_LABELS[type] ?? { label: type, emoji: "🎯" };
          const pct  = s.totalQuestions > 0
            ? Math.round((s.totalCorrect / s.totalQuestions) * 100) : 0;
          return (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 18, width: 24, textAlign: "center" }}>{info.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>{info.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <div style={{ height: 5, borderRadius: 3, flex: 1, background: t.line, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: t.primary, borderRadius: 3 }}/>
                  </div>
                  <div style={{ fontSize: 11, color: t.inkFaint, whiteSpace: "nowrap" }}>{pct}%</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: t.inkFaint, textAlign: "right", minWidth: 40 }}>
                {s.played}×
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main screen ─────────────────────────────────────────────────── */
export default function StatsScreen({ progress, onBack, onReset }) {
  const { theme: t } = useTheme();
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    saveProgress(DEFAULT_PROGRESS);
    onReset?.(DEFAULT_PROGRESS);
    setConfirming(false);
  };

  const history     = progress.history || [];
  const week7       = lastNDays(history, 7);
  const weekData    = aggregate(week7);
  const topGame     = mostPlayed(week7);
  const topInfo     = topGame ? (GAME_LABELS[topGame] ?? { label: topGame, emoji: "🎯" }) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, fontFamily: FONT_SANS }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 16px 10px",
        borderBottom: `1px solid ${t.line}`,
      }}>
        <div onClick={onBack} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Icon name="chevronLeft" size={26} color={t.ink}/>
        </div>
        <div style={{ flex: 1, fontSize: 22, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>
          My Stats
        </div>
        {!confirming ? (
          <div
            onClick={() => setConfirming(true)}
            style={{ fontSize: 12, fontWeight: 700, color: t.inkFaint, cursor: "pointer", padding: "4px 8px" }}
          >
            Reset
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: t.inkSoft }}>Sure?</div>
            <div
              onClick={handleReset}
              style={{ fontSize: 12, fontWeight: 800, color: t.red ?? "#ef4444", cursor: "pointer", padding: "4px 8px" }}
            >
              Yes
            </div>
            <div
              onClick={() => setConfirming(false)}
              style={{ fontSize: 12, fontWeight: 700, color: t.inkFaint, cursor: "pointer", padding: "4px 8px" }}
            >
              No
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Overall highlights */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
          background: t.primarySoft, borderRadius: 16, padding: "14px 12px",
          border: `1.5px solid ${t.primary}`,
        }}>
          <Metric label="TOTAL XP"   value={progress.xp}              color={t.primaryDeep} />
          <Metric label="STREAK"     value={`${progress.streak}d`}    color={t.primaryDeep} />
          <Metric label="GEMS"       value={`💎${progress.gems}`}     color={t.primaryDeep} />
        </div>

        {/* Favourite game (last 7 days) */}
        {topInfo && (
          <div style={{
            background: t.card, border: `1.5px solid ${t.line}`,
            borderRadius: 14, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 28 }}>{topInfo.emoji}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: t.inkSoft, letterSpacing: "1px" }}>FAVOURITE GAME · LAST 7 DAYS</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>{topInfo.label}</div>
            </div>
          </div>
        )}

        {/* Last 7 days stat card */}
        <StatCard title="LAST 7 DAYS" emoji="📊" stats={weekData} />

        {/* Activity grid — last 7 days */}
        <ActivityStrip history={history} />

        {/* Per-game breakdown — last 7 days */}
        <GameBreakdown history={week7} />

        {!week7.length && (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            color: t.inkFaint, fontStyle: "italic", fontFamily: FONT_SERIF, fontSize: 15,
          }}>
            Play some games and your stats will appear here 🌱
          </div>
        )}
      </div>
    </div>
  );
}
