import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { type GKQuestion, gkQuestions } from "../data/gkQuestions";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";

type GKCategory = "india" | "sports" | "science" | "world";
type GKPhase = "playing" | "result";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const CATEGORIES: { id: GKCategory; icon: string }[] = [
  { id: "india", icon: "🇮🇳" },
  { id: "sports", icon: "⚽" },
  { id: "science", icon: "🔬" },
  { id: "world", icon: "🌍" },
];

export function GKGame() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed } =
    useGame();
  const t = translations[language];

  const [phase, setPhase] = useState<GKPhase>("playing");
  const [activeCategory, setActiveCategory] = useState<GKCategory>("india");
  const [questions, setQuestions] = useState<GKQuestion[]>(() =>
    shuffle(gkQuestions.filter((q) => q.category === "india")).slice(0, 5),
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setAnswered(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: currentIdx triggers timer reset
  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [currentIdx, startTimer, clearTimer]);

  const handleCategoryChange = useCallback(
    (cat: GKCategory) => {
      if (phase === "result") return;
      setActiveCategory(cat);
      setQuestions(
        shuffle(gkQuestions.filter((q) => q.category === cat)).slice(0, 5),
      );
      setCurrentIdx(0);
      setSelected(null);
      setAnswered(false);
      setScore(0);
      setTotalCoins(0);
      setTotalXP(0);
    },
    [phase],
  );

  const handleOption = useCallback(
    (idx: number) => {
      if (answered) return;
      clearTimer();
      setSelected(idx);
      setAnswered(true);
      if (idx === questions[currentIdx].correctIndex) {
        setScore((s) => s + 1);
        setTotalCoins((c) => c + 10);
        setTotalXP((x) => x + 15);
      }
    },
    [answered, clearTimer, questions, currentIdx],
  );

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setPhase("result");
      addCoins(totalCoins);
      addXP(totalXP);
      incrementGamesPlayed();
      backend
        .submitGameResult(
          "gk",
          BigInt(score),
          BigInt(totalCoins),
          BigInt(totalXP),
        )
        .catch(() => {});
    }
  }, [
    currentIdx,
    questions.length,
    addCoins,
    addXP,
    incrementGamesPlayed,
    totalCoins,
    totalXP,
    score,
  ]);

  const timerPct = useMemo(() => (timeLeft / 30) * 100, [timeLeft]);
  const timerColor =
    timeLeft > 15 ? "#06B6D4" : timeLeft > 8 ? "#F59E0B" : "#EF4444";

  const question = questions[currentIdx];
  const catLabel = {
    india: t.india,
    sports: t.sports,
    science: t.science,
    world: t.world,
  };

  if (phase === "result") {
    return (
      <div className="flex flex-col items-center gap-5 screen-enter pb-6">
        <div className="text-center">
          <div className="text-6xl mb-2">
            {score >= 4 ? "🌟" : score >= 2 ? "👍" : "💪"}
          </div>
          <h2 className="text-2xl font-black text-foreground">
            {t.sessionComplete}
          </h2>
        </div>
        <div className="w-full bg-white rounded-3xl shadow-card p-6 flex flex-col gap-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.yourScore}</span>
            <span className="text-2xl font-black">
              {score}/{questions.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.coinsEarned}</span>
            <span className="font-bold text-amber-600">🪙 +{totalCoins}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.xpEarned}</span>
            <span className="font-bold text-cyan-600">+{totalXP} XP</span>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            data-ocid="gk.home_button"
            onClick={() => navigate("home")}
            className="flex-1 py-3.5 bg-white border border-border text-foreground font-bold rounded-2xl active:scale-95 shadow-card"
          >
            🏠 {t.home}
          </button>
          <button
            type="button"
            data-ocid="gk.play_again_button"
            onClick={() => {
              setPhase("playing");
              setCurrentIdx(0);
              setSelected(null);
              setAnswered(false);
              setScore(0);
              setTotalCoins(0);
              setTotalXP(0);
            }}
            className="flex-1 py-3.5 text-white font-bold rounded-2xl active:scale-95 shadow-card"
            style={{ background: "linear-gradient(135deg, #06B6D4, #0EA5E9)" }}
          >
            🔄 {t.playAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="gk.screen"
      className="flex flex-col gap-4 screen-enter pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-ocid="gk.home_button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center text-lg active:scale-90"
        >
          ←
        </button>
        <h1 className="text-lg font-black text-foreground">
          {t.generalKnowledge}
        </h1>
        <div className="bg-white shadow-card rounded-2xl px-3 py-2 text-sm font-bold text-cyan-600">
          {score} ✓
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat, i) => (
          <button
            type="button"
            key={cat.id}
            data-ocid={`gk.category.tab.${i + 1}`}
            onClick={() => handleCategoryChange(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-bold transition-all active:scale-90 ${
              activeCategory === cat.id
                ? "text-white shadow-card"
                : "bg-white text-muted-foreground shadow-card"
            }`}
            style={
              activeCategory === cat.id
                ? { background: "linear-gradient(135deg, #06B6D4, #0EA5E9)" }
                : {}
            }
          >
            {cat.icon} {catLabel[cat.id]}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-card px-4 py-2.5">
        <span className="text-sm text-muted-foreground">{t.timer}</span>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, background: timerColor }}
          />
        </div>
        <span
          className={`text-sm font-black tabular-nums ${timeLeft <= 8 ? "timer-urgent" : ""}`}
          style={{ color: timerColor }}
        >
          {timeLeft}
          {t.seconds}
        </span>
      </div>

      {/* Question */}
      <div
        data-ocid="gk.question_card"
        className="bg-white rounded-3xl shadow-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            {catLabel[activeCategory]}
          </span>
          <span className="text-xs text-muted-foreground">
            • {t.question} {currentIdx + 1}/{questions.length}
          </span>
        </div>
        <p className="text-base font-bold text-foreground leading-relaxed">
          {language === "kn" ? question.questionKn : question.questionEn}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.correctIndex;
          const isSelected = idx === selected;
          let btnClass =
            "w-full py-3.5 px-4 rounded-2xl text-left text-sm font-semibold transition-all active:scale-95 border-2 ";
          if (answered) {
            if (isCorrect)
              btnClass += "bg-green-50 border-green-400 text-green-800";
            else if (isSelected)
              btnClass += "bg-red-50 border-red-400 text-red-700";
            else
              btnClass +=
                "bg-white border-transparent text-muted-foreground opacity-60";
          } else {
            btnClass +=
              "bg-white border-border text-foreground hover:border-cyan-300";
          }

          return (
            <button
              type="button"
              key={opt.en}
              data-ocid={`gk.option.button.${idx + 1}`}
              onClick={() => handleOption(idx)}
              disabled={answered}
              className={btnClass}
            >
              <span className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
                  style={{
                    background:
                      answered && isCorrect
                        ? "#22c55e"
                        : answered && isSelected && !isCorrect
                          ? "#ef4444"
                          : "linear-gradient(135deg, #06B6D4, #0EA5E9)",
                  }}
                >
                  {["A", "B", "C", "D"][idx]}
                </span>
                {language === "kn" ? opt.kn : opt.en}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3.5 text-white font-bold rounded-2xl active:scale-95 shadow-card slide-in"
          style={{ background: "linear-gradient(135deg, #06B6D4, #0EA5E9)" }}
        >
          {currentIdx < questions.length - 1
            ? `${t.next} →`
            : `${t.sessionComplete} 🎉`}
        </button>
      )}
    </div>
  );
}
