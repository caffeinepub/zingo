import { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";

export function TopBar() {
  const { coins, xp, rank, language, setLanguage } = useGame();
  const t = translations[language];
  const prevCoins = useRef(coins);
  const [coinPulse, setCoinPulse] = useState(false);

  const xpForRank: Record<string, { min: number; max: number }> = {
    Beginner: { min: 0, max: 500 },
    Player: { min: 500, max: 1500 },
    Pro: { min: 1500, max: 3000 },
    Champion: { min: 3000, max: 6000 },
    Legend: { min: 6000, max: 10000 },
  };
  const rankBounds = xpForRank[rank] || { min: 0, max: 500 };
  const xpProgress = Math.min(
    ((xp - rankBounds.min) / (rankBounds.max - rankBounds.min)) * 100,
    100,
  );

  const rankLabels: Record<string, string> = {
    Beginner: t.beginner,
    Player: t.playerRank,
    Pro: t.pro,
    Champion: t.champion,
    Legend: t.legend,
  };

  useEffect(() => {
    if (coins !== prevCoins.current) {
      prevCoins.current = coins;
      setCoinPulse(true);
      const timer = setTimeout(() => setCoinPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [coins]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-card">
      {/* Profile avatar */}
      <button
        type="button"
        data-ocid="home.profile_button"
        onClick={() => {}}
        className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl font-bold active:scale-90 transition-transform shadow-sm"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
      >
        👤
      </button>

      {/* XP Bar center */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-foreground truncate">
            {rankLabels[rank] || rank}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            {xp} {t.xp}
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${xpProgress}%`,
              background: "linear-gradient(90deg, #8B5CF6, #6366F1)",
            }}
          />
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {xp - rankBounds.min} / {rankBounds.max - rankBounds.min} {t.xp}
        </div>
      </div>

      {/* Coins + Language */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {/* Coin counter */}
        <div
          className={`flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 ${coinPulse ? "coin-pulse" : ""}`}
        >
          <span className="text-base leading-none">🪙</span>
          <span className="text-xs font-bold text-amber-700 tabular-nums">
            {coins.toLocaleString()}
          </span>
        </div>
        {/* Language toggle */}
        <button
          type="button"
          data-ocid="home.language_toggle"
          onClick={() => setLanguage(language === "en" ? "kn" : "en")}
          className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-bold active:scale-90 transition-transform"
        >
          <span>{language === "en" ? "🇮🇳" : "🌐"}</span>
          <span>{language === "en" ? "EN" : "KN"}</span>
        </button>
      </div>
    </div>
  );
}
