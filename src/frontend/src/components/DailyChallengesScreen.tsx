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
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg active:scale-90 transition-transform"
          style={{
            background: "#162233",
            boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
            color: "#e2eaf4",
          }}
        >
          ←
        </button>
        <h1 className="text-lg font-black" style={{ color: "#e2eaf4" }}>
          {t.dailyMissions}
        </h1>
        <div
          className="rounded-2xl px-3 py-2 text-sm font-bold"
          style={{
            background: "#162233",
            boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
            color: "#00e5ff",
          }}
        >
          {completedCount}/{challenges.length}
        </div>
      </div>

      {/* Progress card */}
      <div
        className="rounded-3xl p-4"
        style={{
          background: "#162233",
          boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
        }}
      >
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold" style={{ color: "#e2eaf4" }}>
            {language === "en" ? "Daily Progress" : "ದಿನದ ಪ್ರಗತಿ"}
          </span>
          <span className="text-sm" style={{ color: "#5a7490" }}>
            {completedCount}/{challenges.length}
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{
            background: "#0d1b2a",
            boxShadow: "inset 2px 2px 5px #080f18, inset -1px -1px 4px #1d2e40",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width:
                challenges.length > 0
                  ? `${(completedCount / challenges.length) * 100}%`
                  : "0%",
              background: "linear-gradient(90deg, #00b8d4, #00e5ff)",
              boxShadow: "0 0 8px rgba(0,229,255,0.6)",
            }}
          />
        </div>
        {completedCount === challenges.length && challenges.length > 0 && (
          <p
            className="text-center text-sm font-bold mt-2"
            style={{ color: "#00e5ff" }}
          >
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
          className="rounded-3xl p-8 text-center"
          style={{
            background: "#162233",
            boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
          }}
        >
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-sm" style={{ color: "#5a7490" }}>
            {t.loading}
          </p>
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
                className="rounded-3xl p-4 transition-all"
                style={{
                  background: "#162233",
                  boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
                  opacity: done ? 0.75 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: "#0d1b2a",
                      boxShadow:
                        "inset 3px 3px 6px #070e17, inset -2px -2px 5px #1a2d42",
                    }}
                  >
                    {done ? "✅" : icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: done ? "#5a7490" : "#e2eaf4",
                        textDecoration: done ? "line-through" : "none",
                      }}
                    >
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs" style={{ color: "#5a7490" }}>
                        🎯 {t.target}: {Number(challenge.targetScore)}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#00e5ff" }}
                      >
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
                    className="w-full mt-3 py-2.5 text-sm font-bold rounded-2xl active:scale-95 transition-all disabled:opacity-70"
                    style={{
                      background: "linear-gradient(135deg, #00b8d4, #00e5ff)",
                      color: "#0d1b2a",
                      boxShadow: "3px 3px 8px #070e17, -2px -2px 6px #203247",
                    }}
                  >
                    {isCompleting ? `⏳ ${t.loading}` : `✓ ${t.complete}`}
                  </button>
                )}
                {done && (
                  <div
                    className="w-full mt-3 py-2.5 text-sm font-bold rounded-2xl text-center"
                    style={{
                      background: "rgba(0,229,255,0.06)",
                      border: "1px solid rgba(0,229,255,0.2)",
                      color: "#00e5ff",
                    }}
                  >
                    {t.completed}
                  </div>
                )}
              </div>
            );
          })}

          {challenges.length === 0 && (
            <div
              data-ocid="challenges.empty_state"
              className="rounded-3xl p-8 text-center"
              style={{
                background: "#162233",
                boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
              }}
            >
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-sm" style={{ color: "#5a7490" }}>
                {t.noData}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
