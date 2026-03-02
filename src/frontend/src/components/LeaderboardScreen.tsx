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

const POSITION_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"];

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
          className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center text-lg active:scale-90"
        >
          ←
        </button>
        <h1 className="text-lg font-black text-foreground">
          {t.weeklyLeaderboard}
        </h1>
        <div className="w-10" />
      </div>

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-2 py-4">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="text-2xl">🥈</div>
            <div
              className="w-full rounded-t-2xl flex flex-col items-center py-3 px-2"
              style={{
                background: "linear-gradient(135deg, #E5E7EB, #D1D5DB)",
                minHeight: 80,
              }}
            >
              <div className="text-xl">
                {RANK_ICONS[entries[1]?.rank] || "🎮"}
              </div>
              <p className="text-[10px] font-bold text-gray-700 text-center break-all">
                {truncatePrincipal(entries[1]?.principal || "")}
              </p>
              <p className="text-xs font-black text-gray-600">
                {entries[1]?.xp} XP
              </p>
            </div>
          </div>

          {/* 1st */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="text-3xl">🥇</div>
            <div
              className="w-full rounded-t-2xl flex flex-col items-center py-3 px-2"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                minHeight: 100,
              }}
            >
              <div className="text-2xl">
                {RANK_ICONS[entries[0]?.rank] || "🏆"}
              </div>
              <p className="text-[10px] font-bold text-white text-center break-all">
                {truncatePrincipal(entries[0]?.principal || "")}
              </p>
              <p className="text-xs font-black text-white">
                {entries[0]?.xp} XP
              </p>
            </div>
          </div>

          {/* 3rd */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="text-2xl">🥉</div>
            <div
              className="w-full rounded-t-2xl flex flex-col items-center py-3 px-2"
              style={{
                background: "linear-gradient(135deg, #D97706, #B45309)",
                minHeight: 64,
              }}
            >
              <div className="text-xl">
                {RANK_ICONS[entries[2]?.rank] || "🎮"}
              </div>
              <p className="text-[10px] font-bold text-white text-center break-all">
                {truncatePrincipal(entries[2]?.principal || "")}
              </p>
              <p className="text-xs font-black text-white">
                {entries[2]?.xp} XP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      {loading ? (
        <div
          data-ocid="leaderboard.loading_state"
          className="bg-white rounded-3xl shadow-card p-8 text-center"
        >
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-muted-foreground text-sm">{t.loading}</p>
        </div>
      ) : (
        <div
          data-ocid="leaderboard.list"
          className="bg-white rounded-3xl shadow-card overflow-hidden"
        >
          {entries.map((entry, idx) => {
            const isTop3 = idx < 3;
            const positionColor = POSITION_COLORS[idx] || "transparent";
            return (
              <div
                key={entry.principal}
                data-ocid={`leaderboard.item.${idx + 1}`}
                className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 ${isTop3 ? "bg-amber-50/50" : ""}`}
              >
                {/* Position */}
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={
                    isTop3
                      ? { background: positionColor, color: "white" }
                      : { background: "#F3F4F6", color: "#6B7280" }
                  }
                >
                  {idx + 1}
                </div>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                  }}
                >
                  {RANK_ICONS[entry.rank] || "🎮"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {truncatePrincipal(entry.principal)}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.rank}</p>
                </div>

                {/* XP */}
                <div className="text-sm font-black text-purple-600 flex-shrink-0">
                  {entry.xp.toLocaleString()} XP
                </div>
              </div>
            );
          })}

          {entries.length === 0 && (
            <div
              data-ocid="leaderboard.empty_state"
              className="p-8 text-center text-muted-foreground text-sm"
            >
              {t.noData}
            </div>
          )}
        </div>
      )}

      {/* Your rank */}
      <div className="bg-white rounded-3xl shadow-card p-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
        >
          {RANK_ICONS[rank] || "🌱"}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{t.yourRank}</p>
          <p className="text-sm font-bold text-foreground">{rank}</p>
        </div>
        <div className="text-sm font-black text-purple-600">{xp} XP</div>
      </div>
    </div>
  );
}
