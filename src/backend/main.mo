import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module UserProfile {
    public func compare(x : UserProfile, y : UserProfile) : Order.Order {
      Nat.compare(y.weeklyXP, x.weeklyXP);
    };
  };

  public type UserProfile = {
    coins : Nat;
    xp : Nat;
    rank : Text;
    dailyStreak : Nat;
    lastLogin : Int;
    weeklyXP : Nat;
    language : Text;
    gamesPlayed : Nat;
    lastSpinDate : Int;
  };

  type GameResult = {
    gameName : Text;
    score : Nat;
    coinsEarned : Nat;
    xpEarned : Nat;
  };

  type HighScore = {
    gameName : Text;
    score : Nat;
  };

  type DailyChallenge = {
    id : Text;
    description : Text;
    targetScore : Nat;
    rewardCoins : Nat;
    completed : Bool;
  };

  type LeaderboardEntry = {
    principal : Principal;
    xp : Nat;
    rank : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let highScores = Map.empty<Principal, Map.Map<Text, HighScore>>();
  let dailyChallenges = Map.empty<Principal, List.List<DailyChallenge>>();
  let gameResults = Map.empty<Principal, List.List<GameResult>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Get caller's user profile (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get any user's profile (admin or self only)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's user profile (required by frontend)
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Legacy function - kept for backward compatibility
  public shared ({ caller }) func updateUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Initialize or get user profile
  func getOrCreateProfile(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile = {
          coins = 0;
          xp = 0;
          rank = "Beginner";
          dailyStreak = 0;
          lastLogin = 0;
          weeklyXP = 0;
          language = "en";
          gamesPlayed = 0;
          lastSpinDate = 0;
        };
        userProfiles.add(caller, newProfile);
        newProfile;
      };
      case (?profile) { profile };
    };
  };

  // Submit game result
  public shared ({ caller }) func submitGameResult(gameName : Text, score : Nat, coinsEarned : Nat, xpEarned : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit game results");
    };

    let result : GameResult = { gameName; score; coinsEarned; xpEarned };
    let existingResults = switch (gameResults.get(caller)) {
      case (null) { List.empty<GameResult>() };
      case (?results) { results };
    };
    existingResults.add(result);
    gameResults.add(caller, existingResults);

    // Update high score
    let userHighScores = switch (highScores.get(caller)) {
      case (null) { Map.empty<Text, HighScore>() };
      case (?scores) { scores };
    };
    let existingScore = switch (userHighScores.get(gameName)) {
      case (null) { 0 };
      case (?score) { score.score };
    };
    if (score > existingScore) {
      userHighScores.add(gameName, { gameName; score });
      highScores.add(caller, userHighScores);
    };

    // Update user coins and XP
    let profile = getOrCreateProfile(caller);
    let newXP = profile.xp + xpEarned;
    userProfiles.add(
      caller,
      {
        profile with
        coins = profile.coins + coinsEarned;
        xp = newXP;
        rank = calculateRank(newXP);
        weeklyXP = profile.weeklyXP + xpEarned;
        gamesPlayed = profile.gamesPlayed + 1;
      },
    );
  };

  // Get high score for a game
  public query ({ caller }) func getHighScore(gameName : Text) : async ?HighScore {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get high scores");
    };
    switch (highScores.get(caller)) {
      case (null) { null };
      case (?scores) { scores.get(gameName) };
    };
  };

  // Claim daily login reward
  public shared ({ caller }) func claimDailyLoginReward() : async { coinsAwarded : Nat; currentStreak : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim rewards");
    };
    let now = Time.now();
    let day = now / (24 * 60 * 60 * 1000000000);

    let profile = getOrCreateProfile(caller);
    let lastLoginDay = profile.lastLogin / (24 * 60 * 60 * 1000000000);
    
    if (lastLoginDay == day) {
      Runtime.trap("Daily reward already claimed today");
    };

    let newStreak = if (day - lastLoginDay == 1) { 
      profile.dailyStreak + 1 
    } else {
      1;
    };
    
    let effectiveStreak = if (newStreak > 7) { 7 } else { newStreak };
    let coinsAwarded = switch (effectiveStreak) {
      case (1) { 50 };
      case (2) { 75 };
      case (3) { 100 };
      case (4) { 125 };
      case (5) { 150 };
      case (6) { 175 };
      case (7) { 300 };
      case (_) { 50 };
    };
    
    userProfiles.add(
      caller,
      {
        profile with
        coins = profile.coins + coinsAwarded;
        dailyStreak = if (newStreak > 7) { 1 } else { newStreak };
        lastLogin = now;
      },
    );
    { coinsAwarded; currentStreak = newStreak };
  };

  // Get daily challenges
  public query ({ caller }) func getDailyChallenges() : async [DailyChallenge] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get daily challenges");
    };
    switch (dailyChallenges.get(caller)) {
      case (null) {
        let challenges = List.empty<DailyChallenge>();
        challenges.toArray();
      };
      case (?challenges) {
        challenges.toArray();
      };
    };
  };

  // Complete daily challenge
  public shared ({ caller }) func completeChallenge(challengeId : Text) : async { rewardCoins : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete challenges");
    };
    switch (dailyChallenges.get(caller)) {
      case (null) { Runtime.trap("No daily challenges found") };
      case (?challenges) {
        let challengeArray = challenges.toArray();
        let challengeOpt = challengeArray.find(func(c) { c.id == challengeId });
        let challenge = switch (challengeOpt) {
          case (null) { Runtime.trap("Challenge not found") };
          case (?c) { c };
        };
        
        if (challenge.completed) {
          Runtime.trap("Challenge already completed");
        };

        let updatedChallenges = challenges.map<DailyChallenge, DailyChallenge>(
          func(c) { if (c.id == challengeId) { { c with completed = true } } else { c } }
        );
        dailyChallenges.add(caller, updatedChallenges);
        
        let profile = getOrCreateProfile(caller);
        userProfiles.add(
          caller,
          {
            profile with
            coins = profile.coins + challenge.rewardCoins;
          },
        );
        { rewardCoins = challenge.rewardCoins };
      };
    };
  };

  // Get weekly leaderboard - public access (no auth required)
  public query func getWeeklyLeaderboard() : async [LeaderboardEntry] {
    let entries = List.empty<LeaderboardEntry>();
    userProfiles.entries().forEach(
      func((principal, profile)) {
        entries.add({ principal; xp = profile.weeklyXP; rank = profile.rank });
      }
    );
    let sortedEntries = entries.toArray().sort(
      func(a, b) { Nat.compare(b.xp, a.xp) }
    );
    let topCount = Nat.min(20, sortedEntries.size());
    Array.tabulate<LeaderboardEntry>(topCount, func(i) { sortedEntries[i] });
  };

  // Spin & Win
  public shared ({ caller }) func spinAndWin() : async { rewardCoins : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play spin & win");
    };
    let now = Time.now();
    let day = now / (24 * 60 * 60 * 1000000000);
    
    let profile = getOrCreateProfile(caller);
    let lastSpinDay = profile.lastSpinDate / (24 * 60 * 60 * 1000000000);

    if (lastSpinDay == day) { 
      Runtime.trap("Already spun today") 
    };

    let rewardValues = [10, 25, 50, 100, 200];
    let randomIndex = Int.abs(now) % rewardValues.size();
    let coinsAwarded = rewardValues[randomIndex];

    userProfiles.add(
      caller,
      {
        profile with
        coins = profile.coins + coinsAwarded;
        lastSpinDate = now;
      },
    );

    { rewardCoins = coinsAwarded };
  };

  // Set language preference
  public shared ({ caller }) func setLanguagePreference(language : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save language preference");
    };
    let profile = getOrCreateProfile(caller);
    userProfiles.add(
      caller,
      {
        profile with
        language;
      },
    );
  };

  // Get language preference
  public query ({ caller }) func getLanguagePreference() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get language preference");
    };
    switch (userProfiles.get(caller)) {
      case (null) { "en" };
      case (?profile) { profile.language };
    };
  };

  func calculateRank(xp : Nat) : Text {
    if (xp >= 10000) { "Legend" } else if (xp >= 4000) {
      "Champion";
    } else if (xp >= 1500) { "Pro" } else if (xp >= 500) {
      "Player";
    } else { "Beginner" };
  };
};
