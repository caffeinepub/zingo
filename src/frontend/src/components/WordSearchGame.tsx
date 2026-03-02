import { useCallback, useState } from "react";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { wordSearchPuzzles } from "../data/wordSearchPuzzles";
import { backend } from "../services/backendService";

interface CellPos {
  row: number;
  col: number;
}

function getCellsBetween(start: CellPos, end: CellPos): CellPos[] {
  const cells: CellPos[] = [];
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [start];
  const stepR = dr / steps;
  const stepC = dc / steps;
  // Only allow straight lines
  if (Math.abs(stepR) > 1 || Math.abs(stepC) > 1) return [];
  for (let i = 0; i <= steps; i++) {
    cells.push({
      row: start.row + Math.round(stepR * i),
      col: start.col + Math.round(stepC * i),
    });
  }
  return cells;
}

function getWordFromCells(cells: CellPos[], grid: string[][]): string {
  return cells.map((c) => grid[c.row]?.[c.col] ?? "").join("");
}

export function WordSearchGame() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed } =
    useGame();
  const t = translations[language];

  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [startCell, setStartCell] = useState<CellPos | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<CellPos[]>([]);
  const [hoveredCells, setHoveredCells] = useState<CellPos[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);

  const puzzle = wordSearchPuzzles[puzzleIdx];
  const allFound = puzzle.words.every((w) => foundWords.includes(w));

  const isCellFound = useCallback(
    (row: number, col: number) =>
      foundCells.some((c) => c.row === row && c.col === col),
    [foundCells],
  );

  const isCellHovered = useCallback(
    (row: number, col: number) =>
      hoveredCells.some((c) => c.row === row && c.col === col),
    [hoveredCells],
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const pos: CellPos = { row, col };
      if (!startCell) {
        setStartCell(pos);
        setHoveredCells([pos]);
        return;
      }

      // Trying to select end
      const cells = getCellsBetween(startCell, pos);
      const word = getWordFromCells(cells, puzzle.grid);
      const reversed = word.split("").reverse().join("");

      if (puzzle.words.includes(word) && !foundWords.includes(word)) {
        setFoundWords((prev) => [...prev, word]);
        setFoundCells((prev) => [...prev, ...cells]);
        addCoins(20);
        addXP(25);
        setTotalCoins((c) => c + 20);
      } else if (
        puzzle.words.includes(reversed) &&
        !foundWords.includes(reversed)
      ) {
        setFoundWords((prev) => [...prev, reversed]);
        setFoundCells((prev) => [...prev, ...cells]);
        addCoins(20);
        addXP(25);
        setTotalCoins((c) => c + 20);
      }

      setStartCell(null);
      setHoveredCells([]);
    },
    [startCell, puzzle, foundWords, addCoins, addXP],
  );

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (!startCell) return;
      const cells = getCellsBetween(startCell, { row, col });
      setHoveredCells(cells);
    },
    [startCell],
  );

  const handleNextPuzzle = useCallback(() => {
    if (puzzleIdx < wordSearchPuzzles.length - 1) {
      incrementGamesPlayed();
      backend
        .submitGameResult(
          "wordSearch",
          BigInt(foundWords.length),
          BigInt(totalCoins),
          BigInt(totalCoins),
        )
        .catch(() => {});
      setPuzzleIdx((p) => p + 1);
      setFoundWords([]);
      setFoundCells([]);
      setStartCell(null);
      setHoveredCells([]);
    }
  }, [puzzleIdx, foundWords.length, totalCoins, incrementGamesPlayed]);

  const cellSize = puzzle.size.cols <= 8 ? "w-9 h-9" : "w-8 h-8";
  const cellText = puzzle.size.cols <= 8 ? "text-sm" : "text-xs";

  return (
    <div
      data-ocid="word_search.screen"
      className="flex flex-col gap-4 screen-enter pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center text-lg active:scale-90"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-foreground">{t.wordSearch}</h1>
          <p className="text-xs text-muted-foreground">{puzzle.title}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2 text-sm font-bold text-amber-700">
          🪙 {totalCoins}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/60 rounded-2xl px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          {startCell ? "Tap the end letter of the word" : t.findWords}
        </p>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-3xl shadow-card p-4 overflow-x-auto">
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size.cols}, 1fr)`,
            width: "fit-content",
          }}
        >
          {puzzle.grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const found = isCellFound(rIdx, cIdx);
              const hovered = isCellHovered(rIdx, cIdx);
              const isStart =
                startCell?.row === rIdx && startCell?.col === cIdx;
              const cellKey = `p${puzzle.id}r${rIdx}c${cIdx}`;
              return (
                <button
                  type="button"
                  key={cellKey}
                  data-ocid={`word_search.grid_cell.${rIdx * puzzle.size.cols + cIdx + 1}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  onMouseEnter={() => handleCellHover(rIdx, cIdx)}
                  className={`${cellSize} rounded-xl ${cellText} font-black flex items-center justify-center transition-all active:scale-90 select-none ${
                    found
                      ? "text-white"
                      : hovered || isStart
                        ? "text-white"
                        : "bg-gray-50 text-foreground"
                  }`}
                  style={
                    found
                      ? {
                          background:
                            "linear-gradient(135deg, #10B981, #059669)",
                        }
                      : hovered || isStart
                        ? {
                            background:
                              "linear-gradient(135deg, #F59E0B, #EAB308)",
                          }
                        : {}
                  }
                >
                  {cell}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Words to find */}
      <div className="bg-white rounded-3xl shadow-card p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          {t.wordsFound}: {foundWords.length}/{puzzle.words.length}
        </p>
        <div className="flex flex-wrap gap-2">
          {puzzle.words.map((word) => {
            const found = foundWords.includes(word);
            return (
              <span
                key={word}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
                  found
                    ? "bg-green-100 text-green-700 line-through"
                    : "bg-gray-100 text-foreground"
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Puzzle complete */}
      {allFound && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-5 text-center pop-in">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-black text-green-800 mb-1">
            {t.puzzleComplete}
          </h3>
          {puzzleIdx < wordSearchPuzzles.length - 1 ? (
            <button
              type="button"
              data-ocid="word_search.next_puzzle_button"
              onClick={handleNextPuzzle}
              className="w-full py-3 text-white font-bold rounded-2xl mt-3 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EAB308)",
              }}
            >
              {t.nextPuzzle} →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("home")}
              className="w-full py-3 text-white font-bold rounded-2xl mt-3 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
              }}
            >
              🏠 {t.home}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
