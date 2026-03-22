import { useCallback, useState } from "react";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { wordConnectLevels } from "../data/wordConnectLevels";
import { backend } from "../services/backendService";
import { GameResultModal } from "./GameResultModal";

function calcReward(score: number, max: number): { coins: number; xp: number } {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.6) return { coins: 20, xp: 20 };
  if (pct >= 0.3) return { coins: 10, xp: 10 };
  return { coins: 2, xp: 5 };
}

export function WordConnectGame() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed, watchAd } =
    useGame();
  const t = translations[language];

  const [levelIdx, setLevelIdx] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [_attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });
  const [showResult, setShowResult] = useState(false);
  const [reward, setReward] = useState({ coins: 0, xp: 0 });

  const level = wordConnectLevels[levelIdx];
  const currentWord = selectedLetters.map((i) => level.letters[i]).join("");
  const _allFound = level.words.every((w) => foundWords.includes(w));

  const showMessage = useCallback((text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 1500);
  }, []);

  const handleLetterClick = useCallback((idx: number) => {
    setSelectedLetters((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (currentWord.length < 2) return;
    setAttempts((a) => a + 1);
    if (
      level.words.includes(currentWord) &&
      !foundWords.includes(currentWord)
    ) {
      const newFound = [...foundWords, currentWord];
      setFoundWords(newFound);
      showMessage(`✓ ${currentWord}!`, "success");
      // Check if all found
      if (newFound.length === level.words.length) {
        const r = calcReward(newFound.length, level.words.length);
        setReward(r);
        addCoins(r.coins);
        addXP(r.xp);
        backend
          .submitGameResult(
            "wordConnect",
            BigInt(newFound.length),
            BigInt(r.coins),
            BigInt(r.xp),
          )
          .catch(() => {});
        setTimeout(() => setShowResult(true), 600);
      }
    } else if (foundWords.includes(currentWord)) {
      showMessage("Already found!", "error");
    } else {
      showMessage(`✗ "${currentWord}" not a target word`, "error");
    }
    setSelectedLetters([]);
  }, [currentWord, level.words, foundWords, addCoins, addXP, showMessage]);

  const handleClear = useCallback(() => setSelectedLetters([]), []);

  const handleNextLevel = useCallback(() => {
    if (levelIdx < wordConnectLevels.length - 1) {
      setLevelIdx((l) => l + 1);
      setFoundWords([]);
      setSelectedLetters([]);
      setAttempts(0);
      setShowResult(false);
      setReward({ coins: 0, xp: 0 });
      incrementGamesPlayed();
    }
  }, [levelIdx, incrementGamesPlayed]);

  return (
    <div
      data-ocid="word_connect.screen"
      className="min-h-screen flex flex-col gap-5 screen-enter pb-6 px-4 pt-4"
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
          }}
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-white">{t.wordConnect}</h1>
          <p className="text-xs text-white/60">
            {t.level} {levelIdx + 1}
          </p>
        </div>
        <div
          className="rounded-2xl px-3 py-2 text-sm font-bold text-cyan-300 border border-cyan-400/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(33,150,243,0.1))",
          }}
        >
          {foundWords.length}/{level.words.length}
        </div>
      </div>

      {level.hint && (
        <div
          className="rounded-2xl px-4 py-2 text-center border border-white/10"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p className="text-sm text-white/60">💡 {level.hint}</p>
        </div>
      )}

      <div
        className="rounded-3xl px-6 py-5 text-center min-h-[70px] flex items-center justify-center border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8), rgba(44,83,100,0.7))",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 20px rgba(0,229,255,0.15)",
        }}
      >
        {currentWord ? (
          <span className="text-3xl font-black tracking-[0.3em] text-white">
            {currentWord}
          </span>
        ) : (
          <span className="text-white/40 text-sm">{t.tapLetters}</span>
        )}
      </div>

      {message.text && (
        <div
          className={`rounded-2xl px-4 py-2.5 text-center text-sm font-bold pop-in border ${message.type === "success" ? "border-green-400/40 text-green-300" : "border-red-400/40 text-red-300"}`}
          style={{
            background:
              message.type === "success"
                ? "linear-gradient(135deg, rgba(22,101,52,0.5), rgba(21,128,61,0.3))"
                : "linear-gradient(135deg, rgba(127,29,29,0.5), rgba(153,27,27,0.3))",
            backdropFilter: "blur(8px)",
          }}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 py-2">
        {level.letters.map((letter, idx) => {
          const isSelected = selectedLetters.includes(idx);
          const position = selectedLetters.indexOf(idx);
          return (
            <button
              type="button"
              key={`letter-${idx}-${letter}`}
              data-ocid={`word_connect.letter.button.${idx + 1}`}
              onClick={() => handleLetterClick(idx)}
              className={`w-14 h-14 rounded-2xl font-black text-xl transition-all active:scale-90 border ${isSelected ? "text-white scale-105 border-cyan-400/70" : "text-white border-white/20"}`}
              style={
                isSelected
                  ? {
                      background: "linear-gradient(135deg, #00bcd4, #2196f3)",
                      boxShadow: "0 0 12px rgba(0,229,255,0.4)",
                    }
                  : {
                      background:
                        "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.7))",
                      backdropFilter: "blur(8px)",
                    }
              }
            >
              {isSelected && position >= 0 && (
                <span className="block text-[9px] text-white/70 leading-none mb-0.5">
                  {position + 1}
                </span>
              )}
              {letter}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-3 font-bold rounded-2xl active:scale-95 text-white border border-white/20"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,32,39,0.8), rgba(32,58,67,0.7))",
            backdropFilter: "blur(8px)",
          }}
        >
          {t.clearWord}
        </button>
        <button
          type="button"
          data-ocid="word_connect.submit_button"
          onClick={handleSubmit}
          disabled={currentWord.length < 2}
          className="flex-2 flex-grow-[2] py-3 text-white font-bold rounded-2xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #00bcd4, #2196f3)",
            boxShadow:
              currentWord.length >= 2 ? "0 0 16px rgba(0,229,255,0.3)" : "none",
          }}
        >
          {t.submit} ✓
        </button>
      </div>

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
          {t.targetWords}
        </p>
        <div className="flex flex-wrap gap-2">
          {level.words.map((word) => {
            const found = foundWords.includes(word);
            return (
              <span
                key={word}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all border ${found ? "border-green-400/40 text-green-300 line-through" : "border-white/15 text-white/40"}`}
                style={{
                  background: found
                    ? "linear-gradient(135deg, rgba(22,101,52,0.4), rgba(21,128,61,0.2))"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                {found ? word : "•".repeat(word.length)}
              </span>
            );
          })}
        </div>
      </div>

      <GameResultModal
        isOpen={showResult}
        score={foundWords.length}
        maxScore={level.words.length}
        coinsEarned={reward.coins}
        xpEarned={reward.xp}
        gameName={t.wordConnect}
        onRetry={() => {
          setFoundWords([]);
          setSelectedLetters([]);
          setAttempts(0);
          setShowResult(false);
          setReward({ coins: 0, xp: 0 });
        }}
        onExit={() => {
          incrementGamesPlayed();
          navigate("home");
        }}
        onWatchAdRetry={() => {
          watchAd();
          handleNextLevel();
        }}
      />
    </div>
  );
}
