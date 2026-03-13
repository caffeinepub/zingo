import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../backend.d";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import { backend } from "../services/backendService";

const MOCK_ENTRIES: { principal: string; xp: number; rank: string }[] = [
  { principal: "2vxsx-fae", xp: 4850, rank: "Champion" },
  { principal: "un4fu-tqaaa-aaaab-qab4q-cai", xp: 3720, rank: "Pro" },
  { principal: "rdmx6-jaaaa-aaaaa-aaadq-cai", xp: 2940, rank: "Pro" },
  { principal: "aaaaa-aa", xp: 2100, rank: "Player" },
  { principal: "qoctq-giaaa-aaaaa-aab3q-cai", xp: 1580, rank: "Player" },
  { principal: "ybpg4-pqaaa-aaaan-qamxq-cai", xp: 890, rank: "Beginner" },
  { principal: "rrkah-fqaaa-aaaaa-aaaaq-cai", xp: 430, rank: "Beginner" },
];

function truncatePrincipal(p: string): string {
  if (p.length <= 12) return p;
  return `${p.slice(0, 6)}...${p.slice(-4)}`;
}

const RANK_ICONS: Record<string, string> = {
  Legend: "🌟",
  Champion: "🏆",
  Pro: "🎯",
  Player: "🎮",
  Beginner: "🌱",
};

// Neumorphic podium colors: gold, silver, bronze in navy theme
const PODIUM_STYLES = [
  {
    bg: "linear-gradient(135deg, rgba(0,229,255,0.25), rgba(0,229,255,0.1))",
    border: "rgba(0,229,255,0.4)",
    text: "#00e5ff",
    minH: 100,
    glow: "0 0 20px rgba(0,229,255,0.2)",
  },
  {
    bg: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,229,255,0.05))",
    border: "rgba(0,229,255,0.25)",
    text: "#7fd8e8",
    minH: 80,
    glow: "none",
  },
  {
    bg: "linear-gradient(135deg, rgba(0,180,200,0.15), rgba(0,180,200,0.06))",
    border: "rgba(0,180,200,0.25)",
    text: "#5ab8cc",
    minH: 64,
    glow: "none",
  },
];

export function LeaderboardScreen() {
  const { navigate, language, xp, rank } = useGame();
  const t = translations[language];

  const [entries, setEntries] = useState<
    { principal: string; xp: number; rank: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    backend
      .getWeeklyLeaderboard()
      .then((data: LeaderboardEntry[]) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          const mapped = data.map((e) => ({
            principal: e.principal.toString(),
            xp: Number(e.xp),
            rank: e.rank,
          }));
          setEntries(mapped.sort((a, b) => b.xp - a.xp));
        } else {
          setEntries(MOCK_ENTRIES);
        }
      })
      .catch(() => {
        if (mounted) setEntries(MOCK_ENTRIES);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const podiumOrder =
    entries.length >= 3 ? [entries[1], entries[0], entries[2]] : [];
  const podiumStyles = [PODIUM_STYLES[1], PODIUM_STYLES[0], PODIUM_STYLES[2]];
  const podiumMedals = ["🥈", "🥇", "🥉"];
  const podiumIndexes = [1, 0, 2];

  return (
    <div
      data-ocid="leaderboard.screen"
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
          {t.weeklyLeaderboard}
        </h1>
        <div className="w-10" />
      </div>

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-2 py-4">
          {podiumOrder.map((entry, i) => {
            if (!entry) return null;
            const style = podiumStyles[i];
            return (
              <div
                key={podiumIndexes[i]}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div className="text-2xl">{podiumMedals[i]}</div>
                <div
                  className="w-full rounded-t-2xl flex flex-col items-center py-3 px-2"
                  style={{
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    minHeight: style.minH,
                    boxShadow:
                      style.glow !== "none"
                        ? `4px 4px 10px #070e17, -3px -3px 8px #203247, ${style.glow}`
                        : "4px 4px 10px #070e17, -3px -3px 8px #203247",
                  }}
                >
                  <div className="text-xl">
                    {RANK_ICONS[entry.rank] || "🎮"}
                  </div>
                  <p
                    className="text-[10px] font-bold text-center break-all"
                    style={{ color: style.text }}
                  >
                    {truncatePrincipal(entry.principal)}
                  </p>
                  <p
                    className="text-xs font-black"
                    style={{ color: style.text }}
                  >
                    {entry.xp} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {loading ? (
        <div
          data-ocid="leaderboard.loading_state"
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
        <div
          data-ocid="leaderboard.list"
          className="rounded-3xl overflow-hidden"
          style={{
            background: "#162233",
            boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
          }}
        >
          {entries.map((entry, idx) => {
            const isTop3 = idx < 3;
            return (
              <div
                key={entry.principal}
                data-ocid={`leaderboard.item.${idx + 1}`}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: "1px solid rgba(30,45,61,0.8)",
                  background: isTop3 ? "rgba(0,229,255,0.03)" : "transparent",
                }}
              >
                {/* Position */}
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={
                    isTop3
                      ? {
                          background: "rgba(0,229,255,0.15)",
                          color: "#00e5ff",
                          border: "1px solid rgba(0,229,255,0.25)",
                        }
                      : {
                          background: "#0d1b2a",
                          color: "#5a7490",
                          boxShadow:
                            "inset 2px 2px 4px #080f18, inset -1px -1px 3px #1d2e40",
                        }
                  }
                >
                  {idx + 1}
                </div>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{
                    background: "#0d1b2a",
                    boxShadow:
                      "inset 2px 2px 5px #080f18, inset -1px -1px 4px #1d2e40",
                  }}
                >
                  {RANK_ICONS[entry.rank] || "🎮"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: "#e2eaf4" }}
                  >
                    {truncatePrincipal(entry.principal)}
                  </p>
                  <p className="text-xs" style={{ color: "#5a7490" }}>
                    {entry.rank}
                  </p>
                </div>

                {/* XP */}
                <div
                  className="text-sm font-black flex-shrink-0"
                  style={{ color: "#00e5ff" }}
                >
                  {entry.xp.toLocaleString()} XP
                </div>
              </div>
            );
          })}

          {entries.length === 0 && (
            <div
              data-ocid="leaderboard.empty_state"
              className="p-8 text-center text-sm"
              style={{ color: "#5a7490" }}
            >
              {t.noData}
            </div>
          )}
        </div>
      )}

      {/* Your rank */}
      <div
        className="rounded-3xl p-4 flex items-center gap-3"
        style={{
          background: "#162233",
          boxShadow: "4px 4px 10px #070e17, -3px -3px 8px #203247",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: "#0d1b2a",
            boxShadow: "inset 2px 2px 5px #080f18, inset -1px -1px 4px #1d2e40",
          }}
        >
          {RANK_ICONS[rank] || "🌱"}
        </div>
        <div className="flex-1">
          <p className="text-xs" style={{ color: "#5a7490" }}>
            {t.yourRank}
          </p>
          <p className="text-sm font-bold" style={{ color: "#e2eaf4" }}>
            {rank}
          </p>
        </div>
        <div className="text-sm font-black" style={{ color: "#00e5ff" }}>
          {xp} XP
        </div>
      </div>
    </div>
  );
}
