# RECO mobile (rough MVP)

Expo SDK 58 app for the RECO manual-log demo. Domain logic lives in `../../packages/core` (`@reco/core`); this app is screens, a small store and placeholder design tokens.

## Run it

```bash
npm install            # from kinn/app
npm test               # core tests, includes the copy banned-words check
cd apps/mobile
npx expo start --ios   # Expo Go on the booted simulator (local notifications are limited in Expo Go)
npx expo run:ios       # development build on the simulator (full notifications); needs Xcode + CocoaPods
```

First launch shows onboarding. "Use the sample athlete instead" loads the 21-day seed (Maya, ACL week 8). Settings (gear on Today) has "Reset to sample data".

## Where things are

| What | Where |
|---|---|
| Colours, type, spacing (placeholders until the Figma palette lands) | `src/theme/tokens.ts` |
| Every screen string | `src/copy.ts` (checked by `packages/core/test/copy/mobile-copy.test.ts`) |
| Store (AsyncStorage, reducer, derived view) | `src/store/` |
| Screens | `src/app/(tabs)/*.tsx` tabs, `src/app/{pain,settle,checkin,onboarding,settings}.tsx` modals |
| UI primitives | `src/components/ui/` |
| "Did it settle?" notification | `src/notifications.ts` |
| Seed data, status rules, insights, report text | `../../packages/core/src/{sim,manual,report}` |

## Web build (the site's /try)

```bash
npx expo export --platform web --output-dir /tmp/reco-web   # static, base path /try (app.json → web.output, experiments.baseUrl)
```

Copy the output to `kinn/site/public/try/`. The web build uses `src/app/(tabs)/_layout.web.tsx` (bottom tabs, SVG icons) instead of NativeTabs, and gains the `/tape` screen: pair a RECO tape over Web Bluetooth (Chrome/Edge) or run the simulated tape. Protocol, simulator and client are in `@reco/core` (`src/tape/`); the Web Bluetooth transport is `src/tape/web-bluetooth.ts`.

Known: the browser console shows one React hydration warning (#418) per page load. It comes from a `<Suspense>` boundary that expo-router's static render leaves out; React re-renders on the client and the app works. Not ours to fix.

## TestFlight (EAS)

One-time, by whoever owns the Apple Developer account (these prompts need your Expo and Apple logins, so run them yourself):

```bash
cd kinn/app/apps/mobile
npx eas-cli@latest login
npx eas-cli@latest init            # creates the EAS project and writes extra.eas.projectId into app.json
```

Then each build:

```bash
npx eas-cli@latest build --platform ios --profile production   # cloud build, signs with your Apple account (prompts the first time)
npx eas-cli@latest submit --platform ios --latest              # uploads to TestFlight
```

Internal testers (your App Store Connect team) can install as soon as processing finishes, no Apple review. External testers need one beta review.

### Direct install without TestFlight

This repo sits in the iCloud-synced Desktop, and iCloud's Finder attributes break code signing of frameworks built inside it. Native builds therefore run from a second checkout outside iCloud (a detached git worktree at `~/kinn-native`). Bring it up to date, plug in an iPhone, then:

```bash
cd ~/kinn-native && git checkout -- . && git checkout --detach main && cd kinn/app && npm install && cd apps/mobile
npx expo run:ios --device
```

Pick the phone from the list. Xcode signs with your Apple ID (free personal team works for 7 days; the paid team has no expiry). If signing fails, open `ios/RECO.xcworkspace` in Xcode, select the RECO target, Signing & Capabilities, choose your team, and run once from Xcode.
