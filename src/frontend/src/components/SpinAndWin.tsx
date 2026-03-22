import { useCallback, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";
import { GameResultModal } from "./GameResultModal";
import { RewardedAdButton } from "./RewardedAdButton";

const SEGMENTS = [
  { coins: 10, color: "#8B5CF6", label: "10" },
  { coins: 25, color: "#EC4899", label: "25" },
  { coins: 50, color: "#F59E0B", label: "50" },
  { coins: 100, color: "#10B981", label: "100" },
  { coins: 200, color: "#EF4444", label: "200" },
  { coins: 10, color: "#6366F1", label: "10" },
  { coins: 25, color: "#F97316", label: "25" },
  { coins: 50, color: "#14B8A6", label: "50" },
];

const SEG_COUNT = SEGMENTS.length;
const SEG_ANGLE = 360 / SEG_COUNT;

export function SpinAndWin() {
  const { navigate, language, addCoins, addXP, incrementGamesPlayed, watchAd } =
    useGame();
  const t = translations[language];

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonCoins, setWonCoins] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [extraSpins, setExtraSpins] = useState(0);
  const [spinsUsedToday, setSpinsUsedToday] = useState(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("zingo_spin_date");
    return saved === today;
  });

  const wheelRef = useRef<HTMLDivElement>(null);
  const currentRotation = useRef(rotation);

  const today = new Date().toDateString();
  const canSpin = !spinsUsedToday || extraSpins > 0;

  const handleSpin = useCallback(async () => {
    if (spinning || !canSpin) return;
    setSpinning(true);

    const targetSegIdx = Math.floor(Math.random() * SEG_COUNT);
    const spins = 5 + Math.floor(Math.random() * 3);
    const targetDeg =
      spins * 360 + (360 - targetSegIdx * SEG_ANGLE - SEG_ANGLE / 2);
    const newRotation = currentRotation.current + targetDeg;
    currentRotation.current = newRotation;
    setRotation(newRotation);

    let coins = SEGMENTS[targetSegIdx].coins;
    try {
      const result = await backend.spinAndWin();
      coins = Number(result.rewardCoins) || coins;
    } catch {}

    setTimeout(() => {
      setWonCoins(coins);
      addCoins(coins);
      addXP(10);
      setSpinning(false);
      setShowResult(true);
      if (extraSpins > 0) {
        setExtraSpins((e) => e - 1);
      } else {
        setSpinsUsedToday(true);
        localStorage.setItem("zingo_spin_date", today);
      }
    }, 3200);
  }, [spinning, canSpin, addCoins, addXP, extraSpins, today]);

  const _handleExtraSpinReward = useCallback(() => {
    setExtraSpins((e) => e + 1);
    setSpinsUsedToday(false);
  }, []);

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  function polarToCart(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function segPath(idx: number) {
    const startAngle = idx * SEG_ANGLE;
    const endAngle = startAngle + SEG_ANGLE;
    const start = polarToCart(startAngle, r);
    const end = polarToCart(endAngle, r);
    const largeArc = SEG_ANGLE > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }

  function textPos(idx: number) {
    const angle = idx * SEG_ANGLE + SEG_ANGLE / 2;
    return polarToCart(angle, r * 0.65);
  }

  return (
    <div
      data-ocid="spin.screen"
      className="min-h-screen flex flex-col items-center gap-5 screen-enter pb-6 px-4 pt-4"
      style={{
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      }}
    >
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          data-ocid="spin.home_button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg active:scale-90 transition-transform border border-white/20"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
            backdropFilter: "blur(8px)",
            boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
            color: "#00e5ff",
          }}
        >
          ←
        </button>
        <h1 className="text-lg font-black text-white">{t.spinWin}</h1>
        <div className="w-10" />
      </div>

      <p className="text-sm" style={{ color: "#9fb3c8" }}>
        {t.spinToWin}
      </p>

      {/* Wheel */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -translate-y-1"
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "28px solid #00e5ff",
            filter: "drop-shadow(0 2px 8px rgba(0,229,255,0.6))",
          }}
        />
        <div
          className="rounded-full absolute"
          style={{
            width: size + 20,
            height: size + 20,
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.3), rgba(33,150,243,0.2))",
            boxShadow:
              "0 0 30px rgba(0,229,255,0.25), 4px 4px 15px #070e17, -3px -3px 10px #203247",
            padding: 4,
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{ background: "rgba(0,229,255,0.05)" }}
          />
        </div>
        <div
          ref={wheelRef}
          style={{
            width: size,
            height: size,
            transition: spinning
              ? "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)"
              : "none",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-label="Spin wheel"
          >
            <title>Spin and Win Wheel</title>
            {SEGMENTS.map((seg, segIdx) => (
              <g key={`seg-${seg.coins}-${seg.color}`}>
                <path
                  d={segPath(segIdx)}
                  fill={seg.color}
                  stroke="rgba(0,229,255,0.3)"
                  strokeWidth="2"
                />
                <text
                  x={textPos(segIdx).x}
                  y={textPos(segIdx).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {seg.label}
                </text>
              </g>
            ))}
            <circle cx={cx} cy={cy} r={28} fill="#0d1b2a" />
            <circle cx={cx} cy={cy} r={22} fill="url(#grad)" />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="18"
            >
              🎰
            </text>
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00b8d4" />
                <stop offset="100%" stopColor="#2196f3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {spinsUsedToday && extraSpins === 0 ? (
        <div
          className="rounded-2xl px-4 py-3 text-center text-sm font-medium border"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,166,35,0.05))",
            borderColor: "rgba(245,166,35,0.3)",
            color: "#f59e0b",
          }}
        >
          {t.spinsUsed}
        </div>
      ) : (
        <p className="text-xs" style={{ color: "#9fb3c8" }}>
          {extraSpins > 0
            ? `${extraSpins} extra spin(s) available`
            : "1 free spin per day"}
        </p>
      )}

      <button
        type="button"
        data-ocid="spin.spin_button"
        onClick={handleSpin}
        disabled={spinning || !canSpin}
        className="w-full py-4 text-white text-xl font-black rounded-3xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: spinning
            ? "linear-gradient(135deg, rgba(15,32,39,0.8), rgba(32,58,67,0.7))"
            : "linear-gradient(135deg, #00b8d4, #00e5ff)",
          color: spinning ? "#9fb3c8" : "#0d1b2a",
          boxShadow: spinning
            ? "none"
            : "0 0 24px rgba(0,229,255,0.4), 4px 4px 10px #070e17",
        }}
      >
        {spinning ? t.spinning : t.spin}
      </button>

      <RewardedAdButton className="w-full justify-center py-3" />

      <GameResultModal
        isOpen={showResult}
        score={wonCoins ?? 0}
        maxScore={200}
        coinsEarned={wonCoins ?? 0}
        xpEarned={10}
        gameName={t.spinWin}
        onRetry={() => {
          setShowResult(false);
        }}
        onExit={() => {
          incrementGamesPlayed();
          navigate("home");
        }}
        onWatchAdRetry={() => {
          watchAd();
          setShowResult(false);
        }}
      />
    </div>
  );
}
