import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { FONT_SANS } from "./data/themes";
import LessonScreen  from "./screens/LessonScreen";
import MyWordsScreen from "./screens/MyWordsScreen";
import StatsScreen   from "./screens/StatsScreen";
import { loadProgress } from "./utils/progress";
import { requestNotificationPermission, scheduleDailyReminder } from "./utils/notifications";

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: ${FONT_SANS}; -webkit-font-smoothing: antialiased; }
  *::-webkit-scrollbar { width: 0; height: 0; }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }

  /* ── Desktop: centred phone shell ── */
  .wg-wrap {
    min-height: 100dvh;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .wg-shell {
    width: 100%; max-width: 412px;
    height: min(892px, calc(100dvh - 40px));
    border-radius: 28px; overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12);
    display: flex; flex-direction: column;
    position: relative;
  }

  /* ── Mobile: fill the entire screen ── */
  @media (max-width: 500px) {
    .wg-wrap {
      padding: 0;
      align-items: stretch;
      min-height: 100svh;
      min-height: 100dvh;
    }
    .wg-shell {
      max-width: 100%;
      height: 100svh;
      height: 100dvh;
      border-radius: 0;
      box-shadow: none;
    }
  }
`;

function AppInner() {
  const { theme: t } = useTheme();
  const [screen,   setScreen]   = useState("lesson"); // "lesson" | "mywords" | "stats"
  const [progress, setProgress] = useState(() => loadProgress());

  /* ── Request notification permission + schedule daily reminder ─── */
  useEffect(() => {
    requestNotificationPermission().then(granted => {
      if (granted) scheduleDailyReminder(progress.lastPlayedDate);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="wg-wrap" style={{ background: t.bgDeep }}>
        {/* Phone shell */}
        <div className="wg-shell" style={{ background: t.bg }}>
          {screen === "lesson"  && (
            <LessonScreen
              onGoAddWords={() => setScreen("mywords")}
              onGoStats={() => setScreen("stats")}
              onProgressChange={setProgress}
            />
          )}
          {screen === "mywords" && <MyWordsScreen onBack={() => setScreen("lesson")}/>}
          {screen === "stats"   && <StatsScreen   progress={progress} onBack={() => setScreen("lesson")} onReset={setProgress}/>}
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner/>
    </ThemeProvider>
  );
}
