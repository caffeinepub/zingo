import type { backendInterface } from "../backend.d";
/**
 * Thin wrapper around the backend actor for direct (non-hook) calls.
 * Uses anonymous actor (no identity) for read operations and game submissions.
 */
import { createActorWithConfig } from "../config";

let actorCache: backendInterface | null = null;

async function getActor(): Promise<backendInterface> {
  if (!actorCache) {
    actorCache = await createActorWithConfig();
  }
  return actorCache;
}

export const backend = {
  async getCallerUserProfile() {
    const actor = await getActor();
    return actor.getCallerUserProfile();
  },
  async claimDailyLoginReward() {
    const actor = await getActor();
    return actor.claimDailyLoginReward();
  },
  async getDailyChallenges() {
    const actor = await getActor();
    return actor.getDailyChallenges();
  },
  async completeChallenge(id: string) {
    const actor = await getActor();
    return actor.completeChallenge(id);
  },
  async getWeeklyLeaderboard() {
    const actor = await getActor();
    return actor.getWeeklyLeaderboard();
  },
  async getHighScore(gameName: string) {
    const actor = await getActor();
    return actor.getHighScore(gameName);
  },
  async submitGameResult(
    gameName: string,
    score: bigint,
    coinsEarned: bigint,
    xpEarned: bigint,
  ) {
    const actor = await getActor();
    return actor.submitGameResult(gameName, score, coinsEarned, xpEarned);
  },
  async spinAndWin() {
    const actor = await getActor();
    return actor.spinAndWin();
  },
  async setLanguagePreference(language: string) {
    const actor = await getActor();
    return actor.setLanguagePreference(language);
  },
  async getLanguagePreference() {
    const actor = await getActor();
    return actor.getLanguagePreference();
  },
};
