import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { shade } from "../utils/color";
import { FONT_SANS } from "../data/themes";

export default function BigButton({ children, onClick, color, shadowColor, disabled, ghost, small, style }) {
  const { theme: t } = useTheme();
  const [pressed, setPressed] = useState(false);

  const bg     = disabled ? t.line    : ghost ? t.card              : (color || t.primary);
  const fg     = ghost    ? t.inkSoft : "#fff";
  const shadow = disabled ? t.inkFaint : (shadowColor || (color ? shade(color) : t.primaryDeep));
  const h      = small ? 44 : 56;

  return (
    <div
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => !disabled && onClick?.()}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: small ? "0 16px" : "0 24px",
        height: h, minWidth: small ? 80 : 120,
        borderRadius: 16,
        background: bg, color: fg,
        fontWeight: 800, fontSize: small ? 14 : 16,
        letterSpacing: "0.5px", textTransform: "uppercase",
        fontFamily: FONT_SANS,
        boxShadow: disabled ? "none" : pressed ? `0 0 0 ${shadow}` : `0 4px 0 ${shadow}`,
        transform: pressed && !disabled ? "translateY(4px)" : "translateY(0)",
        transition: "transform 80ms, box-shadow 80ms",
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
        border: ghost ? `2px solid ${t.line}` : "none",
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
