import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import Mascot from "../components/Mascot";
import BigButton from "../components/BigButton";
import Icon from "../components/Icon";
import { shade } from "../utils/color";

function StatCard({ color, label, value, icon }) {
  const { theme: t } = useTheme();
  return (
    <div style={{
      flex: 1, background: t.card,
      border: `2px solid ${color}`,
      borderRadius: 14, padding: "10px 8px 12px",
      textAlign: "center",
      boxShadow: `0 3px 0 ${color}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: shade(color, -20), letterSpacing: "1px", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
        <Icon name={icon} size={20} color={color}/>
        <div style={{ fontSize: 22, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF }}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function CompletionScreen({ stats, totalProgress, onContinue }) {
  const { theme: t } = useTheme();
  const confettiColors = [t.gold, t.pink, t.primary, t.sage, t.lavender, t.sky];

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: `linear-gradient(180deg, ${t.primarySoft} 0%, ${t.bg} 60%)`,
      fontFamily: FONT_SANS,
    }}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0.6; }
        }
      `}</style>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "20px 24px", position: "relative", overflow: "hidden",
      }}>
        {/* Confetti */}
        {[...Array(14)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 80}%`,
            width: 10, height: 10,
            background: confettiColors[i % confettiColors.length],
            borderRadius: i % 2 ? "50%" : 2,
            animation: `confettiFall 2.5s ease-in-out ${i * 0.1}s infinite`,
            opacity: 0.8,
          }}/>
        ))}

        <Mascot size={150} mood="cheer"/>

        <div style={{
          fontSize: 32, fontWeight: 800, color: t.primaryDeep,
          fontFamily: FONT_SERIF, marginTop: 16,
          textAlign: "center", lineHeight: 1.15,
        }}>
          Lesson Complete!
        </div>

        <div style={{
          fontSize: 14, color: t.inkSoft, marginTop: 8,
          textAlign: "center", fontStyle: "italic", fontFamily: FONT_SERIF,
        }}>
          "A new word is a new friend" — Pia
        </div>

        {/* Session stat cards */}
        <div style={{ display: "flex", gap: 10, marginTop: 28, width: "100%" }}>
          <StatCard color={t.gold} label="XP Earned" value={`+${stats.xp}`}       icon="star"/>
          <StatCard color={t.sage} label="Accuracy"  value={`${stats.accuracy}%`} icon="check"/>
          <StatCard color={t.pink} label="Rounds"    value={stats.words}           icon="sparkle"/>
        </div>

        {/* Cumulative progress strip */}
        {totalProgress && (
          <div style={{
            marginTop: 18, width: "100%",
            background: t.card, borderRadius: 14,
            border: `1.5px solid ${t.line}`,
            padding: "12px 16px",
            display: "flex", justifyContent: "space-around",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: t.inkSoft, letterSpacing: "1px" }}>TOTAL XP</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.primaryDeep, marginTop: 2 }}>⭐ {totalProgress.xp}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: t.inkSoft, letterSpacing: "1px" }}>STREAK</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.primaryDeep, marginTop: 2 }}>🔥 {totalProgress.streak}d</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: t.inkSoft, letterSpacing: "1px" }}>GEMS</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.primaryDeep, marginTop: 2 }}>💎 {totalProgress.gems}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "0 24px 32px" }}>
        <BigButton onClick={onContinue} style={{ width: "100%" }}>
          Continue
        </BigButton>
      </div>
    </div>
  );
}
