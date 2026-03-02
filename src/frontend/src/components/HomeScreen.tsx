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
      color: "#8B5CF6",
      ocid: "game_card.quiz.button",
    },
    {
      id: "gk",
      icon: "🌍",
      title: t.generalKnowledge,
      color: "#06B6D4",
      ocid: "game_card.gk.button",
    },
    {
      id: "wordConnect",
      icon: "🔤",
      title: t.wordConnect,
      color: "#10B981",
      ocid: "game_card.word_connect.button",
    },
    {
      id: "wordSearch",
      icon: "🔍",
      title: t.wordSearch,
      color: "#F59E0B",
      ocid: "game_card.word_search.button",
    },
    {
      id: "speedChallenge",
      icon: "⚡",
      title: t.speedChallenge,
      color: "#EF4444",
      ocid: "game_card.speed_challenge.button",
    },
    {
      id: "spinWin",
      icon: "🎰",
      title: t.spinWin,
      color: "#EC4899",
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
        <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-widest mb-3 px-1">
          🎮 Games
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              icon={game.icon}
              title={game.title}
              onClick={() => navigate(game.id as any)}
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
          color="#8B5CF6"
          wide
        />
        <GameCard
          icon="🏆"
          title={t.weeklyLeaderboard}
          subtitle="See top players"
          onClick={() => navigate("leaderboard")}
          data-ocid="home.leaderboard_button"
          color="#F59E0B"
          wide
        />
      </div>

      {/* Banner Ad */}
      <BannerAd />

      {/* Daily Reward Modal */}
      {showRewardModal && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
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
            className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 slide-in"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />

            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎁</div>
              <h3 className="text-xl font-black text-foreground">
                {t.dailyReward}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStreak} {language === "en" ? "day streak" : "ದಿನದ ಸತತತೆ"}{" "}
                🔥
              </p>
            </div>

            {/* 7-day streak circles */}
            <div className="flex justify-center gap-2 mb-6">
              {streakDays.map((day) => (
                <div
                  key={day}
                  className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    day <= currentStreak
                      ? "text-white shadow-sm"
                      : "bg-gray-100 text-gray-400"
                  }`}
                  style={
                    day <= currentStreak
                      ? {
                          background:
                            "linear-gradient(135deg, #8B5CF6, #6366F1)",
                        }
                      : {}
                  }
                >
                  <span className="text-[10px] leading-none">
                    {language === "en" ? "D" : "ದಿ"}
                  </span>
                  <span>{day}</span>
                </div>
              ))}
            </div>

            {rewardClaimed ? (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                  <div className="text-2xl mb-1">🎉</div>
                  <p className="font-bold text-green-700">
                    +{rewardCoins} {t.coins}{" "}
                    {language === "en" ? "earned!" : "ಗಳಿಸಿದ್ದೀರಿ!"}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="daily_reward.close_button"
                  onClick={() => setShowRewardModal(false)}
                  className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  {t.continue}
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="daily_reward.confirm_button"
                onClick={handleClaimReward}
                className="w-full py-3.5 font-bold text-white rounded-2xl active:scale-95 transition-transform text-lg shadow-card"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
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
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          © {new Date().getFullYear()}. Built with ❤️ using caffeine.ai
        </a>
      </div>
    </div>
  );
}
