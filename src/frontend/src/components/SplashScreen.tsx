import { useEffect, useRef } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const CONFETTI = [
  { color: "#A78BFA", size: 10, left: "10%", delay: "0s", duration: "3.5s" },
  { color: "#F472B6", size: 8, left: "20%", delay: "0.3s", duration: "4s" },
  { color: "#60A5FA", size: 12, left: "30%", delay: "0.6s", duration: "3.2s" },
  { color: "#34D399", size: 8, left: "45%", delay: "0.1s", duration: "3.8s" },
  { color: "#FBBF24", size: 10, left: "55%", delay: "0.5s", duration: "3.6s" },
  { color: "#F87171", size: 9, left: "65%", delay: "0.2s", duration: "4.2s" },
  { color: "#818CF8", size: 11, left: "75%", delay: "0.7s", duration: "3.4s" },
  { color: "#2DD4BF", size: 8, left: "85%", delay: "0.4s", duration: "3.9s" },
  { color: "#FB923C", size: 10, left: "92%", delay: "0.8s", duration: "3.7s" },
  { color: "#C084FC", size: 12, left: "5%", delay: "0.9s", duration: "4.1s" },
];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.opacity = "0";
        containerRef.current.style.transform = "scale(1.03)";
        containerRef.current.style.transition =
          "opacity 0.5s ease, transform 0.5s ease";
      }
      setTimeout(onComplete, 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      data-ocid="splash.screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #8B5CF6 0%, #6366F1 40%, #3B82F6 100%)",
      }}
    >
      {/* Confetti dots */}
      {CONFETTI.map((dot) => (
        <div
          key={`${dot.left}-${dot.color}`}
          className="confetti-dot"
          style={{
            backgroundColor: dot.color,
            width: dot.size,
            height: dot.size,
            left: dot.left,
            bottom: "-20px",
            animationDelay: dot.delay,
            animationDuration: dot.duration,
          }}
        />
      ))}

      {/* Logo area */}
      <div className="flex flex-col items-center gap-4 fade-in">
        {/* Logo image */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-40"
            style={{
              background: "rgba(255,255,255,0.3)",
              transform: "scale(1.5)",
            }}
          />
          <img
            src="/assets/generated/zingo-logo-transparent.dim_400x160.png"
            alt="Zingo"
            className="w-48 h-auto relative z-10 drop-shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* App name fallback / hero text */}
        <h1
          className="text-7xl font-black tracking-tight text-white drop-shadow-lg"
          style={{ textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
        >
          Zingo
        </h1>

        {/* Tagline */}
        <p className="text-white/80 text-lg font-medium tracking-widest">
          Play • Win • Enjoy
        </p>

        {/* Loading dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              style={{
                animation: "coinPulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
