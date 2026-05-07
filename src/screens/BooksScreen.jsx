import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF, FONT_SANS } from "../data/themes";
import { VOCAB_BOOKS } from "../data/vocab";
import { shade } from "../utils/color";
import BottomNav from "../components/BottomNav";

function BookCard({ book }) {
  const { theme: t } = useTheme();
  return (
    <div style={{
      background: book.cover, borderRadius: 18,
      border: `2px solid ${book.coverAccent}`,
      boxShadow: `0 3px 0 ${book.coverAccent}`,
      padding: 16, display: "flex", gap: 14,
      cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      {/* Book spine */}
      <div style={{
        width: 66, height: 88, borderRadius: 4, flexShrink: 0,
        background: `linear-gradient(135deg, ${book.coverAccent} 0%, ${shade(book.coverAccent, -20)} 100%)`,
        boxShadow: `inset 6px 0 0 ${shade(book.coverAccent, -30)}, 2px 2px 6px rgba(0,0,0,0.2)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 32,
      }}>
        {book.emoji}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#3B2A1F", fontFamily: FONT_SERIF, lineHeight: 1.2 }}>
            {book.title}
          </div>
          <div style={{ fontSize: 11, color: "#3B2A1F", opacity: 0.7, fontStyle: "italic", marginTop: 2 }}>
            by {book.author}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#3B2A1F", fontWeight: 700, letterSpacing: "1px", marginBottom: 4 }}>
            {Math.round(book.progress * book.totalLessons)} / {book.totalLessons} LESSONS
          </div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.12)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${book.progress * 100}%`, height: "100%", background: book.coverAccent }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BooksScreen({ onNav }) {
  const { theme: t } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bg, fontFamily: FONT_SANS }}>
      <div style={{ padding: "18px 20px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: t.inkSoft, letterSpacing: "2px" }}>MY LIBRARY</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: t.ink, fontFamily: FONT_SERIF, marginTop: 2 }}>Books</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {VOCAB_BOOKS.map(book => (
          <BookCard key={book.id} book={book}/>
        ))}

        {/* My Words entry point */}
        <div
          onClick={() => onNav("mywords")}
          style={{
            marginTop: 8, padding: "22px 16px",
            borderRadius: 18, border: `2px dashed ${t.line}`,
            textAlign: "center", color: t.inkSoft, cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 4 }}>📝</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>My Words</div>
          <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>Add &amp; manage your vocabulary</div>
        </div>
      </div>

      <BottomNav current="books" onNav={onNav}/>
    </div>
  );
}
