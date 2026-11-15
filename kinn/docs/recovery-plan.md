# The recovery plan

How a RECO patient gets a plan, whoever writes it, and what the backend will need to store. Code: `app/packages/core/src/plan/` (`recovery.ts`, `resolve.ts`, `catalog.ts`, `build.ts`), the clinic editor in `app/apps/clinic/src/components/plan-editor.tsx`, the patient screen in `app/apps/mobile/src/app/plan.tsx`.

## One rule: a written plan is a fact, RECO's plan is derived

- **A plan a person wrote is stored.** A PT writes it on the clinic site, or the patient types it in from their PT's sheet. It is a `RecoveryPlan` record: who wrote it, a version, the exercises with doses and days a week, and what may happen on a flare-up morning.
- **RECO's own plan is never stored.** It is worked out each day from the protocol phase, the day's status and recent flare-ups (`buildPlan`). A change to the rules changes it everywhere, with no migration. This matches the existing rule in `backend.md`: store facts, derive everything else.

## Which plan a patient follows

`resolvePlan` decides, in this order, and both apps call it, so they never disagree:

1. **The plan the patient's PT wrote** on the clinic site, at every guidance level.
2. **The plan the patient typed in** from their PT. A patient who has a PT but hasn't typed anything sees an empty plan with a way to add it.
3. **RECO's protocol plan, only at the Guided level.** The no-PT plan stays behind Guided until the regulatory review (decisions.md, Oct 30).
4. **Otherwise no plan.** The patient sees their phase in plain words and how to find a PT.

## The PT's plan

Built on the clinic site, from a patient's page ("Write a plan" or "Edit plan"). The PT can:

- **Pick from the library and edit.** Every knee exercise is listed by phase, opening on the patient's own phase. Each one shows the checkpoints it works toward on that patient's protocol: straight-leg raises toward "Straight-leg raise with no sag", single-leg squats toward "10 single-leg squats to 60°". Picking one copies its doses in; the PT edits anything.
- **Type their own.** A blank exercise with sets, reps, hold, minutes, per side, a note, and days a week.
- **Choose the flare-up behaviour per plan.** Shown exactly as written (the default), or lighter on flare-up mornings, where RECO swaps in the lighter dose the PT set. A flare-up morning is the existing rule: morning pain 5 or more, a lot of swelling, or pain that didn't settle overnight. RECO never changes a PT's plan in any other way.
- **Publish a version.** Each publish is the next version; the patient app shows "From <name> · version N". Problems are listed before publishing, from `validatePlan`, the same check the backend will run.

Until the backend exists, a published plan is saved on that computer and never reaches a phone; the editor says so. The sample patients Maya and Leo carry sample PT plans (Leo's goes lighter on flare-up mornings).

## RECO's plan (no PT, Guided only)

- The phase comes from the protocol checkpoints for ACL reconstruction and meniscus repair, and from time since injury for everything else.
- **Progression is by phase only.** Exercises change when the phase changes; doses stay fixed within a phase.
- Day to day: a Steady day uses the lighter dose and drops sport drills; an Ease off day becomes a recovery day; two flare-ups in ten days hold the plan back one phase.
- Always labelled as based on published rehab protocols, with "your PT can change it".

## For the backend

What it stores and checks, from these types:

| Record | Notes |
|---|---|
| `RecoveryPlan` | `id`, `version`, `author` (`pt` with a name, or `typed`), `adaptation`, `entries`, `publishedOn`. Store every version; never edit one in place. The latest version is the one in use. |
| `PlanEntry` | `id`, `source` (a library exercise id, or custom), `name`, `how`, `dose`, optional `lightDose`, `daysPerWeek`. |
| `Dose` | optional `sets`, `reps`, `seconds`, `minutes`, `perSide`, `note`. |
| Plan marks | already stored by the patient app (`planMarks`): which entry was done on which day. They key on entry ids, so ids must stay stable across versions when an entry is kept. |

- Run `validatePlan` on the server before accepting a publish; the editor runs the same check, so a valid draft is never refused.
- Only the patient's own PT may publish to them, and only once the patient has chosen to share with that PT. Sharing stays the patient's choice (decisions.md, Oct 30).
- RECO's derived plan is not stored or synced; each app works it out.

## Not built yet

- The backend itself: sync, PT accounts, the patient choosing to share with a PT.
- A library beyond the current knee exercises. Adding exercises (heel props and other protocol staples) is content that needs PT review.
- Dose progression within a phase, and sport-specific drills: both declined for now.
