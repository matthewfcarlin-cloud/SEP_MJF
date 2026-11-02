# RECO brand identity

_Version 1.0 · 2026-11-01 · Pairs with [vision.md](vision.md) (what RECO is) · Figma: "Kinn app — screens, flow and tokens" (file XBqAiK0KonAxgVsncFxkOW), pages Branding, V1 screens, Tokens_

This is the one place the brand is written down. The app reads its colours and type from `app/apps/mobile/src/theme/tokens.ts`, the site from the CSS variables at the top of `site/public/brand.css`. Both mirror this file. The logo files live in `kinn/brand/` and are copied to `site/public/brand/` and the app's `assets/`.

## 1. The idea in one sentence

**RECO makes the hours between PT visits visible.** Everything in the brand should feel like that: calm, measured, on your side, quietly confident. A team physio who knows more than you and tells you the truth.

| We are | We are not |
|---|---|
| Precise, calm, quietly confident | Loud, "beast mode" |
| Clinical but warm | A cold hospital |
| Evidence-led | Wellness-vague |
| Elite and understood | Gamified or cartoonish |
| On the patient's side | Policing the patient |

## 2. Name and lines

- **Name:** RECO, always in capitals. Never "Reco" or "reco" in running text. The App Store listing is "RECO Knee Recovery" because "RECO" alone is taken; the home-screen name is "RECO".
- **Tagline:** **Trust your comeback.**
- **Descriptor:** Recovery, measured.
- **Supporting line:** Built for the days your PT doesn't see.
- **One-liner (pitch, site hero sub-copy):** RECO is a smart tape and app that tracks your injured joint every day, shows your progress and what comes before your pain, and gives your PT the full picture between visits.

Campaign lines that are on brand: "Recovery, measured." · "Every day, accounted for." · "The other 160 hours." · "Your line, learned." · "Heal on data."

Lines from the exploration we do **not** use, and why:

| Line | Why not |
|---|---|
| Know when you're ready. | Implies a readiness or clearance call. RECO never clears anyone. |
| Back sooner. Back stronger. | An outcome we have not shown. "Sooner, with fewer setbacks" is a goal, written as a goal. |
| Recover like a pro. | Fine as a mood, but it narrows us to athletes. Use only in athlete campaigns. |
| Clinical-grade recovery monitor | "Clinical-grade" is a medical claim. |
| Recovered / Recovering / At risk (status names) | "At risk" is a risk prediction. The status system is in section 6. |

## 3. Logo

**The Sensor O.** The O in RECO is a ring readout: a faint full track with a live arc on top, the same shape as the recovery dial in the app and the LED ring on the coin. One shape is the wordmark, the app icon, the dial and the hardware.

| File (in `kinn/brand/`) | Use |
|---|---|
| `reco-wordmark-olive.svg` | Default on ceramic and paper |
| `reco-wordmark-ink.svg` | On white, print, documents |
| `reco-wordmark-ceramic.svg` | On olive, ink and photography |
| `reco-mark-olive.svg` | App icon, social avatar, favicon source |
| `reco-mark-ink.svg` | App icon dark variant, merch |
| `reco-mark-ceramic.svg` | On light surfaces where a filled tile is needed |
| `reco-mark-transparent.svg` | The ring alone, for the dial, the coin and motion |

Rules:
- Letters are Geist SemiBold, outlined, with tight tracking. Do not retype the wordmark.
- The arc always starts at 12 o'clock and runs clockwise. It ends at 9 o'clock in the logo (three quarters), which reads as "most of the way there", never full.
- The arc is the live colour: teal `#3DDBB8` on dark, deep teal `#1F8A72` on light. Never put the status colours in the logo.
- Clear space: the height of the O on every side. Minimum wordmark width 72 px on screen, 20 mm in print.
- Never stretch, outline, add shadow, or animate the letters. Only the arc may animate, and only by filling clockwise.

## 4. Colour

The palette is **Ceramic**: a warm off-white page, deep olive ink, one status colour per day, and teal reserved for anything live. It was chosen over the graphite-and-lime exploration because it reads as calm and medical-adjacent without being cold, and it matches the V1 screens the team designed.

### Core

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F2F1EC` Ceramic | `#121410` Night | Page |
| `surface` | `#FBFAF7` Paper | `#1A1D18` | Cards |
| `surfaceRaised` | `#E8E5DC` Bone | `#242820` | Insets, secondary buttons |
| `border` | `#E0DCD1` | `#2D3229` | Hairlines |
| `text` | `#1C1E1A` Ink | `#ECEAE3` | Body text |
| `textSecondary` | `#5C6058` | `#B3B5AB` | Supporting text |
| `textMuted` | `#686B62` | `#8D9187` | Labels (passes 4.5:1) |
| `accent` | `#2F3A2C` Olive | `#E6E3D8` | Primary buttons, selected states |
| `live` | `#1F8A72` | `#3DDBB8` Teal | Live data, tape, the logo arc, voice |
| `horizon` | `#D3DBCB` | `#232920` | Decorative hills behind the dial |

