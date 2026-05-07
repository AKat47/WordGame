import { useTheme } from "../context/ThemeContext";

export default function Mascot({ size = 120, mood = "happy" }) {
  const { theme: t } = useTheme();
  const isHappy = mood === "happy" || mood === "cheer";
  const isSad   = mood === "sad";
  const isThink = mood === "think";
  const isWave  = mood === "wave";

  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1} style={{ display: "block" }}>
      {/* Shadow */}
      <ellipse cx="100" cy="210" rx="50" ry="6" fill="rgba(0,0,0,0.10)" />

      {/* Dress */}
      <path d="M 60 150 Q 55 195 45 205 L 155 205 Q 145 195 140 150 Z" fill={t.pink} stroke={t.pinkDeep} strokeWidth="2" />
      <path d="M 68 158 Q 64 190 56 200" stroke={t.pinkSoft} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M 46 205 L 154 205" stroke={t.gold} strokeWidth="3" strokeLinecap="round"/>

      {/* Bodice */}
      <path d="M 75 118 Q 70 145 60 150 L 140 150 Q 130 145 125 118 Z" fill={t.primary} stroke={t.primaryDeep} strokeWidth="2"/>
      <circle cx="100" cy="128" r="5" fill={t.gold} stroke={t.goldDeep} strokeWidth="1.5"/>

      {/* Neck */}
      <rect x="92" y="110" width="16" height="14" rx="3" fill="#FBD9BE"/>

      {/* Arms */}
      <ellipse cx="62" cy="145" rx="9" ry="18" fill={t.primary} stroke={t.primaryDeep} strokeWidth="2"
        transform={isWave ? "rotate(-40 62 135)" : "rotate(-10 62 145)"}/>
      <ellipse cx="138" cy="145" rx="9" ry="18" fill={t.primary} stroke={t.primaryDeep} strokeWidth="2"
        transform="rotate(10 138 145)"/>
      <circle cx={isWave ? 42 : 56} cy={isWave ? 118 : 160} r="7" fill="#FBD9BE" stroke={t.inkSoft} strokeWidth="1.2"/>
      <circle cx="144" cy="160" r="7" fill="#FBD9BE" stroke={t.inkSoft} strokeWidth="1.2"/>

      {/* Head */}
      <ellipse cx="100" cy="80" rx="38" ry="40" fill="#FBD9BE" stroke={t.inkSoft} strokeWidth="1.5"/>

      {/* Hair */}
      <path d="M 62 72 Q 58 40 80 30 Q 100 22 120 30 Q 142 40 138 72 Q 140 55 128 48 Q 115 55 100 52 Q 85 55 72 48 Q 60 55 62 72 Z"
        fill={t.gold} stroke={t.goldDeep} strokeWidth="1.5"/>
      <path d="M 64 75 Q 52 95 58 120 Q 62 110 66 100 Q 68 85 68 78" fill={t.gold} stroke={t.goldDeep} strokeWidth="1.5"/>
      <path d="M 136 75 Q 148 95 142 120 Q 138 110 134 100 Q 132 85 132 78" fill={t.gold} stroke={t.goldDeep} strokeWidth="1.5"/>
      <path d="M 85 35 Q 95 28 108 30" stroke="#FFF2BC" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Crown */}
      <path d="M 78 40 L 84 30 L 90 38 L 100 26 L 110 38 L 116 30 L 122 40 Z"
        fill={t.gold} stroke={t.goldDeep} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="100" cy="34" r="3" fill={t.pink} stroke={t.pinkDeep} strokeWidth="1"/>

      {/* Cheeks */}
      <ellipse cx="76" cy="88" rx="6" ry="4" fill={t.pink} opacity="0.6"/>
      <ellipse cx="124" cy="88" rx="6" ry="4" fill={t.pink} opacity="0.6"/>

      {/* Eyes */}
      {isHappy && (<>
        <path d="M 82 78 Q 86 73 90 78" stroke={t.ink} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 110 78 Q 114 73 118 78" stroke={t.ink} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>)}
      {isSad && (<>
        <ellipse cx="86" cy="80" rx="3" ry="4" fill={t.ink}/>
        <ellipse cx="114" cy="80" rx="3" ry="4" fill={t.ink}/>
        <path d="M 80 76 Q 86 74 92 78" stroke={t.ink} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 108 78 Q 114 74 120 76" stroke={t.ink} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </>)}
      {(isThink || isWave) && (<>
        <ellipse cx="86" cy="80" rx="3" ry="4" fill={t.ink}/>
        <ellipse cx="114" cy="80" rx="3" ry="4" fill={t.ink}/>
        {isWave && <><circle cx="89" cy="77" r="1" fill="#fff"/><circle cx="117" cy="77" r="1" fill="#fff"/></>}
      </>)}

      {/* Mouth */}
      {isHappy && <path d="M 92 96 Q 100 104 108 96" stroke={t.ink} strokeWidth="2.5" fill={t.pinkDeep} strokeLinecap="round" strokeLinejoin="round"/>}
      {isSad    && <path d="M 92 102 Q 100 96 108 102" stroke={t.ink} strokeWidth="2" fill="none" strokeLinecap="round"/>}
      {isThink  && <ellipse cx="100" cy="98" rx="3" ry="2" fill={t.ink}/>}
      {isWave   && <path d="M 92 96 Q 100 104 108 96" stroke={t.ink} strokeWidth="2.5" fill={t.pinkDeep} strokeLinecap="round" strokeLinejoin="round"/>}

      {/* Wand (cheer only) */}
      {mood === "cheer" && (
        <g transform="rotate(25 42 118)">
          <line x1="42" y1="118" x2="30" y2="88" stroke={t.goldDeep} strokeWidth="2" strokeLinecap="round"/>
          <path d="M 30 88 L 33 82 L 35 88 L 41 85 L 37 91 L 42 95 L 35 94 L 32 100 L 30 94 L 24 95 L 28 89 L 22 86 Z"
            fill={t.gold} stroke={t.goldDeep} strokeWidth="1.2"/>
        </g>
      )}
    </svg>
  );
}
