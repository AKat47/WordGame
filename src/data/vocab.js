export const VOCAB_BOOKS = [
  {
    id: "grandma",
    title: "Grandma's Bag of Stories",
    author: "Sudha Murthy",
    cover: "#E8C4A0",
    coverAccent: "#B87A4E",
    emoji: "📖",
    progress: 0.75,
    totalLessons: 4,
    lessons: [
      {
        id: "l1",
        title: "Village Tales",
        words: [
          { word: "pious", meaning: "deeply religious and devoted", sentence: "The pious old man prayed every morning by the river.", image: "🕉️" },
          { word: "frugal", meaning: "careful with money, not wasteful", sentence: "Grandma was frugal and saved every coin.", image: "🪙" },
          { word: "bountiful", meaning: "generous and plentiful", sentence: "The monsoon brought a bountiful harvest that year.", image: "🌾" },
          { word: "quaint", meaning: "old-fashioned in a charming way", sentence: "Their quaint cottage had a thatched roof and a blue door.", image: "🏡" },
        ],
      },
      {
        id: "l2",
        title: "Wise Sayings",
        words: [
          { word: "benevolent", meaning: "kind and generous", sentence: "The benevolent king shared his grain with the villagers.", image: "👑" },
          { word: "humble", meaning: "modest, not proud", sentence: "Despite her wealth, she remained humble and gentle.", image: "🙏" },
          { word: "wisdom", meaning: "knowledge gained through experience", sentence: "Her grandmother shared her wisdom through stories.", image: "🦉" },
          { word: "diligent", meaning: "hard-working and careful", sentence: "The diligent student finished her homework before dusk.", image: "✏️" },
        ],
      },
    ],
  },
  {
    id: "rusty",
    title: "The Adventures of Rusty",
    author: "Ruskin Bond",
    cover: "#A8C8A0",
    coverAccent: "#5A7A48",
    emoji: "🌲",
    progress: 0.4,
    totalLessons: 5,
    lessons: [
      {
        id: "l1",
        title: "Mountain Words",
        words: [
          { word: "meander", meaning: "to wander slowly, without direction", sentence: "The little stream meandered through the deodar forest.", image: "🏞️" },
          { word: "serene", meaning: "calm and peaceful", sentence: "The serene lake mirrored the snowy peaks above.", image: "🏔️" },
          { word: "luminous", meaning: "giving off bright light", sentence: "A luminous moon rose over the pine trees.", image: "🌙" },
          { word: "rustle", meaning: "a soft crackling sound", sentence: "She heard the rustle of leaves as the leopard passed.", image: "🍂" },
        ],
      },
    ],
  },
  {
    id: "magic",
    title: "How I Taught My Grandmother",
    author: "Sudha Murthy",
    cover: "#D4B8E0",
    coverAccent: "#7A5A8C",
    emoji: "✨",
    progress: 0.1,
    totalLessons: 3,
    lessons: [
      {
        id: "l1",
        title: "Family Words",
        words: [
          { word: "eager", meaning: "very keen or excited", sentence: "She was eager to read the new chapter aloud.", image: "🌟" },
          { word: "reluctant", meaning: "unwilling, hesitant", sentence: "He was reluctant to admit his mistake.", image: "😟" },
          { word: "gratitude", meaning: "the feeling of being thankful", sentence: "She expressed her gratitude with a warm hug.", image: "💛" },
          { word: "cherish", meaning: "to hold dear and protect", sentence: "I cherish the stories Grandma told me.", image: "💝" },
        ],
      },
    ],
  },
];

export const CURRENT_LESSON = VOCAB_BOOKS[0].lessons[0];
