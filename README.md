# Word Garden 🌸

A Duolingo-style vocabulary learning app for children, built with React + Vite.
Vocabulary sourced from Sudha Murthy & Ruskin Bond books.

---

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

---

## Project structure

```
word-garden/
├── index.html                  # HTML shell + Google Fonts
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                # React root mount
    ├── App.jsx                 # Navigation state, phone-card shell
    │
    ├── context/
    │   └── ThemeContext.jsx    # useTheme() hook + ThemeProvider
    │
    ├── data/
    │   ├── themes.js           # THEMES object (Storybook / Forest / Twilight)
    │   ├── vocab.js            # VOCAB_BOOKS – books, lessons, words
    │   └── questions.js        # buildQuestions() – 5 game questions
    │
    ├── utils/
    │   └── color.js            # shade(hex, amt) colour helper
    │
    ├── components/             # Reusable UI primitives
    │   ├── Icon.jsx            # SVG icon system (24+ icons)
    │   ├── Mascot.jsx          # Pia the fairy (SVG, mood-aware)
    │   ├── BigButton.jsx       # 3-D press button
    │   ├── ProgressBar.jsx     # Animated filled bar
    │   ├── StatPill.jsx        # Icon + number inline
    │   ├── TopStatBar.jsx      # Streak / Gems / Hearts header row
    │   ├── BottomNav.jsx       # 4-tab bottom navigation
    │   └── FeedbackDrawer.jsx  # Correct / wrong slide-up panel
    │
    ├── games/                  # The 5 mini-game question types
    │   ├── MatchPictureGame.jsx    # Tap the picture that matches the word
    │   ├── MatchDefinitionGame.jsx # Pick the correct definition
    │   ├── ListenTapGame.jsx       # Hear the word, tap the spelling
    │   ├── SpellGame.jsx           # Build the word from a letter bank
    │   └── FillBlankGame.jsx       # Complete the sentence
    │
    └── screens/                # Full-screen views
        ├── HomeScreen.jsx      # Lesson path + book banner
        ├── LessonRunner.jsx    # Orchestrates 5 questions + feedback
        ├── CompletionScreen.jsx# XP / accuracy stats + confetti
        ├── BooksScreen.jsx     # Library of vocabulary books
        ├── RewardsScreen.jsx   # Streak, achievements, leaderboard
        └── ProfileScreen.jsx   # Avatar, word pocket, theme picker
```

---

## Themes

Switch between **Storybook** (warm cream), **Forest** (green), and **Twilight** (dark purple) from the Profile tab. All components read from `ThemeContext` — no prop-drilling.

## Adding new content

- **New vocabulary books / lessons / words** → `src/data/vocab.js`
- **New question types** → add a component in `src/games/`, register it in the `GameComponent` map in `LessonRunner.jsx`
- **New theme** → add an entry to `THEMES` in `src/data/themes.js`
