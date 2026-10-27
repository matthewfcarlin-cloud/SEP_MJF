# RECO scoring methods

_Version 0.1 · 2026-10-27 · Status: reference for the current build_

How the two headline numbers in the RECO app are computed, where each constant comes from, and how well each one can be defended today. Formulas are copied from the code, so this note is wrong only when the code moves. Tags follow [feature-spec.md](feature-spec.md): **[lit]** published source, **[assumption]** our own guess with a validation step, **[code]** where it lives.

**Bottom line.** The status call (Keep going / Steady / Ease off) rests on a published pain-monitoring rule. The Knee load score has a documented, tunable structure whose constants are untested assumptions. The Recovery % dial is a progress heuristic; its weights have no evidence behind them. None of the validation plan in feature-spec.md section 2.4 has run, and no physio has reviewed any of it.

---

## 1. Recovery % (Today dial, Progress bar)

**[code]** `app/packages/core/src/manual/trend.ts` (`progressPercent`), constants in `manual/constants.ts` (`ROM_TARGETS`).

```
extension = clamp01(1 − extensionDeficitDeg / 15)
flexion   = clamp01((flexionDeg − 90) / (135 − 90))
timeline  = clamp01(weeksSinceInjury / 36)
recovery% = round(100 × (0.35·extension + 0.35·flexion + 0.30·timeline))
```

Inputs: the most recent range-of-motion day (extension deficit in degrees, 0 = fully straight; peak flexion in degrees) and weeks since the injury or surgery date in the profile.

| Constant | Value | Tag | Backing |
|---|---|---|---|
| Full straightening threshold | deficit ≤ 2° | [lit] | Full extension is the first ACL milestone in every criterion-based protocol (Adams et al. 2012 JOSPT; MOON guidelines, Wright et al. 2015). |
| Bike range | 120° | [lit] | About 110 to 120° of flexion is the usual cycling criterion in the same protocols. |
| Full bend | 135° | [lit] | Typical normal knee flexion is 135 to 140°; protocols use "full" or "symmetric". |
| Comeback timeline | 36 weeks | [lit, loosely] | Return to sport before 9 months carries a much higher reinjury rate (Grindem et al. 2016 BJSM; Beischer et al. 2020 JOSPT). 36 weeks ≈ 9 months. The *linear* ramp toward it is an assumption. |
| Starting deficit | 15° | [assumption] | Where extension progress reads 0. |
| Starting flexion | 90° | [assumption] | Where flexion progress reads 0. |
| Weights | 0.35 / 0.35 / 0.30 | [assumption] | Chosen so the bar does not read "done" at week 8 when range is back. |

**Caveats to state whenever this number is shown.**
- The timeline term rises with the calendar alone. An athlete who does nothing gains about 0.8 points a week.
- Range-of-motion days currently come only from the 21-day sample dataset (`source: 'reco-tape-sim'`). The live tape streams stretch activation, not knee angle; it does not feed this number yet.
- It is not a clinical measure of recovery. Strength, hop tests and psychological readiness, which drive return-to-sport decisions, are not in it. Prefer "Range progress" in any external material.

---

## 2. Knee load score (0 to 100, per day)

**[code]** `app/packages/core/src/load/*` (sensor path), `manual/load.ts` and `manual/constants.ts` (manual path). Full rationale in feature-spec.md section 2.

### 2.1 Units to score

```
score = min(100, round(100 × units / 12,000))
```

| Constant | Value | Tag | Backing |
|---|---|---|---|
| Healthy-day anchor | 12,000 units | [assumption] | ≈ 5,000 walking cycles + a 30-min run + 200 stairs + a strength set. Validation: feature-spec 2.4 step 3 (score vs session RPE, Spearman > 0.6). |
| Linear, capped at 100 | | [assumption] | Chosen for explainability over a log strain scale. |

### 2.2 Manual path (what the shipped app uses)

Each logged activity earns a fixed unit count by activity and intensity; a day's units are the sum.

| Activity | light | moderate | hard |
|---|---|---|---|
| rest | 300 | 300 | 300 |
| walking | 1,500 | 2,500 | 3,500 |
| PT | 2,500 | 3,500 | 4,500 |
| gym | 3,000 | 4,500 | 6,000 |
| practice | 4,000 | 6,000 | 8,000 |
| game | 7,000 | 9,000 | 11,000 |

**[assumption]** throughout. The table was set so a hard game lands near the top of the scale and a light PT day near a quarter of it. Validation: 2.4 step 4 (three physios rate ten simulated days; tune to the majority call). This is the single cheapest and most valuable check and needs no hardware.

### 2.3 Sensor path (built and unit tested, never run on hardware)

1. **Segment.** The angle stream is split into bend cycles: a cycle starts at a trough, is confirmed once the angle rises 30° above it, and closes when it falls 70% of the way back. [assumption]
2. **Classify.** Each cycle is labelled by peak angle, cycles per minute and shin acceleration: impact ≥ 2.5 g; cycling 70 to 115° at 45 to 115/min under 1.3 g; stairs 80 to 110° at 15 to 55/min over 1.3 g; walking ≤ 75° at 35 to 75/min; slow deep cycles are bends. [assumption; validation 2.4 step 2, ≥ 85% per class]
3. **Units per cycle.** Walking 1.0, cycling 0.5, stairs 3.0, bend 3.0, impact 1.5 × (peak g − 1.5) with a 0.5 floor; ×1.5 inside a tagged PT or training session; plus 1 unit per 10 s above the deep-flexion threshold (90° before week 8, 110° after) and 10 units per over-range excursion. Stairs at about three times walking is the only one with literature behind it, at order-of-magnitude level (patellofemoral load on stairs vs level walking, Reilly and Martens 1972). The rest are [assumption].
4. **Sum and score** as in 2.1. Every constant sits in `load/constants.ts` under `MODEL_VERSION`, stored with each day so history can be recomputed when weights change.

