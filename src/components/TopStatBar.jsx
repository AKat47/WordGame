import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";

export default function TopStatBar({ hearts, streak, gems }) {
  const { theme: t } = useTheme();

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 20,
      padding: "12px 18px 14px",
      background: t.bg,
      borderBottom: `1px solid ${t.line}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="flame" size={26} color={t.primary}/>
        <span style={{ color: t.ink, fontWeight: 800, fontSize: 18 }}>{streak}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="gem" size={22} color={t.sky}/>
        <span style={{ color: t.ink, fontWeight: 800, fontSize: 18 }}>{gems}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="heart" size={24} color={t.red}/>
        <span style={{ color: t.ink, fontWeight: 800, fontSize: 18 }}>{hearts}</span>
      </div>

      <div style={{ flex: 1 }}/>
    </div>
  );
}