### Status (one per day, never decoration)

| Status | Light | Dark | Means |
|---|---|---|---|
| Keep going | `#6F9E68` | `#8CBC84` | Your knee settled; a normal or bigger day is fine |
| Steady | `#C99A3A` | `#DCAE55` | Hold where you are, see how it feels tomorrow |
| Ease off | `#D4673F` | `#E3805A` | Keep today light |

Text on any status fill is Ink `#1C1E1A`. White on these colours is below 4.5:1.

### Marketing extras

Sage `#A9BBA8` and Sand `#DCD5C4` for large campaign fields and packaging. Never in the app UI.

## 5. Type

| Role | Typeface | Where |
|---|---|---|
| Interface and body | **Geist** (400, 500, 600) | Every app screen, site body, reports |
| Data and labels | **Geist Mono** (400, 500) | Numbers that are measured, timestamps, small uppercase labels |
| Editorial | **Instrument Serif** (400, italic) | Site headlines, the onboarding hero, quoted voice notes, campaign lines |

All three are free on Google Fonts and ship in the app through `@expo-google-fonts`.

App scale (from `tokens.ts`):

| Style | Size / line | Weight | Font |
|---|---|---|---|
| display | 44 / 48 | 600, −1 tracking | Geist |
| title | 28 / 34 | 600, −0.5 | Geist |
| heading | 20 / 26 | 600 | Geist |
| body | 16 / 24 | 400 | Geist |
| bodyStrong | 16 / 24 | 600 | Geist |
| small | 13 / 18 | 500 | Geist |
| label | 11 / 16 | 500, +0.9, uppercase | Geist Mono |
| number | 64 / 68 | 500, −2 | Geist Mono |
| serif | 34 / 38 | 400 | Instrument Serif |

Rules: one serif moment per screen at most. Measured numbers are always mono. Never use the serif for numbers or buttons.

## 6. Status system

Three words, a dot and a colour, used identically in the app, notifications, the report and the coin's LED:

- **Keep going** (green)
- **Steady** (amber)
- **Ease off** (orange)

Each status is always shown with its reason in plain words ("Pain settled overnight and yesterday was close to your usual"). Statuses compare you to your own usual, never to a clinical threshold. A red flag (sudden pain spike, the joint giving way) replaces the status with "Contact your clinician" and stops all other advice.

## 7. Voice

Talk like the team physio: short, factual, second person, never hype.

| Say | Don't say |
|---|---|
| Your knee bent to 125°, 3° more than last week. | CRUSH your recovery 💪 |
| Pain settled overnight. A normal day is fine. | You're cleared for sprint work. |
| 3 of your last 4 flare-ups came after game days. | Games cause your flare-ups. |
| Based on 6 days of tape readings. | Science-backed magic. |
| Keep today light: a walk and your mobility work. | Uh oh, bad day? Bounce back! |

Rules that every string obeys (tested in `packages/core/test/copy`):
- RECO tracks and shows. It never diagnoses, treats, prevents, clears or predicts injury.
- "What came before your pain", never "what causes your pain".
- "Warning signs" or "overuse warning", never "re-injury detector".
- "Your plan, based on published rehab protocols. Your PT can change it." whenever a plan is shown.
- Never compliance, adherence, missed, streak, failed or policing language. The record belongs to the patient.
- "Not a medical device" stays visible in Settings and on every report.
- Statistics: "about 23 to 30% of young athletes have a second ACL injury after returning to sport". Never "1 in 3".

## 8. Imagery

- **Stillness over sprint.** Stretching, taping, ice, eyes closed. The story is the in-between, not the highlight.
- **Macro textures.** Skin, tape weave, the coin, fabric. Make the tech feel tactile.
- **Muted natural grade.** Daylight, plenty of negative space, no neon gym lighting.
- **One number per screen.** Big single readouts over busy dashboards. Data is the hero.
- People of different sports and ages, recovering, not only elite athletes.

## 9. Motion

- The dial fills clockwise from zero on open (900 ms, ease-out cubic). The same motion is used for the logo arc and the coin's LED.
- Cards fade up 8 px with a 60 ms stagger.
- Teal pulses only for things that are live right now (tape streaming, voice listening).
- Haptics: a light tick for selections, a success tap for anything saved.

## 10. Applications

- **App icon:** `reco-mark-olive.svg` on the olive tile.
- **Splash:** ceramic page with the olive wordmark centred.
- **Coin:** satin silver aluminium case and shoulder, matte black dial and band with the satin RECO O-mark, the ring LED in teal when streaming and in the status colour after a sync. Twist-locks 60° into a matte black mount on the tape.
- **Tape label and packaging:** sand or sage field, ink wordmark, mono spec line.
- **PT report:** paper background, ink wordmark top left, mono data, status dots, the disclaimer in the footer.
