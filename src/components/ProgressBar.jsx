import { useTheme } from "../context/ThemeContext";
import { shade } from "../utils/color";

export default function ProgressBar({ value, max = 1, color, height = 14 }) {
  const { theme: t } = useTheme();
  const pct = Math.max(0, Math.min(1, value / max));
  const barColor = color || t.sage;

  return (
    <div style={{
      height,
      background: t.bgDeep,
      borderRadius: height,
      overflow: "hidden",
      boxShadow: "inset 0 2px 0 rgba(0,0,0,0.06)",
      flex: 1,
    }}>
      <div style={{
        width: `${pct * 100}%`,
        height: "100%",
        background: barColor,
        borderRadius: height,
        boxShadow: `inset 0 -4px 0 ${shade(barColor, -20)}, inset 0 3px 0 rgba(255,255,255,0.35)`,
        transition: "width 320ms cubic-bezier(.4,1.3,.5,1)",
      }}/>
    </div>
  );
}
