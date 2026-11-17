# Clinician view

A website where a PT sees their caseload: each patient's progress, next steps, week and anything alarming from their check-ins, and writes their plan. Code: `app/apps/clinic` (Vite + React) on the shared logic in `app/packages/core/src/clinic`. It runs on sample patients, or, when built with a server address, on the signed-in PT's own patients.

Run it with `npm run clinic` from `kinn/app` (http://localhost:5174).

## Hosting on Vercel

Import the GitHub repo as a new Vercel project and set **Root Directory** to `kinn/app/apps/clinic`. Everything else comes from `apps/clinic/vercel.json`: it installs only the clinic's packages from the workspace lockfile (`npm ci --workspace reco-clinic`), runs `npm run build` (typecheck, then Vite) and serves `dist`. Leave "Include files outside the root directory" on (the default), since the site builds `packages/core` from source. Every page is sent with `noindex` so search engines skip it.

**Sample or real.** With no `VITE_API_URL` set on the Vercel project, the site shows the six sample patients, as it always has. Set `VITE_API_URL` to the RECO server's address and redeploy, and it opens on a sign-in page (email, then an 8-digit code), with "Look around with sample data" one click away. Signed in, the rail lists the PT's own patients, the ones whose phone hasn't synced yet, "Add a patient" (makes a sharing code) and sign out. Each patient's page says what they share and what they left off, so an empty section isn't read as a quiet week.

**Which site is which.** This is `kinn/app/apps/clinic`, its own Vercel project. The public marketing site is `kinn/site`, a different folder and project; nothing here touches it.

## Why a website, not a PT mode in the app

- PTs work at a desk across a caseload; a list beside a detail fits a wide screen.
- It's a link: no App Store review or install on clinic computers.
- The patient app stays the patient's own. The vision says the record belongs to the patient and must never feel like policing, so a clinician role doesn't live inside it.
- Nothing is duplicated: both apps call the same `@reco/core` functions (`deriveToday`, the protocol path, the weekly report), so they can't disagree.

Vite + React rather than Expo web, because the patient app's components are phone-first and a dashboard wants wide layouts.

**Design (Nov 16, "The clinic record").** The site looks and works like the patient-record software a PT already uses: white pages, tables, labelled buttons, one thing per page. One teal marks the main button on each page and recovery progress; red and amber appear only on alerts, always with the word. The font is Source Sans 3; the RECO wordmark is the brand SVG. This replaced the Nov 12 "Week Ring" design (a 168-hour ring per patient, a dark sidebar, diamonds for severity), which Matthew found confusing and asked to simplify (decisions.md, Nov 16). The design system is recorded in `apps/clinic/DESIGN.md`, the product context in `apps/clinic/PRODUCT.md`, and the direction in `apps/clinic/.impeccable/surfaces/`.

## What it shows

- **Patients page**: a table, most urgent first, then by name. Each row has the patient, procedure, week, a small recovery progress bar with the phase in words, the top flag as a word tag, and an "Open chart" button, so nothing alarming hides behind a click.
- **Patient chart**: the name and facts, one main button ("Write exercise plan" or "Edit exercise plan"), and three tabs:
  - **Summary**: what needs attention first, then recovery progress (phase and its state, the six phases, checkpoints met, latest bend with the other knee, straightening, the plan phase and whether flare-ups held it back, any bend limit), then the next checkpoints with their latest values and who measures each, and the in-clinic ones under "To check at the next visit".
  - **Daily log**: the same headline the patient's own PT report uses, deepest bend, best straightening, flare-up mornings and pain logs, then the last seven days as a table.
  - **Exercise plan**: the plan the patient follows, as a table, with who wrote it and its version.

The recovery progress bar is filled by the phases behind the patient plus the share of the current phase's checkpoints they have met. It shows the phase in words and never a percentage.

The open page lives in the URL: `#/` is the patients table, `#/p/<id>` a chart, `#/p/<id>/log` and `#/p/<id>/exercises` its other tabs, `#/p/<id>/plan` the plan editor. A link to someone who isn't on the list lands on the patients table.

## Flags (`core/src/clinic/flags.ts`)

| Tier | When | Window |
|---|---|---|
| Contact soon | Pain 8 or above (pain button or check-in), a note with red-flag words ("gave way", "buckled", "locked"…), or a giving-way answer | today and yesterday |
| Worth a look | Flare-ups (morning pain 5+, swelling "a lot", or pain that didn't settle overnight), shown as one flag for the run; bends past the limit | 3 days; bends 7 days |
| Note | A range checkpoint that has levelled off; past the phase's typical window | now |

Thresholds come from the patient-side rules (`WARNING_RULES.redFlagPain`, `STATUS_RULES.flarePain`, the red-flag word list), so a flag here matches what the patient's app told them. Flags are about the knee only: nothing counts exercises done or not done (feature-spec 1.5).

## Copy

PT voice. "Patient" is the right word here, unlike in the patient app; the rest of core's banned list still applies (tested). Nothing makes the clinical call: the footer says what it means clinically is the PT's call.

## Not built yet

- **Going live with real patients.** The sharing, accounts and server are built and tested (decisions.md, Nov 15; [backend.md](backend.md) sections 9 to 12) but not deployed, and the privacy policy and a health-data law review come first ([how-reco-works.md](how-reco-works.md), section 9).
- Editing a patient's limits or phase from the website (`from-pt.tsx` stays in the patient app), messages, notifications, and remote-monitoring billing.
- PT validation: vision.md's open question 5 ("What will PTs actually use?") still stands. This is the thing to put in front of one.
