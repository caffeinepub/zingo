import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { DailyChallengesScreen } from "./components/DailyChallengesScreen";
import { GKGame } from "./components/GKGame";
import { HomeScreen } from "./components/HomeScreen";
import { InterstitialAd } from "./components/InterstitialAd";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { QuizGame } from "./components/QuizGame";
import { SpeedChallengeGame } from "./components/SpeedChallengeGame";
import { SpinAndWin } from "./components/SpinAndWin";
import { SplashScreen } from "./components/SplashScreen";
import { WordConnectGame } from "./components/WordConnectGame";
import { WordSearchGame } from "./components/WordSearchGame";
import { GameProvider, useGame } from "./context/GameContext";

function AppInner() {
  const { screen, navigate } = useGame();
  const [visible, setVisible] = useState(true);

  // Animate on screen change
  // biome-ignore lint/correctness/useExhaustiveDependencies: screen change triggers animation
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [screen]);

  const renderScreen = () => {
    switch (screen) {
      case "splash":
        return <SplashScreen onComplete={() => navigate("home")} />;
      case "home":
        return <HomeScreen />;
      case "quiz":
        return <QuizGame />;
      case "gk":
        return <GKGame />;
      case "wordConnect":
        return <WordConnectGame />;
      case "wordSearch":
        return <WordSearchGame />;
      case "speedChallenge":
        return <SpeedChallengeGame />;
      case "spinWin":
        return <SpinAndWin />;
      case "leaderboard":
        return <LeaderboardScreen />;
      case "dailyChallenges":
        return <DailyChallengesScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      {screen === "splash" ? (
        renderScreen()
      ) : (
        <div className="zingo-bg min-h-screen flex justify-center">
          <div
            className="w-full max-w-md min-h-screen flex flex-col relative"
            style={{ overflowX: "hidden" }}
          >
            {/* Background decoration */}
            <div
              className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none"
              style={{
                height: "100vh",
                background:
                  "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(139,92,246,0.12) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />

            {/* Content */}
            <main
              className="flex-1 flex flex-col relative z-10 px-4 pt-4 pb-6"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              {renderScreen()}
            </main>
          </div>
        </div>
      )}
      <InterstitialAd />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
