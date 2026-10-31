# What RECO is

_Version 1.0 · 2026-10-30 · Source: the team doc's "WHAT TF IS RECO" tab, expanded · Status: draft for team review_

This is the source of truth for what RECO is and where it is going. If another doc disagrees about the product's direction, this one wins. The other docs describe how the current build works.

## In one line

**RECO is a smart tape and app that helps people recovering from an injury get back to their lives sooner, with fewer setbacks. It tracks the injured joint every day, shows their progress and what comes before their pain, and gives their PT the full picture between visits.**

"Sooner, with fewer setbacks" is the goal we are building toward. It is not a result we have shown, so it is not a claim we can make yet.

## The idea

Recovery is decided in the hours nobody sees. A PT sees you for 1 to 3 hours a week. For the other 160+ you are guessing, and at the next visit you report it all from memory.

People don't stall because they are unmotivated. They get discouraged because they can't see progress or tell when they will be back to normal.

RECO makes those hours visible and turns them into a next step. It should feel like WHOOP for one injury: you wear it, forget about it, and the app tells you what your data means.

## The problems we solve

| Problem | RECO's answer |
|---|---|
| Recovery is long, uncertain and discouraging | A progress meter built on measured data and tied to the goal you want to get back to |
| You can't pin down what causes a flare-up, and the PT only sees the clinic | A pain button, lined up with what the tape recorded before it |
| There is no good way to log your week | One press on the device, with more detail only if you want to add it |
| What the PT hears doesn't match what happened | A measured record you own and choose to share |
| Close attention is expensive or rare | Guidance every day between visits, and a plan if you have no PT |
| Nobody knows how much strain is too much | A personal line, learned from your own pain history |
| People stop before recovery is finished | A plan that keeps going after PT ends, until you reach your goal |

**On "lying to their PT":** people forget, round up, and don't want to disappoint anyone. RECO fixes that with a better record, not by checking up on them. It must never feel like policing. An early interviewee rejected compliance tracking in exactly those terms, so the record belongs to the patient.

## The core bet: your line

There is no universal number for how much is too much, and RECO won't pretend to have one.

Instead it learns your line. It connects what you did, how far and how much the joint moved, and what hurt afterward, including pain that shows up hours later. A clinic visit can't capture this, and neither can a whole-body wearable or an exercise app.

This is why the tape and the button both have to exist. The tape records what happened, the button records what it cost, and the pattern between them gets more specific the longer you wear it. Until there is enough personal history, RECO starts from published rehab protocols and simple rules.

## The product

- **Smart tape.** Athletic-style tape, worn on the injured joint, that collects movement angle and load outside PT visits. Load is an estimate derived from movement, not a direct measure of force on the tissue.
- **Coin.** The reusable electronics that slide into the tape. It has the pain button. The tape is the refill.
- **App.** Turns the data into progress, a changing plan and warnings, rather than raw numbers.
- **PT report.** A short, data-driven summary of life between visits.

## Two paths, one product

| | Has a PT | No PT (cost or access) |
|---|---|---|
| **The plan comes from** | The PT. RECO reflects it and fills in the days between visits | RECO, from onboarding answers and published protocols |
| **Who sets the limits** | The PT | Conservative defaults that only tighten on their own |
| **Where the data goes** | A report the patient sends to the PT | Stays with the patient until they want a PT |
| **Way forward** | Better visits, because the PT starts with context | Optional match with a RECO-approved PT, who starts with the injury history |

The PT is never replaced. When a PT is involved, their word overrides RECO's.

## The app

### Step 1: a five-minute onboarding

1. Choose the injury: knee, shoulder or elbow.
2. Describe it in your own words. RECO listens and pulls out the details, Granola-style, so you don't fill out a long form.
3. Answer a few prompts: Do you have a PT? Did you have surgery? How long ago?
4. Name what you are trying to get back to. This goal anchors everything that follows.
5. If you have no PT, RECO builds an individual plan.

### Step 2: the core features

**1. Progress meter.** One WHOOP-style view of where you are in your recovery and how far it is to your goal.
- It has to move because of what you did, not because time passed. It can plateau or dip, and it should explain why when it does.
- It answers "when will I be back?" with an honest range, never a clearance date.

**1.1 The adaptive plan.** What to do this week: exercises, walks, and guided sessions.
- It changes with what you actually did today and in the past. A hard Tuesday with pain that doesn't settle means a lighter Wednesday.
- It never pushes when the signals disagree. If the data is unclear, or pain hasn't settled, it holds back.

**2. Pain logging.** Press the button on the device. That is all you have to do, and it fixes inconsistent logging at the source.
- The app then offers optional detail: a voice note, what you were doing, maybe a photo of swelling.
- A check-in later asks how the pain is now, because pain can flare hours afterward. RECO lines that up with the day's activity.
- Each pattern is written in plain language, such as "3 of your last 4 flare-ups came after game days."

**3. Warning signs.** During activity, RECO compares what you are doing with what came before your past pain, warns you of overuse, and suggests what to do about it.
- The purpose is confidence: you can keep pushing because you know something will speak up. That answers the fear of re-injury.
- Warnings must be rare, explained and tied to your own history. Each one shows why it fired and has a "that was wrong" button. They only fire on a good sensor signal, because a peeling strip must never cause an alert. False alarms cost more trust than unneeded caution.

