import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { type GKQuestion, gkQuestions } from "../data/gkQuestions";
import type { Lang } from "../data/translations";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";

function getLangField(
  q: Pick<
    GKQuestion,
    "questionEn" | "questionKn" | "questionHi" | "questionTe" | "questionTa"
  >,
  lang: Lang,
): string {
  switch (lang) {
    case "kn":
      return q.questionKn;
    case "hi":
      return q.questionHi;
    case "te":
      return q.questionTe;
    case "ta":
      return q.questionTa;
    default:
      return q.questionEn;
  }
}

function getOptionText(
  opt: { en: string; kn: string; hi: string; te: string; ta: string },
  lang: Lang,
): string {
  return opt[lang] ?? opt.en;
}

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

  const question = questions[currentIdx];
  const catLabel = {
    india: t.india,
    sports: t.sports,
    science: t.science,
    world: t.world,
  };

  if (phase === "result") {
    return (
      <div
        className="min-h-screen flex flex-col items-center gap-5 screen-enter pb-6 px-4 pt-8"
        style={{
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        }}
      >
        <div className="text-center">
          <div className="text-6xl mb-2">
            {score >= 4 ? "🌟" : score >= 2 ? "👍" : "💪"}
          </div>
          <h2 className="text-2xl font-black text-white">
            {t.sessionComplete}
          </h2>
        </div>
        <div
          className="w-full rounded-3xl p-6 flex flex-col gap-4 border border-white/10"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8), rgba(44,83,100,0.7))",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 20px rgba(0,229,255,0.15)",
          }}
        >
          <div className="flex justify-between">
            <span className="text-white/70">{t.yourScore}</span>
            <span className="text-2xl font-black text-white">
              {score}/{questions.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">{t.coinsEarned}</span>
            <span className="font-bold text-amber-400">🪙 +{totalCoins}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">{t.xpEarned}</span>
            <span className="font-bold text-cyan-300">+{totalXP} XP</span>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            data-ocid="gk.home_button"
            onClick={() => navigate("home")}
            className="flex-1 py-3.5 font-bold rounded-2xl active:scale-95 border border-white/20 text-white"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,32,39,0.8), rgba(32,58,67,0.8))",
            }}
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
            className="flex-1 py-3.5 text-white font-bold rounded-2xl active:scale-95"
            style={{
              background: "linear-gradient(135deg, #00bcd4, #2196f3)",
              boxShadow: "0 0 16px rgba(0,229,255,0.25)",
            }}
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
      className="min-h-screen flex flex-col gap-4 screen-enter pb-6 px-4 pt-4"
      style={{
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-ocid="gk.home_button"
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
        <h1 className="text-lg font-black text-white">{t.generalKnowledge}</h1>
        <div
          className="rounded-2xl px-3 py-2 text-sm font-bold text-cyan-300 border border-cyan-400/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(33,150,243,0.1))",
          }}
        >
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
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-bold transition-all active:scale-90 border ${
              activeCategory === cat.id
                ? "text-white border-cyan-400/50"
                : "text-white/60 border-white/15"
            }`}
            style={
              activeCategory === cat.id
                ? {
                    background: "linear-gradient(135deg, #00bcd4, #2196f3)",
                    boxShadow: "0 0 12px rgba(0,229,255,0.25)",
                  }
                : {
                    background:
                      "linear-gradient(135deg, rgba(15,32,39,0.8), rgba(32,58,67,0.6))",
                    backdropFilter: "blur(8px)",
                  }
            }
          >
            {cat.icon} {catLabel[cat.id]}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 20px rgba(0,229,255,0.1)",
        }}
      >
        <span className="text-sm text-white/60">{t.timer}</span>
        <div
          className="flex-1 h-3 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${timerPct}%`,
              background:
                timeLeft > 15
                  ? "linear-gradient(90deg, #00e5ff, #2196f3)"
                  : timeLeft > 8
                    ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                    : "linear-gradient(90deg, #ef4444, #dc2626)",
            }}
          />
        </div>
        <span
          className={`text-sm font-black tabular-nums ${timeLeft <= 8 ? "timer-urgent" : ""}`}
          style={{
            color:
              timeLeft > 15 ? "#00e5ff" : timeLeft > 8 ? "#f59e0b" : "#ef4444",
          }}
        >
          {timeLeft}
          {t.seconds}
        </span>
      </div>

      {/* Question */}
      <div
        data-ocid="gk.question_card"
        className="rounded-3xl p-5 border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8), rgba(44,83,100,0.7))",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 20px rgba(0,229,255,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            {catLabel[activeCategory]}
          </span>
          <span className="text-xs text-white/50">
            • {t.question} {currentIdx + 1}/{questions.length}
          </span>
        </div>
        <p className="text-base font-bold text-white leading-relaxed">
          {getLangField(question, language)}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.correctIndex;
          const isSelected = idx === selected;
          let btnClass =
            "w-full py-3.5 px-4 rounded-2xl text-left text-sm font-semibold transition-all active:scale-95 border-2 ";
          let btnStyle: React.CSSProperties = {};

          if (answered) {
            if (isCorrect) {
              btnClass += "border-green-400 text-white";
              btnStyle = {
                background:
                  "linear-gradient(135deg, rgba(22,101,52,0.8), rgba(21,128,61,0.6))",
              };
            } else if (isSelected) {
              btnClass += "border-red-400 text-white";
              btnStyle = {
                background:
                  "linear-gradient(135deg, rgba(127,29,29,0.8), rgba(153,27,27,0.6))",
              };
            } else {
              btnClass += "border-white/10 text-white/40 opacity-60";
              btnStyle = {
                background:
                  "linear-gradient(135deg, rgba(15,32,39,0.6), rgba(32,58,67,0.4))",
              };
            }
          } else {
            btnClass += "border-white/20 text-white hover:border-cyan-400/50";
            btnStyle = {
              background:
                "linear-gradient(135deg, rgba(15,32,39,0.8), rgba(32,58,67,0.7))",
              backdropFilter: "blur(8px)",
            };
          }

          return (
            <button
              type="button"
              key={opt.en}
              data-ocid={`gk.option.button.${idx + 1}`}
              onClick={() => handleOption(idx)}
              disabled={answered}
              className={btnClass}
              style={btnStyle}
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
                          : "linear-gradient(135deg, #00bcd4, #2196f3)",
                  }}
                >
                  {["A", "B", "C", "D"][idx]}
                </span>
                {getOptionText(opt, language)}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3.5 text-white font-bold rounded-2xl active:scale-95 slide-in"
          style={{
            background: "linear-gradient(135deg, #00bcd4, #2196f3)",
            boxShadow: "0 0 16px rgba(0,229,255,0.3)",
          }}
        >
          {currentIdx < questions.length - 1
            ? `${t.next} →`
            : `${t.sessionComplete} 🎉`}
        </button>
      )}
    </div>
  );
}
