# RECO pilot feature spec

_Version 0.1 · 2026-11-06 · Status: draft for team review · Pairs with the [Reco Project Context](https://claude.ai/artifact/YcTEsBLb1xuLCEdtm5jFSg), [vision.md](vision.md), [decisions.md](decisions.md)_

**What this is:** the features, screens and states for the first build real people use for their own recovery. It is the input to the styling pass, then the build. It covers function only, not visual design.

**The pilot in one line:** about 10 adults, 3 to 12 months into a knee recovery, use the app through TestFlight for 4 weeks. There is no tape in the first phase. We learn whether people keep logging, whether their logs form patterns, and whether PTs use the report.

## 1. Assumptions to confirm

| # | Assumption | Why | If wrong |
|---|---|---|---|
| A1 | Patient-first, with the report as the bridge to PTs | Matches the go-to-market in the pitch script, and recent calls ask for the same thing. Resolves the Project Context's open "24/7 PT vs PT tool" question. | PT tool first: report and PT plan come first, and Today shrinks |
| A2 | Voice uses an opt-in AI step through a small server, with on-device rules as backup | Rules will miss messy speech, and voice is the logging promise in the pitch | Rules only: no server, the privacy policy stays as is, and users correct more by hand |
| A3 | Phase A has no tape | The iOS app has no Bluetooth yet (`tape/ble.ts` is a stub), and the firmware reads a pressure sensor, not knee angle | See section 11 |
| A4 | Size, length and adults-only | The gap analysis recommends adults first and about 10 people. Four weeks is our guess at a useful first read. | Minors need a second protocol with parental permission |
| A5 | Knee only, ACL and meniscus first | Project Context: start with the knee | Shoulder and elbow plan content exists in core but stays hidden |

## 2. Blockers before any real person uses it

These are not features. Each one makes the pilot unsafe or its data useless if left as it is.

| # | Problem today | Required behaviour |
|---|---|---|
| B1 | Finishing onboarding keeps the sample athlete's 21 days, so a tester sees Maya's flare-ups as their own (`store/state.ts`) | A real account starts empty. Sample data lives under a separate storage key and can never mix with real data. |
| B2 | Range numbers are simulated and labelled "via RECO tape" | No simulated number appears in real mode. Range comes from typed-in measurements, labelled by who measured them. |
| B3 | Screens assume weeks of history | Every screen has a first-day and an early-days state (section 6) |
| B4 | There is no consent, age check or data deletion | Consent screen, 18+ gate, and "Delete my data" in Settings |
| B5 | The privacy policy says nothing leaves the phone, and voice AI (A2) makes that untrue | Update the policy and add a separate opt-in before the first AI request |
| B6 | Plan and warnings are guidance, and the decision log says they need review before real users rely on them | Guidance levels (section 4), defaulting to Descriptive |
| B7 | Settings says "RECO doesn't prescribe exercises" while the plan exists | Copy follows the guidance level |
| B8 | Deleting the app or changing phones loses everything, because data is only on the phone | Weekly export prompt during the pilot, and say this plainly at consent |

## 3. Two data modes

| | Real (default in TestFlight) | Sample (default at `/try`) |
|---|---|---|
| Starts with | Nothing | The 21-day sample athlete |
| Storage | `reco.state.v1` | A separate key |
| Range numbers | Typed in, labelled "Your PT measured" or "You measured" | Simulated, with a "Sample data" tag on every screen |
| Notifications | On, per settings | Off |
| Export | Yes | Off |

In TestFlight, "Look around with sample data" is a clearly bannered side trip from Settings, with one tap back to the user's own data.

## 4. Guidance levels

This is the largest product decision in the spec. The gap analysis found that patient-facing guidance, not the sensor, sets the regulatory burden. So the build carries one setting with three levels. Screens share the same slots, so styling only happens once.

| Surface | Descriptive (default) | PT-led | Guided |
|---|---|---|---|
| **When allowed** | Always | The user's PT has agreed to take part | After regulatory review, or in a study with oversight |
| **Today's chip** | Settled · Mixed · Flared | Same as Descriptive | Keep going · Steady · Ease off |
| **Line under it** | "Morning pain 2. Yesterday's load 67, your usual is 40." | Same as Descriptive | Those facts, plus one suggestion |
| **Plan** | The exercises the user typed in, with check-offs | The PT's exercises, with check-offs and "Your PT can change this" | Generated plan that adapts each day |
| **Warning card** | The facts only: "Your last 3 flare-ups came after days around 80. Today is at 85." | Same, plus "Worth mentioning to your PT" | The facts plus "Keep the rest of today light" |
| **No-PT user** | Logging, patterns, report | Not applicable | Generated plan |

Every level keeps the red-flag rule (section 5.6) and "RECO is in development and is not a medical device" near any guidance.

**Recommendation:** launch in Descriptive and PT-led. Book the hour with a law clinic or regulatory advisor, then turn Guided on for specific testers if it clears. A university IRB route may also be needed if results will be published, or if Guided runs as a study; the advisor should confirm.

## 5. Features

"Core" means the logic is already in `@reco/core` with tests. Most of the build is screens and storage.

| # | Feature | Core | Screens |
|---|---|---|---|
| 5.1 | Consent and onboarding | Parser yes | New |
| 5.2 | Today | Yes | Rework |
| 5.3 | Plan | Generated plan yes; typed-in PT plan no | New |
| 5.4 | Pain button and end-of-day check | Partly | Rework |
| 5.5 | Voice diary | Parser yes | New |
| 5.6 | Warning signs and red flags | Yes | New |
| 5.7 | Patterns (Insights) | Yes | Exists, needs empty states |
| 5.8 | Progress and range entry | Mostly | Rework |
| 5.9 | PT report | Document yes | Rework |
| 5.10 | Notifications and Settings | No | Rework |

### 5.1 Consent and onboarding (about 5 minutes)

1. **Welcome.** Tagline, "Get started".
2. **Consent.** What RECO is and is not, where data lives, that it is lost if the app is deleted without an export. A date-of-birth or 18+ check blocks minors with a kind message.
3. **Voice opt-in.** "Tell RECO about your injury." Unticked by default, with a plain statement that the words are sent to an AI service to be sorted. "Type or answer questions instead" is equal in weight.
4. **Tell RECO.** Speak or type. Live transcript.
5. **Here's what RECO heard.** Injury, side, when, surgery, sport, goal, PT. Every field is editable, and a field not found shows as a question rather than a guess.
6. **Fill the gaps.** One question per screen, only for what is still missing.
7. **The PT fork.**
    - Has a PT: name, optional email, next visit date, and "Add the exercises they gave you" (now or later).
    - No PT: says what RECO will and won't do at this guidance level.
8. **Your goal.** "What are you getting back to?" It appears on Today and in the report.
9. **Starting point (optional).** "Do you know your latest bend and straighten numbers?"
10. **Notifications.** Asked here, with the one-a-day default explained, not on first launch.

States: voice refused or unavailable falls back to typing; no recognised fields goes straight to questions; earlier than month 3 is allowed, with a note that RECO is built for later in recovery; a non-knee injury gets a "not yet" message and the waitlist.

### 5.2 Today

Order: greeting, week calendar, morning asks (until answered), dial and chip, plan for today, Log pain, today's load.

- **Calendar:** seven days, a dot for how each morning read. Tapping a past day opens Day detail (what you logged, pain, check-in, notes). No streak language.
- **Dial:** see 5.8 for what it means and when it shows.
- **Chip and reasons:** one of the three words plus the two or three inputs behind it. Tapping shows the full reasoning.
- **Morning asks:** "Did it settle?" and check-in, in one card, gone once answered. One ask at most is pushed per day.

States: Day 1 (no chip, "Your first read comes after tomorrow's check-in"); check-in not done (facts so far, no chip); flare day; red flag replaces the whole top section.

### 5.3 Plan

- **With a PT:** the user adds exercises (name, sets and reps, days per week, optional note). Today shows what is due; tap to mark done. A Plan view shows the week. Editing is always allowed and shows "from your PT".
- **Without a PT, below Guided:** no generated exercises. Shows the phase they are in, in plain language, from the [knee recovery guide](https://claude.ai/artifact/69fEy9tu4FatNfKuzYwH3p), and how to find a PT.
- **Guided:** generated plan from `plan/build.ts`. Lighter on Steady, recovery day on Ease off, and holds back a phase after two flare-ups in 10 days. Always labelled "Your plan, based on published rehab protocols. Your PT can change it."

Weekly count ("3 of 5 this week"), never a streak. A plan item not done is simply not done; there is no "missed" state.

States: no exercises yet; rest day; all done; Ease off day (Guided only).

### 5.4 Pain button and end-of-day check

- **One tap saves** the time immediately, before any question. This is the behaviour the coin button will have later.
- **Then optional detail,** all skippable: 0 to 10, what you were doing, voice note, swelling photo. Files stay on the phone.
- **End-of-day check** (off unless chosen): "How's the knee tonight?" Catches pain that shows up later.
- **Next morning:** "Did it settle?" as today.

States: detail skipped (still counts, can be completed later from Day detail); photo or microphone permission refused; two taps by accident (undo for 10 seconds).

Rule: an untagged press must count in patterns. Today, a rating is required to save.

### 5.5 Voice diary (Log tab)

Speak or type your day, then see "RECO sorted it into": activity and intensity, pain, recovery notes. Each is editable and removable, and nothing saves until confirmed. "Add by hand" stays available, with today's chips. Log keeps the load bar against your usual and the last 7 days.

The original words are kept with the day. They reach the report only if the user turns notes on.

States: AI off or offline (rules on the phone, and a note that it may catch less); nothing recognised (saved as a note, with hand entry offered); mic refused.

### 5.6 Warning signs and red flags

- **Warning card on Today only.** No push notifications, following the research on false alarms.
- **Rare:** only when today reaches your line, at most once a day, and never from a bad reading.
- **Explained:** always shows why it fired.
- **Correctable:** "That was wrong" loosens your line, and "Helpful" is recorded. Both are pilot data.
- **Your line:** starts from your usual day until two flare-ups have taught it, and says which it is using.
- **Red flag:** pain of 8 or more, or a note saying the knee gave way, locked or popped. Replaces normal advice at every guidance level with "This is worth a call to your clinician" and links to the guide's red-flag section.

Load comes from what the user logged in Phase A, so the card says "from what you logged". Live warnings during a workout wait for the tape.

### 5.7 Patterns (Insights)

As built: one headline, the 30-day timeline, load the day before. Add "came before", never "caused", on any new copy, and show how sure it is ("3 of 4").

States: under 2 flare-ups ("No pattern yet. That's a good thing, and logging is what would show one."); plenty of flare-ups but no pattern ("Nothing stands out yet."); no logs.

### 5.8 Progress and range entry

Recovery % must answer "am I getting better?" honestly, with no tape behind it yet.

- **Add a measurement:** bend and straighten, date, who measured (my PT, me). Prompted after each PT visit, never daily. Self-measured numbers are marked, because a phone-free estimate is rough.
- **Meter:** shows only after one range measurement and 3 logged days. Until then: "Building your starting point", with what is left to do.
- **Staleness:** "Last measured Oct 12." After 21 days without a new measurement, the meter fades and asks for one.
- **Why it moved:** one line (range, handled load, or a flare-up), already in core.
- **"When will I be back?":** a typical range for your injury from published protocols, with "not a date for you, and your PT makes the call".
- **Milestones:** first straight, bike range, full bend. Add non-range evidence for later months, such as "6 weeks of logging with fewer flare-ups", which the research suggests helps confidence once range is back.

Open point: the meter's weights have no evidence behind them (see [scoring-methods.md](scoring-methods.md), which still describes the old time-based formula and needs updating). The report shows the underlying numbers, not only the percentage. Ask PTs whether the percentage helps or misleads them.

### 5.9 PT report

One-page PDF: headline for the week, day by day, range measured, pain logs with "settled" answers, plan sessions done, and optional notes. Sections are toggled by the user, who previews it before it leaves the phone.

- **Send:** Mail with the PT's address filled in, the share sheet, or save the PDF.
- **Before a visit:** with a visit date set, a reminder the evening before opens the report. Nothing sends itself; true automatic send needs a server and comes later.
- **After a visit:** asks for the next visit date and any new measurement.

States: little data ("Only 2 days logged", stated at the top); no PT on file; Mail not set up on the phone.

### 5.10 Notifications and Settings

Default is one morning prompt, combining check-in and "Did it settle?". Choices: Morning only, Morning and evening, Only visit reminders, Off. The plan reminder joins the morning prompt rather than adding one.

Settings: your comeback (edit), your PT, guidance level shown as a plain statement, notifications, voice AI on or off, export my data, look around with sample data, delete my data, privacy policy, disclaimer.

## 6. Early-days rules

| Data so far | Today | Patterns | Progress | Warning |
|---|---|---|---|---|
| Day 1 | Welcome, first ask, no chip | Empty state | "Building your starting point" | None |
| After first check-in | Chip from pain and swelling only | Empty state | Same, unless a range was entered | None |
| 3+ logged days | Adds "your usual" | Empty state | Meter, if a range exists | Starting line only |
| 2+ flare-ups | Same | Patterns may appear | Same | Personal line |
| 7+ quiet days | "Nothing logged lately. Want to catch up?" Never guilt. | Same | Meter fades after 21 days | None |

## 7. Privacy and data

| Data | Where | Leaves the phone when |
|---|---|---|
| Logs, check-ins, plan, profile | Phone | The user sends a report or export |
| Audio and photos | Phone | Never in the pilot, and never in the report without a toggle |
| Voice transcript, with AI on | Sent to the AI service to be sorted | Each time, only with the opt-in |

Requirements: a contract or settings with no training and no retention on the AI service, to be confirmed before launch; the server stores nothing; no ad or analytics SDKs; separate opt-ins for AI and for sharing with the team. Have the advisor review the updated policy along with the guidance levels, including Washington and Connecticut health-data rules from the gap analysis.

## 8. What the pilot must tell us

Export is a file the tester sends to us each week, with their consent. Extend the existing trial export with plan marks, warning feedback, pain-detail use, voice use counts and the guidance level. Transcripts stay out unless separately agreed.

| Question | Measure |
|---|---|
| Do people keep logging? | Days with any log, by week; share still active at week 4 |
| Is one tap enough? | Taps with and without detail; morning ask answer rate |
| Does voice beat tapping? | Share of logs by voice; fields corrected after sorting |
| Do patterns appear? | Testers with at least one pattern by week 4; "did this ring true?" in the exit call |
| Are warnings trusted? | Fired per person per week; "That was wrong" rate |
| Do PTs read it? | Reports sent; PT says it changed something (ask directly) |
| Does it help emotionally? | A short weekly question: "I know whether I'm making progress." Compare week 1 and week 4. |
| Would they pay? | Price test in the exit call, using the gap analysis structures |

Exit call with every tester, and with each PT who received a report.

## 9. Styling handoff

**Already in the Figma V1 screens:** opening, what happened, about you, your goal, voice intake, Today, did it settle, check-in, log pain, voice log, Insights, Progress, report, Settings.

**New, not in Figma yet:**

- Consent and 18+ gate
- Voice AI opt-in
- PT details and exercise editor
- Plan view (week) and exercise row (due, done, rest day)
- Day detail from the calendar
- Chip in its Descriptive words: Settled, Mixed, Flared
- Warning card, with both feedback buttons, at each guidance level
- Red-flag takeover
- Add a measurement, plus the "who measured" label
- Meter states: building, normal, stale
- End-of-day check
- Pain detail after one tap, with undo
- Report section picker, and the "little data" note
- Sample-mode banner
- Empty states from section 6
- Export and delete confirmations

**Change in Figma:** Today's "Health + Tape" tile (steps, active, sleep) is out, since neither source exists in Phase A. The "via tape" label is out in real mode.

**Still open for styling:** the logo, ring versus muscle fiber (a Project Context open question).

## 10. Build order

Each step leaves something testable.

1. **Foundations:** real and sample modes, empty start, guidance setting, consent, delete, export (B1 to B4, B6 to B8).
2. **Daily loop:** Today states, calendar, Day detail, one-tap pain with detail, end-of-day check, notification choices.
3. **Range and progress:** add a measurement, meter states, why it moved, typical range.
4. **PT path:** PT details, exercise editor, plan on Today, report PDF, visit reminder.
5. **Voice:** intake and diary on device with rules, then the AI step and the policy update (B5).
6. **Warnings:** card, feedback, red-flag takeover.
7. **Pilot run-through:** new install on a real phone, 7 simulated days, TestFlight external review.

Regulatory hour and PT conversations run alongside, and ideally before step 4, since they can change the PT path and report.

## 11. Not in this pilot

| Item | When | Needs |
|---|---|---|
| Tape in the loop (Phase B) | After Phase A's first read | Native Bluetooth, a sensor that gives angle, setup and strip-change flow, skin and adhesion logging |
| Coin button, passive daily log, live workout warnings | Phase B | Same |
| Apple Health steps and sleep | If Phase A shows logging fatigue | HealthKit |
| Automatic send, PT accounts, dashboard | After PTs have used the report | Server, and business associate terms if clinics deploy it |
| PT-set range alerts | Phase B or later | Tape angle, PT buy-in |
| Shoulder and elbow | After the knee works | Tape shape, protocols |
| PT matching, AI chat, social, widget, graduation flow | Later | Evidence from the pilot |

## 12. Open decisions

| Decision | Recommendation | Owner |
|---|---|---|
| Confirm A1 and A2 | As stated | Team |
| Who joins: PT-path only, or no-PT too? | Both, with no-PT testers in Descriptive. Tracks "how many have a PT", another Project Context open question. | Team |
| Regulatory hour | Book before step 4 | [OWNER] |
| IRB needed? | Ask the faculty contacts and the advisor | [OWNER] |
| Who recruits ~10 testers and 2 to 3 PTs? | Waitlist, Reddit contacts, the LA clinic list | [OWNER] |
| Update the Project Context with these calls | After team review | Matthew |
