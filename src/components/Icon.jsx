const PATHS = {
  heart:        (c, s) => <path d="M12 21s-7-4.5-9-9.5C1.5 7 4.5 3 8.5 4c2 .5 3 2 3.5 3 .5-1 1.5-2.5 3.5-3 4-1 7 3 5.5 7.5C19 16.5 12 21 12 21z" fill={c} stroke="none"/>,
  heartEmpty:   (c, s) => <path d="M12 21s-7-4.5-9-9.5C1.5 7 4.5 3 8.5 4c2 .5 3 2 3.5 3 .5-1 1.5-2.5 3.5-3 4-1 7 3 5.5 7.5C19 16.5 12 21 12 21z" fill="none" stroke={c} strokeWidth={s} strokeLinejoin="round"/>,
  flame:        (c)    => <path d="M12 2s-1 3-1 5c0 1.5 1 2.5 1 4 0-1 1.5-2 3-2 0 3-2 4-2 6 0 3 2 5 2 5s-3 1-5 1c-3 0-6-2-6-6 0-3 2-4 2-6 0 1 1 2 2 2 0-2-1-3-1-5 0-2 2-4 5-4z" fill={c} stroke="none"/>,
  gem:          (c, s) => <path d="M6 3h12l3 6-9 12L3 9l3-6z" fill={c} stroke={c} strokeWidth={s} strokeLinejoin="round"/>,
  star:         (c)    => <path d="M12 3l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.4l6-.9L12 3z" fill={c} stroke="none"/>,
  book:         (c, s) => <path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4V4zm16 0h-7a3 3 0 00-3 3v13a2 2 0 012-2h8V4z" fill="none" stroke={c} strokeWidth={s} strokeLinejoin="round"/>,
  home:         (c, s) => <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H10v6H4a1 1 0 01-1-1v-9z" fill="none" stroke={c} strokeWidth={s} strokeLinejoin="round"/>,
  user:         (c, s) => <g fill="none" stroke={c} strokeWidth={s} strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></g>,
  trophy:       (c, s) => <g fill="none" stroke={c} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3"/><path d="M9 18h6l1 3H8l1-3zM12 13v5"/></g>,
  check:        (c, s) => <path d="M4 12l5 5L20 6" fill="none" stroke={c} strokeWidth={s + 0.5} strokeLinecap="round" strokeLinejoin="round"/>,
  x:            (c, s) => <g stroke={c} strokeWidth={s + 0.5} strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g>,
  chevronLeft:  (c, s) => <path d="M15 6l-6 6 6 6" fill="none" stroke={c} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
  chevronRight: (c, s) => <path d="M9 6l6 6-6 6" fill="none" stroke={c} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
  speaker:      (c, s) => <g fill={c} stroke={c} strokeWidth={s} strokeLinejoin="round" strokeLinecap="round"><path d="M4 9h4l5-4v14l-5-4H4V9z"/><path d="M17 8c1.5 1 2 2.5 2 4s-.5 3-2 4" fill="none"/></g>,
  settings:     (c, s) => <g fill="none" stroke={c} strokeWidth={s} strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g>,
  lock:         (c, s) => <g fill="none" stroke={c} strokeWidth={s} strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></g>,
  play:         (c, s) => <path d="M7 4l13 8-13 8V4z" fill={c} stroke={c} strokeWidth={s} strokeLinejoin="round"/>,
  sparkle:      (c)    => <g fill={c}><path d="M12 2l1.5 5 5 1.5-5 1.5L12 15l-1.5-5-5-1.5 5-1.5L12 2z"/><circle cx="19" cy="5" r="1.5"/><circle cx="5" cy="18" r="1.5"/></g>,
  crown:        (c, s) => <path d="M3 8l4 4 5-7 5 7 4-4v10H3V8z" fill={c} stroke={c} strokeWidth={s} strokeLinejoin="round"/>,
  feather:      (c, s) => <path d="M20 4c0 8-8 14-14 14l-2 2M20 4c-6 0-10 4-12 8M14 10l-6 6" fill="none" stroke={c} strokeWidth={s} strokeLinecap="round" strokeLinejoin="round"/>,
};

export default function Icon({ name, size = 24, color = "currentColor", strokeWidth = 2 }) {
  const fn = PATHS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {fn ? fn(color, strokeWidth) : null}
    </svg>
  );
}
