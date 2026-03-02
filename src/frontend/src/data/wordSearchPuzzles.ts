export interface WordSearchPuzzle {
  id: number;
  title: string;
  grid: string[][];
  words: string[];
  size: { rows: number; cols: number };
}

// Pre-built static grids for reliability
const puzzle1Grid: string[][] = [
  ["C", "A", "T", "X", "S", "U", "N", "M"],
  ["D", "O", "G", "Y", "Z", "P", "Q", "O"],
  ["A", "B", "C", "D", "E", "F", "G", "O"],
  ["S", "T", "A", "R", "H", "I", "J", "N"],
  ["K", "L", "M", "N", "O", "P", "Q", "R"],
  ["S", "T", "A", "R", "U", "V", "W", "X"],
  ["Y", "Z", "A", "B", "C", "D", "E", "F"],
  ["G", "H", "I", "J", "K", "L", "M", "N"],
];

const puzzle2Grid: string[][] = [
  ["A", "P", "P", "L", "E", "X", "Y", "Z"],
  ["G", "R", "A", "P", "E", "A", "B", "C"],
  ["M", "A", "N", "G", "O", "D", "E", "F"],
  ["G", "H", "I", "J", "K", "L", "E", "M"],
  ["N", "O", "P", "Q", "R", "S", "M", "T"],
  ["L", "E", "M", "O", "N", "U", "O", "V"],
  ["W", "X", "Y", "Z", "A", "B", "N", "C"],
  ["D", "E", "F", "G", "H", "I", "J", "K"],
];

const puzzle3Grid: string[][] = [
  ["I", "N", "D", "I", "A", "X", "Y", "Z"],
  ["R", "I", "V", "E", "R", "A", "B", "C"],
  ["O", "C", "E", "A", "N", "D", "E", "F"],
  ["G", "H", "I", "J", "K", "L", "M", "N"],
  ["O", "P", "Q", "R", "S", "T", "U", "V"],
  ["W", "X", "Y", "Z", "A", "B", "C", "D"],
  ["M", "O", "U", "N", "T", "A", "I", "N"],
  ["E", "F", "G", "H", "I", "J", "K", "L"],
  ["M", "N", "O", "P", "Q", "R", "S", "T"],
  ["U", "V", "W", "X", "Y", "Z", "A", "B"],
];

const puzzle4Grid: string[][] = [
  ["C", "R", "I", "C", "K", "E", "T", "X"],
  ["T", "E", "N", "N", "I", "S", "Y", "Z"],
  ["A", "B", "C", "D", "E", "F", "G", "H"],
  ["H", "O", "C", "K", "E", "Y", "I", "J"],
  ["K", "L", "M", "N", "O", "P", "Q", "R"],
  ["F", "O", "O", "T", "B", "A", "L", "L"],
  ["S", "T", "U", "V", "W", "X", "Y", "Z"],
  ["A", "B", "C", "D", "E", "F", "G", "H"],
  ["I", "J", "K", "L", "M", "N", "O", "P"],
  ["Q", "R", "S", "T", "U", "V", "W", "X"],
];

const puzzle5Grid: string[][] = [
  ["S", "C", "I", "E", "N", "C", "E", "X"],
  ["P", "H", "Y", "S", "I", "C", "S", "Y"],
  ["A", "B", "C", "D", "E", "F", "G", "Z"],
  ["B", "I", "O", "L", "O", "G", "Y", "A"],
  ["B", "C", "D", "E", "F", "G", "H", "I"],
  ["M", "A", "T", "H", "S", "J", "K", "L"],
  ["M", "N", "O", "P", "Q", "R", "S", "T"],
  ["U", "V", "W", "X", "Y", "Z", "A", "B"],
  ["C", "D", "E", "F", "G", "H", "I", "J"],
  ["K", "L", "M", "N", "O", "P", "Q", "R"],
];

export const wordSearchPuzzles: WordSearchPuzzle[] = [
  {
    id: 1,
    title: "Animals & Nature",
    grid: puzzle1Grid,
    words: ["CAT", "DOG", "SUN", "MOON", "STAR"],
    size: { rows: 8, cols: 8 },
  },
  {
    id: 2,
    title: "Fruits",
    grid: puzzle2Grid,
    words: ["APPLE", "GRAPE", "MANGO", "LEMON"],
    size: { rows: 8, cols: 8 },
  },
  {
    id: 3,
    title: "Geography",
    grid: puzzle3Grid,
    words: ["INDIA", "RIVER", "OCEAN", "MOUNTAIN"],
    size: { rows: 10, cols: 8 },
  },
  {
    id: 4,
    title: "Sports",
    grid: puzzle4Grid,
    words: ["CRICKET", "TENNIS", "HOCKEY", "FOOTBALL"],
    size: { rows: 10, cols: 8 },
  },
  {
    id: 5,
    title: "Science",
    grid: puzzle5Grid,
    words: ["SCIENCE", "PHYSICS", "BIOLOGY", "MATHS"],
    size: { rows: 10, cols: 8 },
  },
];
