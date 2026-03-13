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

type SpeedPhase = "ready" | "playing" | "result";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function SpeedChallengeGame() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed } =
    useGame();
  const t = translations[language];

  const [phase, setPhase] = useState<SpeedPhase>("ready");
  const [questions] = useState(() => shuffle(quizQuestions));
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load high score
  useEffect(() => {
    backend
      .getHighScore("speed_challenge")
      .then((hs) => {
        if (hs) setHighScore(Number(hs.score));
      })
      .catch(() => {});
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const _endGame = useCallback(
    (finalScore: number, finalCoins: number, finalXP: number) => {
      stopTimer();
      setPhase("result");
      addCoins(finalCoins);
      addXP(finalXP);
      incrementGamesPlayed();
      backend
        .submitGameResult(
          "speed_challenge",
          BigInt(finalScore),
          BigInt(finalCoins),
          BigInt(finalXP),
        )
        .catch(() => {});
    },
    [stopTimer, addCoins, addXP, incrementGamesPlayed],
  );

  const startGame = useCallback(() => {
    setPhase("playing");
    setQIdx(0);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalCoins(0);
    setTotalXP(0);
    setAnswered(false);
    setSelectedIdx(null);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Watch timeLeft to end game
  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      stopTimer();
      setPhase("result");
      // Use functional updates to read final values
      setScore((finalScore) => {
        setTotalCoins((finalCoins) => {
          setTotalXP((finalXP) => {
            addCoins(finalCoins);
            addXP(finalXP);
            incrementGamesPlayed();
            backend
              .submitGameResult(
                "speed_challenge",
                BigInt(finalScore),
                BigInt(finalCoins),
                BigInt(finalXP),
              )
              .catch(() => {});
            return finalXP;
          });
          return finalCoins;
        });
        return finalScore;
      });
    }
  }, [timeLeft, phase, stopTimer, addCoins, addXP, incrementGamesPlayed]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const handleOption = useCallback(
    (idx: number) => {
      if (answered || phase !== "playing") return;
      setAnswered(true);
      setSelectedIdx(idx);

      const question = questions[qIdx % questions.length];
      const correct = idx === question.correctIndex;

      if (correct) {
        setScore((s) => s + 1);
        setTotalCoins((c) => c + 5);
        setTotalXP((x) => x + 8);
        setStreak((str) => {
          const newStr = str + 1;
          setMaxStreak((ms) => Math.max(ms, newStr));
          return newStr;
        });
      } else {
        setStreak(0);
      }

      // Auto-advance after short delay
      setTimeout(() => {
        setQIdx((q) => q + 1);
        setAnswered(false);
        setSelectedIdx(null);
      }, 400);
    },
    [answered, phase, questions, qIdx],
  );

  const question = questions[qIdx % questions.length];
  const timerPct = useMemo(() => (timeLeft / 60) * 100, [timeLeft]);
  const timerColor =
    timeLeft > 20 ? "#EF4444" : timeLeft > 10 ? "#F59E0B" : "#DC2626";
  const isNewHighScore = phase === "result" && score > highScore;

  if (phase === "ready") {
    return (
      <div
        data-ocid="speed.screen"
        className="flex flex-col items-center gap-6 screen-enter pb-6"
      >
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            data-ocid="speed.home_button"
            onClick={() => navigate("home")}
            className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center text-lg active:scale-90"
          >
            ←
          </button>
          <h1 className="text-lg font-black text-foreground">
            {t.speedChallenge}
          </h1>
          <div className="w-10" />
        </div>

        <div className="text-center">
          <div className="text-7xl mb-4">⚡</div>
          <h2 className="text-3xl font-black text-foreground mb-2">
            {t.speedChallenge}
          </h2>
          <p className="text-muted-foreground text-sm">
            {language === "kn"
              ? "60 ಸೆಕೆಂಡ್‌ನಲ್ಲಿ ಎಷ್ಟು ಸಾಧ್ಯವೋ ಅಷ್ಟು ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ!"
              : language === "hi"
                ? "60 सेकंड में जितना हो सके उतने सवालों के जवाब दें!"
                : language === "te"
                  ? "60 సెకండ్లలో వీలైనన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి!"
                  : language === "ta"
                    ? "60 விநாடிகளில் முடிந்தவரை கேள்விகளுக்கு பதிலளிக்கவும்!"
                    : "Answer as many questions as possible in 60 seconds!"}
          </p>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-card p-5 flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.highScore}</span>
            <span className="font-bold text-red-500">
              {highScore} {t.correct_count}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === "kn"
                ? "ಪ್ರತಿ ಸರಿ ಉತ್ತರ"
                : language === "hi"
                  ? "प्रत्येक सही उत्तर"
                  : language === "te"
                    ? "ప్రతి సరైన సమాధానం"
                    : language === "ta"
                      ? "ஒவ்வொரு சரியான பதிலுக்கும்"
                      : "Per correct answer"}
            </span>
            <span className="font-bold text-amber-600">🪙 +5, ✨ +8 XP</span>
          </div>
        </div>

        <button
          type="button"
          onClick={startGame}
          className="w-full py-5 text-white text-xl font-black rounded-3xl active:scale-95 shadow-modal"
          style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
        >
          {t.go} ⚡
        </button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flex flex-col items-center gap-5 screen-enter pb-6">
        <div className="text-center">
          <div className="text-6xl mb-2">
            {score >= 20 ? "🏆" : score >= 10 ? "🎉" : "⚡"}
          </div>
          <h2 className="text-2xl font-black text-foreground">{t.gameOver}</h2>
          {isNewHighScore && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl px-4 py-2 mt-2">
              <p className="text-sm font-bold text-amber-700">
                🌟 {t.newHighScore}
              </p>
            </div>
          )}
        </div>
        <div className="w-full bg-white rounded-3xl shadow-card p-5 flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.correct_count}</span>
            <span className="text-2xl font-black text-red-500">{score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {language === "kn"
                ? "ಅತ್ಯುತ್ತಮ ಸತತತೆ"
                : language === "hi"
                  ? "सर्वश्रेष्ठ लकीर"
                  : language === "te"
                    ? "అత్యుత్తమ వరుస"
                    : language === "ta"
                      ? "சிறந்த தொடர்ச்சி"
                      : "Best Streak"}
            </span>
            <span className="font-bold">🔥 {maxStreak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.coinsEarned}</span>
            <span className="font-bold text-amber-600">🪙 +{totalCoins}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.xpEarned}</span>
            <span className="font-bold text-red-500">+{totalXP} XP</span>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            data-ocid="speed.home_button"
            onClick={() => navigate("home")}
            className="flex-1 py-3.5 bg-white border border-border text-foreground font-bold rounded-2xl active:scale-95 shadow-card"
          >
            🏠 {t.home}
          </button>
          <button
            type="button"
            onClick={() => startGame()}
            className="flex-1 py-3.5 text-white font-bold rounded-2xl active:scale-95 shadow-card"
            style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
          >
            ⚡ {t.playAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="speed.screen"
      className="flex flex-col gap-4 screen-enter pb-6"
    >
      {/* Timer bar */}
      <div className="flex items-center gap-3">
        <div
          className={`text-3xl font-black tabular-nums w-14 text-center ${timeLeft <= 10 ? "timer-urgent" : ""}`}
          style={{ color: timerColor }}
        >
          {timeLeft}
        </div>
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${timerPct}%`,
              background: `linear-gradient(90deg, ${timerColor}, ${timerColor}80)`,
            }}
          />
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl px-3 py-1.5 text-sm font-black text-red-600 tabular-nums">
          {score} ✓
        </div>
      </div>

      {/* Streak */}
      {streak >= 2 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2 text-center slide-in">
          <span className="text-sm font-bold text-orange-700">
            🔥 {streak} {t.currentStreak}!
          </span>
        </div>
      )}

      {/* Question */}
      <div className="bg-white rounded-3xl shadow-card p-5">
        <p className="text-base font-bold text-foreground leading-relaxed">
          {getLangField(question, language)}
        </p>
      </div>

      {/* Options - 2x2 grid for speed */}
      <div className="grid grid-cols-2 gap-2.5">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.correctIndex;
          const isSelected = idx === selectedIdx;
          let btnClass =
            "py-4 px-3 rounded-2xl text-sm font-bold transition-all active:scale-90 border-2 text-left ";
          if (answered) {
            if (isCorrect)
              btnClass += "bg-green-50 border-green-400 text-green-800";
            else if (isSelected)
              btnClass += "bg-red-50 border-red-400 text-red-700";
            else btnClass += "bg-white border-transparent opacity-50";
          } else {
            btnClass += "bg-white border-border text-foreground";
          }
          return (
            <button
              type="button"
              key={opt.en}
              data-ocid={`speed.option.button.${idx + 1}`}
              onClick={() => handleOption(idx)}
              disabled={answered}
              className={btnClass}
            >
              <span className="block text-[10px] text-muted-foreground mb-1">
                {["A", "B", "C", "D"][idx]}
              </span>
              {getOptionText(opt, language)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
