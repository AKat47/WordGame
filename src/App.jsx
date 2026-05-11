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
      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: t.bgDeep, padding: "20px",
      }}>
        {/* Phone shell */}
        <div style={{
          width: "100%", maxWidth: 412,
          height: "min(892px, calc(100dvh - 40px))",
          borderRadius: 28, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)",
          display: "flex", flexDirection: "column",
          background: t.bg, position: "relative",
        }}>
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
