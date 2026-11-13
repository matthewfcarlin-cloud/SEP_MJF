# Protocol path

How RECO places someone after ACL reconstruction or meniscus repair on a published, criterion-based protocol. Code: `app/packages/core/src/protocol/`. Screen: `app/apps/mobile/src/app/path.tsx`.

## What it does

Published protocols (Mass General Brigham ACL 2024 and meniscus repair 2021, cross-checked against the MOON guidelines) move a person to the next phase on **criteria**: range, swelling, quad control, strength, hop tests. Time only sets a healing floor. The old plan picked its phase from weeks since surgery alone (`PHASE_WEEKS`), which is still what every other injury uses.

Each protocol is data (`protocols.ts`): 6 phases, each with a time floor, a typical window, goals, precautions (with machine-readable bend limits for the tape), exit criteria and what the phase opens up. Each criterion says who measures it: the tape, the person (a 1-minute self-test), the morning check-in, or the PT.

`buildPath(input)` gives the current phase, its state, every checkpoint with status and projection, the timeline, the bend limit in force and the headline and why. Leaving a phase needs both:

1. every required exit checkpoint met, and
2. the next phase's time floor passed.

Meeting checkpoints early never skips the floor; passing the floor never skips the checkpoints. Completed phases are sticky, stored with a date in `Dataset.path`. A bad swelling day later shows as a checkpoint slipping in the current phase and as a hold-back in the daily plan, not as a drop back a phase.

The app calls `nextPathRecord()` on open (and when new values come in) and stores at most one phase change a day.

## Where the numbers come from

`inputs.ts` maps a dataset to the engine (`datasetToPathInput`):

| Checkpoint metric | Source |
|---|---|
| Range (bend, straighten) | `RomDay[]`, best of the last 3 days so one stiff morning doesn't flip a checkpoint |
| Gap to the other knee | `Profile.otherKnee`, measured once ("Measure your good knee first", `/measure?knee=other`) |
| Swelling grade | Morning check-in. The optional stroke test grade (`MorningCheckIn.effusion`) if given, otherwise `none → trace`, `some → 1+`, `a-lot → 2+` |
| Pain or swelling after exercise | A pain log in the last 7 days that did not settle, or one followed by morning pain at or above `STATUS_RULES.steadyPain` |
| Self-tests, giving way, run program | `Dataset.measurements`, by `self-test` or `check-in` |
| Strength, H:Q, hop, gait, sign-off | "From my PT" sheet, saved as measurements by `pt` |

On the same day a PT value beats the person's own. Answers about "this week" (swelling grade, giving way) stop counting after 7 days, so an old answer can't pass a checkpoint. The PT sheet also sets a phase override and the bend limit (or lifts it). A PT-set phase is completed once its checkpoints and floor are met, and from there the checkpoints lead again.

Protocol phases map onto the exercise library's 4 phases through an explicit table (`phase-map.ts`): 1–2 → 1, 3 → 2, 4 → 3, 5–6 → 4. The flare-up hold-back still applies on top.

## Tolerance and projection assumptions

- "Equal to the other knee" means within 3° of flexion and 2° of extension, because goniometers vary by a few degrees between clinicians.
- Projections fit a straight line to the last 14 days of range (at least 5 readings). Under 0.2°/day reads as "levelled off". The range shown is ±35% of the straight-line estimate. They never shorten a time floor, and the copy always says "at your current pace" and gives a range, never a date.
- "Behind typical" shows one week after the end of the phase's typical window.
- A bend goal above the limit in force is marked as waiting for the surgeon or PT to lift the limit, with no projection.

## Bend limits and the tape

`PathView.limits` carries the limit in force (`flexionMaxDeg`, `loadedFlexionMaxDeg`, and who set it). The tape's capacitive sensor tracks bend, and `BendWatch` (`apps/mobile/src/tape/bend-watch.ts`) checks every live reading against the limit:

1. **Degrees.** LIVE gives the filtered raw value at 20 Hz. `bendAngle()` maps it onto a line through two calibration points: rest with the leg straight (0°) and max at a bend the person enters on the tape screen ("Bend at max calibration"), ideally measured by the PT. Above the max point the line is extended, so the max can be calibrated under the limit and still catch bends past it.
2. **Alerts.** `stepBendWatch()` counts a bend once it stays over the limit for 0.3 s, and once per excursion: the knee has to come back 3° under the limit before the next one counts. Each alert buzzes the phone and is saved in `Dataset.bendAlerts`; Today counts today's, the Path banner the last 7 days.
3. **Whose record.** A real tape records into whichever mode is showing. The demo tape only records into sample data, never into a person's own record.

Assumptions to check before trusting the numbers:
- The sensor is close to linear between straight and the max point. Check against a goniometer at a few angles; if it curves, the two-point line needs more points.
- The tape can't tell yet whether the leg is taking weight, so only the plain bend limit is watched, not the loaded one (for example the 60° mini-squat limit in ACL phase 2).

## Sample data

`sim/seed.ts` builds the sample from five deterministic personas in `simulate.ts` (Maya on track, Jordan fast, Sam with a stalled bend, Priya with a meniscus repair and three over-bends, Leo with a flare-up). Maya stays the default and keeps her 21-day log story for Today and Insights. In sample mode, Settings has a menu to switch persona and move along their recovery a day or a week at a time.

## Copy rules

Enforced by `test/protocol/copy.test.ts` and the mobile copy test:

- Never "safe", "cleared", "ready to return", "re-injury" or "at risk". RECO never clears anyone; the last phase says the surgeon and PT make the call.
- Projections say "at your current pace" and give a range.
- "Behind typical" says plenty of people take longer and points to the PT.
- Time floors are healing time the protocol builds in, never "not allowed".

## Not built yet

- Questionnaires (KOOS-Sport, IKDC, ACL-RSI) are placeholders until their licences are checked. The PT can enter the score meanwhile.
- The joint-position and single-leg squat tests are still typed in. With bend in degrees the tape can now measure both; that's the next step for them.
- The other knee is measured from the Path screen, not yet as an onboarding step.
- Graft type and ACL plus meniscus repair (see open question 4).

## Open questions (need PT input)

1. **Tolerance for "equal to the other knee".** Set to ±3° flexion and ±2° extension. Confirm.
2. **Self-reported stroke test.** Is it reliable enough to gate a phase, or should swelling only gate when the PT enters it?
3. **Meniscus bend limit.** MGB keeps flexion under 90° through week 6 unless the surgeon says otherwise. Other surgeons cap loaded flexion at 45–60° early. The default must be easy for the PT to change (the "From my PT" sheet does this today; onboarding should too).
4. **Graft type and combined repairs.** Hamstring autograft or allograft delays some phases, and ACL plus meniscus repair should follow the more conservative protocol. Needs `Profile.graft` and `Profile.concomitant`; not modelled yet.
5. **Regulatory.** Showing which published checkpoint someone has met is descriptive. The plan's phase now follows the checkpoints, which changes which exercises are shown; that, and any automatic dose change from it, is the step to review first.
