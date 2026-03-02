import { useEffect, useState } from "react";
import type { DailyChallenge } from "../backend.d";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";

const MOCK_CHALLENGES: DailyChallenge[] = [
  {
    id: "quiz_5",
    description: "Answer 5 Quiz questions correctly",
    targetScore: BigInt(5),
    rewardCoins: BigInt(50),
    completed: false,
  },
  {
    id: "speed_10",
    description: "Score 10 in Speed Challenge",
    targetScore: BigInt(10),
    rewardCoins: BigInt(75),
    completed: false,
  },
  {
    id: "word_connect_1",
    description: "Complete 1 Word Connect level",
    targetScore: BigInt(1),
    rewardCoins: BigInt(40),
    completed: false,
  },
];

const CHALLENGE_ICONS: Record<string, string> = {
  quiz_5: "🧠",
  speed_10: "⚡",
  word_connect_1: "🔤",
  word_search_1: "🔍",
};

export function DailyChallengesScreen() {
  const { navigate, language, addCoins } = useGame();
  const t = translations[language];

  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    backend
      .getDailyChallenges()
      .then((data: DailyChallenge[]) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          setChallenges(data);
          const map: Record<string, boolean> = {};
          for (const c of data) {
            map[c.id] = c.completed;
          }
          setCompletedMap(map);
        } else {
          setChallenges(MOCK_CHALLENGES);
        }
      })
      .catch(() => {
        if (mounted) setChallenges(MOCK_CHALLENGES);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleComplete = async (challengeId: string, rewardCoins: bigint) => {
    if (completedMap[challengeId] || completing) return;
    setCompleting(challengeId);
    try {
      await backend.completeChallenge(challengeId);
      const coins = Number(rewardCoins);
      addCoins(coins);
      setCompletedMap((prev) => ({ ...prev, [challengeId]: true }));
    } catch {
      // Offline fallback
      addCoins(Number(rewardCoins));
      setCompletedMap((prev) => ({ ...prev, [challengeId]: true }));
    } finally {
      setCompleting(null);
    }
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <div
      data-ocid="challenges.screen"
      className="flex flex-col gap-4 screen-enter pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center text-lg active:scale-90"
        >
          ←
        </button>
        <h1 className="text-lg font-black text-foreground">
          {t.dailyMissions}
        </h1>
        <div className="bg-white shadow-card rounded-2xl px-3 py-2 text-sm font-bold text-purple-600">
          {completedCount}/{challenges.length}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-3xl shadow-card p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-foreground">
            {language === "en" ? "Daily Progress" : "ದಿನದ ಪ್ರಗತಿ"}
          </span>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{challenges.length}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width:
                challenges.length > 0
                  ? `${(completedCount / challenges.length) * 100}%`
                  : "0%",
              background: "linear-gradient(90deg, #8B5CF6, #6366F1)",
            }}
          />
        </div>
        {completedCount === challenges.length && challenges.length > 0 && (
          <p className="text-center text-sm font-bold text-green-600 mt-2">
            🎉{" "}
            {language === "en"
              ? "All missions complete!"
              : "ಎಲ್ಲ ಕಾರ್ಯಗಳು ಮುಗಿದಿವೆ!"}
          </p>
        )}
      </div>

      {/* Challenge list */}
      {loading ? (
        <div
          data-ocid="challenges.loading_state"
          className="bg-white rounded-3xl shadow-card p-8 text-center"
        >
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-muted-foreground text-sm">{t.loading}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {challenges.map((challenge, idx) => {
            const done = completedMap[challenge.id] || challenge.completed;
            const isCompleting = completing === challenge.id;
            const icon = CHALLENGE_ICONS[challenge.id] || "🎯";

            return (
              <div
                key={challenge.id}
                data-ocid={`challenges.item.${idx + 1}`}
                className={`bg-white rounded-3xl shadow-card p-4 transition-all ${done ? "opacity-75" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${done ? "bg-green-100" : "bg-purple-50"}`}
                  >
                    {done ? "✅" : icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold ${done ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        🎯 {t.target}: {Number(challenge.targetScore)}
                      </span>
                      <span className="text-xs font-semibold text-amber-600">
                        🪙 +{Number(challenge.rewardCoins)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete button */}
                {!done && (
                  <button
                    type="button"
                    data-ocid={`challenges.complete_button.${idx + 1}`}
                    onClick={() =>
                      handleComplete(challenge.id, challenge.rewardCoins)
                    }
                    disabled={isCompleting}
                    className="w-full mt-3 py-2.5 text-white text-sm font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-70"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                    }}
                  >
                    {isCompleting ? `⏳ ${t.loading}` : `✓ ${t.complete}`}
                  </button>
                )}
                {done && (
                  <div className="w-full mt-3 py-2.5 text-green-700 text-sm font-bold rounded-2xl bg-green-50 border border-green-200 text-center">
                    {t.completed}
                  </div>
                )}
              </div>
            );
          })}

          {challenges.length === 0 && (
            <div
              data-ocid="challenges.empty_state"
              className="bg-white rounded-3xl shadow-card p-8 text-center"
            >
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-muted-foreground text-sm">{t.noData}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
