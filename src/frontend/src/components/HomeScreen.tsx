import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";
import { BannerAd } from "./BannerAd";
import { GameCard } from "./GameCard";
import { TopBar } from "./TopBar";

export function HomeScreen() {
  const { navigate, language, addCoins, streak } = useGame();
  const t = translations[language];
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(streak);

  // Check if we should show the daily reward modal
  useEffect(() => {
    const lastClaim = localStorage.getItem("zingo_last_claim");
    const today = new Date().toDateString();
    if (lastClaim !== today) {
      const timer = setTimeout(() => setShowRewardModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClaimReward = async () => {
    try {
      const result = await backend.claimDailyLoginReward();
      const coins = Number(result.coinsAwarded);
      const newStreak = Number(result.currentStreak);
      setRewardCoins(coins);
      setCurrentStreak(newStreak);
      addCoins(coins);
      setRewardClaimed(true);
      localStorage.setItem("zingo_last_claim", new Date().toDateString());
    } catch {
      // offline fallback
      const coins = 20 + Math.floor(Math.random() * 30);
      setRewardCoins(coins);
      addCoins(coins);
      setRewardClaimed(true);
      localStorage.setItem("zingo_last_claim", new Date().toDateString());
    }
  };

  const games = [
    {
      id: "quiz",
      icon: "🧠",
      title: t.quiz,
      color: "#00e5ff",
      ocid: "game_card.quiz.button",
    },
    {
      id: "gk",
      icon: "🌍",
      title: t.generalKnowledge,
      color: "#00e5ff",
      ocid: "game_card.gk.button",
    },
    {
      id: "wordConnect",
      icon: "🔤",
      title: t.wordConnect,
      color: "#00e5ff",
      ocid: "game_card.word_connect.button",
    },
    {
      id: "wordSearch",
      icon: "🔍",
      title: t.wordSearch,
      color: "#00e5ff",
      ocid: "game_card.word_search.button",
    },
    {
      id: "speedChallenge",
      icon: "⚡",
      title: t.speedChallenge,
      color: "#00e5ff",
      ocid: "game_card.speed_challenge.button",
    },
    {
      id: "spinWin",
      icon: "🎰",
      title: t.spinWin,
      color: "#00e5ff",
      ocid: "game_card.spin_win.button",
    },
  ] as const;

  const streakDays = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div
      data-ocid="home.screen"
      className="flex flex-col gap-4 pb-6 screen-enter"
    >
      {/* Top Bar */}
      <TopBar />

      {/* Games Grid */}
      <div>
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-3 px-1"
          style={{ color: "#5a7490" }}
        >
          🎮 Games
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              icon={game.icon}
              title={game.title}
              onClick={() =>
                navigate(game.id as Parameters<typeof navigate>[0])
              }
              data-ocid={game.ocid}
              color={game.color}
            />
          ))}
        </div>
      </div>

      {/* Wide CTA Cards */}
      <div className="flex flex-col gap-3">
        <GameCard
          icon="🎯"
          title={t.dailyChallenges}
          subtitle="3 missions today"
          onClick={() => navigate("dailyChallenges")}
          data-ocid="home.challenges_button"
          color="#00e5ff"
          wide
        />
        <GameCard
          icon="🏆"
          title={t.weeklyLeaderboard}
          subtitle="See top players"
          onClick={() => navigate("leaderboard")}
          data-ocid="home.leaderboard_button"
          color="#00e5ff"
          wide
        />
      </div>

      {/* Banner Ad */}
      <BannerAd />

      {/* Daily Reward Modal */}
      {showRewardModal && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && rewardClaimed) {
              setShowRewardModal(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && rewardClaimed) setShowRewardModal(false);
          }}
        >
          <div
            data-ocid="daily_reward.modal"
            className="w-full max-w-md p-6 pb-8 slide-in rounded-t-3xl"
            style={{
              background: "#162233",
              boxShadow:
                "0 -8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,229,255,0.08)",
            }}
          >
            {/* Drag handle */}
            <div
              className="w-12 h-1.5 rounded-full mx-auto mb-5"
              style={{ background: "#2a3d52" }}
            />

            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎁</div>
              <h3 className="text-xl font-black" style={{ color: "#e2eaf4" }}>
                {t.dailyReward}
              </h3>
              <p className="text-sm mt-1" style={{ color: "#5a7490" }}>
                {currentStreak} {t.dayStreak} 🔥
              </p>
            </div>

            {/* 7-day streak circles */}
            <div className="flex justify-center gap-2 mb-6">
              {streakDays.map((day) => (
                <div
                  key={day}
                  className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all"
                  style={
                    day <= currentStreak
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,229,255,0.35))",
                          border: "1px solid rgba(0,229,255,0.5)",
                          color: "#00e5ff",
                          boxShadow: "0 0 12px rgba(0,229,255,0.2)",
                        }
                      : {
                          background: "#0d1b2a",
                          boxShadow:
                            "inset 2px 2px 5px #080f18, inset -1px -1px 4px #1d2e40",
                          color: "#5a7490",
                        }
                  }
                >
                  <span className="text-[10px] leading-none">
                    {t.day.charAt(0)}
                  </span>
                  <span>{day}</span>
                </div>
              ))}
            </div>

            {rewardClaimed ? (
              <div className="text-center">
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    background: "rgba(0,229,255,0.06)",
                    border: "1px solid rgba(0,229,255,0.2)",
                    boxShadow: "inset 2px 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="text-2xl mb-1">🎉</div>
                  <p className="font-bold" style={{ color: "#00e5ff" }}>
                    +{rewardCoins} {t.coins} {t.claimed}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="daily_reward.close_button"
                  onClick={() => setShowRewardModal(false)}
                  className="w-full py-3.5 font-bold rounded-2xl active:scale-95 transition-transform text-sm"
                  style={{
                    background: "#1e2d3d",
                    color: "#00e5ff",
                    boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
                    border: "1px solid rgba(0,229,255,0.2)",
                  }}
                >
                  {t.continue}
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="daily_reward.confirm_button"
                onClick={handleClaimReward}
                className="w-full py-3.5 font-bold rounded-2xl active:scale-95 transition-transform text-lg"
                style={{
                  background: "linear-gradient(135deg, #00b8d4, #00e5ff)",
                  color: "#0d1b2a",
                  boxShadow:
                    "4px 4px 12px #070e17, -3px -3px 8px #203247, 0 0 20px rgba(0,229,255,0.3)",
                }}
              >
                🎁 {t.claimReward}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-2">
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors"
          style={{ color: "#2a3d52" }}
        >
          © {new Date().getFullYear()}. Built with ❤️ using caffeine.ai
        </a>
      </div>
    </div>
  );
}
