import { useCallback, useState } from "react";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { wordSearchPuzzles } from "../data/wordSearchPuzzles";
import { backend } from "../services/backendService";
import { GameResultModal } from "./GameResultModal";

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

function calcReward(score: number, max: number): { coins: number; xp: number } {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.6) return { coins: 20, xp: 20 };
  if (pct >= 0.3) return { coins: 10, xp: 10 };
  return { coins: 2, xp: 5 };
}

export function WordSearchGame() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed, watchAd } =
    useGame();
  const t = translations[language];

  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [startCell, setStartCell] = useState<CellPos | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<CellPos[]>([]);
  const [hoveredCells, setHoveredCells] = useState<CellPos[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [reward, setReward] = useState({ coins: 0, xp: 0 });

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
      let newFoundWords = foundWords;
      if (puzzle.words.includes(word) && !foundWords.includes(word)) {
        newFoundWords = [...foundWords, word];
        setFoundWords(newFoundWords);
        setFoundCells((prev) => [...prev, ...cells]);
      } else if (
        puzzle.words.includes(reversed) &&
        !foundWords.includes(reversed)
      ) {
        newFoundWords = [...foundWords, reversed];
        setFoundWords(newFoundWords);
        setFoundCells((prev) => [...prev, ...cells]);
      }
      if (
        newFoundWords.length === puzzle.words.length &&
        newFoundWords.length > foundWords.length
      ) {
        const r = calcReward(newFoundWords.length, puzzle.words.length);
        setReward(r);
        addCoins(r.coins);
        addXP(r.xp);
        backend
          .submitGameResult(
            "wordSearch",
            BigInt(newFoundWords.length),
            BigInt(r.coins),
            BigInt(r.xp),
          )
          .catch(() => {});
        setTimeout(() => setShowResult(true), 600);
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
      setPuzzleIdx((p) => p + 1);
      setFoundWords([]);
      setFoundCells([]);
      setHoveredCells([]);
      setStartCell(null);
      setShowResult(false);
      setReward({ coins: 0, xp: 0 });
    } else {
      incrementGamesPlayed();
      navigate("home");
    }
  }, [puzzleIdx, incrementGamesPlayed, navigate]);

  return (
    <div
      data-ocid="word_search.screen"
      className="min-h-screen flex flex-col gap-4 screen-enter pb-6 px-4 pt-4"
      style={{
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg active:scale-90 text-white border border-white/20"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
            backdropFilter: "blur(8px)",
            color: "#00e5ff",
          }}
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-white">{t.wordSearch}</h1>
          <p className="text-xs text-white/60">
            {t.puzzleComplete.split(" ")[0]} {puzzleIdx + 1}
          </p>
        </div>
        <div
          className="rounded-2xl px-3 py-2 text-sm font-bold text-cyan-300 border border-cyan-400/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(33,150,243,0.1))",
          }}
        >
          {foundWords.length}/{puzzle.words.length}
        </div>
      </div>

      <div
        className="rounded-3xl overflow-hidden border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
          backdropFilter: "blur(12px)",
        }}
      >
        {puzzle.grid.map((row, rIdx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable grid
          <div key={`row-${rIdx}`} className="flex">
            {/* biome-ignore lint/suspicious/noArrayIndexKey: stable grid */}
            {row.map((cell, cIdx) => {
              const found = isCellFound(rIdx, cIdx);
              const hovered = isCellHovered(rIdx, cIdx);
              // biome-ignore lint/suspicious/noArrayIndexKey: static grid
              const cellKey = `cell-${rIdx}-${cIdx}`;
              return (
                <button
                  type="button"
                  key={cellKey}
                  data-ocid={`word_search.cell.button.${rIdx * row.length + cIdx + 1}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  onMouseEnter={() => handleCellHover(rIdx, cIdx)}
                  className="flex-1 aspect-square flex items-center justify-center text-xs font-black transition-all"
                  style={{
                    color: found
                      ? "#00e5ff"
                      : hovered
                        ? "#fff"
                        : "rgba(255,255,255,0.8)",
                    background: found
                      ? "rgba(0,229,255,0.2)"
                      : hovered
                        ? "rgba(0,229,255,0.1)"
                        : "transparent",
                    fontSize: "clamp(10px, 2.5vw, 14px)",
                  }}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div
        className="rounded-3xl p-4 border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
          backdropFilter: "blur(12px)",
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
                className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${found ? "border-green-400/40 text-green-300 line-through" : "border-white/15 text-white/50"}`}
                style={{
                  background: found
                    ? "linear-gradient(135deg, rgba(22,101,52,0.4), rgba(21,128,61,0.2))"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {allFound && !showResult && (
        <div
          className="rounded-3xl p-5 text-center border border-green-400/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(22,101,52,0.5), rgba(21,128,61,0.3))",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-black text-green-300 mb-4">
            {t.puzzleComplete}
          </h3>
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
              {t.next} Puzzle →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                incrementGamesPlayed();
                navigate("home");
              }}
              className="w-full py-3 text-white font-bold rounded-2xl active:scale-95"
              style={{
                background: "linear-gradient(135deg, #00bcd4, #2196f3)",
              }}
            >
              🏠 {t.home}
            </button>
          )}
        </div>
      )}

      <GameResultModal
        isOpen={showResult}
        score={foundWords.length}
        maxScore={puzzle.words.length}
        coinsEarned={reward.coins}
        xpEarned={reward.xp}
        gameName={t.wordSearch}
        onRetry={() => {
          setFoundWords([]);
          setFoundCells([]);
          setShowResult(false);
          setReward({ coins: 0, xp: 0 });
        }}
        onExit={() => {
          incrementGamesPlayed();
          navigate("home");
        }}
        onWatchAdRetry={() => {
          watchAd();
          handleNextPuzzle();
        }}
      />
    </div>
  );
}
