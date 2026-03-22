interface EntryFeeModalProps {
  isOpen: boolean;
  cost: number;
  gameName: string;
  onConfirm: () => void;
  onCancel: () => void;
  canAfford: boolean;
}

export function EntryFeeModal({
  isOpen,
  cost,
  gameName,
  onConfirm,
  onCancel,
  canAfford,
}: EntryFeeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      data-ocid="entry_fee.modal"
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div
        className="w-full max-w-md p-6 pb-8 rounded-t-3xl"
        style={{
          background: "linear-gradient(135deg, #0f2027, #162233)",
          boxShadow:
            "0 -8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,229,255,0.08)",
          border: "1px solid rgba(0,229,255,0.15)",
        }}
      >
        <div
          className="w-12 h-1.5 rounded-full mx-auto mb-5"
          style={{ background: "#2a3d52" }}
        />

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎮</div>
          <h3 className="text-xl font-black text-white">{gameName}</h3>
          <p className="text-sm mt-1" style={{ color: "#9fb3c8" }}>
            Entry fee required to play
          </p>
        </div>

        <div
          className="rounded-2xl p-4 mb-5 text-center"
          style={{
            background: "rgba(0,229,255,0.06)",
            border: `1px solid ${canAfford ? "rgba(0,229,255,0.3)" : "rgba(239,68,68,0.4)"}`,
          }}
        >
          <div
            className="text-3xl font-black"
            style={{ color: canAfford ? "#00e5ff" : "#ef4444" }}
          >
            🪙 {cost} coins
          </div>
          {!canAfford && (
            <p className="text-sm font-bold mt-1" style={{ color: "#ef4444" }}>
              Not enough coins! Watch an ad or play other games first.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            data-ocid="entry_fee.cancel_button"
            onClick={onCancel}
            className="flex-1 py-3.5 font-bold rounded-2xl active:scale-95 transition-transform border border-white/20 text-white"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="entry_fee.confirm_button"
            onClick={onConfirm}
            disabled={!canAfford}
            className="flex-1 py-3.5 font-bold rounded-2xl active:scale-95 transition-transform"
            style={{
              background: canAfford
                ? "linear-gradient(135deg, #00bcd4, #2196f3)"
                : "rgba(255,255,255,0.08)",
              color: canAfford ? "#0d1b2a" : "#5a7490",
              boxShadow: canAfford ? "0 0 20px rgba(0,229,255,0.3)" : "none",
            }}
          >
            Pay &amp; Play
          </button>
        </div>
      </div>
    </div>
  );
}
