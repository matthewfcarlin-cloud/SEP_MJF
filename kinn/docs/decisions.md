# Kinn product decisions

Running log. Newest at the bottom. Each entry: what was decided, why, and what would change our mind. "Matthew" means a decision he made; "Claude, approved" means proposed and accepted; "Claude" means made by Claude on his behalf under the brief and open to being overruled.

## 2026-10-14 · Direction: knee recovery (Matthew)
Focus the product on the knee, specifically post-op ACL and return to sport, because the biggest gaps found in research were return-to-sport decisions (29.5% second ACL injury within 2 years, Paterno et al.) and early post-op stiffness. From CONTEXT.md.

## 2026-10-16 · Lead with the range alert, not adherence (team)
The "know your limit" alert and a wear-all-day mode were judged the most promising use case. Compliance tracking was explicitly rejected as a "policing device" in the sarena interview (Oct 15). From CONTEXT.md and Granola.

## 2026-10-19 · ICP narrowed to mature ACL athletes, weeks 4 to 24 (Matthew)
Pro and college athletes recovering from ACL reconstruction who see a physio 1 to 2× a week. Younger athletes under-report symptoms and reject anything that polices them. Supersedes the Oct 17 "anyone coming back from an injury" framing. The site intake still lists shoulder and ankle; leave it, it is a waitlist.

## 2026-10-19 · The core feature is a daily knee Load score (Matthew)
One 0 to 100 number against a stage-based target band, with a plain-language call (Room to push / On target / Ease off) and a reason sentence. Raw angles are secondary. Modelled on Oura sleep and Whoop strain.

## 2026-10-19 · MVP cut (Claude, approved)
In: Load score, range alert, Moments with 2-tap tagging and an evening swelling check-in, rules-based flare-up insights, onboarding with calibration, athlete-generated weekly physio report with per-section toggles, a read-only next-checkpoint card, a lightweight monthly other-knee check for symmetry.
Out until later: guided training with live rep feedback (needs physio-authored exercises and target ranges we do not have; per-rep feedback on simulated data would be theatre), full checkpoint tracker, second strip.
Would change our mind: a physio partner who hands us a protocol with exercises and ranges in the first three weeks.

## 2026-10-19 · Stack: Expo (React Native) + TypeScript, with a pure TS core (Claude, approved)
Push notifications and a BLE path on a real phone matter more than the faster demo loop of a web PWA, which cannot do Bluetooth or background alerts on iOS. All non-UI logic (load model, alerts, insights, simulator) lives in a `core` package with no React Native imports so it runs under Vitest and could be mounted in a web shell for a pitch link.

## 2026-10-19 · Physio side is report-only, no accounts (Claude, approved)
The athlete generates a weekly PDF or link and chooses what is in it. No physio login, no clinic view in MVP. Keeps the athlete in control (interview: sarena) and keeps Kinn out of clinic data handling. A "physio adjustment" screen in the athlete's app records the physio's name with any change to the range or band.

## 2026-10-19 · The athlete can only lower their range limit (Claude, approved)
Raising goes through the physio adjustment screen. Rationale: the default limit is the one thing in the app closest to a clinical judgement; letting the athlete raise it undermines the "your physio sets your actual range" framing that keeps us on the wellness side of the FDA line. A 90-minute "supervised session" mute exists so PT visits do not fire alerts.

## 2026-10-19 · Local-first, no backend, no accounts (Claude, approved)
All data on the phone in SQLite. Export is user-initiated (the report). The Railway Postgres behind the waitlist is not touched. Revisit when a second device, physio accounts, or multi-phone sync is needed.

## 2026-10-19 · Score anchor and target band are explicit assumptions (Claude)
Score 100 = 12,000 knee work units ≈ a full training day for a healthy athletic knee. Band anchors by week are in feature-spec.md §2.3. Both are placeholders to be tuned in the physio "rate ten simulated days" exercise before any athlete sees them as truth. Every constant is versioned so history can be recomputed.

## 2026-10-19 · The call uses a projection, not the so-far score (Claude)
"Room to push" at 9 am every day would be meaningless. The call compares (score so far + the athlete's typical remainder for this hour) against the band, with overrides for excursions, pain and swelling. Falls back to a protocol-average day profile for the first 14 days.

## 2026-10-19 · Evening swelling check-in added to Moments (Claude)
Swelling was the flare-up signal mentioned most in interviews (paxton) and in the brief, and the strip cannot see it. One tap, three options, skippable. Counts as a flare-up at "A lot".

## 2026-10-19 · "Safe range" is an internal name only (Claude)
UI copy says "this week's range" or "your range" and labels the default as "typical for week N, from standard rehab protocols". "Safe" implies Kinn judged what is safe. Same reason the alert says "past this week's range" instead of "deeper than it's ready for".

## 2026-10-19 · Symmetry via a monthly other-knee check, no symmetry index (Claude)
Move the strip to the other knee for a two-minute scripted set; show the two peak numbers side by side in the report. No percentage, no readiness statement, so it stays data and not a clearance claim. Second strip is the real answer later.

## 2026-10-19 · Docs live in kinn/docs/, app will live in kinn/app/ (Claude)
The repo is SEP_MJF with everything under kinn/. The brief said docs/feature-spec.md; we kept that name under kinn/docs/ so the repo layout stays consistent.

## 2026-10-19 · Evidence tagging (Claude)
Claims in the spec are tagged [interview], [founder], [lit] or [assumption]. All five recorded interviews are athletes or friends; no physio has been interviewed. Statements about physio behaviour are [founder] until a physio says them on a call.

## 2026-10-23 · Two-day rough MVP for Monday Oct 26 (Matthew)
A demoable manual-log app on a phone by Monday beats a designed one later. Screens are built on a neutral placeholder token file while Matthew continues the visual design in Figma; the palette and type are his call and get swapped into the token file when ready. In-memory store seeded with 21 days of sample data, no SQLite, no Figma screens, no spec rewrite. Plan in [mvp-plan.md](mvp-plan.md). Would change our mind: the deadline moving.

## 2026-10-26 · Rebrand: the product is now RECO (Matthew)
The app, bundle id (`com.reco.app`), npm packages (`@reco/core`, `reco-mobile`), URL scheme (`reco://`), all athlete-facing copy and the TestFlight listing use RECO. The repo folder stays `kinn/` and the native worktree stays `~/kinn-native` so paths and history do not break; older docs (feature-spec, architecture, CONTEXT) keep "Kinn" where they quote earlier work. The marketing site under `site/` still says Kinn and is a separate rebrand job.

