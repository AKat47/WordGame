import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import BottomNav from "../components/BottomNav";
import ProgressBar from "../components/ProgressBar";
import Icon from "../components/Icon";

const LEADERBOARD = [
  { name: "Pia (You)", xp: 420, avatar: "👑", me: true },
  { name: "Arjun",     xp: 385, avatar: "🦊" },
  { name: "Meera",     xp: 340, avatar: "🐢" },
  { name: "Kabir",     xp: 210, avatar: "🐿️" },
];

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function AchievementRow({ name, desc, icon, color, unlocked, progress }) {
  const { theme: t } = useTheme();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: t.card, borderRadius: 14, padding: 12,
      border: `1.5px solid ${t.line}`,
      opacity: unlocked ? 1 : 0.65,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: unlocked ? color : t.bgDeep,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={unlocked ? icon : "lock"} size={24} color={unlocked ? "#fff" : t.inkFaint}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: t.ink }}>{name}</div>
        <div style={{ fontSize: 11, color: t.inkSoft }}>{desc}</div>
        {progress !== undefined && progress < 1 && (
          <div style={{ marginTop: 4 }}>
            <ProgressBar value={progress} color={color} height={6}/>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RewardsScreen({ state, onNav }) {
  const { theme: t } = useTheme();

  const achievements = [
    { name: "First Story",  desc: "Finish your first lesson",      icon: "book",    color: t.sage,    unlocked: true },
    { name: "Wordsmith",    desc: "Learn 25 new words",             icon: "feather", color: t.primary, unlocked: true,  progress: 24/25 },
    { name: "7-Day Streak", desc: "A week of reading!",             icon: "flame",   color: t.gold,    unlocked: true },
    { name: "Storyteller",  desc: "Use 10 words in sentences",      icon: "sparkle", color: t.pink,    unlocked: false, progress: 0.4 },
    { name: "Royal Scholar",desc: "Finish a whole book",            icon: "crown",   color: t.lavender,unlocked: false, progress: 0.3 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, fontFamily: FONT_SANS }}>
      <div style={{ padding: "18px 20px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "2px" }}>YOUR PROGRESS</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, marginTop: 2 }}>Rewards</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 20px" }}>

        {/* Streak card */}
        <div style={{
          background: t.primary, borderRadius: 18, padding: 16,
          boxShadow: `0 4px 0 ${t.primaryDeep}`,
          display: "flex", alignItems: "center", gap: 14, marginBottom: 14,
        }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="flame" size={42} color="#fff"/>
          </div>
          <div style={{ flex: 1, color: "#fff" }}>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: FONT_SERIF }}>{state.streak} days</div>
            <div style={{ fontSize: 12, opacity: 0.9, fontStyle: "italic" }}>Keep your reading fire burning!</div>
          </div>
        </div>

        {/* Weekly tracker */}
        <div style={{ background: t.card, borderRadius: 16, padding: 14, border: `1.5px solid ${t.line}`, marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px", marginBottom: 10 }}>THIS WEEK</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {WEEK_DAYS.map((d, i) => {
              const done  = i < 5;
              const today = i === 5;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 10, color: t.inkSoft, fontWeight: 700 }}>{d}</div>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: done ? t.gold : today ? "transparent" : t.bgDeep,
                    border: today ? `2px dashed ${t.primary}` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {done && <Icon name="flame" size={18} color="#fff"/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px", marginBottom: 10, paddingLeft: 4 }}>
          ACHIEVEMENTS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {achievements.map((a, i) => <AchievementRow key={i} {...a}/>)}
        </div>

        {/* Leaderboard */}
        <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px", marginBottom: 10, paddingLeft: 4 }}>
          FRIENDS LEAGUE
        </div>
        <div style={{ background: t.card, borderRadius: 16, border: `1.5px solid ${t.line}`, overflow: "hidden" }}>
          {LEADERBOARD.map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderBottom: i < LEADERBOARD.length - 1 ? `1px solid ${t.line}` : "none",
              background: p.me ? t.goldSoft : "transparent",
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: i < 3 ? t.gold : t.inkSoft, width: 22, textAlign: "center" }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 26 }}>{p.avatar}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: t.ink }}>{p.name}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: t.goldDeep, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="star" size={16} color={t.gold}/>
                {p.xp}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav current="rewards" onNav={onNav}/>
    </div>
  );
}
