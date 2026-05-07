import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";

export default function StatPill({ icon, value, color }) {
  const { theme: t } = useTheme();
  const c = color || t.ink;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: c, fontWeight: 800, fontSize: 16 }}>
      <Icon name={icon} size={22} color={c}/>
      <span>{value}</span>
    </div>
  );
}
