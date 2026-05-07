import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";

const TABS = [
  { id: "home",    icon: "home",   label: "Learn"   },
  { id: "books",   icon: "book",   label: "Books"   },
  { id: "rewards", icon: "trophy", label: "Rewards" },
  { id: "profile", icon: "user",   label: "Profile" },
];

export default function BottomNav({ current, onNav }) {
  const { theme: t } = useTheme();

  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 4px",
      background: t.card,
      borderTop: `1px solid ${t.line}`,
    }}>
      {TABS.map(tab => {
        const active = current === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onNav(tab.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "6px 0", borderRadius: 12, cursor: "pointer",
              background: active ? t.primarySoft : "transparent",
            }}
          >
            <Icon name={tab.icon} size={26} color={active ? t.primary : t.inkFaint}/>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "1px",
              color: active ? t.primary : t.inkFaint, textTransform: "uppercase",
            }}>
              {tab.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
