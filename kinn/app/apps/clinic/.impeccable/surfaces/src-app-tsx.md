---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components"]
---

# Clinician caseload

Scope: the whole clinician site (caseload rail and patient detail). Visitor mode: Operate. First audience: investors watching a demo; daily audience: clinic PTs (morning caseload check, prep before a visit, during the visit).

Memorable moment: the patient's week as one ring, with the clinic visit a sliver of it.

Unresolved: real patient data and sharing (a separate product decision); PT validation.

## Direction contract

THESIS: The hours the PT never sees, drawn as each patient's 168-hour Week Ring: the clinic visit is a sliver of ink, everything else is the patient's own record. Refuses the white SaaS card dashboard of KPI tiles and line charts.

OWN-WORLD: Graphite rail #1C2422 holding the caseload; cool porcelain ground #EEF2F0 on one stepped green-grey ramp for every neutral; live teal #1F8A72 (#3DDBB8 on graphite) for the week's arc; red #C93C30 contact soon, amber #E0A21B worth a look, ink #1C2422 for clinic visits. Atkinson Hyperlegible Next for UI, its Mono for every number and time, right-aligned tabular; Geist only in the wordmark. Severity always also carries a word and a mark weight. Every flag shows the entry that raised it.

STORY: The viewer sees who needs a call today from the rail, opens a patient, and understands in one glance that RECO captured the 166 hours between visits; the PT acts on the flag and the next checkpoint.

FIRST VIEWPORT: Left, a 320px graphite rail: RECO wordmark, "Your patients", six rows, each a mini Week Ring (seven day segments coloured by morning), name plate, surgery, week, phase, and the top flag as a word chip. Right, the patient header (name, surgery, week, sport). Below it, the Week Ring at ~520px on the left: day sectors from 12 o'clock clockwise, 168 hour ticks, tracks for mornings, pain logs at their hour, activity with clinic visits in ink, bend alerts; centre reads hours between visits. To its right: flags with proof, progress, next steps. No primary action; the task is reading.

FORM: The Week Ring, candidate 7 of 7 (the brand's literal reading, assigned by the roll). seed:8d67bd32279de19b. Raises: one stepped tonal ramp and severity readable without colour (Exposure Record); fixed patient furniture in the same place (Character Catalog); every flag paired with its proof (Monochrome Proof); one hour-cell module for ticks and spacing (Grid Specimen); right-aligned tabular values on a fixed measure (Mixtape J-card).

Signature interaction and motion: hovering or focusing a day sector reads out every entry of that day directly under the ring (amended after finish review: a day holds up to a dozen marks too small to target one by one, so the seven day sectors are the hover and keyboard targets, arrow keys move between them, and the ring column stays in view while the right column scrolls). Switching patient by pointer refills the week arc clockwise from 12 in 280ms; keyboard switches and reduced motion skip it. Nothing else animates.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
