# Kinn feature spec

> **Rebrand note (2026-10-26):** the product is now called **RECO**. This document predates the rename and keeps "Kinn" as written; see [decisions.md](decisions.md).

_Version 0.1 · 2026-10-19 · Owner: Matthew Carlin · Status: draft for review_

This spec says what the Kinn app does, why each feature exists, what data it needs, how the logic works, and what we are assuming. It is written for a 10-week prototype sprint. Decisions behind it are logged in [decisions.md](decisions.md); the technical plan is in [architecture.md](architecture.md); the product history is in [../CONTEXT.md](../CONTEXT.md).

Evidence tags used throughout:

- **[interview]** said by a participant in a Granola-recorded discovery call (Oct 15 to 19, 2026: sarena, Akshay, Lowie/Ava/Sammie, paxton, Riya). All five were athletes or friends. **No physio has been interviewed yet.**
- **[founder]** from Matthew's brief, not yet traced to a recorded interview. Treat as a hypothesis to confirm.
- **[lit]** published rehab protocol or sports-science convention. Cite before quoting in marketing.
- **[assumption]** our own guess. Every one of these has a validation step in section 4.

---

## 0. Scope in one page

**Who.** Pro and college athletes recovering from ACL reconstruction, roughly weeks 4 to 24 after surgery, who see a physio once or twice a week and spend the rest of the week unsupervised. [founder] Mature athletes were chosen because younger athletes under-report symptoms and reject anything that "polices" them. [founder, consistent with interview: compliance tracking rejected as "policing"]

**The question we answer every day.** "Can I push harder today, or should I back off?" [interview: Riya, paxton, Lowie, Akshay all described this uncertainty in their own words]

**What Kinn is.** A thin strip worn on the knee with a snap-in coin that streams knee motion to the phone. The app turns that into one daily **Load score** with a plain-language call, a running record of **Moments** (when something hurt), and a weekly **report** the athlete chooses to share with their physio.

**What Kinn is not.** Not a medical device. It does not diagnose, predict injury, set return-to-sport readiness, or replace the physio's clearance testing. See section 6 for how that shapes the wording.

**Language rule.** Never "compliance", "adherence", "missed", "streak", "score drop", "you failed", "didn't do". Lead with confidence and reassurance. See the banned-words list in 6.4.

### MVP vs later

| # | Feature | MVP (10 weeks) | Later |
|---|---|---|---|
| 1 | Daily Load score + call + breakdown | Yes | Personal baseline learning beyond rolling averages |
| 2 | Range alert | Yes | Loaded-deep-bend alert after full range returns |
| 3 | Coin button / Moments + evening check-in | Yes (in-app button stands in for the coin) | Haptic confirm on coin |
| 4 | Flare-up insights | Yes, rules-based | Statistical / learned triggers |
| 5 | Physio report with share toggles | Yes, athlete-generated PDF or link | Physio accounts, clinic view |
| 6 | Recovery checkpoints | Read-only "next checkpoint" card, physio-editable | Full milestone tracker |
| 7 | Guided training with live rep feedback | No | Yes |
| 8 | Onboarding + pairing + calibration | Yes (simulated coin) | BLE pairing with real hardware |
| 9 | Left/right symmetry | Lightweight "other knee check" | Second strip |

Why guided training is deferred: it needs physio-authored exercise content and per-exercise target ranges we do not have, and per-rep feedback on simulated data would be theatre. Checkpoints are kept as a read-only card because they are cheap and they frame the range alert positively.

---

## 1. Features

### 1.1 Daily Load score

