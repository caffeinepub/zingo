import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";

export function InterstitialAd() {
  const { showInterstitial, dismissInterstitial } = useGame();
  const [countdown, setCountdown] = useState(3);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!showInterstitial) {
      setCountdown(3);
      setCanSkip(false);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showInterstitial]);

  if (!showInterstitial) return null;

  return (
    <div
      data-ocid="interstitial.modal"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div className="bg-white rounded-3xl p-8 mx-6 text-center shadow-modal max-w-xs w-full pop-in">
        <div className="text-4xl mb-3">📱</div>
        <h3 className="text-lg font-bold text-foreground mb-2">
          Short break...
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Ad plays here</p>
        <div className="w-full bg-gray-100 rounded-xl h-20 flex items-center justify-center mb-6">
          <span className="text-xs text-gray-400 tracking-wide uppercase">
            Advertisement Zone
          </span>
        </div>
        {canSkip ? (
          <button
            type="button"
            data-ocid="interstitial.close_button"
            onClick={dismissInterstitial}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-2xl active:scale-95 transition-transform"
          >
            Continue Playing
          </button>
        ) : (
          <div className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-2xl text-center">
            Skip in {countdown}s
          </div>
        )}
      </div>
    </div>
  );
}
