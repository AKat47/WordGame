import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import { VOCAB_BOOKS } from "../data/vocab";
import TopStatBar from "../components/TopStatBar";
import BottomNav from "../components/BottomNav";
import Mascot from "../components/Mascot";
import Icon from "../components/Icon";

/* ── Lesson node on the winding path ────────────────────────────── */
function LessonNode({ state, label, icon, position, onClick }) {
  const { theme: t } = useTheme();
  const [wiggle, setWiggle] = useState(false);

  const colors = {
    done:    { bg: t.sage,    shadow: t.sageDeep,    fg: "#fff" },
    current: { bg: t.primary, shadow: t.primaryDeep, fg: "#fff" },
    locked:  { bg: t.line,    shadow: t.inkFaint,    fg: t.inkFaint },
    bonus:   { bg: t.gold,    shadow: t.goldDeep,    fg: "#fff" },
  }[state];

  const handleClick = () => {
    setWiggle(true);
    setTimeout(() => setWiggle(false), 400);
    if (state !== "locked") onClick?.();
  };

  return (
    <div style={{ position: "absolute", left: position.x, top: position.y, transform: "translate(-50%, -50%)" }}>
      {/* "START" bubble above current node */}
      {state === "current" && (
        <div style={{
          position: "absolute", top: -44, left: "50%", transform: "translateX(-50%)",
          background: "#fff", color: t.primary,
          padding: "6px 14px", borderRadius: 10,
          fontSize: 11, fontWeight: 800, letterSpacing: "1.5px",
          boxShadow: `0 3px 0 ${t.line}`, whiteSpace: "nowrap",
          fontFamily: FONT_SANS,
        }}>
          START
          <div style={{
            position: "absolute", bottom: -6, left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 10, height: 10, background: "#fff",
          }}/>
        </div>
      )}

      {/* Circle node */}
      <div onClick={handleClick} style={{
        width: 74, height: 74, borderRadius: "50%",
        background: colors.bg, boxShadow: `0 6px 0 ${colors.shadow}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: colors.fg,
        cursor: state === "locked" ? "default" : "pointer",
        animation: state === "current"
          ? "nodeP 2.2s ease-in-out infinite"
          : wiggle ? "nodeW 0.4s" : "none",
      }}>
        <Icon name={state === "locked" ? "lock" : icon} size={34} color={colors.fg}/>
      </div>

      {/* Label below node */}
      {label && state !== "locked" && (
        <div style={{
          position: "absolute", top: 84, left: "50%", transform: "translateX(-50%)",
          fontSize: 11, fontWeight: 700, color: t.inkSoft,
          textTransform: "uppercase", letterSpacing: "1px",
          whiteSpace: "nowrap", fontFamily: FONT_SANS,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

/* ── Winding path of lesson nodes ───────────────────────────────── */
const LESSON_NODES = [
  { id: "l1", state: "done",    icon: "star",    label: "" },
  { id: "l2", state: "done",    icon: "star",    label: "" },
  { id: "l3", state: "done",    icon: "star",    label: "" },
  { id: "l4", state: "current", icon: "feather", label: "Village Tales" },
  { id: "chest", state: "locked", icon: "gem",   label: "Treasure" },
  { id: "l5", state: "locked",  icon: "book",    label: "Wise Sayings" },
  { id: "l6", state: "locked",  icon: "crown",   label: "" },
];

const CENTER_X = 190;
const OFFSETS  = [0, -60, -90, -60, 0, 60, 90, 60, 0, -60];
const SPACING  = 120;

function LessonPath({ onStart }) {
  const { theme: t } = useTheme();
  const currentIdx = LESSON_NODES.findIndex(l => l.state === "current");

  return (
    <div style={{ position: "relative", padding: "50px 0 32px", minHeight: 820 }}>
      {/* Dotted SVG connectors */}
      <svg
        width={380}
        height={LESSON_NODES.length * SPACING}
        style={{ position: "absolute", top: 20, left: 0 }}
      >
        {LESSON_NODES.slice(0, -1).map((_, i) => {
          const x1 = CENTER_X + OFFSETS[i % OFFSETS.length];
          const y1 = 40 + i * SPACING;
          const x2 = CENTER_X + OFFSETS[(i + 1) % OFFSETS.length];
          const y2 = 40 + (i + 1) * SPACING;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={t.line} strokeWidth="4"
              strokeLinecap="round" strokeDasharray="2 10"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {LESSON_NODES.map((l, i) => (
        <LessonNode
          key={l.id}
          state={l.state}
          label={l.label}
          icon={l.icon}
          position={{ x: CENTER_X + OFFSETS[i % OFFSETS.length], y: 40 + i * SPACING }}
          onClick={onStart}
        />
      ))}

      {/* Mascot on a cloud beside current node */}
      {currentIdx >= 0 && (() => {
        const cx   = CENTER_X + OFFSETS[currentIdx % OFFSETS.length];
        const cy   = 40 + currentIdx * SPACING;
        const left = OFFSETS[currentIdx % OFFSETS.length] > 0;
        return (
          <div style={{
            position: "absolute",
            left: left ? cx - 160 : cx + 50,
            top: cy - 50,
          }}>
            <div style={{ position: "relative" }}>
              <svg width="120" height="50" style={{ position: "absolute", bottom: -14, left: -10 }}>
                <ellipse cx="30" cy="30" rx="25" ry="14" fill="#fff" opacity="0.9"/>
                <ellipse cx="60" cy="26" rx="30" ry="18" fill="#fff" opacity="0.9"/>
                <ellipse cx="90" cy="32" rx="22" ry="12" fill="#fff" opacity="0.9"/>
              </svg>
              <Mascot size={90} mood="wave"/>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ── Book banner ────────────────────────────────────────────────── */
function BookBanner({ book }) {
  return (
    <div style={{
      margin: "14px 16px 8px", padding: "14px 16px",
      background: book.cover, borderRadius: 18,
      display: "flex", alignItems: "center", gap: 14,
      border: `2px solid ${book.coverAccent}`,
      boxShadow: `0 3px 0 ${book.coverAccent}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", right: -10, top: -10, fontSize: 70, opacity: 0.35 }}>
        {book.emoji}
      </div>
      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: book.coverAccent, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 2 }}>
          Current Book
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#3B2A1F", fontFamily: FONT_SERIF, lineHeight: 1.15 }}>
          {book.title}
        </div>
        <div style={{ fontSize: 12, color: "#3B2A1F", opacity: 0.7, marginTop: 2, fontStyle: "italic" }}>
          by {book.author}
        </div>
      </div>
    </div>
  );
}

/* ── HomeScreen ─────────────────────────────────────────────────── */
export default function HomeScreen({ state, onStartLesson, onNav }) {
  const { theme: t } = useTheme();
  const book = VOCAB_BOOKS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, fontFamily: FONT_SANS }}>
      <style>{`
        @keyframes nodeP { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes nodeW { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }
      `}</style>

      <TopStatBar hearts={state.hearts} streak={state.streak} gems={state.gems}/>

      <div style={{ flex: 1, overflow: "auto" }}>
        <BookBanner book={book}/>

        {/* Chapter label */}
        <div style={{
          margin: "10px 16px 0", padding: "10px 14px",
          background: t.primary, borderRadius: 12,
          boxShadow: `0 3px 0 ${t.primaryDeep}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="feather" size={22} color="#fff"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: 700, letterSpacing: "1.5px" }}>
              CHAPTER 1
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
              The Village of Shiggaon
            </div>
          </div>
          <Icon name="book" size={22} color="#fff"/>
        </div>

        <LessonPath onStart={onStartLesson}/>
      </div>

      <BottomNav current="home" onNav={onNav}/>
    </div>
  );
}
