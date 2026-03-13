import { useEffect, useRef } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const ZINGO_LETTERS = [
  { char: "Z", delay: "0s", isCyan: true },
  { char: "I", delay: "0.12s", isCyan: false },
  { char: "N", delay: "0.24s", isCyan: false },
  { char: "G", delay: "0.36s", isCyan: false },
  { char: "O", delay: "0.48s", isCyan: false },
];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.opacity = "0";
        containerRef.current.style.transition = "opacity 0.7s ease";
      }
      setTimeout(onComplete, 700);
    }, 3200);
    return () => clearTimeout(fadeTimer);
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      data-ocid="splash.screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #080f18 0%, #0d1b2a 60%, #111e2e 100%)",
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes extrudeIn {
            0% {
              opacity: 0;
              transform: perspective(600px) translateZ(-60px) translateY(30px) scale(0.8);
            }
            60% {
              opacity: 1;
              transform: perspective(600px) translateZ(4px) translateY(-2px) scale(1.03);
            }
            100% {
              opacity: 1;
              transform: perspective(600px) translateZ(0px) translateY(0px) scale(1);
            }
          }

          @keyframes cyanPulse {
            0%, 100% {
              text-shadow: 0 0 12px rgba(0,229,255,0.6), 0 0 30px rgba(0,229,255,0.3), 0 0 50px rgba(0,229,255,0.1);
            }
            50% {
              text-shadow: 0 0 24px rgba(0,229,255,1), 0 0 50px rgba(0,229,255,0.6), 0 0 80px rgba(0,229,255,0.3);
            }
          }

          @keyframes floatY {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes lightSweep {
            0% {
              transform: translateX(-120%) skewX(-20deg);
              opacity: 0;
            }
            20% { opacity: 0.5; }
            100% {
              transform: translateX(220%) skewX(-20deg);
              opacity: 0;
            }
          }

          @keyframes subtitleFadeIn {
            0% { opacity: 0; transform: translateY(12px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes iconReveal {
            0% { opacity: 0; transform: scale(0.6); }
            60% { opacity: 1; transform: scale(1.06); }
            80% { transform: scale(0.97); }
            100% { opacity: 1; transform: scale(1); }
          }

          .splash-letter-wrap {
            animation: extrudeIn 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both;
          }

          .splash-letter-cyan {
            animation: extrudeIn 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both,
                       cyanPulse 2.2s ease-in-out 1.2s infinite;
          }

          .splash-icon {
            animation: iconReveal 0.8s cubic-bezier(0.34, 1.4, 0.64, 1) 0.1s both,
                       floatY 3s ease-in-out 1s infinite;
          }

          .splash-subtitle {
            animation: subtitleFadeIn 0.6s ease-out 1.2s both;
          }

          .splash-badges {
            animation: subtitleFadeIn 0.6s ease-out 1.5s both;
          }

          .splash-sweep {
            animation: lightSweep 1.8s ease-in-out 0.4s both;
          }
        }

        /* Immediate fallback for reduced-motion users */
        @media (prefers-reduced-motion: reduce) {
          .splash-letter-wrap,
          .splash-letter-cyan,
          .splash-icon,
          .splash-subtitle,
          .splash-badges {
            opacity: 1 !important;
          }
        }

        /* Shadow text layers for 3D extrusion illusion */
        .nm-text-3d {
          -webkit-text-stroke: 0.5px rgba(32, 50, 71, 0.8);
          filter: drop-shadow(2px 3px 6px rgba(7, 14, 23, 0.8)) drop-shadow(-1px -1px 3px rgba(32, 50, 71, 0.4));
        }

        .nm-text-cyan {
          color: #00e5ff;
          -webkit-text-stroke: 0.5px rgba(0, 100, 150, 0.4);
          filter: drop-shadow(2px 3px 6px rgba(7, 14, 23, 0.8)) drop-shadow(-1px -1px 3px rgba(0, 80, 120, 0.3));
        }
      `}</style>

      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow orb behind logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -58%)",
        }}
      />

      {/* Center content */}
      <div
        className="flex flex-col items-center gap-6 relative z-10"
        style={{ perspective: "800px" }}
      >
        {/* App icon */}
        <div className="splash-icon relative">
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: "#162233",
              boxShadow:
                "8px 8px 20px #070e17, -5px -5px 14px #203247, 0 0 30px rgba(0,229,255,0.15)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/assets/generated/zingo-neomorphic-icon-v2.dim_512x512.png"
              alt="Zingo"
              style={{ width: 104, height: 104, objectFit: "contain" }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
                const parent = img.parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<span style="font-size:3.5rem;font-weight:900;color:#00e5ff;text-shadow:0 0 20px rgba(0,229,255,0.8),0 0 40px rgba(0,229,255,0.4)">Z</span>';
                }
              }}
            />
          </div>
          {/* Cyan border glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 28,
              border: "1px solid rgba(0,229,255,0.2)",
              boxShadow:
                "0 0 20px rgba(0,229,255,0.2), inset 0 0 20px rgba(0,229,255,0.05)",
            }}
          />
        </div>

        {/* ZINGO 3D extruding text */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            perspective: "600px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {ZINGO_LETTERS.map((letter) => (
            <span
              key={letter.char}
              className={
                letter.isCyan ? "splash-letter-cyan" : "splash-letter-wrap"
              }
              style={{
                animationDelay: letter.delay,
                fontSize: "clamp(3rem, 18vw, 5rem)",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "0.02em",
                display: "inline-block",
                fontFamily: "Outfit, system-ui, sans-serif",
              }}
            >
              <span
                className={letter.isCyan ? "nm-text-cyan" : "nm-text-3d"}
                style={{
                  display: "block",
                  color: letter.isCyan ? "#00e5ff" : "#e2eaf4",
                }}
              >
                {letter.char}
              </span>
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="splash-subtitle"
          style={{
            color: "#5a7490",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          Play &bull; Win &bull; Explore
        </p>

        {/* Language badges */}
        <div
          className="splash-badges"
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { text: "EN", color: "#00e5ff" },
            { text: "ಕ", color: "#00c4e0" },
            { text: "हि", color: "#00e5ff" },
            { text: "తె", color: "#00c4e0" },
            { text: "த", color: "#00e5ff" },
          ].map((badge) => (
            <span
              key={badge.text}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: 900,
                background: "#162233",
                color: badge.color,
                border: "1px solid rgba(0,229,255,0.2)",
                boxShadow: "2px 2px 6px #070e17, -1px -1px 4px #203247",
              }}
            >
              {badge.text}
            </span>
          ))}
        </div>
      </div>

      {/* Light sweep bar at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
        style={{ height: 2 }}
      >
        <div
          className="splash-sweep absolute inset-0"
          style={{
            width: "40%",
            background:
              "linear-gradient(90deg, transparent, rgba(0,229,255,0.6), transparent)",
          }}
        />
      </div>
    </div>
  );
}
