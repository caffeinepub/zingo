import { useState } from "react";
import { useGame } from "../context/GameContext";

interface ShopItemDef {
  key: "hint" | "extraLife" | "doubleReward" | "spinToken";
  icon: string;
  title: string;
  description: string;
  cost: number;
  ownedKey: keyof import("../context/GameContext").ShopItems;
}

const ITEMS: ShopItemDef[] = [
  {
    key: "hint",
    icon: "💡",
    title: "Hint",
    description: "Remove 2 wrong answers",
    cost: 30,
    ownedKey: "hints",
  },
  {
    key: "extraLife",
    icon: "❤️",
    title: "Extra Life",
    description: "Retry without watching an ad",
    cost: 50,
    ownedKey: "extraLives",
  },
  {
    key: "doubleReward",
    icon: "2️⃣",
    title: "Double Reward",
    description: "Next game gives 2x coins",
    cost: 100,
    ownedKey: "doubleReward",
  },
  {
    key: "spinToken",
    icon: "🎰",
    title: "Spin Token",
    description: "Extra spin on Spin & Win",
    cost: 80,
    ownedKey: "spinTokens",
  },
];

export function ShopScreen() {
  const { navigate, coins, shopItems, buyShopItem } = useGame();
  const [pulseKey, setPulseKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleBuy = (item: ShopItemDef) => {
    const success = buyShopItem(item.key);
    if (success) {
      setPulseKey(item.key);
      setTimeout(() => setPulseKey(null), 600);
    } else {
      setErrorKey(item.key);
      setTimeout(() => setErrorKey(null), 600);
    }
  };

  const getOwned = (item: ShopItemDef): number | boolean => {
    return shopItems[item.ownedKey];
  };

  return (
    <div
      data-ocid="shop.screen"
      className="min-h-screen flex flex-col gap-4 screen-enter pb-6 px-4 pt-4"
      style={{
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="shop.close_button"
          onClick={() => navigate("home")}
          className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform border border-white/20"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8))",
            backdropFilter: "blur(8px)",
            color: "#00e5ff",
            fontSize: "1.2rem",
          }}
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-black text-white">🛒 Shop</h1>
          <p className="text-xs" style={{ color: "#9fb3c8" }}>
            Spend your coins wisely
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(0,229,255,0.1)",
            border: "1px solid rgba(0,229,255,0.3)",
          }}
        >
          <span>🪙</span>
          <span className="font-black text-sm" style={{ color: "#00e5ff" }}>
            {coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        {ITEMS.map((item) => {
          const owned = getOwned(item);
          const canAfford = coins >= item.cost;
          const isPulsing = pulseKey === item.key;
          const isError = errorKey === item.key;

          return (
            <div
              key={item.key}
              data-ocid={`shop.${item.key}.card`}
              className="rounded-3xl p-4 flex items-center gap-4 border transition-all"
              style={{
                background: isPulsing
                  ? "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,229,255,0.25))"
                  : isError
                    ? "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.1))"
                    : "linear-gradient(135deg, rgba(15,32,39,0.9), rgba(32,58,67,0.8), rgba(44,83,100,0.7))",
                backdropFilter: "blur(12px)",
                borderColor: isPulsing
                  ? "rgba(0,229,255,0.5)"
                  : isError
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(255,255,255,0.1)",
                boxShadow: isPulsing
                  ? "0 0 20px rgba(0,229,255,0.3)"
                  : "0 0 15px rgba(0,229,255,0.08)",
                transform: isPulsing ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: "rgba(0,229,255,0.1)",
                  border: "1px solid rgba(0,229,255,0.2)",
                }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-white text-base">
                  {item.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#9fb3c8" }}>
                  {item.description}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#00e5ff" }}
                  >
                    🪙 {item.cost} coins
                  </span>
                  {typeof owned === "boolean"
                    ? owned && (
                        <span className="text-xs font-bold text-green-400">
                          ✓ Active
                        </span>
                      )
                    : owned > 0 && (
                        <span className="text-xs" style={{ color: "#9fb3c8" }}>
                          Owned: {owned}
                        </span>
                      )}
                </div>
              </div>
              <button
                type="button"
                data-ocid={`shop.${item.key}.button`}
                onClick={() => handleBuy(item)}
                className="px-4 py-2.5 rounded-2xl font-bold text-sm active:scale-95 transition-transform flex-shrink-0"
                style={{
                  background: canAfford
                    ? "linear-gradient(135deg, #00bcd4, #2196f3)"
                    : "rgba(255,255,255,0.08)",
                  color: canAfford ? "#0d1b2a" : "#5a7490",
                  boxShadow: canAfford
                    ? "0 0 12px rgba(0,229,255,0.3)"
                    : "none",
                }}
              >
                Buy
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs mt-2" style={{ color: "#5a7490" }}>
        Play games to earn more coins 🎮
      </p>
    </div>
  );
}
