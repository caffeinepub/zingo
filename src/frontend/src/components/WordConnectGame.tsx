import { useCallback, useState } from "react";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { wordConnectLevels } from "../data/wordConnectLevels";
import { backend } from "../services/backendService";

export function WordConnectGame() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed } =
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
  const [totalCoins, setTotalCoins] = useState(0);

  const level = wordConnectLevels[levelIdx];
  const currentWord = selectedLetters.map((i) => level.letters[i]).join("");
  const allFound = level.words.every((w) => foundWords.includes(w));

  const showMessage = useCallback((text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 1500);
  }, []);

  const handleLetterClick = useCallback((idx: number) => {
    setSelectedLetters((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      }
      return [...prev, idx];
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (currentWord.length < 2) return;
    setAttempts((a) => a + 1);

    if (
      level.words.includes(currentWord) &&
      !foundWords.includes(currentWord)
    ) {
      setFoundWords((prev) => [...prev, currentWord]);
      setTotalCoins((c) => c + 15);
      addCoins(15);
      addXP(20);
      showMessage(`✓ ${currentWord}!`, "success");
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
      incrementGamesPlayed();
      backend
        .submitGameResult(
          "wordConnect",
          BigInt(foundWords.length),
          BigInt(totalCoins),
          BigInt(totalCoins),
        )
        .catch(() => {});
    }
  }, [levelIdx, foundWords.length, totalCoins, incrementGamesPlayed]);

  return (
    <div
      data-ocid="word_connect.screen"
      className="flex flex-col gap-5 screen-enter pb-6"
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
          <h1 className="text-lg font-black text-foreground">
            {t.wordConnect}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t.level} {levelIdx + 1}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2 text-sm font-bold text-amber-700">
          🪙 {totalCoins}
        </div>
      </div>

      {/* Hint */}
      {level.hint && (
        <div className="bg-white/60 rounded-2xl px-4 py-2 text-center">
          <p className="text-sm text-muted-foreground">
            💡 {language === "en" ? level.hint : level.hint}
          </p>
        </div>
      )}

      {/* Current word display */}
      <div className="bg-white rounded-3xl shadow-card px-6 py-5 text-center min-h-[70px] flex items-center justify-center">
        {currentWord ? (
          <span className="text-3xl font-black tracking-[0.3em] text-foreground">
            {currentWord}
          </span>
        ) : (
          <span className="text-muted-foreground/60 text-sm">
            {t.tapLetters}
          </span>
        )}
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`rounded-2xl px-4 py-2.5 text-center text-sm font-bold pop-in ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Letter tiles */}
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
              className={`w-14 h-14 rounded-2xl font-black text-xl transition-all active:scale-90 shadow-card ${
                isSelected ? "text-white scale-105" : "bg-white text-foreground"
              }`}
              style={
                isSelected
                  ? { background: "linear-gradient(135deg, #10B981, #059669)" }
                  : {}
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

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-3 bg-white border border-border text-foreground font-bold rounded-2xl active:scale-95 shadow-card"
        >
          {t.clearWord}
        </button>
        <button
          type="button"
          data-ocid="word_connect.submit_button"
          onClick={handleSubmit}
          disabled={currentWord.length < 2}
          className="flex-2 flex-grow-[2] py-3 text-white font-bold rounded-2xl active:scale-95 shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          {t.submit} ✓
        </button>
      </div>

      {/* Target words */}
      <div className="bg-white rounded-3xl shadow-card p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          {t.targetWords}
        </p>
        <div className="flex flex-wrap gap-2">
          {level.words.map((word) => {
            const found = foundWords.includes(word);
            return (
              <span
                key={word}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  found
                    ? "bg-green-100 text-green-700 line-through"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {found ? word : "•".repeat(word.length)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Level complete */}
      {allFound && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-5 text-center pop-in">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-black text-green-800 mb-1">
            {t.levelComplete}
          </h3>
          <p className="text-sm text-green-600 mb-4">
            {language === "en"
              ? `Found all ${level.words.length} words!`
              : `${level.words.length} ಪದಗಳನ್ನು ಕಂಡಿದ್ದೀರಿ!`}
          </p>
          {levelIdx < wordConnectLevels.length - 1 ? (
            <button
              type="button"
              onClick={handleNextLevel}
              className="w-full py-3 text-white font-bold rounded-2xl active:scale-95"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
              }}
            >
              {t.next} Level →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("home")}
              className="w-full py-3 text-white font-bold rounded-2xl active:scale-95"
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