**4. PT report.** A one-page summary of the time between visits, in a format a PT will actually read.
- Schedule send delivers it before each appointment, so the PT has time to review it.
- The patient decides what's included and turns scheduling on. Nothing is sent without that choice.

### Step 3: every day

1. Put on the tape, slide in the coin, and forget it's there.
2. See today's exercises from your plan.
3. Answer the daily prompts and check-ins. You choose how many notifications you get.
4. Press the button when something hurts.

### Later: PT matching

RECO uses your data to find a certified PT and makes the handoff easy, because the PT starts with your injury history. This waits until the core loop works with real patients.

## Why it matters

**For patients:** you take control of your recovery with real data, see it moving, and stay informed enough to make the most of it.

**For PTs:** evidence-based decisions, better use of clinic time and more satisfied patients. Lower total care cost and better recovery are the outcomes we expect and still have to prove.

## Who it's for

**The vision is anyone recovering from a joint injury, with or without a PT.**

**The first version is knee injuries, focused on active people in the strengthening and return-to-activity stretch (about months 3 to 9).** All the code, hardware and interview evidence so far are knee-specific. It is also the clearest gap: in one study of 11,518 ACL patients, 90% of first-year PT visits were done by week 16, while return to sport typically takes 9+ months. Each new joint needs its own tape shape, movement model and protocol data, so shoulder and elbow come after the knee works.

## Why RECO is different

| Alternative | What it does | What it misses |
|---|---|---|
| WHOOP, Oura | Whole-body recovery scores | Nothing about your specific injury |
| Hinge Health | Online PT and guided exercise | Sees you during sessions, not the rest of the day |
| TracPatch | Knee data for surgeons | Built for knee replacement, used in the first weeks after surgery, and owned by the clinician |
| A PT alone | Expert judgment | An hour-long snapshot and your memory of the week |

**RECO is the only one that is joint-specific, worn through daily life, owned by the patient and learns from your own setbacks.**

## Where we draw the line

RECO explains patterns in your data. It does not diagnose. That line has to survive every screen, and the new vision pushes on it harder than anything before it. Earlier research found that patient-facing guidance, not the sensor, sets the regulatory burden. **The no-PT plan and the warnings need a regulatory review before real users rely on them.** Until then they are shown in trials or through a PT.

| The vision says | The product says | Why |
|---|---|---|
| Re-injury detector | Warning signs, overuse warning | We can't detect an injury, and "detector" is a medical claim |
| Fewer setbacks, faster recovery | Our goal | Unproven, so it can't be a promise |
| Recovery plan | Your plan, based on published protocols; your PT can change it | It must not read as treatment |
| How close you are to recovered | Your progress toward your goal | It is never clearance to return |
| What triggers your pain | What came before your pain | We see patterns, not causes |

Red flags such as a sudden pain spike or the joint giving way stop the normal advice and tell you to contact a clinician. The full wording rules are in [feature-spec.md](feature-spec.md) section 6.

On statistics: use "about 23 to 30% of young athletes have a second ACL injury after returning to sport." Don't say "1 in 3," and don't present the high end as a population-wide rate.

## Where we are today

| Vision | In the repo now | Main gap |
|---|---|---|
| Onboarding | Three short steps, knee only | Voice intake, other joints, generated plan |
| Progress meter | Recovery % dial | Range data is sample data, and the score rises with the calendar alone |
| Adaptive plan | One daily status and suggestion | No plan or exercises. App copy still says RECO doesn't prescribe exercises |
| Pain logging | In-app button, "Did it settle?" check, flare-up patterns | Device button not wired up in firmware; no voice or photos |
| Warning signs | Next-morning status rules | No live warnings based on personal history |
| PT report | Weekly summary through the share sheet | No one-page document or schedule send. Send needs a backend, and today's promise is that nothing leaves the phone |
| Smart tape | Prototype tape streaming muscle activation; touch button on the puck PCB | No angle yet, so tape data doesn't feed the meter. No native iOS Bluetooth |

Sensor direction: no two-IMU design. We are planning around one shin IMU plus EMG and/or a stretch sensor, and that combination isn't locked yet.

## Open calls

Ordered by how much they change what we build.

1. **Does the no-PT plan ship in the first version?** It is the widest market and the biggest regulatory exposure. Recommendation: build the PT path first, and test the no-PT plan in the trial with study oversight.
2. **How do we confirm knee-first?** The vision names three joints. This doc starts with the knee. See [decisions.md](decisions.md).
3. **Who pays?** The team doc says B2C, while research says comparable products reached people through clinicians and pricing by recovery episode fits a bounded need. Sell to the patient, and test PTs and athletic trainers as the way in.
4. **Can the tape really be worn all day?** "Forget it's there" is the promise, but tape adhesion, skin reaction and battery life under daily wear are unmeasured. An earlier strategy note argued for sessions and sport only. The trial decides.
5. **What will PTs actually use?** The PT side of this doc still needs direct PT validation. Their answers decide the report format and how much they will trust the data.

## What the trial must show

1. People keep wearing the tape, and their skin tolerates it.
2. People press the button, and the pain data forms real personal patterns.
3. The tape's readings match clinical measures such as a goniometer.
4. Warnings are precise enough that people don't mute them.
5. PTs read the report and change something because of it.
6. People will pay, and we learn how much.
