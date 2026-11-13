# Clinician view

A website where a PT sees their caseload: each patient's progress, next steps, week and anything alarming from their check-ins. Code: `app/apps/clinic` (Vite + React) on the shared logic in `app/packages/core/src/clinic`. Sample data only.

Run it with `npm run clinic` from `kinn/app` (http://localhost:5174).

## Hosting on Vercel

Import the GitHub repo as a new Vercel project and set **Root Directory** to `kinn/app/apps/clinic`. Everything else comes from `apps/clinic/vercel.json`: it installs only the clinic's packages from the workspace lockfile (`npm ci --workspace reco-clinic`), runs `npm run build` (typecheck, then Vite) and serves `dist`. Leave "Include files outside the root directory" on (the default), since the site builds `packages/core` from source. Every page is sent with `noindex` so search engines skip it.

## Why a website, not a PT mode in the app

- PTs work at a desk across a caseload; a list beside a detail fits a wide screen.
- It's a link: no App Store review or install on clinic computers.
- The patient app stays the patient's own. The vision says the record belongs to the patient and must never feel like policing, so a clinician role doesn't live inside it.
- Nothing is duplicated: both apps call the same `@reco/core` functions (`deriveToday`, the protocol path, the weekly report), so they can't disagree.

Vite + React rather than Expo web, because the patient app's components are phone-first and a dashboard wants wide layouts.

**Design (Nov 12 redesign, "The Week Ring").** Each patient's last seven days are drawn as one 168-hour ring, opened out from RECO's Sensor O: clinic visits are an ink sliver, and the centre pairs "the hours you never see" with the hour in clinic. Its own palette (a stepped green-grey ramp, graphite rail, live teal) and Atkinson Hyperlegible Next and Mono, chosen for legibility on projectors and clinic screens; the RECO wordmark is the brand SVG. The design system is recorded in `apps/clinic/DESIGN.md`, the product context in `apps/clinic/PRODUCT.md`, and the direction in `apps/clinic/.impeccable/surfaces/`. Built with the Impeccable and Emil Kowalski design skills.

## What it shows

- **Patient list**, most urgent first, then by name. Each row has the checkpoint ring, injury, week, phase and the top flag, so nothing alarming hides behind a click.
- **Patient detail**, flags first, then:
  - **Progress**: phase and its state, checkpoints met, the six phases, latest bend (with the other knee) and straightening, the exercise-plan phase and whether flare-ups held it back, any bend limit.
  - **Next steps**: how the phase moves on, the open checkpoints with their values and who measures each, and the in-clinic ones under "For you at the next visit".
  - **This week**: the same headline the patient's own PT report uses, the seven mornings, deepest bend, best straightening, flare-up mornings, pain logs, and what they logged.

The open patient lives in the URL (`#/p/<id>`). With none picked, the most urgent opens.

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

- **Real data.** Every patient is a sample persona from `core/src/sim/seed.ts`. Real use needs patient-controlled sharing to a named PT (revocable, choosing what's shared, like the report's toggles), a backend and PT accounts, and health-data handling. That reverses the Oct 19 "report-only, no accounts" and "local-first, no backend" decisions, so it needs its own decision first.
- PT sign-in, editing a patient's limits or phase from the website (`from-pt.tsx` stays in the patient app), messages, notifications, and remote-monitoring billing.
- PT validation: vision.md's open question 5 ("What will PTs actually use?") still stands. This is the thing to put in front of one.
