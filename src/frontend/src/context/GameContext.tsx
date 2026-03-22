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
  | "dailyChallenges"
  | "shop";

export interface ShopItems {
  hints: number;
  extraLives: number;
  doubleReward: boolean;
  spinTokens: number;
}

export interface GameContextValue {
  // Screen routing
  screen: Screen;
  navigate: (s: Screen) => void;

  // User stats
  coins: number;
  xp: number;
  rank: string;
  level: number;
  streak: number;
  gamesPlayed: number;
  weeklyXP: number;
  lastSpinDate: number;

  // Language
  language: Lang;
  setLanguage: (lang: Lang) => void;

  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXP: (amount: number) => void;
  incrementGamesPlayed: () => void;

  // Ad system
  lastAdTime: number;
  isAdOnCooldown: boolean;
  watchAd: () => void;

  // Shop
  shopItems: ShopItems;
  buyShopItem: (
    item: "hint" | "extraLife" | "doubleReward" | "spinToken",
  ) => boolean;

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
  if (xp < 1500) return "Intermediate";
  if (xp < 3000) return "Pro";
  return "Master";
}

function getLevel(xp: number): number {
  if (xp < 500) return 1;
  if (xp < 1500) return 2;
  if (xp < 3000) return 3;
  return 4;
}

const DEFAULT_SHOP: ShopItems = {
  hints: 0,
  extraLives: 0,
  doubleReward: false,
  spinTokens: 0,
};

function loadShop(): ShopItems {
  try {
    const saved = localStorage.getItem("zingo_shop");
    if (saved) return { ...DEFAULT_SHOP, ...JSON.parse(saved) };
  } catch {}
  return { ...DEFAULT_SHOP };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("splash");
  const [coins, setCoins] = useState(100); // start with some coins
  const [xp, setXP] = useState(0);
  const [rank, setRank] = useState("Beginner");
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [weeklyXP, setWeeklyXP] = useState(0);
  const [lastSpinDate, setLastSpinDate] = useState(0);
  const [gamesPlayedCount, setGamesPlayedCount] = useState(0);
  const [language, setLang] = useState<Lang>("en");
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [lastAdTime, setLastAdTime] = useState(0);
  const [shopItems, setShopItems] = useState<ShopItems>(loadShop);
  const [now, setNow] = useState(Date.now());

  // Track games since last interstitial
  const gamesSinceAd = useRef(0);

  // Update "now" every second for cooldown countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const isAdOnCooldown = now - lastAdTime < 120000;

  // Load profile on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await backend.getCallerUserProfile();
        if (!mounted) return;
        if (profile) {
          const c = Number(profile.coins);
          const x = Number(profile.xp);
          setCoins(c > 0 ? c : 100);
          setXP(x);
          setRank(getRank(x));
          setLevel(getLevel(x));
          setStreak(Number(profile.dailyStreak));
          setWeeklyXP(Number(profile.weeklyXP));
          setLastSpinDate(Number(profile.lastSpinDate));
          setGamesPlayedCount(Number(profile.gamesPlayed));
          if (["en", "kn", "hi", "te", "ta"].includes(profile.language)) {
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

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setCoins((prev) => {
      if (prev >= amount) {
        success = true;
        return prev - amount;
      }
      return prev;
    });
    return success;
  }, []);

  const addXP = useCallback((amount: number) => {
    setXP((prev) => {
      const next = prev + amount;
      setRank(getRank(next));
      setLevel(getLevel(next));
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

  const watchAd = useCallback(() => {
    setLastAdTime(Date.now());
    setCoins((prev) => prev + 50);
  }, []);

  const buyShopItem = useCallback(
    (item: "hint" | "extraLife" | "doubleReward" | "spinToken"): boolean => {
      const costs: Record<string, number> = {
        hint: 30,
        extraLife: 50,
        doubleReward: 100,
        spinToken: 80,
      };
      const cost = costs[item];
      let success = false;
      setCoins((prev) => {
        if (prev >= cost) {
          success = true;
          return prev - cost;
        }
        return prev;
      });
      if (success) {
        setShopItems((prev) => {
          const next = (() => {
            switch (item) {
              case "hint":
                return { ...prev, hints: prev.hints + 1 };
              case "extraLife":
                return { ...prev, extraLives: prev.extraLives + 1 };
              case "doubleReward":
                return { ...prev, doubleReward: true };
              case "spinToken":
                return { ...prev, spinTokens: prev.spinTokens + 1 };
            }
          })();
          localStorage.setItem("zingo_shop", JSON.stringify(next));
          return next;
        });
      }
      return success;
    },
    [],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      screen,
      navigate,
      coins,
      xp,
      rank,
      level,
      streak,
      weeklyXP,
      lastSpinDate,
      gamesPlayed: gamesPlayedCount,
      language,
      setLanguage,
      addCoins,
      spendCoins,
      addXP,
      incrementGamesPlayed,
      lastAdTime,
      isAdOnCooldown,
      watchAd,
      shopItems,
      buyShopItem,
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
      level,
      streak,
      weeklyXP,
      lastSpinDate,
      gamesPlayedCount,
      language,
      setLanguage,
      addCoins,
      spendCoins,
      addXP,
      incrementGamesPlayed,
      lastAdTime,
      isAdOnCooldown,
      watchAd,
      shopItems,
      buyShopItem,
      showInterstitial,
      dismissInterstitial,
      profileLoading,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
