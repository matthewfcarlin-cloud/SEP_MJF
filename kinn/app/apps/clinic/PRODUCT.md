# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: outpatient sports and orthopaedic physical therapists** seeing knee patients through rehab, mostly months 3 to 9 after injury or surgery. They see each patient 1 to 3 hours a week and hear about the other 160+ hours from memory.
- **Also in mind: athletic trainers** with a team or college roster, who often see athletes daily. Design for clinic PTs first; nothing should rule ATs out.
- **First real audience: investors, accelerators and partners** watching a demo. For the next few months the site's main job is pitch and investor demos, shown on sample data. It must make "this is what the PT sees" obvious in seconds.

The jobs, in the order a PT does them:
1. **Morning caseload check:** scan everyone at once for anything that needs a call today.
2. **Prep before a visit:** a few minutes before a patient arrives, see what happened since last time.
3. **During the visit:** on screen with the patient in the room, talking it through together.

## Product Purpose

RECO is a smart tape and app for people recovering from a joint injury. It tracks the injured joint every day, shows progress and what comes before pain, and gives the PT the full picture between visits. This site is the PT's side of that: a caseload, each patient's progress against a published protocol, their next steps, their week, and anything alarming from their check-ins.

Success for now: an investor or PT watching the demo understands within seconds what a PT would act on, and believes a PT would open it before every visit.

## Positioning

The PT sees a measured record of the hours they don't see, built from the patient's own daily check-ins, pain logs and the tape, laid against the published criterion-based protocol (Mass General Brigham ACL and meniscus repair). Competitors see you during sessions (online PT) or serve surgeons in the first weeks (knee-replacement trackers). The record belongs to the patient, who chooses to share it; RECO never polices them.

## Operating Context

- Used at a desk before visits and for a morning scan, and on screen with the patient in the room. A phone works but isn't the main scene.
- Demoed live to investors, on a laptop or projected, usually on the sample patients.
- Patients use the RECO Expo app (`kinn/app/apps/mobile`). This site reads the same data model through `@reco/core`, so the two can never disagree.
- PT vocabulary: phase, checkpoints, healing floor, flare-up, giving way, bend limit, in-clinic checks.

## Capabilities and Constraints

- Caseload list, most urgent first; patient detail with flags, progress (phase, checkpoints, range against the other knee, plan phase), next steps (open checkpoints, who measures each, in-clinic checks) and the week (the same summary as the patient's PT report).
- Flags in three tiers: **Contact soon** (pain 8+, red-flag words, the knee giving way), **Worth a look** (flare-ups, bends past the limit), **Note** (stalled progress). Thresholds are the patient app's own.
- Logic lives in `kinn/app/packages/core/src/clinic`; the site is Vite + React, deployed on Vercel from `kinn/app/apps/clinic`.
- **Sample data only.** Six personas from `core/src/sim/seed.ts`. No accounts, no backend, no real patient data. Real data needs patient-controlled sharing, a backend and PT accounts: a separate, undecided product decision (see `kinn/docs/decisions.md`).
- Not built: PT sign-in, editing a patient from the site, messaging, notifications, remote-monitoring billing.

## Brand Commitments

From `kinn/docs/brand.md` (binding):
- Name **RECO**, always capitals. Tagline "Trust your comeback." Descriptor "Recovery, measured."
- Voice: precise, calm, quietly confident; clinical but warm; evidence-led; on the patient's side, never policing.
- The Sensor O: the logo's ring with a live arc from 12 o'clock clockwise; only the arc may animate, only by filling clockwise. Logo files in `kinn/brand/`.
- Never: "safe", "cleared", "ready to return", "at risk", risk predictions, readiness or clearance calls, "clinical-grade". RECO doesn't diagnose; the clinical call is the PT's.
- No adherence or compliance metrics, no "missed" or "skipped": flags are about the knee only.

## Evidence on Hand

- Six sample patients (Ava, Leo, Priya, Sam, Jordan, Maya) with deterministic data, each showing one state: a red flag, a flare-up, bends past a limit, a stalled bend, and two on track.
- Protocol sources: MGB ACL reconstruction (2024) and meniscus repair (2021), MOON 2015, Grindem 2016, Sturgill 2009 (`core/src/protocol/protocols.ts`).
- No PT has validated the site yet, and there are no customers, testimonials or outcome data. Never fabricate them.

## Product Principles

1. **What needs a PT today comes first.** Anything alarming is visible from the list, without a click.
2. **Show the record, not a verdict.** RECO describes what the patient recorded; interpretation and the clinical call stay with the PT.
3. **The patient's side, always.** Nothing reads as surveillance or scoring the patient.
4. **One source of truth.** The PT and the patient see the same facts, from the same logic.
5. **Readable in a glance, true on inspection.** A demo viewer gets it in seconds; a PT who looks closer finds real protocol detail.

## Accessibility & Inclusion

Clinic screens and projected demos: legible at a distance, contrast that survives a projector, and no meaning carried by colour alone (flags always have a word).