### 2.4 Target band and the daily call (sensor path)

- **Band by weeks since surgery.** Anchors (lower/upper): wk 4 20/35, wk 6 25/40, wk 8 30/50, wk 10 35/55, wk 12 40/60, wk 14 45/65, wk 16 50/75, wk 20 60/85, wk 24 65/90, interpolated. [assumption] The slow rise from week 10 to 16 reflects the graft remodelling window; the literature places the weakest point at roughly weeks 6 to 12, so the exact window is a physio question. [lit, partial]
- **Personalisation after 14 wear days.** Band centre = 0.6 × protocol centre + 0.4 × the athlete's 28-day mean; the upper bound is capped at 1.3 × chronic and the lower floored at 0.8 × chronic. The 0.8 to 1.3 window is the acute:chronic workload ratio "sweet spot" (Gabbett 2016 BJSM) [lit]. Note that the ACWR has been criticised since (Impellizzeri et al. 2020, IJSPP), so cite it as a convention, not a validated threshold. The 0.6/0.4 blend and 14-day start are [assumption].
- **The call.** A projected end-of-day score (so-far plus the athlete's median remainder at this hour) is compared with the band: below is Room to push, inside On target, above Ease off. Overrides: 3 or more over-range excursions, pain ≥ 5 today, or heavy swelling last night force Ease off; a flare-up in the last 24 h downgrades Room to push to On target. Projection and override thresholds are [assumption].

---

## 3. Status call: Keep going / Steady / Ease off (manual path, shipped)

**[code]** `app/packages/core/src/manual/status.ts`, `STATUS_RULES` in `manual/constants.ts`.

Evaluated in order, first match wins:

| Condition | Status | Tag |
|---|---|---|
| Morning pain ≥ 5 | Ease off | [lit] |
| Swelling "a lot" this morning | Ease off | [lit] |
| A pain log from yesterday answered "did not settle" | Ease off | [lit] |
| Morning pain ≥ 3 | Steady | [assumption, within the same model] |
| Swelling "some" | Steady | [assumption] |
| Yesterday's load > 1.3 × the mean of the previous 7 logged days | Steady | [lit, by analogy to ACWR 1.3] |
| No check-in yet | Steady | [assumption, conservative default] |
| Otherwise | Keep going | |

The backbone is the **pain-monitoring model** (Thomeé 1997 Phys Ther; Silbernagel et al. 2007 AJSM): pain during and after activity is acceptable up to about 5 on a 0 to 10 scale provided it settles by the next morning; pain that does not settle, or rising swelling, means reduce load. This is standard practice in tendon and ACL rehabilitation and is the strongest-backed rule in the app. Load never forces Ease off on its own; it only holds the day at Steady.

The same thresholds define a **flare-up morning** (pain ≥ 5, swelling "a lot", or an unsettled pain log) for the insights and the weekly report.

---

## 4. What would make this defensible

In order of cost:

1. **Physio rating study** (feature-spec 2.4 step 4). Three physios, ten simulated days, rate load 1 to 10 and give a push / hold / ease call. Tune the unit table and band anchors to the majority. No hardware needed.
2. **Rename or trim the dial.** Either show it as "Range progress" built from extension and flexion only, or keep the timeline term and label the number a progress bar, not recovery.
3. **Score vs effort** (step 3). Three to five athletes, 14 days, session RPE; want Spearman > 0.6.
4. **Angle accuracy and classifier** (steps 1 and 2) once the tape reports angle rather than stretch activation.

Until step 1 has run, describe the model externally as "a transparent, tunable load model built on the pain-monitoring rule and standard ACL protocol milestones", not as a validated score.

## References

- Adams D, Logerstedt D, Hunter-Giordano A, Axe MJ, Snyder-Mackler L. Current concepts for ACL reconstruction: a criterion-based rehabilitation progression. *J Orthop Sports Phys Ther.* 2012;42(7):601-614.
- Wright RW et al. (MOON Group). ACL reconstruction rehabilitation: MOON guidelines. *Sports Health.* 2015;7(3):239-243.
- Grindem H, Snyder-Mackler L, Moksnes H, Engebretsen L, Risberg MA. Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction. *Br J Sports Med.* 2016;50(13):804-808.
- Beischer S et al. Young athletes who return to sport before 9 months after ACL reconstruction have a rate of new ACL injury 7 times that of those who delay return. *J Orthop Sports Phys Ther.* 2020;50(2):83-90.
- Thomeé R. A comprehensive treatment approach for patellofemoral pain syndrome in young women. *Phys Ther.* 1997;77(12):1690-1703.
- Silbernagel KG, Thomeé R, Eriksson BI, Karlsson J. Continued sports activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy. *Am J Sports Med.* 2007;35(6):897-906.
- Gabbett TJ. The training-injury prevention paradox: should athletes be training smarter and harder? *Br J Sports Med.* 2016;50(5):273-280.
- Impellizzeri FM, Tenan MS, Kempton T, Novak A, Coutts AJ. Acute:chronic workload ratio: conceptual issues and fundamental pitfalls. *Int J Sports Physiol Perform.* 2020;15(6):907-913.
- Reilly DT, Martens M. Experimental analysis of the quadriceps muscle force and patello-femoral joint reaction force for various activities. *Acta Orthop Scand.* 1972;43(2):126-137.

Citations are from memory and should be checked against the originals before any of them appears in marketing or an investor document.
