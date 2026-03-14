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
      className="min-h-screen flex flex-col gap-4 screen-enter pb-6 px-4 pt-4"
      style={{
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg active:scale-90 text-white border border-white/20"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
            backdropFilter: "blur(8px)",
          }}
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-white">{t.wordSearch}</h1>
          <p className="text-xs text-white/60">{puzzle.title}</p>
        </div>
        <div
          className="rounded-2xl px-3 py-2 text-sm font-bold text-amber-400 border border-amber-400/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,166,35,0.05))",
          }}
        >
          🪙 {totalCoins}
        </div>
      </div>

      {/* Instructions */}
      <div
        className="rounded-2xl px-4 py-2 text-center border border-white/10"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(8px)",
        }}
      >
        <p className="text-xs text-white/60">
          {startCell ? "Tap the end letter of the word" : t.findWords}
        </p>
      </div>

      {/* Grid */}
      <div
        className="rounded-3xl p-4 overflow-x-auto border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8), rgba(44,83,100,0.7))",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 20px rgba(0,229,255,0.15)",
        }}
      >
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
                  className={`${cellSize} rounded-xl ${cellText} font-black flex items-center justify-center transition-all active:scale-90 select-none`}
                  style={
                    found
                      ? {
                          background:
                            "linear-gradient(135deg, #00bcd4, #2196f3)",
                          color: "white",
                          boxShadow: "0 0 8px rgba(0,229,255,0.4)",
                        }
                      : hovered || isStart
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(0,188,212,0.4), rgba(33,150,243,0.3))",
                            color: "white",
                            border: "1px solid rgba(0,229,255,0.5)",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, rgba(15,32,39,0.8), rgba(32,58,67,0.6))",
                            color: "rgba(255,255,255,0.8)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }
                  }
                >
                  {cell}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Word list */}
      <div
        className="rounded-3xl p-4 border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 20px rgba(0,229,255,0.1)",
        }}
      >
        <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
          {t.findWords}
        </p>
        <div className="flex flex-wrap gap-2">
          {puzzle.words.map((word) => {
            const found = foundWords.includes(word);
            return (
              <span
                key={word}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                  found
                    ? "border-cyan-400/40 text-cyan-300 line-through"
                    : "border-white/15 text-white/60"
                }`}
                style={{
                  background: found
                    ? "linear-gradient(135deg, rgba(0,188,212,0.2), rgba(33,150,243,0.1))"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* All found */}
      {allFound && (
        <div
          className="rounded-3xl p-5 text-center pop-in border border-cyan-400/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,188,212,0.25), rgba(33,150,243,0.15))",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 20px rgba(0,229,255,0.25)",
          }}
        >
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-black text-cyan-300 mb-1">
            Puzzle Complete!
          </h3>
          <p className="text-sm text-white/60 mb-4">
            Found all {puzzle.words.length} words!
          </p>
          {puzzleIdx < wordSearchPuzzles.length - 1 ? (
            <button
              type="button"
              onClick={handleNextPuzzle}
              className="w-full py-3 text-white font-bold rounded-2xl active:scale-95"
              style={{
                background: "linear-gradient(135deg, #00bcd4, #2196f3)",
                boxShadow: "0 0 16px rgba(0,229,255,0.3)",
              }}
            >
              Next Puzzle →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("home")}
              className="w-full py-3 text-white font-bold rounded-2xl active:scale-95"
              style={{
                background: "linear-gradient(135deg, #00bcd4, #2196f3)",
                boxShadow: "0 0 16px rgba(0,229,255,0.3)",
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
