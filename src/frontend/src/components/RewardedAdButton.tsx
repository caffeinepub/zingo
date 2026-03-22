import { useGame } from "../context/GameContext";

interface RewardedAdButtonProps {
  className?: string;
}

export function RewardedAdButton({ className = "" }: RewardedAdButtonProps) {
  const { watchAd, isAdOnCooldown, lastAdTime } = useGame();

  const secondsLeft = isAdOnCooldown
    ? Math.ceil((120000 - (Date.now() - lastAdTime)) / 1000)
    : 0;

  const handleClick = () => {
    if (isAdOnCooldown) return;
    // Simulate ad watching (1.5s delay)
    setTimeout(() => {
      watchAd();
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isAdOnCooldown}
      data-ocid="home.watch_ad_button"
      className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm active:scale-95 transition-all border ${className}`}
      style={{
        background: isAdOnCooldown
          ? "rgba(255,255,255,0.05)"
          : "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(33,150,243,0.15))",
        border: isAdOnCooldown
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,229,255,0.3)",
        color: isAdOnCooldown ? "#5a7490" : "#00e5ff",
        boxShadow: isAdOnCooldown ? "none" : "0 0 12px rgba(0,229,255,0.15)",
      }}
    >
      <span className="text-base">{isAdOnCooldown ? "⏱️" : "📺"}</span>
      {isAdOnCooldown ? `Cooldown: ${secondsLeft}s` : "Watch Ad (+50 coins)"}
    </button>
  );
}
