export interface WordConnectLevel {
  id: number;
  letters: string[];
  words: string[];
  hint?: string;
}

export const wordConnectLevels: WordConnectLevel[] = [
  {
    id: 1,
    letters: ["C", "A", "T", "S"],
    words: ["CAT", "ACT", "SAT"],
    hint: "Animals & actions",
  },
  {
    id: 2,
    letters: ["D", "O", "G", "S"],
    words: ["DOG", "GOD", "DOGS"],
    hint: "Man's best friend",
  },
  {
    id: 3,
    letters: ["P", "L", "A", "Y"],
    words: ["PLAY", "LAP", "PAL"],
    hint: "Fun activities",
  },
  { id: 4, letters: ["B", "O", "O", "K"], words: ["BOOK"], hint: "Read it!" },
  {
    id: 5,
    letters: ["F", "I", "R", "E"],
    words: ["FIRE", "RIFE"],
    hint: "Hot!",
  },
  {
    id: 6,
    letters: ["S", "T", "A", "R"],
    words: ["STAR", "RATS", "ARTS", "TARS"],
    hint: "Sky & more",
  },
  {
    id: 7,
    letters: ["H", "A", "N", "D"],
    words: ["HAND", "AND"],
    hint: "Body part",
  },
  {
    id: 8,
    letters: ["F", "L", "O", "W"],
    words: ["FLOW", "FOWL", "WOLF", "LOW"],
    hint: "Movement",
  },
  {
    id: 9,
    letters: ["P", "A", "R", "K"],
    words: ["PARK", "PARK", "KARP"],
    hint: "Green space",
  },
  {
    id: 10,
    letters: ["S", "I", "N", "G"],
    words: ["SING", "GINS", "SIGN"],
    hint: "Music",
  },
  {
    id: 11,
    letters: ["C", "H", "A", "I", "N"],
    words: ["CHAIN", "CHINA", "NAICH"],
    hint: "Connected",
  },
  {
    id: 12,
    letters: ["B", "R", "A", "I", "N"],
    words: ["BRAIN", "RAIN", "BAN", "RAN"],
    hint: "Think!",
  },
  {
    id: 13,
    letters: ["G", "L", "O", "V", "E"],
    words: ["GLOVE", "LOVE", "OGLE"],
    hint: "Keep warm",
  },
  {
    id: 14,
    letters: ["S", "T", "O", "N", "E"],
    words: ["STONE", "NOTES", "TONES", "ONES"],
    hint: "Rock solid",
  },
  {
    id: 15,
    letters: ["W", "A", "T", "E", "R"],
    words: ["WATER", "TARE", "WEAR", "RATE"],
    hint: "Essential liquid",
  },
  {
    id: 16,
    letters: ["G", "R", "E", "A", "T"],
    words: ["GREAT", "GRATE", "GREET", "RATE"],
    hint: "Excellent!",
  },
  {
    id: 17,
    letters: ["P", "L", "A", "N", "E", "T"],
    words: ["PLANET", "PLANT", "PLATE", "PLANE"],
    hint: "Solar system",
  },
  {
    id: 18,
    letters: ["F", "L", "O", "W", "E", "R"],
    words: ["FLOWER", "LOWER", "FOWLER", "FLEW"],
    hint: "Garden beauty",
  },
  {
    id: 19,
    letters: ["S", "P", "R", "I", "N", "G"],
    words: ["SPRING", "GRINS", "RINGS", "PINGS"],
    hint: "Season",
  },
  {
    id: 20,
    letters: ["B", "R", "I", "D", "G", "E"],
    words: ["BRIDGE", "GRIDE", "BRIDE", "RIDE"],
    hint: "Cross it",
  },
];
