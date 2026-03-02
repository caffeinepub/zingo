import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Lang } from "../data/translations";
import { backend } from "../services/backendService";

export type Screen =
  | "splash"
  | "home"
  | "quiz"
  | "gk"
  | "wordConnect"
  | "wordSearch"
  | "speedChallenge"
  | "spinWin"
  | "leaderboard"
  | "dailyChallenges";

export interface GameContextValue {
  // Screen routing
  screen: Screen;
  navigate: (s: Screen) => void;

  // User stats
  coins: number;
  xp: number;
  rank: string;
  streak: number;
  gamesPlayed: number;
  weeklyXP: number;
  lastSpinDate: number;

  // Language
  language: Lang;
  setLanguage: (lang: Lang) => void;

  // Actions
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  incrementGamesPlayed: () => void;

  // Interstitial
  showInterstitial: boolean;
  dismissInterstitial: () => void;

  // Loading
  profileLoading: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

function getRank(xp: number): string {
  if (xp < 500) return "Beginner";
  if (xp < 1500) return "Player";
  if (xp < 3000) return "Pro";
  if (xp < 6000) return "Champion";
  return "Legend";
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("splash");
  const [coins, setCoins] = useState(0);
  const [xp, setXP] = useState(0);
  const [rank, setRank] = useState("Beginner");
  const [streak, setStreak] = useState(0);
  const [weeklyXP, setWeeklyXP] = useState(0);
  const [lastSpinDate, setLastSpinDate] = useState(0);
  const [gamesPlayedCount, setGamesPlayedCount] = useState(0);
  const [language, setLang] = useState<Lang>("en");
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Track games since last interstitial
  const gamesSinceAd = useRef(0);

  // Load profile on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await backend.getCallerUserProfile();
        if (!mounted) return;
        if (profile) {
          setCoins(Number(profile.coins));
          setXP(Number(profile.xp));
          setRank(profile.rank || getRank(Number(profile.xp)));
          setStreak(Number(profile.dailyStreak));
          setWeeklyXP(Number(profile.weeklyXP));
          setLastSpinDate(Number(profile.lastSpinDate));
          setGamesPlayedCount(Number(profile.gamesPlayed));
          if (profile.language === "kn" || profile.language === "en") {
            setLang(profile.language as Lang);
          }
        }
      } catch {
        // Use defaults for new/anonymous users
      } finally {
        if (mounted) setProfileLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const navigate = useCallback((s: Screen) => {
    setScreen(s);
  }, []);

  const addCoins = useCallback((amount: number) => {
    setCoins((prev) => prev + amount);
  }, []);

  const addXP = useCallback((amount: number) => {
    setXP((prev) => {
      const next = prev + amount;
      setRank(getRank(next));
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: Lang) => {
    setLang(lang);
    backend.setLanguagePreference(lang).catch(() => {});
  }, []);

  const incrementGamesPlayed = useCallback(() => {
    setGamesPlayedCount((prev) => prev + 1);
    gamesSinceAd.current += 1;
    if (gamesSinceAd.current >= 3) {
      gamesSinceAd.current = 0;
      setShowInterstitial(true);
    }
  }, []);

  const dismissInterstitial = useCallback(() => {
    setShowInterstitial(false);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      screen,
      navigate,
      coins,
      xp,
      rank,
      streak,
      weeklyXP,
      lastSpinDate,
      gamesPlayed: gamesPlayedCount,
      language,
      setLanguage,
      addCoins,
      addXP,
      incrementGamesPlayed,
      showInterstitial,
      dismissInterstitial,
      profileLoading,
    }),
    [
      screen,
      navigate,
      coins,
      xp,
      rank,
      streak,
      weeklyXP,
      lastSpinDate,
      gamesPlayedCount,
      language,
      setLanguage,
      addCoins,
      addXP,
      incrementGamesPlayed,
      showInterstitial,
      dismissInterstitial,
      profileLoading,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
