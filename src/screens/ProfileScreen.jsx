import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import BottomNav from "../components/BottomNav";
import StatPill from "../components/StatPill";
import Mascot from "../components/Mascot";
import Icon from "../components/Icon";

const RECENT_WORDS = ["pious", "frugal", "bountiful", "quaint", "benevolent", "humble"];

const PARENT_ROWS = [
  { icon: "book",     label: "Add words from a book" },
  { icon: "settings", label: "Daily goal & reminders" },
  { icon: "trophy",   label: "Weekly progress report" },
];

export default function ProfileScreen({ state, onNav }) {
  const { theme: t, themeKey, setThemeKey, THEMES } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, fontFamily: FONT_SANS }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "2px" }}>HELLO</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, marginTop: 2 }}>Your Profile</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 20px" }}>

        {/* Profile card */}
        <div style={{
          background: t.card, borderRadius: 18,
          border: `2px solid ${t.line}`,
          padding: 16, display: "flex", alignItems: "center", gap: 14,
          boxShadow: `0 3px 0 ${t.line}`,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: t.pinkSoft, border: `3px solid ${t.pink}`,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            overflow: "hidden",
          }}>
            <Mascot size={80} mood="happy"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>Pia</div>
            <div style={{ fontSize: 12, color: t.inkSoft }}>Reader since Sep 2025</div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <StatPill icon="flame" value={state.streak}/>
              <StatPill icon="gem"   value={state.gems}  color={t.sky}/>
              <StatPill icon="star"  value="420"         color={t.goldDeep}/>
            </div>
          </div>
        </div>

        {/* Words pocket */}
        <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px", marginTop: 20, marginBottom: 10, paddingLeft: 4 }}>
          WORDS IN YOUR POCKET
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {RECENT_WORDS.map((w, i) => (
            <div key={i} style={{
              padding: "8px 14px", borderRadius: 12,
              background: t.card, border: `1.5px solid ${t.line}`,
              fontSize: 14, fontWeight: 700, color: t.ink,
              fontFamily: FONT_SERIF, fontStyle: "italic",
            }}>
              {w}
            </div>
          ))}
        </div>

        {/* Theme / Story Mood picker */}
        <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px", marginTop: 20, marginBottom: 10, paddingLeft: 4 }}>
          STORY MOOD
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {Object.entries(THEMES).map(([key, th]) => {
            const active = themeKey === key;
            return (
              <div key={key} onClick={() => setThemeKey(key)} style={{
                flex: 1, background: th.bg, borderRadius: 14,
                border: `2.5px solid ${active ? th.primary : th.line}`,
                padding: "10px 8px", cursor: "pointer", textAlign: "center",
                boxShadow: active ? `0 3px 0 ${th.primary}` : "none",
                transition: "box-shadow 150ms",
              }}>
                <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 6 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: th.primary }}/>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: th.gold }}/>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: th.pink }}/>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: th.ink }}>{th.name}</div>
              </div>
            );
          })}
        </div>

        {/* For parents */}
        <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "1.5px", marginTop: 20, marginBottom: 10, paddingLeft: 4 }}>
          FOR PARENTS
        </div>
        <div style={{ background: t.card, border: `1.5px solid ${t.line}`, borderRadius: 14, overflow: "hidden" }}>
          {PARENT_ROWS.map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              borderBottom: i < PARENT_ROWS.length - 1 ? `1px solid ${t.line}` : "none",
              cursor: "pointer",
            }}>
              <Icon name={row.icon} size={22} color={t.primary}/>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: t.ink }}>{row.label}</div>
              <Icon name="chevronRight" size={20} color={t.inkFaint}/>
            </div>
          ))}
        </div>

      </div>

      <BottomNav current="profile" onNav={onNav}/>
    </div>
  );
}
