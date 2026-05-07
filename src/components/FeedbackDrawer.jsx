import { useTheme } from "../context/ThemeContext";
import { shade } from "../utils/color";
import { FONT_SERIF } from "../data/themes";
import Icon from "./Icon";
import BigButton from "./BigButton";

export default function FeedbackDrawer({ correct, correctAnswer, explanation, onContinue }) {
  const { theme: t } = useTheme();
  const bg       = correct ? t.sageSoft : t.redSoft;
  const fg       = correct ? t.sageDeep : t.red;
  const btnBg    = correct ? t.sage     : t.red;
  const btnShadow = correct ? t.sageDeep : shade(t.red);

  return (
    <div style={{
      background: bg, padding: "18px 20px 22px",
      borderTop: `2px solid ${correct ? t.sage : t.red}`,
      animation: "slideUp 280ms cubic-bezier(.2,1,.3,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: correct ? t.sage : t.red,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={correct ? "check" : "x"} size={24} color="#fff" strokeWidth={3}/>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: fg, fontFamily: FONT_SERIF }}>
            {correct ? "Wonderful!" : "Almost!"}
          </div>
          {!correct && (
            <div style={{ fontSize: 13, color: fg, marginTop: 1 }}>
              Correct answer: <b>{correctAnswer}</b>
            </div>
          )}
        </div>
      </div>

      {explanation && (
        <div style={{
          fontSize: 13, color: t.ink, lineHeight: 1.4,
          marginTop: 4, paddingLeft: 52,
          fontStyle: "italic", fontFamily: FONT_SERIF,
        }}>
          {explanation}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <BigButton onClick={onContinue} color={btnBg} shadowColor={btnShadow} style={{ width: "100%" }}>
          Continue
        </BigButton>
      </div>
    </div>
  );
}
