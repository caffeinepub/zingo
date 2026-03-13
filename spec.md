# Zingo — 3D Neumorphic Design System

## Current State

Zingo is a fully functional multi-game app (Quiz, GK, Word Connect, Word Search, Speed Challenge, Spin & Win) with:
- Bright lavender-to-sky-blue gradient background
- White glass cards, purple primary accent, coral pink secondary
- Animated splash screen with orbiting multilingual letters and gold "ZINGO" text
- TopBar with XP, coins, rank, and language/settings access
- 2-column game card grid on HomeScreen
- All game logic intact and wired to Motoko backend

## Requested Changes (Diff)

### Add
- Complete 3D neumorphic design language: deep navy (#0d1b2a) and charcoal grey (#1e2d3d) base palette, neon-cyan (#00f5ff) as the sole interactive highlight color
- Neumorphic CSS utilities: `nm-surface`, `nm-pressed`, `nm-raised`, `nm-inset` classes that use dual-shadow technique (light shadow top-left, dark shadow bottom-right) for tactile 3D depth
- New SplashScreen: full-screen deep charcoal background, centered slow-motion 3D extrusion animation of "ZINGO" text using CSS 3D transforms and keyframe layering, soft diffuse light reveal effect, neon-cyan glow on the Z
- New app icon: the generated 3D neumorphic cube image (zingo-neomorphic-icon.dim_512x512.png) applied to favicon, manifest, and all icon references
- New 3D logo splash image (zingo-3d-logo-splash.dim_800x400.png) displayed during splash
- Neumorphic TopBar: deep navy surface with neumorphic profile avatar extrusion, cyan-highlighted XP bar, coin counter with subtle pressed state
- Neumorphic GameCard: raised 3D panel for each of the 6 game tiles in a 2-column grid, with neon-cyan border glow on active/hover state, icon rendered in a pressed inset circle
- Neumorphic Daily Reward modal: dark navy bottom sheet with neumorphic streak day indicators, cyan claim button
- Neumorphic Daily Challenges and Leaderboard screens: all list items and cards use `nm-raised` surface treatment

### Modify
- `index.css`: Replace all OKLCH tokens with deep navy/charcoal/cyan palette; replace `.zingo-bg` gradient; add neumorphic shadow utility classes and keyframe animations for the new splash (extrudeIn, glowReveal, cyanPulse)
- `App.tsx`: Update background wrapper to use new `zingo-bg` dark class
- `SplashScreen.tsx`: Full replacement — deep charcoal bg, 3D extrusion CSS animation for ZINGO text, neon-cyan Z highlight, soft light sweep, use 3D logo splash image, 2.5s total with smooth fade
- `HomeScreen.tsx`: Replace card colors and layout backgrounds with neumorphic classes; update daily reward modal to dark navy neumorphic style
- `TopBar.tsx`: Restyle to deep navy neumorphic surface
- `GameCard.tsx`: Full neumorphic raised card treatment
- `index.html`: Update favicon and manifest icon paths to new cube icon
- `manifest.json` (if present): Update icon paths

### Remove
- All lavender, sky-blue, coral-pink, bright-purple pastel color references from CSS and inline styles
- Confetti animation classes (no longer needed)
- Old splash animated orbiting letters and gold gradient ZINGO text

## Implementation Plan

1. Update `index.css` with new OKLCH tokens (dark navy base), neumorphic shadow utilities (`nm-raised`, `nm-pressed`, `nm-inset`, `nm-surface`), new keyframe animations (extrudeIn, glowReveal, cyanPulse, lightSweep), updated `.zingo-bg` to deep charcoal
2. Update `index.html` favicon references to new cube icon
3. Rewrite `SplashScreen.tsx` with 3D CSS extrusion animation for ZINGO, neon-cyan Z glow, deep charcoal background, use splash logo image
4. Rewrite `TopBar.tsx` with neumorphic navy surface, cyan XP bar, neumorphic avatar
5. Rewrite `GameCard.tsx` with neumorphic raised panel, inset icon circle, cyan hover glow
6. Update `HomeScreen.tsx` game array colors to cyan/navy, update daily reward modal to dark neumorphic style, update section labels
7. Update `App.tsx` background wrapper class
8. Apply neumorphic styling to `DailyChallengesScreen.tsx` and `LeaderboardScreen.tsx` list items
9. Validate: typecheck, lint, build
