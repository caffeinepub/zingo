import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import type { QuizQuestion } from "../data/quizQuestions";
import { quizQuestions } from "../data/quizQuestions";
import type { Lang } from "../data/translations";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";
import { GameResultModal } from "./GameResultModal";

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

const MAX_SCORE = 20;

function calcReward(score: number): { coins: number; xp: number } {
  const pct = score / MAX_SCORE;
  if (pct >= 0.6) return { coins: 20, xp: 20 };
  if (pct >= 0.3) return { coins: 10, xp: 10 };
  return { coins: 2, xp: 5 };
}

export function SpeedChallengeGame() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed, watchAd } =
    useGame();
  const t = translations[language];

  const [phase, setPhase] = useState<SpeedPhase>("ready");
  const [questions] = useState(() => shuffle(quizQuestions));
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [_maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [reward, setReward] = useState({ coins: 0, xp: 0 });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const hs = localStorage.getItem("zingo_speed_hs");
    if (hs) setHighScore(Number(hs));
  }, []);

  const startGame = useCallback(() => {
    setPhase("playing");
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(60);
    setQIdx(0);
    setAnswered(false);
    setSelectedIdx(null);
    setReward({ coins: 0, xp: 0 });

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          setScore((finalScore) => {
            const r = calcReward(finalScore);
            setReward(r);
            addCoins(r.coins);
            addXP(r.xp);
            backend
              .submitGameResult(
                "speedChallenge",
                BigInt(finalScore),
                BigInt(r.coins),
                BigInt(r.xp),
              )
              .catch(() => {});
            if (finalScore > highScore) {
              localStorage.setItem("zingo_speed_hs", String(finalScore));
              setHighScore(finalScore);
            }
            return finalScore;
          });
          setPhase("result");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer, addCoins, addXP, highScore]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const handleOption = useCallback(
    (idx: number) => {
      if (answered || phase !== "playing") return;
      setAnswered(true);
      setSelectedIdx(idx);
      const isCorrect = idx === questions[qIdx % questions.length].correctIndex;
      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const next = s + 1;
          setMaxStreak((m) => Math.max(m, next));
          return next;
        });
      } else {
        setStreak(0);
      }
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

  if (phase === "ready") {
    return (
      <div
        data-ocid="speed.screen"
        className="min-h-screen flex flex-col items-center gap-6 screen-enter pb-6 px-4 pt-4"
        style={{
          background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        }}
      >
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            data-ocid="speed.home_button"
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
          <h1 className="text-lg font-black text-white">{t.speedChallenge}</h1>
          <div className="w-10" />
        </div>
        <div className="text-center">
          <div className="text-7xl mb-4">⚡</div>
          <h2 className="text-3xl font-black text-white mb-2">
            {t.speedChallenge}
          </h2>
          <p className="text-white/60 text-sm">
            Answer as many questions as possible in 60 seconds!
          </p>
        </div>
        <div
          className="w-full rounded-3xl p-5 flex flex-col gap-3 border border-white/10"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8), rgba(44,83,100,0.7))",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 20px rgba(0,229,255,0.15)",
          }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-white/60">{t.highScore}</span>
            <span className="font-bold text-cyan-300">
              {highScore} {t.correct_count}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Win reward</span>
            <span className="font-bold text-amber-400">
              🪙 +20 coins, +20 XP
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={startGame}
          className="w-full py-5 text-white text-xl font-black rounded-3xl active:scale-95"
          style={{
            background: "linear-gradient(135deg, #00bcd4, #2196f3)",
            boxShadow: "0 0 24px rgba(0,229,255,0.4)",
          }}
        >
          {t.go} ⚡
        </button>
      </div>
    );
  }

  return (
    <div
      data-ocid="speed.screen"
      className="min-h-screen flex flex-col gap-4 screen-enter pb-6 px-4 pt-4"
      style={{
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-ocid="speed.home_button"
          onClick={() => {
            stopTimer();
            navigate("home");
          }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg active:scale-90 text-white border border-white/20"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
            backdropFilter: "blur(8px)",
          }}
        >
          ←
        </button>
        <h1 className="text-lg font-black text-white">{t.speedChallenge}</h1>
        <div
          className="rounded-2xl px-3 py-1.5 text-sm font-black text-cyan-300 tabular-nums border border-cyan-400/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(33,150,243,0.1))",
          }}
        >
          {score} ✓
        </div>
      </div>

      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
          backdropFilter: "blur(8px)",
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
                timeLeft > 20
                  ? "linear-gradient(90deg, #00e5ff, #2196f3)"
                  : timeLeft > 10
                    ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                    : "linear-gradient(90deg, #ef4444, #dc2626)",
            }}
          />
        </div>
        <span
          className="text-sm font-black tabular-nums"
          style={{
            color:
              timeLeft > 20 ? "#00e5ff" : timeLeft > 10 ? "#f59e0b" : "#ef4444",
          }}
        >
          {timeLeft}s
        </span>
      </div>

      {streak >= 2 && (
        <div
          className="rounded-2xl px-4 py-2 text-center slide-in border border-orange-400/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(251,146,60,0.2), rgba(239,68,68,0.1))",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="text-sm font-bold text-orange-300">
            🔥 {streak} {t.currentStreak}!
          </span>
        </div>
      )}

      <div
        className="rounded-3xl p-5 border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8), rgba(44,83,100,0.7))",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 20px rgba(0,229,255,0.15)",
        }}
      >
        <p className="text-base font-bold text-white leading-relaxed">
          {getLangField(question, language)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.correctIndex;
          const isSelected = idx === selectedIdx;
          let btnStyle: React.CSSProperties = {};
          let btnClass =
            "py-4 px-3 rounded-2xl text-sm font-bold transition-all active:scale-90 border-2 text-left ";
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
              btnClass += "border-white/10 text-white/40 opacity-50";
              btnStyle = {
                background:
                  "linear-gradient(135deg, rgba(15,32,39,0.6), rgba(32,58,67,0.4))",
              };
            }
          } else {
            btnClass += "border-white/20 text-white";
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
              data-ocid={`speed.option.button.${idx + 1}`}
              onClick={() => handleOption(idx)}
              disabled={answered}
              className={btnClass}
              style={btnStyle}
            >
              <span className="block text-[10px] text-white/50 mb-1">
                {["A", "B", "C", "D"][idx]}
              </span>
              {getOptionText(opt, language)}
            </button>
          );
        })}
      </div>

      <GameResultModal
        isOpen={phase === "result"}
        score={score}
        maxScore={MAX_SCORE}
        coinsEarned={reward.coins}
        xpEarned={reward.xp}
        gameName={t.speedChallenge}
        onRetry={() => startGame()}
        onExit={() => {
          incrementGamesPlayed();
          navigate("home");
        }}
        onWatchAdRetry={() => {
          watchAd();
          startGame();
        }}
      />
    </div>
  );
}
