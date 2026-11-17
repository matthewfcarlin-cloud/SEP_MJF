---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components"]
---

# Clinician site

Scope: the whole clinician site (patients table, patient chart, plan editor, add a patient, sign-in). Visitor mode: Operate. First audience: investors watching a demo; daily audience: clinic PTs (morning scan, prep before a visit, during the visit).

Memorable moment: none by design. The small recovery progress bar beside each patient is the one RECO touch.

Unresolved: PT validation. Matthew approved this look on Nov 16.

## Direction contract

THESIS: A clinic record, played straight. One thing per page: a table of patients, then one patient's chart in three tabs. Chosen by Matthew on Nov 16 after the Week Ring read as confusing and "AI": he asked for simpler, clear buttons, more medical, and picked "clinic records software" and "replace the ring with a table". Refuses the single crowded dashboard and any invented data graphic.

OWN-WORLD: White sheets on a light grey desk (#F2F4F6), 1px hairlines, 8px sheet corners, 6px controls. Tables for anything with rows, grey header row. One teal (#0F7662) for primary buttons, the current tab and recovery progress. Red and amber only on alerts and tags, always with the word. Source Sans 3 for everything, tabular figures, no monospace. No dark surfaces, no diamonds, no rings.

STORY: The viewer sees every patient at once and who needs a call today, presses "Open chart", reads what needs attention and where recovery stands, and presses one button to write the exercise plan.

FIRST VIEWPORT: A 56px white bar with the RECO wordmark and who is signed in. "Patients" as the heading, then one table: patient, procedure, week, a small recovery progress bar with "Phase 4 of 6", a word tag with the top flag, and an "Open chart" button on every row.

FORM: The category standard (the user's own choice), seed: none (user-pinned direction). Patient chart = back link, name and facts, one primary button, tabs Summary / Daily log / Exercise plan.

Signature interaction and motion: none. Hover and press feedback on controls only; no entrance or decorative motion.

FINISH: reviewed in-thread at 1440, 1280 and 375 wide (no separate reviewer ran); detector clean; DESIGN.md and its sidecar rewritten from the build on Nov 16.
