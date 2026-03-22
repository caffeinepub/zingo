# Zingo — Economy & Progression Upgrade

## Current State
- 6 games: Quiz, GK, Word Connect, Word Search, Speed Challenge, Spin & Win
- Coin/XP system in GameContext (addCoins, addXP)
- Dark glass UI on all screens
- 5-language support
- Daily challenges, leaderboard, daily streak reward
- No entry fees, no shop, no spend mechanics
- No game result screen, no level unlock gate
- Rewarded ad button exists but no cooldown

## Requested Changes (Diff)

### Add
- **Shop screen** accessible from home: Hint (30c), Extra Life (50c), Double Reward (100c), Spin Token (80c) — deduct coins with animation feedback
- **Entry fee gate** before each game: Quiz=10c, Word games=15c, Advanced=20c — show modal "Spend X coins to play?"
- **Win/Lose result screen** (modal) after every game — shows score, coins/XP earned, Retry (Watch Ad) or Exit options
- **Level system**: Beginner→Intermediate→Pro→Master based on XP (0/500/1500/3000), shown on home with XP bar
- **Game unlock system**: Quiz always unlocked; Word Connect=Intermediate; Speed Challenge=Pro; Spin & Win=Master — show lock icon + level needed
- **Rewarded ad cooldown**: 2-minute cooldown tracked in state, disable button during cooldown with countdown
- **Invite & Earn**: Share button on home — copies link + shows "Earn 30 coins" prompt, award coins on share
- **Result sharing**: "I scored X/10 in Zingo 🔥" WhatsApp share button on result screen
- **spendCoins** function in GameContext that returns false if insufficient coins
- **Ad cooldown state** in GameContext (lastAdTime, isAdOnCooldown)
- **Shop screen component** (`ShopScreen.tsx`)
- **GameResultModal component** shown after game ends

### Modify
- **Daily streak rewards**: Day1=30c, Day2=50c, Day3=70c, Day7=150c (reset if skip)
- **Coin earning**: Win=+20c/+20XP, Average=+10c/+10XP, Lose=+2c/+5XP, Daily mission=+30-50c/+40XP, Watch Ad=+50c
- **GameContext**: add spendCoins, level (1-4 from XP), isAdOnCooldown, lastAdTime, shopItems state
- **HomeScreen**: add Shop button, Invite & Earn button, level + XP progress display, lock icons on locked games
- **TopBar**: show level badge beside rank
- **All game components**: call spendCoins before game starts; show GameResultModal on game end
- **RewardedAdButton**: enforce 2-min cooldown, reward 50 coins only
- **Screen type**: add "shop" to Screen union

### Remove
- Unlimited free rewards / unlimited ad watching

## Implementation Plan
1. Update GameContext: add spendCoins, level calc, ad cooldown, shop inventory state
2. Update Screen type and App.tsx routing to include "shop"
3. Create ShopScreen.tsx with 4 purchasable items
4. Create GameResultModal.tsx (win/lose overlay with share + retry)
5. Update HomeScreen: level display, XP bar, lock gates, Shop + Invite buttons
6. Update all 6 game components: entry fee modal + GameResultModal on finish
7. Update RewardedAdButton: 2-min cooldown, 50c reward
8. Update daily reward values in DailyChallengesScreen/HomeScreen
9. Update TopBar to show level badge
