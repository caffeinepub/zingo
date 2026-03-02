import { useState } from "react";

interface RewardedAdButtonProps {
  label: string;
  onReward: () => void;
  className?: string;
}

export function RewardedAdButton({
  label,
  onReward,
  className = "",
}: RewardedAdButtonProps) {
  const [state, setState] = useState<"idle" | "watching" | "claimed">("idle");

  const handleClick = () => {
    if (state !== "idle") return;
    setState("watching");
    // Simulate ad watching
    setTimeout(() => {
      setState("claimed");
      onReward();
      setTimeout(() => setState("idle"), 2000);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "watching"}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm active:scale-95 transition-all ${
        state === "claimed"
          ? "bg-green-100 text-green-700"
          : state === "watching"
            ? "bg-gray-100 text-gray-500"
            : "bg-amber-50 text-amber-700 border border-amber-200"
      } ${className}`}
    >
      <span className="text-base">
        {state === "claimed" ? "✅" : state === "watching" ? "⏳" : "📺"}
      </span>
      {state === "claimed"
        ? "Reward Claimed!"
        : state === "watching"
          ? "Loading ad..."
          : label}
    </button>
  );
}
