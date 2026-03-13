import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import type { QuizQuestion } from "../data/quizQuestions";
import { quizQuestions } from "../data/quizQuestions";
import type { Lang } from "../data/translations";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";

function getLangField(
  q: Pick<
    QuizQuestion,
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

type QuizPhase = "playing" | "result";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function QuizGame() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed } =
    useGame();
  const t = translations[language];

  const [phase, setPhase] = useState<QuizPhase>("playing");
  const [questions] = useState(() => shuffle(quizQuestions).slice(0, 10));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = questions[currentIdx];

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

  const handleOption = useCallback(
    (idx: number) => {
      if (answered) return;
      clearTimer();
      setSelected(idx);
      setAnswered(true);
      if (idx === question.correctIndex) {
        setScore((s) => s + 1);
        setTotalCoins((c) => c + 10);
        setTotalXP((x) => x + 15);
      }
    },
    [answered, clearTimer, question.correctIndex],
  );

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setPhase("result");
      // Award rewards
      addCoins(totalCoins + (score === questions.length ? 50 : 0));
      addXP(totalXP);
      incrementGamesPlayed();
      backend
        .submitGameResult(
          "quiz",
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
    timeLeft > 15 ? "#8B5CF6" : timeLeft > 8 ? "#F59E0B" : "#EF4444";

  if (phase === "result") {
    const perfect = score === questions.length;
    return (
      <div className="flex flex-col items-center gap-5 screen-enter pb-6">
        <div className="text-center">
          <div className="text-6xl mb-2">
            {perfect ? "🏆" : score >= 7 ? "🎉" : score >= 4 ? "👍" : "💪"}
          </div>
          <h2 className="text-2xl font-black text-foreground">
            {t.sessionComplete}
          </h2>
        </div>
        <div className="w-full bg-white rounded-3xl shadow-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">
              {t.yourScore}
            </span>
            <span className="text-2xl font-black text-foreground">
              {score}/{questions.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">
              {t.coinsEarned}
            </span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              🪙 +{totalCoins + (perfect ? 50 : 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">
              {t.xpEarned}
            </span>
            <span className="font-bold text-purple-600">+{totalXP} XP</span>
          </div>
          {perfect && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <p className="text-sm font-bold text-amber-700">
                🌟 Perfect Score Bonus: +50 coins!
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            data-ocid="quiz.home_button"
            onClick={() => navigate("home")}
            className="flex-1 py-3.5 bg-white border border-border text-foreground font-bold rounded-2xl active:scale-95 transition-transform shadow-card"
          >
            🏠 {t.home}
          </button>
          <button
            type="button"
            data-ocid="quiz.play_again_button"
            onClick={() => {
              setPhase("playing");
              setCurrentIdx(0);
              setSelected(null);
              setAnswered(false);
              setScore(0);
              setTotalCoins(0);
              setTotalXP(0);
            }}
            className="flex-1 py-3.5 text-white font-bold rounded-2xl active:scale-95 transition-transform shadow-card"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
          >
            🔄 {t.playAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 screen-enter pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-ocid="quiz.home_button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center text-lg active:scale-90 transition-transform"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-foreground">{t.quiz}</h1>
          <p className="text-xs text-muted-foreground">
            {t.question} {currentIdx + 1} {t.of} {questions.length}
          </p>
        </div>
        <div className="bg-white shadow-card rounded-2xl px-3 py-2 text-sm font-bold text-purple-600">
          {score} ✓
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(currentIdx / questions.length) * 100}%`,
            background: "linear-gradient(90deg, #8B5CF6, #6366F1)",
          }}
        />
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

      {/* Question card */}
      <div
        data-ocid="quiz.question_card"
        className="bg-white rounded-3xl shadow-card p-5"
      >
        <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
          {question.category}
        </div>
        <p className="text-base font-bold text-foreground leading-relaxed">
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
              "bg-white border-border text-foreground hover:border-purple-300 hover:bg-purple-50";
          }

          return (
            <button
              type="button"
              key={opt.en}
              data-ocid={`quiz.option.button.${idx + 1}`}
              onClick={() => handleOption(idx)}
              disabled={answered}
              className={btnClass}
            >
              <span className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{
                    background:
                      answered && isCorrect
                        ? "#22c55e"
                        : answered && isSelected && !isCorrect
                          ? "#ef4444"
                          : "linear-gradient(135deg, #8B5CF6, #6366F1)",
                    color: "white",
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

      {/* Next button */}
      {answered && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3.5 text-white font-bold rounded-2xl active:scale-95 transition-transform shadow-card slide-in"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
        >
          {currentIdx < questions.length - 1
            ? `${t.next} →`
            : `${t.sessionComplete} 🏆`}
        </button>
      )}
    </div>
  );
}
