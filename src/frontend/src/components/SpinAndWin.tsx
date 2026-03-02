import { useCallback, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";
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
  const { navigate, language, addCoins } = useGame();
  const t = translations[language];

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonCoins, setWonCoins] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);
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

    // Pick a winning segment (will be confirmed by backend)
    const targetSegIdx = Math.floor(Math.random() * SEG_COUNT);
    const spins = 5 + Math.floor(Math.random() * 3);
    const targetDeg =
      spins * 360 + (360 - targetSegIdx * SEG_ANGLE - SEG_ANGLE / 2);
    const newRotation = currentRotation.current + targetDeg;
    currentRotation.current = newRotation;

    setRotation(newRotation);

    // Call backend
    let coins = SEGMENTS[targetSegIdx].coins;
    try {
      const result = await backend.spinAndWin();
      coins = Number(result.rewardCoins) || coins;
    } catch {
      // Use local result
    }

    setTimeout(() => {
      setWonCoins(coins);
      setShowReward(true);
      addCoins(coins);
      setSpinning(false);

      if (extraSpins > 0) {
        setExtraSpins((e) => e - 1);
      } else {
        setSpinsUsedToday(true);
        localStorage.setItem("zingo_spin_date", today);
      }
    }, 3200);
  }, [spinning, canSpin, addCoins, extraSpins, today]);

  const handleExtraSpinReward = useCallback(() => {
    setExtraSpins((e) => e + 1);
    setSpinsUsedToday(false);
  }, []);

  // Draw wheel as SVG
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  function polarToCart(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
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
      className="flex flex-col items-center gap-5 screen-enter pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center text-lg active:scale-90"
        >
          ←
        </button>
        <h1 className="text-lg font-black text-foreground">{t.spinWin}</h1>
        <div className="w-10" />
      </div>

      <p className="text-sm text-muted-foreground">{t.spinToWin}</p>

      {/* Wheel container */}
      <div className="relative flex items-center justify-center">
        {/* Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -translate-y-1"
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "28px solid #8B5CF6",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />

        {/* Outer ring */}
        <div
          className="rounded-full absolute"
          style={{
            width: size + 20,
            height: size + 20,
            background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
            padding: 4,
          }}
        >
          <div className="w-full h-full rounded-full bg-white/20" />
        </div>

        {/* Wheel */}
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
                  stroke="white"
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
            {/* Center circle */}
            <circle cx={cx} cy={cy} r={28} fill="white" />
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
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Status */}
      {spinsUsedToday && extraSpins === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center text-sm text-amber-700 font-medium">
          {t.spinsUsed}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {extraSpins > 0
            ? `${extraSpins} ${language === "en" ? "extra spin(s) available" : "ಹೆಚ್ಚು ತಿರುಗಿ ಲಭ್ಯ"}`
            : language === "en"
              ? "1 free spin per day"
              : "ದಿನಕ್ಕೆ 1 ಉಚಿತ ತಿರುಗಿ"}
        </p>
      )}

      {/* Spin button */}
      <button
        type="button"
        data-ocid="spin.spin_button"
        onClick={handleSpin}
        disabled={spinning || !canSpin}
        className="w-full py-4 text-white text-xl font-black rounded-3xl active:scale-95 transition-all shadow-modal disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: spinning
            ? "#9CA3AF"
            : "linear-gradient(135deg, #8B5CF6, #6366F1)",
        }}
      >
        {spinning ? t.spinning : t.spin}
      </button>

      {/* Extra spin button */}
      <RewardedAdButton
        data-ocid="spin.extra_spin_button"
        label={t.watchAdForSpin}
        onReward={handleExtraSpinReward}
        className="w-full justify-center py-3"
      />

      {/* Reward modal */}
      {showReward && wonCoins !== null && (
        <div
          data-ocid="spin.reward.modal"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowReward(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowReward(false);
          }}
        >
          <div className="bg-white rounded-3xl p-8 mx-6 text-center shadow-modal pop-in max-w-xs w-full">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-2xl font-black text-foreground mb-2">
              {t.youWon}
            </h3>
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="text-4xl">🪙</span>
              <span className="text-5xl font-black text-amber-500">
                {wonCoins}
              </span>
            </div>
            <button
              type="button"
              data-ocid="spin.reward.close_button"
              onClick={() => setShowReward(false)}
              className="w-full py-3.5 text-white font-bold rounded-2xl active:scale-95"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
              }}
            >
              {t.continue} 🎰
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
