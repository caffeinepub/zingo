import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    xp: bigint;
    principal: Principal;
    rank: string;
}
export interface DailyChallenge {
    id: string;
    targetScore: bigint;
    completed: boolean;
    rewardCoins: bigint;
    description: string;
}
export interface UserProfile {
    xp: bigint;
    gamesPlayed: bigint;
    weeklyXP: bigint;
    coins: bigint;
    rank: string;
    language: string;
    lastSpinDate: bigint;
    lastLogin: bigint;
    dailyStreak: bigint;
}
export interface HighScore {
    score: bigint;
    gameName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimDailyLoginReward(): Promise<{
        coinsAwarded: bigint;
        currentStreak: bigint;
    }>;
    completeChallenge(challengeId: string): Promise<{
        rewardCoins: bigint;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyChallenges(): Promise<Array<DailyChallenge>>;
    getHighScore(gameName: string): Promise<HighScore | null>;
    getLanguagePreference(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyLeaderboard(): Promise<Array<LeaderboardEntry>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setLanguagePreference(language: string): Promise<void>;
    spinAndWin(): Promise<{
        rewardCoins: bigint;
    }>;
    submitGameResult(gameName: string, score: bigint, coinsEarned: bigint, xpEarned: bigint): Promise<void>;
    updateUserProfile(profile: UserProfile): Promise<void>;
}
