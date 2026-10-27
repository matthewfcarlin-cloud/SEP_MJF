# RECO on TestFlight: what has to happen, and who does it

_2026-10-26 · pairs with [mvp-plan.md](mvp-plan.md) and `app/apps/mobile/README.md`_

Two kinds of testers exist on TestFlight and they need different things:

| | Internal testers | External testers |
|---|---|---|
| Who | Up to 100 people who are members of your App Store Connect team | Up to 10,000 people, by email invite or a public link |
| Apple review | None. Installable minutes after the build finishes processing. | A one-time Beta App Review of the first build (usually under 48 hours), then new builds are usually auto-approved |
| Needs | An App Store Connect app record and a processed build | Everything on the left plus a privacy policy URL, beta test information, export compliance and an App Privacy answer |

For a Monday demo with teammates, internal testing is enough. For athletes or PTs outside the team, you need external.

## Already done in the repo

- App name **RECO**, bundle id `com.recoapp.recovery`, version 0.1.0, build number 1, `eas.json` with `production` and `preview` profiles, `appVersionSource: remote` so EAS increments the build number.
- 1024 px icon without transparency (placeholder art), splash, dark splash background.
- Export compliance answered in the build: `ITSAppUsesNonExemptEncryption = false`, so TestFlight will not ask on every upload.
- No HealthKit, no tracking SDKs, no network calls from the app. App Privacy can be answered as **Data Not Collected**.
- A privacy policy page at `site/public/privacy/index.html`. Once the site deploys it is at `https://<your site domain>/privacy/`.

## Two ways to get a build to TestFlight

**Route A, Xcode only (chosen 2026-10-26).** No Expo account. Archive on this Mac from the non-iCloud checkout at `~/kinn-native` and upload from Xcode's Organizer. Needs only the paid Apple Developer account that already exists.

1. Bring the checkout to the latest commit and regenerate the native project (run by Claude, or by hand):
   ```bash
   cd ~/kinn-native && git checkout -- . && git checkout --detach main
   cd kinn/app && npm install && cd apps/mobile && rm -rf ios && npx expo prebuild --platform ios && open ios/RECO.xcworkspace
   ```
2. In Xcode: select the **RECO** target → **Signing & Capabilities** → tick *Automatically manage signing* → choose your **Team** (the paid account, not "Personal Team"). Xcode creates the App ID `com.recoapp.recovery` and a profile. If the bundle id is already taken by someone else, Xcode says so here; change `ios.bundleIdentifier` in `app.json`, rerun step 1.
3. Set the run destination to **Any iOS Device (arm64)**, then **Product → Archive**. First archive takes 5 to 10 minutes.
4. The Organizer opens with the archive. **Distribute App → TestFlight & App Store → Upload**, accept the defaults (Xcode manages signing). Sign in with your Apple ID if asked. Upload takes a few minutes; processing on Apple's side 5 to 30 more.
5. Create the app record first at appstoreconnect.apple.com → Apps → "+": iOS, name **RECO Knee Recovery** (the plain name "RECO" is taken on the App Store; the listing name must be unique store-wide, while the home-screen name stays RECO), English (U.S.), bundle id `com.recoapp.recovery`, SKU `reco-ios`. Letting Xcode create the record fails with "App Name you entered is already being used".
6. Each later build: pull latest into `~/kinn-native`, bump `ios.buildNumber` in `app.json` (Xcode rejects a repeat), `npx expo prebuild --platform ios`, Archive, Upload.

**Route B, EAS (cloud, needs a free Expo account).** Kept for when nobody has a Mac with Xcode handy.

1. **Check the bundle id is free.** In [App Store Connect](https://appstoreconnect.apple.com) → Apps → "+" → New App, try bundle id `com.recoapp.recovery`. If Apple says it is taken, pick `com.reco.recovery` (or similar) and change `ios.bundleIdentifier` and `android.package` in `app.json` before the next step. Do not create the app record yet; `eas submit` can create it for you, or create it here with name **RECO**, platform iOS, primary language English (U.S.), SKU `reco-ios`.

2. **Log in to Expo and link the project.**
   ```bash
   cd kinn/app/apps/mobile
   npx eas-cli@latest login
   npx eas-cli@latest init
   ```
   `init` writes `extra.eas.projectId` into `app.json`. Commit that change.

3. **First cloud build.** This asks you to sign in with your Apple ID once, then creates the distribution certificate and provisioning profile on your Developer account.
   ```bash
   npx eas-cli@latest build --platform ios --profile production
   ```
   Expect 10 to 25 minutes in the free queue. The result is an `.ipa` on EAS.

4. **Submit to TestFlight.**
   ```bash
   npx eas-cli@latest submit --platform ios --latest
   ```
   The first time it asks for the App Store Connect app (choose the record from step 1 or let it create one) and for an App Store Connect API key or your Apple ID. Processing on Apple's side takes 5 to 30 minutes; you get an email when the build is ready.

5. **Internal testers (team).** App Store Connect → Users and Access → add each teammate with any role (Developer is enough), then TestFlight → Internal Testing → "+" group → add them and tick the build. They get an email, install TestFlight, and the app appears.

6. **External testers (athletes, PTs).** TestFlight → External Testing → "+" group. Fill in:
   - **Beta App Description**: "RECO is a knee-recovery companion for athletes coming back from ACL and meniscus injuries. Log activity, pain and morning check-ins; see what tends to come before a flare-up; share a weekly summary with your PT. This beta runs on sample data you can reset from Settings."
   - **Feedback email**: yours.
   - **Privacy Policy URL**: `https://<your site domain>/privacy/` after the site deploys.
   - **What to Test**: the demo path. Open the app, answer the morning questions, log a pain, look at Insights and Progress, share a report.
   - **Review notes**: "No login required. Sample data is preloaded. Settings → Reset to sample data restores it."
   Add the build, submit for Beta App Review. After approval, share the public link or add emails.

7. **App Privacy** (App Store Connect → App Privacy): answer **Data Not Collected**. This is accurate: the app has no server, no analytics and no identifiers.

## Each new build after that (Route B)

```bash
cd kinn/app/apps/mobile
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

The build number increments on EAS; testers see an update in TestFlight within the hour. Bump `version` in `app.json` (0.1.0 → 0.2.0) when you want testers to see a new version line.

## Things that would block Beta App Review

- A privacy policy URL that 404s. Deploy the site change before submitting the external group.
- Placeholder icon. Apple accepts it for TestFlight, but replace it when the RECO mark exists.
- The app opening on a blank screen. It does not; it opens on onboarding with "Use the sample athlete instead" as the shortcut.
- Medical claims. Copy is tested against the banned-words list; the disclaimer is in Settings and the share text.

## Not needed for TestFlight

- App Store screenshots, description, keywords, age rating: those are for the public App Store submission, not for TestFlight.
- An Expo account, if you use Route A.

## Before public App Store release (later)

Real icon, screenshots on 6.7" and 6.1" devices, age rating questionnaire (answer "Infrequent/Mild Medical/Treatment Information" for the pain scale), support URL, and a decision on whether sample data ships at all.
