import { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import type { Lang } from "../data/translations";
import { translations } from "../data/translations";

const LANGUAGES: { code: Lang; label: string; short: string; flag: string }[] =
  [
    { code: "en", label: "English", short: "EN", flag: "🌐" },
    { code: "kn", label: "ಕನ್ನಡ", short: "ಕ", flag: "🇮🇳" },
    { code: "hi", label: "हिंदी", short: "हि", flag: "🇮🇳" },
    { code: "te", label: "తెలుగు", short: "తె", flag: "🇮🇳" },
    { code: "ta", label: "தமிழ்", short: "த", flag: "🇮🇳" },
  ];

export function TopBar() {
  const { coins, xp, rank, level, language, setLanguage } = useGame();
  const t = translations[language];
  const prevCoins = useRef(coins);
  const [coinPulse, setCoinPulse] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const xpForRank: Record<string, { min: number; max: number }> = {
    Beginner: { min: 0, max: 500 },
    Intermediate: { min: 500, max: 1500 },
    Pro: { min: 1500, max: 3000 },
    Master: { min: 3000, max: 6000 },
  };
  const rankBounds = xpForRank[rank] || { min: 0, max: 500 };
  const xpProgress = Math.min(
    ((xp - rankBounds.min) / (rankBounds.max - rankBounds.min)) * 100,
    100,
  );

  const rankLabels: Record<string, string> = {
    Beginner: t.beginner || "Beginner",
    Intermediate: "Intermediate",
    Pro: t.pro || "Pro",
    Master: "Master",
  };

  useEffect(() => {
    if (coins !== prevCoins.current) {
      prevCoins.current = coins;
      setCoinPulse(true);
      const timer = setTimeout(() => setCoinPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [coins]);

  const currentLang =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl relative nm-raised"
      style={{ background: "#162233" }}
    >
      {/* Profile avatar */}
      <button
        type="button"
        data-ocid="home.profile_button"
        onClick={() => {}}
        className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold active:scale-90 transition-transform"
        style={{
          background: "linear-gradient(135deg, #1e2d3d, #162233)",
          boxShadow: "4px 4px 8px #070e17, -2px -2px 6px #203247",
          border: "1px solid rgba(0,229,255,0.2)",
          color: "#e2eaf4",
        }}
      >
        👤
      </button>

      {/* XP Bar center */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-bold truncate"
              style={{ color: "#00e5ff" }}
            >
              {rankLabels[rank] || rank}
            </span>
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(0,229,255,0.15)",
                border: "1px solid rgba(0,229,255,0.3)",
                color: "#00e5ff",
              }}
            >
              Lv.{level}
            </span>
          </div>
          <span className="text-xs ml-1" style={{ color: "#5a7490" }}>
            {xp} {t.xp}
          </span>
        </div>
        {/* XP bar nm-inset */}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{
            background: "#0d1b2a",
            boxShadow: "inset 2px 2px 5px #080f18, inset -1px -1px 4px #1d2e40",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${xpProgress}%`,
              background: "linear-gradient(90deg, #00b8d4, #00e5ff)",
              boxShadow: "0 0 8px rgba(0,229,255,0.6)",
            }}
          />
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: "#5a7490" }}>
          {xp - rankBounds.min} / {rankBounds.max - rankBounds.min} {t.xp}
        </div>
      </div>

      {/* Coins + Language */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {/* Coin counter */}
        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${coinPulse ? "coin-pulse" : ""}`}
          style={{
            background: "#0d1b2a",
            boxShadow: "inset 2px 2px 5px #080f18, inset -1px -1px 4px #1d2e40",
          }}
        >
          <span className="text-base leading-none">🪙</span>
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: "#00e5ff" }}
          >
            {coins.toLocaleString()}
          </span>
        </div>
        {/* Language picker button */}
        <button
          type="button"
          data-ocid="home.language_toggle"
          onClick={() => setShowLangPicker((v) => !v)}
          className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold active:scale-90 transition-transform"
          style={{
            background: "#1e2d3d",
            boxShadow: "3px 3px 6px #070e17, -2px -2px 5px #203247",
            color: "#00e5ff",
          }}
        >
          <span>{currentLang.flag}</span>
          <span>{currentLang.short}</span>
          <span className="text-[8px]">▾</span>
        </button>
      </div>

      {/* Language Dropdown */}
      {showLangPicker && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowLangPicker(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowLangPicker(false)}
          />
          <div
            data-ocid="home.language_dropdown"
            className="absolute top-full right-0 mt-2 z-40 rounded-2xl overflow-hidden min-w-[160px]"
            style={{
              background: "#162233",
              boxShadow:
                "6px 6px 16px #070e17, -4px -4px 12px #1e3049, 0 0 30px rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.15)",
            }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                data-ocid={`home.lang_${lang.code}.button`}
                onClick={() => {
                  setLanguage(lang.code);
                  setShowLangPicker(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors text-left"
                style={
                  language === lang.code
                    ? { background: "rgba(0,229,255,0.1)", color: "#00e5ff" }
                    : { color: "#e2eaf4" }
                }
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && (
                  <span
                    className="ml-auto text-xs"
                    style={{ color: "#00e5ff" }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
