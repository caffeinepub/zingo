interface GameResultModalProps {
  isOpen: boolean;
  score: number;
  maxScore: number;
  coinsEarned: number;
  xpEarned: number;
  gameName: string;
  onRetry: () => void;
  onExit: () => void;
  onWatchAdRetry?: () => void;
}

export function GameResultModal({
  isOpen,
  score,
  maxScore,
  coinsEarned,
  xpEarned,
  gameName,
  onRetry,
  onExit,
  onWatchAdRetry,
}: GameResultModalProps) {
  if (!isOpen) return null;

  const pct = maxScore > 0 ? score / maxScore : 0;
  const isWin = pct >= 0.6;
  const isAvg = pct >= 0.3 && pct < 0.6;

  const emoji = isWin ? "🏆" : isAvg ? "👍" : "💪";
  const resultText = isWin
    ? "Victory!"
    : isAvg
      ? "Good Try!"
      : "Better Luck Next Time";

  const shareText = encodeURIComponent(
    `I scored ${score}/${maxScore} in ${gameName} on Zingo 🔥 Can you beat me? ${window.location.href}`,
  );
  const whatsappUrl = `https://wa.me/?text=${shareText}`;

  return (
    <div
      data-ocid="result.modal"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,32,39,0.98), rgba(32,58,67,0.95), rgba(44,83,100,0.9))",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,229,255,0.2)",
          boxShadow:
            "0 0 40px rgba(0,229,255,0.15), 0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Result header */}
        <div className="text-center">
          <div className="text-6xl mb-2">{emoji}</div>
          <h2 className="text-2xl font-black text-white">{resultText}</h2>
          <p className="text-sm mt-1" style={{ color: "#9fb3c8" }}>
            {gameName}
          </p>
        </div>

        {/* Stats */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-3"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">Score</span>
            <span className="text-2xl font-black text-white">
              {score}/{maxScore}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">Coins Earned</span>
            <span className="font-bold text-amber-400">🪙 +{coinsEarned}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">XP Earned</span>
            <span className="font-bold" style={{ color: "#00e5ff" }}>
              +{xpEarned} XP
            </span>
          </div>
        </div>

        {/* WhatsApp share */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="result.share_button"
          className="w-full py-3 rounded-2xl font-bold text-sm text-center active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={{
            background: "rgba(37,211,102,0.15)",
            border: "1px solid rgba(37,211,102,0.4)",
            color: "#25d366",
          }}
        >
          <span>📲</span> Share on WhatsApp
        </a>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {onWatchAdRetry && (
            <button
              type="button"
              data-ocid="result.watch_ad_button"
              onClick={onWatchAdRetry}
              className="w-full py-3.5 font-bold rounded-2xl active:scale-95 transition-transform text-sm"
              style={{
                background: "linear-gradient(135deg, #00bcd4, #2196f3)",
                color: "#0d1b2a",
                boxShadow: "0 0 20px rgba(0,229,255,0.3)",
              }}
            >
              📺 Watch Ad &amp; Retry
            </button>
          )}
          <button
            type="button"
            data-ocid="result.retry_button"
            onClick={onRetry}
            className="w-full py-3.5 font-bold rounded-2xl active:scale-95 transition-transform text-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(33,150,243,0.2))",
              color: "#00e5ff",
              border: "1px solid rgba(0,229,255,0.3)",
            }}
          >
            🔄 Play Again
          </button>
          <button
            type="button"
            data-ocid="result.exit_button"
            onClick={onExit}
            className="w-full py-3 font-bold rounded-2xl active:scale-95 transition-transform text-sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#9fb3c8",
            }}
          >
            🏠 Exit to Home
          </button>
        </div>
      </div>
    </div>
  );
}