**User problem.** Athletes under-train out of fear or overdo it because the knee "feels fine", and flare-ups arrive hours later with no obvious cause. [interview: Riya ran a 5K thinking she was healed and the pain came back; paxton kept swelling for weeks after activity; Lowie's teammates were "very careful not to overdo it"; Akshay: the gap between PT sessions is anxiety-inducing]. Physios estimate weekly load from questionnaires and nothing tracks load at the joint. [founder]

**What the user sees.**

- One number, 0 to 100, for how much work the knee did today.
- A target band for the athlete's recovery week, drawn behind the number.
- A headline call: **Room to push** / **On target** / **Ease off**, plus one sentence of reason. Example: "You went hard at PT this morning. Keep the rest of today light."
- A breakdown the user can open: PT session, walking and daily movement, stairs, training sets, deep bends past this week's range, impact. Each row shows its share of today's load and when it happened.
- Raw angles are two taps deep (a day timeline of knee angle), never the headline.
- Yesterday and the last 14 days as small bars, each against its band.

**Inputs.**

| Signal | Source | Notes |
|---|---|---|
| Knee flexion angle, ~50 Hz | Two IMUs (thigh, shin) in v0; printed stretch trace + one IMU later | Angle = relative orientation of the two segments about the knee axis. Accuracy target ±5°. |
| Shin acceleration magnitude | Shin IMU | Impact detection. |
| Bend cycles | Derived | A flexion excursion with ≥30° peak-to-trough, split at local minima. Walking swing is ~60°, stairs ~90 to 100°, sit-to-stand ~95°, squat >110°, deep squat >130°. [lit, approximate] |
| Activity class per cycle | Derived | walking, stairs, cycling, squat/bend, run/impact, PT (inside a tagged session), unknown. v0 classifier is threshold-based on peak angle, cadence and impact. |
| Time under deep flexion | Derived | Seconds with angle above the week's deep threshold. |
| Over-range excursions | Derived | Excursions above the range limit (see 1.2). |
| Tagged sessions | User | "I'm at PT" / "Training" start-stop, or auto-suggested from a dense cluster of cycles. |
| Wear coverage | Derived | Minutes the coin reported data, over the active day. |
| Weeks since surgery, graft type, level | Onboarding | Drives the target band and thresholds. |

**Logic.** Section 2 has the full model. In short: each cycle and event earns **knee work units** by type, units sum across the day, and the score is the day's units as a percentage of a reference "full healthy training day". The target band is a function of weeks since surgery, then nudged toward the athlete's own recent history after two weeks of wear.

**The call.** Evaluated against a projection, not the raw so-far score, so 9 am does not always read "Room to push":

```
projected = scoreSoFar + expectedRemainder(hourOfDay)
   expectedRemainder = median over the last 14 wear days of (endOfDayScore - scoreAtThisHour)
                       falling back to a protocol-average day profile until 14 days exist

call = Room to push   if projected < band.lower
     = On target      if band.lower <= projected <= band.upper
     = Ease off       if projected > band.upper

overrides, applied after:
  Ease off      if over-range excursions today >= 3
  Ease off      if a Moment today has pain >= 5, or last night's check-in was swelling "a lot"
  On target     (never Room to push) if any flare-up in the last 24 h
  Not enough data  if wear coverage < 60% of the active day so far
```

**Reason sentence.** Built from the biggest component and the band position with templates, e.g. "PT this morning made up 60% of today's load." / "Mostly walking so far. There's room for your strength set." / "Three bends past this week's range. Keep it easy tonight." The templates must never imply causation about injury or recovery. Templates live in one file so they can be reviewed as copy.

**Edge cases.**

- Day boundary at 04:00 local, so late evenings count toward the day they belong to.
- Coin off or out of range for part of the day: score is marked "partial", the breakdown shows the gap, and the call falls to "Not enough data" below 60% coverage. Never silently extrapolate.
- No surgery date, only "about N weeks ago": accept 2-week buckets; band uses the bucket midpoint.
- Weeks < 4 or > 24: outside the protocol table. Show the band only if a physio has set one, otherwise show the score against the athlete's own 7-day average with the note "No target yet for this stage."
- Strip swapped or re-applied mid-day: prompt a 5-second straight-leg check; mark the data between removal and check as "re-calibrated".
- Calibration drift: a quiet-standing straight-leg reading drifting more than 8° from zero triggers a re-calibration prompt.
- Very high days (score pinned at 100): show "100+" and the real unit count in the breakdown.
- Sample data mode: a persistent "SAMPLE DATA" banner on every screen that shows it.

**MVP / later.** MVP: everything above with simulated data. Later: learned per-person profiles, graft-specific modifiers, pooled priors across users.

---

### 1.2 Range alert ("Safe-range alert" internally)

**User problem.** People in rehab want to keep moving but do not know where productive rehab ends and a setback starts. Nothing accessible quantifies that line. [interview: sarena, named as the most promising use case; Akshay's "green zone": confirm you are not overextending and also that you are extending enough]. Users do not know their own limit and must not be asked for it at setup. [founder]

**What the user sees.**

- One phone notification when the knee bends past this week's range: "Right knee reached 124°. This week's range tops out at 120°. Ease back for now."
- In-app, a quiet range card: this week's range, how often you went past it today, and the next checkpoint it feeds (1.6).
- The range is preset by Kinn from injury type and weeks since surgery, shown as "Typical for week N, from standard rehab protocols. Your physio can set your actual range."
- The athlete can **lower** the limit themselves. Raising it goes through the physio-adjustment screen (1.5), which records who changed it and when. [decision 2026-10-19]
- A 90-minute mute, labelled "At PT" or "Supervised session", for when the physio is pushing range on purpose.

**Inputs.** Knee angle stream; range setting (limit, source, timestamp); mute state; weeks since surgery.

**Default range table [assumption, from common ACL protocols; to confirm with physios].**

| Weeks since surgery | Flexion limit for the alert | Why |
|---|---|---|
| 4 to 5 | 110° | Protocols typically target 120° by week 6; stay under until reached. |
| 6 to 7 | 120° | |
| 8 to 9 | 130° | Approaching full range. |
| 10 to 12 | 135° | Full range expected; alert is about outliers. |
| 13 and later | none by default | Range is no longer the limiter; load is. A physio can still set one. Later: "loaded deep bend" alert instead. |

Graft type (patellar tendon, hamstring, quad, allograft) is recorded but does not change the table in MVP. [assumption: physios may want it to]

**Trigger logic.**

```
exceeded     = angle > limit + 5° (the ±5° accuracy margin)   sustained for >= 0.5 s
one excursion = from exceeding until angle < limit - 5° (hysteresis), max one excursion per 10 s
notify        if excursion and not muted and lastNotification > 10 min ago and notificationsToday < 6
always record the excursion for the load breakdown, even when not notifying
```

**Edge cases.**

- Calibration error makes everything look 10° deeper: the drift check in 1.1 catches it; alerts are suppressed while "re-calibration needed" is showing.
- Sitting deep on a low couch is a legitimate excursion; it still counts, and the reason copy stays neutral ("reached 124°", not "you overdid it").
- Phone unreachable: the coin cannot buzz in v0 (no haptic). Excursions are stored on the coin and synced later; late alerts are shown as a summary, never as a burst of stale notifications.
- Physio raises the limit mid-week: today's earlier excursions are not retroactively erased from history; the breakdown shows the limit that applied at the time.

**MVP / later.** MVP: everything above with simulated angles and local notifications. Later: coin haptic, extension-deficit alert (knee not reaching 0°), loaded-deep-bend alert.

---

### 1.3 Coin button and Moments

**User problem.** Flare-ups show up hours after a hard session and athletes cannot remember a week of them when the physio asks. [founder, and interview: Riya and paxton described exactly this pattern]. The physical button to log pain in real time was the single strongest reaction in interviews ("Wait, where was this four years ago?"). [interview: Riya]

**What the user sees.**

- Press the coin (or the big in-app button in v0): a short confirmation, nothing else to do.
- Later, usually that evening, a card asks to tag each untagged Moment in two taps: **feeling** (Sharp pain, Ache, Unstable, Swollen, Stiff, Just noting) and an optional **0 to 10 pain** slider. Skip is allowed; untagged Moments still count.
- Each Moment stores: time, knee angle at the press, the 60 seconds of angle before it, the activity class at the time, the load score so far that day, and (later) the tag.
- **Evening check-in**, one tap, around 21:00 or on first open after 19:00: swelling tonight? None / Some / A lot. Optional note. This exists because swelling was the flare-up signal most often mentioned and it is not in the sensor data. [interview: paxton; founder]

**Edge cases.**

- Accidental presses: a second press within 10 s cancels. Moments with no tag after 7 days are kept as "untagged".
- Press while coin is disconnected: timestamped on the coin, synced later with the angle buffer the coin kept.
- A Moment logged with pain ≥ 5, or feeling Sharp/Swollen, or check-in "A lot" is a **flare-up** for 1.4 and the call overrides in 1.1. Threshold is an [assumption].

**MVP / later.** MVP: in-app button, tagging, check-in, flare-up rule. Later: coin button over BLE, haptic confirmation.

---

### 1.4 Flare-up insights

**User problem.** The athlete and physio both want to know what sets flare-ups off. Nobody can do that from memory. [interview: sarena, Riya; founder]

**What the user sees.** Short observations, only when there is enough support, phrased as observations not causes:

- "Both flare-ups this week came after days over 75."
- "3 of your 4 Moments were within 2 hours of stairs."
- "Your swollen evenings this month all followed days with 5+ bends past your range."

**Logic (rules-based in MVP).**

```
for each candidate condition C in:
   same-day load > band.upper
   same-day load > 75
   previous-day load > band.upper
   over-range excursions same day >= N (N in 3, 5)
   Moment within 2 h of activity class A (stairs, run/impact, squat/bend, PT)
   two consecutive days above band
compute support = flare-ups where C held / all flare-ups in the window (7 or 30 days)
show C if flare-ups >= 2 and support >= 0.67 and the condition held on <= 50% of all days
      (so "after a day over 75" is not shown when every day was over 75)
rank by support, then by how rare the condition is; show at most 2
```

**Edge cases.** Fewer than 2 flare-ups: show nothing, not a placeholder that nags. Conflicting conditions: show the rarer one. Never say "caused", "because", "risk", "injury".

**MVP / later.** MVP: rules above. Later: per-person conditional probabilities once there are weeks of data; pooled, anonymised priors across athletes.

---

### 1.5 Physio report and sharing

**User problem.** Physios see the athlete one hour a week and estimate the rest. [founder; CONTEXT.md] Athletes must control what is shared, and nothing in the report may read as surveillance. [interview: sarena rejected compliance tracking as policing; founder]

**What the user sees.**

- A **weekly report** the athlete generates (PDF via the share sheet, or a read-only link later). Sections, each with its own toggle:
  1. Load per day against the band, with the call for each day.
  2. Flare-ups and the two days before each one.
  3. Deepest bend each day and time past this week's range.
  4. Left vs right comparison, when an other-knee check exists (1.7).
  5. Training and PT sessions: count, duration, reps counted. Labelled "sessions recorded", never "sessions missed".
  6. Moments list with tags. Free-text notes are **off by default**.
- Defaults: 1 to 5 on, 6 on without notes. The athlete sees a preview before anything leaves the phone.
- **Physio adjustment screen**: a place in the app where, sitting with the physio, the limit and band can be changed. It asks for the physio's name, stores it with the change, and shows "Set by [name] on [date]" everywhere that value appears. No login in MVP. [decision 2026-10-19: report-only physio side, no accounts]

**Edge cases.** Report for a week with little wear: coverage stated at the top. Report must never include adherence-style aggregates, even if they are derivable. Regenerating a report after a physio changes the band uses the band that applied each day.

**MVP / later.** MVP: PDF report, toggles, adjustment screen. Later: physio accounts, live clinic view, remote therapeutic monitoring billing support (which has its own regulatory and language consequences; see 6).

---

### 1.6 Recovery checkpoints (read-only card)

**User problem.** Physios progress patients by pass/fail milestones, and the next one gives the range alert a positive frame: a limit is also a goal. [founder; Lowie described the gradual, gated progression around ACL athletes]

**What the user sees.** One card: "Next checkpoint: 120° comfortable bend. Typical around week 6. Often unlocks the stationary bike." Editable by the physio on the adjustment screen. No pass/fail judgement from Kinn; the card shows the deepest comfortable bend this week next to the target and the physio decides.

**Default checkpoints [assumption, from common protocols].** Full extension (0°) by week 2 to 4; 120° by week 6 (bike); full flexion by week 8 to 12; jogging typically week 12 to 16 by strength criteria; sport-specific work after week 16; return to sport usually 9+ months and only on clearance testing. Kinn shows the range ones only; strength and clearance milestones are the physio's.

**MVP / later.** MVP: card with defaults and physio edit. Later: full tracker.

---

### 1.7 Left/right symmetry (lightweight)

**User problem.** Clearance testing is about symmetry and objective data could add to it. [founder] One strip cannot see both knees.

**MVP approach [assumption].** An optional monthly **other-knee check**: move the strip to the other knee for a two-minute scripted set (10 steps, 3 slow squats, a stair if available) and store peak flexion, flexion speed and bend-cycle shape. The app then shows "Right knee reaches 112°, left 134°" in the report. No percentage "symmetry index", no readiness statement.

**Later.** Second strip and coin for continuous comparison.

---

### 1.8 Onboarding, pairing, calibration

**Steps.**

1. Injury: ACL reconstruction (default) with optional graft type; other knee injuries accepted but marked "limited targets".
2. Which knee.
3. Surgery date, or "about N weeks ago" in 2-week buckets.
4. Level: pro, college, recreational. In MVP this only labels the report; later it tunes the band.
5. Pair the coin. v0: "Simulated coin" with a scenario picker (see architecture). Later: BLE scan.
6. Calibrate: stand with the leg straight for 5 seconds, then one gentle bend and back. The straight-leg reading becomes 0°; the gentle bend confirms the sign and that the angle rises with flexion.
7. Done. First screen shows "This week's range: 120°, typical for week 6" and an empty score with "We'll have your first call this evening."

Never asked: a bend limit, a daily goal, pain history, consent for sharing (sharing is off until the athlete generates a report).

**Edge cases.** Calibration while sitting: detected by a non-zero steady angle and rejected with a hint. Left/right mirrored mounting: the gentle bend fixes the sign.

---

## 2. Load score model, first pass

Everything in this section is an **[assumption]** unless tagged otherwise. The structure is chosen so that each constant can be tuned from data without changing the shape of the model.

### 2.1 Knee work units

Each detected cycle or event earns units. Units are additive across the day.

| Component | Detection | Units | Rationale |
|---|---|---|---|
| Walking cycle | peak 30 to 75°, cadence 80 to 130/min, shin impact < 2 g | 1.0 | Baseline unit. ~5,000 cycles per knee on a 10k-step day. |
| Cycling cycle | peak 70 to 115°, rhythmic 50 to 110 rpm, impact < 1.3 g | 0.5 | Low-load range work. |
| Stair cycle | peak 80 to 110°, vertical accel pattern, cadence < 90 | 3.0 | Stairs load the knee at ~3× walking. [lit, order of magnitude] |
| Bend / squat cycle | peak > 90° (weeks < 8) or > 110° (later), not walking cadence | 3.0 | Controlled strength work. |
| Deep flexion time | seconds above the deep threshold | 1.0 per 10 s | Time under deep flexion matters as well as count. |
| Over-range excursion | per 1.2 | 10.0 | Counted hard so the breakdown surfaces it; also drives alerts. |
| Impact event | shin accel peak > 2.5 g | 2.0 × (peakG − 1.5), min 1 | Running strikes ~3 to 6 g on the shin; jumps higher. Scales with magnitude. |
| Training rep (inside a tagged PT or training session) | any cycle inside the session | multiply the cycle's units by 1.5 | Reps are usually loaded or controlled past normal range. |

Why multiplicative for sessions rather than a flat unit: a 45-minute PT session of mixed walking, bike and squats should score more than the same movements spread over the day, but by how much depends on what was done.

### 2.2 Score

```
rawUnits   = sum of units for the day
HEALTHY_DAY = 12,000 units    // anchor: a full training day for a healthy athletic knee
                              // ≈ 5,000 walking cycles + 30 min run (~2,500 strikes) + 200 stairs + a strength set
score      = min(100, round(100 * rawUnits / HEALTHY_DAY))
```

The score is linear in units up to 100 and pinned there. Linear is easier to explain to athletes and physios than a logarithmic strain scale, and the ceiling is a real signal ("100+" shows in the breakdown).

### 2.3 Target band by weeks since surgery

Anchors, linearly interpolated between them:

| Week | Lower | Upper |
|---|---|---|
| 4 | 20 | 35 |
| 6 | 25 | 40 |
| 8 | 30 | 50 |
| 10 | 35 | 55 |
| 12 | 40 | 60 |
| 14 | 45 | 65 |
| 16 | 50 | 75 |
| 20 | 60 | 85 |
| 24 | 65 | 90 |

The upper bound rises slowly between weeks 10 and 16 on purpose, because that is the window the brief identifies as highest re-tear risk while the graft remodels. [founder; lit says graft is weakest in the 6 to 12 week remodelling phase, so the exact window is a question for physios]

**Personalisation after 14 wear days.**

```
chronic = mean score over the last 28 days (or all days if fewer)
acute   = mean score over the last 7 days
band.center = 0.6 * protocolCenter + 0.4 * chronic
band.width  = protocolWidth
band.upper  = min(band.upper, 1.3 * chronic)      // acute:chronic ratio guard, borrowed from sports science [lit: ACWR "sweet spot" 0.8 to 1.3]
band.lower  = max(band.lower, 0.8 * chronic)
```

A physio-set band replaces the protocol band and is not personalised away.

### 2.4 Validation and tuning plan

1. **Bench angle accuracy.** Two IMUs on a hinged jig and on three volunteers against a goniometer and slow-motion video at 0°, 45°, 90°, 120°, 135°. Target ±5°. If worse, widen the ±5° alert margin.
2. **Activity classifier.** Record labelled sessions (walk, stairs, bike, squats, jog) from 5 people; confusion matrix; require ≥85% per class before trusting the breakdown.
3. **Does the score track effort?** 3 to 5 athletes wear it for 14 days and log session RPE (0 to 10) and a one-word day rating. Spearman correlation between daily score and RPE; we want > 0.6. Also compare against step count from their watch as a sanity check (walking units should track steps).
4. **Does the band make sense to physios?** Show 3 physios 10 simulated days (section 3 of architecture) and ask them to rate each day's load 1 to 10 and give a push / hold / ease call. Tune unit weights and band anchors to maximise agreement with the majority call. This is the single most important tuning step and does not need hardware.
5. **Do flare-ups follow high-load days?** Within-person: are the two days before a flare-up higher-load than the athlete's median? If not, the insights rules are wrong or the inputs are missing something (sleep, swelling, strength work the strip cannot see).
6. **Alert nuisance.** Count alerts per day and the mute rate. Over 4 alerts a day or frequent mutes means the hysteresis or the default table is wrong.

Everything tunable sits in one constants file with a version number that is stored alongside each day's score, so historical scores can be recomputed when weights change.

---

## 3. Open questions for the next physio interviews

Ordered by how much they change the product.

1. How do you set a patient's bend limit today, and when do you change it? Protocol week, what you saw in clinic, pain, swelling, graft type?
2. If a patient showed you a 0 to 100 daily knee-load number, what would you want it to count? Walking? Stairs? Strength reps? Bike? Would you weight any of them differently from how we do?
3. What would make you trust the number: a validation study, a comparison to your own session notes, a name you recognise, or seeing it match your clinical impression for a few weeks?
4. Which weeks after ACL reconstruction worry you most, and why? (We are assuming 10 to 16.)
5. Does graft type change what you would want the limits or the load band to be?
6. When a patient reports swelling or pain the next day, what did they usually do the day before? Would a list of the two previous days' load help you, or is it noise?
7. What do you currently do with a patient's self-report of pain 0 to 10? Would an evening swelling check-in be useful to you, or only to the patient?
8. How often is too often for a phone alert about range? Would you want to see how often it fired?
9. Would you set the range yourself in the patient's app during a visit, or would you rather the patient did it from your instructions?
10. What is the smallest weekly summary you would actually read? One page? One chart?
11. For clearance testing, what symmetry measures do you use, and would knee-angle data from everyday movement add anything, or only data from a formal test?
12. Would you ever want a "supervised session" mode that lets the patient push past the range at PT without alerts?
13. Have you used two-sensor knee monitors (TracPatch or similar)? What stopped you using them more?
14. Does anything here feel like it polices the patient? Where is the line for you?
15. Would you want Kinn to tell the patient when they can start the bike or jog, or is that always your call? (We assume always yours.)

---

## 4. Simulated days (for the prototype and for physio interviews)

The sensor layer can play these at real time or fast-forward. Each is labelled SAMPLE DATA everywhere it appears. Target scores assume week 10.

| Scenario | What happens | Expected score (wk 10 band 35 to 55) | Expected call |
|---|---|---|---|
| Rest day | 3k steps, no sessions, one short stairs trip | ~15 | Room to push |
| Hard PT morning | 45-min PT 9:00 with bike, squats, step-ups; then 6k steps | ~50 by noon, ~60 EOD | On target → Ease off by evening |
| Deep squat set | Normal day plus a set with 4 bends to 128° (limit 135° so no alert) and 2 to 138° (alerts) | ~45, 2 excursions | On target with excursions shown |
| Stairs-heavy day | Campus day, 400 stair cycles, 9k steps | ~55 | On target, stairs biggest component |
| Return to jog | 20-min jog at 3 to 4 g strikes plus normal walking | ~75 | Ease off |
| Flare-up day | Moderate day, Moment at 16:00 with pain 6 after stairs, swelling "a lot" at night | ~40 | Ease off (override) |
| Coin off afternoon | Hard morning then no data after 13:00 | partial | Not enough data |

---

## 5. Anything that touches the clinic

- The report is generated and sent by the athlete. Kinn is not a covered entity under HIPAA in this model and holds no clinic data. If clinics later onboard patients or bill remote therapeutic monitoring codes, that changes: business associate agreements, audit logs, and the compliance language that billing requires. Park it, and note that RTM billing explicitly pays for "monitoring", which collides with the no-policing stance. [CONTEXT.md market notes]
- Data stays on the phone in MVP. Export is user-initiated. There is no account.

---

## 6. Staying out of medical-device territory

### 6.1 Where the line is

The FDA's General Wellness policy leaves low-risk products alone when they are intended for general wellness (fitness, activity, recovery from exercise) and make no disease or condition claims, or when they help people with a known condition live well and the technology is low-risk and well understood. A simple goniometer is a Class I exempt device. Whoop, Oura and Garmin live here by talking about strain, readiness and recovery as training concepts, not clinical ones. [lit; confirm with counsel before launch]

Kinn's risk is **intended use**, not the sensor. The moment the product's purpose is "manage recovery after ACL surgery" or "prevent re-tear", it is making a claim about a medical condition, and a limit "set from injury type and surgery timing" looks like a clinical determination made by software.

### 6.2 Features that could push us over, and the mitigation

| Feature as briefed | Risk | How we word and build it |
|---|---|---|
| Kinn sets the safe range from injury type and surgery timing | Software deciding a clinical limit | Default is labelled "Typical for week N, from published rehab protocols." The physio sets the actual range on the adjustment screen. The athlete acknowledges this once at onboarding. Internally "safe range"; in UI "this week's range" or "your range". |
| "Bends deeper than it's ready for" | "Ready" is a clinical judgement | "Past this week's range". |
| Load target by recovery stage | Treatment guidance | Target band is "typical", physio-editable, and the call is training guidance in Whoop's register: push, on target, ease off. Never "stop", "unsafe", "danger". |
| Flare-up insights | Diagnosis of cause | Observations only: "came after", "within 2 hours of". Never "caused", "because", "risk". |
| Weeks 10 to 16 re-tear risk window | Injury prediction | We never show a risk number or the word re-tear in the app. The band shape encodes caution silently. |
| Left/right symmetry | Readiness or clearance claim | Show the two numbers. No index, no "cleared", no "ready". |
| Checkpoints | Treatment plan | "Typical around week 6, often unlocks the bike" with the physio as the one who decides. |
| Physio report | Clinical decision support | It is a summary of the athlete's own data that the athlete chooses to share. No recommendations to the physio. |
| Name and positioning | Intended use | Position as a knee **training-load and movement tracker for athletes, including athletes returning from injury**. "ACL" can appear in onboarding as a selectable injury and in marketing stories, not in the stated purpose. |

### 6.3 Required wording everywhere it fits

- "Kinn tracks movement. It does not diagnose, treat or prevent any condition and does not replace your physio."
- "Not a medical device." (Already on the site.)
- Alerts: "reached", "past this week's range", "ease back". Never "stop", "unsafe", "injury".

### 6.4 Banned words in UI, notifications and reports

compliance, adherence, adherent, non-compliant, missed, skipped, streak, failed, lazy, policing, surveillance, monitor (as a noun for the person), patient (use "you" or "athlete"), diagnose, treat, cure, prevent, predict, risk score, re-tear, unsafe, danger, cleared, ready to return.

Allowed and encouraged: room to push, on target, ease off, your range, this week's range, recorded, logged, noted, typical for week N, your physio decides.

---

## 7. What is deliberately not in this spec

- Guided training with live rep feedback (needs exercise content and target ranges from physios).
- Any backend, accounts or sync.
- Visual design. The prototype UI is plain.
- Pricing, packaging and the hardware build.
