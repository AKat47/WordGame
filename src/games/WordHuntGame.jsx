import { useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { FONT_SERIF } from "../data/themes";

/**
 * Word Hunt: find hidden words in a letter grid.
 * Touch/mouse: press on start letter, drag through cells, release to check.
 */
export default function WordHuntGame({ q, onAnswer }) {
  const { theme: t } = useTheme();
  const { grid, targetWords } = q;
  const ROWS = grid.length;
  const COLS = grid[0].length;

  const [foundWords, setFoundWords]       = useState([]);
  const [foundCells, setFoundCells]       = useState([]); // [{r,c,color}]
  const [selecting,  setSelecting]        = useState(false);
  const [selection,  setSelection]        = useState([]); // [{r,c}]
  const [wrongFlash, setWrongFlash]       = useState(false);
  const gridRef = useRef(null);

  const COLORS = [t.primary, t.gold, t.pink, t.sage, t.lavender, t.sky];

  /* ── Pointer helpers ───────────────────────────────────────────── */
  const cellFromPoint = (clientX, clientY) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cellW = rect.width  / COLS;
    const cellH = rect.height / ROWS;
    const c = Math.floor((clientX - rect.left)  / cellW);
    const r = Math.floor((clientY - rect.top)   / cellH);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return { r, c };
  };

  const extendSelection = (cell) => {
    if (!cell) return;
    if (selection.length === 0) { setSelection([cell]); return; }
    const first = selection[0];
    const dr = Math.sign(cell.r - first.r);
    const dc = Math.sign(cell.c - first.c);
    // Only allow horizontal, vertical, diagonal (strict line from first cell)
    const dRow = cell.r - first.r;
    const dCol = cell.c - first.c;
    const isHoriz  = dRow === 0;
    const isVert   = dCol === 0;
    const isDiag   = Math.abs(dRow) === Math.abs(dCol);
    if (!isHoriz && !isVert && !isDiag) return;
    // Build path from first to current
    const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
    const path = [];
    for (let i = 0; i <= steps; i++) {
      path.push({ r: first.r + dr * i, c: first.c + dc * i });
    }
    setSelection(path);
  };

  const finalizeSelection = () => {
    setSelecting(false);
    if (selection.length < 2) { setSelection([]); return; }
    const word = selection.map(({ r, c }) => grid[r][c]).join("");
    const wordRev = word.split("").reverse().join("");
    const found = targetWords.find(
      w => !foundWords.includes(w) && (w.toUpperCase() === word || w.toUpperCase() === wordRev)
    );
    if (found) {
      const color = COLORS[foundWords.length % COLORS.length];
      const nextFound = [...foundWords, found];
      setFoundWords(nextFound);
      setFoundCells(prev => [...prev, ...selection.map(cell => ({ ...cell, color }))]);
      setSelection([]);
      if (nextFound.length === targetWords.length) {
        setTimeout(() => onAnswer(true), 500);
      }
    } else {
      setWrongFlash(true);
      setTimeout(() => { setWrongFlash(false); setSelection([]); }, 500);
    }
  };

  /* ── Pointer event handlers (touch + mouse unified) ──────────────── */
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const cell = cellFromPoint(e.clientX, e.clientY);
    setSelecting(true);
    setSelection(cell ? [cell] : []);
  };
  const onPointerMove = (e) => {
    if (!selecting) return;
    extendSelection(cellFromPoint(e.clientX, e.clientY));
  };
  const onPointerUp = () => finalizeSelection();

  /* ── Cell state ──────────────────────────────────────────────────── */
  const cellColor = (r, c) => {
    const f = foundCells.find(fc => fc.r === r && fc.c === c);
    if (f) return f.color;
    if (wrongFlash && selection.some(s => s.r === r && s.c === c)) return t.red;
    if (selecting && selection.some(s => s.r === r && s.c === c)) return t.primary;
    return null;
  };

  const inSelection = (r, c) =>
    selecting && selection.some(s => s.r === r && s.c === c);

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: t.inkSoft }}>
        FIND THE HIDDEN WORDS — DRAG TO SELECT
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 3,
          userSelect: "none",
          touchAction: "none",
          borderRadius: 12,
          overflow: "hidden",
          border: `1.5px solid ${t.line}`,
          background: t.card,
          padding: 4,
        }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const bg     = cellColor(r, c);
            const active = inSelection(r, c);
            return (
              <div key={`${r}-${c}`} style={{
                aspectRatio: "1",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 6,
                background: bg ? (bg + "33") : "transparent",
                border: `2px solid ${bg || "transparent"}`,
                fontSize: 14, fontWeight: 800,
                color: bg ? bg : t.ink,
                transition: "background 120ms, border-color 120ms, color 120ms",
                fontFamily: FONT_SERIF,
                transform: active ? "scale(1.1)" : "scale(1)",
              }}>
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Word list */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {targetWords.map((word, i) => {
          const found = foundWords.includes(word);
          const color = found ? COLORS[foundWords.indexOf(word) % COLORS.length] : t.inkSoft;
          return (
            <div key={word} style={{
              padding: "6px 14px", borderRadius: 20,
              background: found ? (color + "22") : t.card,
              border: `2px solid ${found ? color : t.line}`,
              fontSize: 13, fontWeight: 800, color,
              textDecoration: found ? "line-through" : "none",
              fontFamily: FONT_SERIF,
            }}>
              {found ? "✓ " : ""}{word}
            </div>
          );
        })}
      </div>
    </div>
  );
}
