---
name: RECO Clinic
description: The PT's caseload, each patient's week drawn as a 168-hour Week Ring.
colors:
  r0: "#F7F9F8"
  r1: "#EEF2F0"
  r2: "#E3E9E6"
  r3: "#D2DBD7"
  r4: "#B4C1BC"
  r5: "#8D9C97"
  r6: "#5F6E69"
  r7: "#46534F"
  r8: "#33403C"
  r9: "#263130"
  r10: "#1C2422"
  teal: "#1F8A72"
  teal-soft: "#CDE7DF"
  teal-ink: "#145C4C"
  live: "#3DDBB8"
  red: "#C93C30"
  red-ink: "#9E2A1F"
  red-soft: "#F8E1DE"
  amber: "#E0A21B"
  amber-ink: "#7A5200"
  amber-soft: "#FBEFD3"
  on-rail: "#F2F5F4"
  on-rail-2: "#A9B8B3"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: "44px"
    letterSpacing: "-0.025em"
  ring-figure:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, monospace"
    fontSize: "clamp(40px, 13cqi, 68px)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "24px"
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  body-small:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  label:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
  numeric:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 400
    fontFeature: "tnum"
  axis-label:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  bar: "3px"
  tag: "6px"
  row: "12px"
  flag: "14px"
spacing:
  cell: "8px"
  cell-2: "16px"
  cell-3: "24px"
  cell-4: "32px"
  cell-5: "40px"
components:
  rail:
    backgroundColor: "{colors.r10}"
    textColor: "{colors.on-rail}"
    width: "320px"
    padding: "24px 16px"
  caseload-row:
    backgroundColor: "transparent"
    textColor: "{colors.on-rail}"
    rounded: "{rounded.row}"
    padding: "12px 8px"
  caseload-row-hover:
    backgroundColor: "{colors.r9}"
  caseload-row-selected:
    backgroundColor: "{colors.r8}"
  flag-contact-soon:
    backgroundColor: "{colors.red-soft}"
    textColor: "{colors.r10}"
    rounded: "{rounded.flag}"
    padding: "{spacing.cell-2}"
  flag-worth-a-look:
    backgroundColor: "{colors.amber-soft}"
    textColor: "{colors.r10}"
    rounded: "{rounded.flag}"
    padding: "{spacing.cell-2}"
  flag-note:
    backgroundColor: "{colors.r1}"
    textColor: "{colors.r10}"
    rounded: "{rounded.flag}"
    padding: "{spacing.cell-2}"
  badge:
    backgroundColor: "{colors.r2}"
    textColor: "{colors.r8}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "2px 7px"
  badge-clinic:
    backgroundColor: "{colors.r10}"
    textColor: "{colors.on-rail}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "2px 7px"
  badge-tape:
    backgroundColor: "{colors.teal-soft}"
    textColor: "{colors.teal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "2px 7px"
  phase-bar:
    backgroundColor: "{colors.r2}"
    rounded: "{rounded.bar}"
    height: "6px"
  phase-bar-done:
    backgroundColor: "{colors.teal}"
  phase-bar-current:
    backgroundColor: "{colors.r10}"
---

# Design System: RECO Clinic

## Overview

**Creative North Star: "The Week Ring"**

The hours the PT never sees, drawn. Every patient's last seven days are one 168-hour ring, read clockwise from 12 o'clock like the brand's Sensor O: the clinic visit is a sliver of ink, everything else is the patient's own record. The world is a graphite rail holding the caseload beside a cool porcelain reading surface, both drawn from a single stepped green-grey ramp, with live teal reserved for the week itself and red and amber for severity.

It is an instrument, not a dashboard. Density is calm and measured: regions are separated by hairline rules and an 8px cell rhythm rather than boxed into cards, numbers are tabular mono set right, and every coloured signal also carries a word and a shape so it survives a projector, a print-out, or a colour-blind reader. Nothing is decorative; the only motion is the week arc refilling clockwise when a patient is picked by pointer.

The build refuses the white SaaS card dashboard: no KPI tiles, no line charts, no drop shadows, no gradient fills.

**Key Characteristics:**
- One stepped green-grey ramp (r0 to r10) for every neutral, light and dark.
- Teal means the week (recorded time); ink means the clinic; red and amber mean severity, never decoration.
- Severity is triple-coded: colour, diamond weight, and a word.
- Atkinson Hyperlegible Next for words, its Mono for every number, time and date.
- Ruled regions on an 8px cell derived from the ring's own hour ticks.
- Flat surfaces; depth comes from the ramp, not from shadows.

## Colors

A cool, quiet green-grey world with one living accent and two severity voices.

### Primary
- **Week Teal** (teal): the week arc on the ring, "clear" morning marks, completed protocol phases, met checkpoints, the hours-unseen figure. It means time the patient recorded.
- **Live Teal** (live): the same meaning on graphite, where Week Teal would sink: mini-ring "clear" segments, focus rings inside the rail. Only on the rail.
- **Teal Ink** (teal-ink): teal as text on light grounds (progress states that are on track, the Tape badge).
- **Teal Mist** (teal-soft): activity arcs on the ring, Tape badge ground, text selection.

### Secondary (severity)
- **Signal Red** (red): contact-soon marks and the red-flag halo. Graphic only; as text it becomes **Red Ink** (red-ink). **Red Wash** (red-soft) grounds a contact-soon flag.
- **Signal Amber** (amber): worth-a-look marks, bends past the limit on the ring. Graphic only; as text it becomes **Amber Ink** (amber-ink) (limits, "past the typical window"). **Amber Wash** (amber-soft) grounds a worth-a-look flag.

### Neutral
- **Porcelain** (r1): the page ground and the ring's selected day sector.
- **Paper** (r0): the knock-out stroke around bend marks on the ring.
- **Mist rules** (r2, r3): r3 for region rules, ring ticks and table heads; r2 for inner rules, the ring track, empty phase bars, default badges.
- **Pewter** (r4, r5): six-hour ticks, empty "no check-in" marks, note-tier marks.
- **Slate text** (r6, r7): secondary text (r6 for labels and meta, r7 for legend and supporting copy, pain-log dots).
- **Graphite** (r8, r9, r10): r10 is the rail, primary text, clinic-visit ink and the current phase; r9 is rail hover; r8 is the selected row and dark rules on the rail.
- **Rail text** (on-rail, on-rail-2): primary and secondary text on graphite.

### Named Rules
**The One Ramp Rule.** Every neutral, light or dark, comes from r0 to r10. A new grey is a new ramp step argued for, never a one-off hex.

**The Teal Is Time Rule.** Teal marks recorded time and things that went well against the protocol. It is never a button colour, a link colour or decoration.

**The Ink Pair Rule.** Red and amber are graphic colours. Any severity word is set in its ink variant (red-ink, amber-ink) so text contrast holds on Porcelain and on the washes.

## Typography

**Body Font:** Atkinson Hyperlegible Next (with system-ui, sans-serif), weights 400, 500, 700
**Label/Mono Font:** Atkinson Hyperlegible Mono (with ui-monospace, monospace), weights 400, 500
**Wordmark:** the official RECO SVG (`src/assets/reco-wordmark-ceramic.svg`), never typeset.

**Character:** One family built by the Braille Institute for legibility, in two widths: the proportional cut speaks, the mono cut counts. Both are self-hosted.

### Hierarchy
- **Display** (700, 40px/44px, -0.025em; 32px/36px under 860px): the patient's name, once per view.
- **Ring figure** (Mono 500, clamp 40 to 68px by container, -0.04em, teal): the hours-unseen number at the ring's centre; its unit drops to 0.4em.
- **Headline** (700, 20px): "Your patients" on the rail, the current phase name.
- **Title** (700, 17px/24px): region headings ("The week", "Flags", "Progress"). Sub-region heads step down to 15px 700.
- **Body** (400, 15px/1.5): facts, readouts, flag proof. Tabular numerals are on globally.
- **Body small** (400, 13px/18px): meta, row subtitles, legends, footer.
- **Label** (500, 12px/16px): badges, the Sample data tag, phase names under bars.
- **Numeric** (Mono 400 or 500): every value, date and clock time in facts lists, readouts and the day table, right-aligned in fact lists.
- **Axis label** (Mono 500, 12px, 0.04em, uppercase): the seven weekday names around the ring only; today's in r10, the rest r6.

### Named Rules
**The Mono Counts Rule.** Numbers, dates and times are Mono, tabular and right-aligned in any facts column. Words are never Mono.

**The Never Retype Rule.** RECO appears as the brand SVG in the interface; never set the wordmark in a font.

## Layout

A two-column application: a 320px graphite rail (sticky, full height, own scroll) and a main column padded 32px top, 40px sides. Under 860px the rail stacks above the detail and the main padding drops to 24px top, 16px sides; the day table drops its activity column.

Inside the detail, the body is a two-column grid: the ring column (420 to 560px) and the side column (320px to 1fr), 40px apart. The ring column is sticky (top 24px) so the ring stays in view while flags, progress and next steps scroll beside it. Under 1180px the body collapses to one column and the ring stops sticking.

Spacing is built from the cell (8px), the Week Ring's hour-tick spacing at full size (2π × 202px / 168 ≈ 7.6px, rounded). Region padding is 3 cells above and 4 below; gaps inside regions are 2 cells; the rail is padded 3 by 2 cells.

### Named Rules
**The Hour Cell Rule.** Structural spacing is a multiple of the 8px cell. Tight inline gaps inside a single component (marks beside words, stacked meta) may use 2px or 6px; nothing structural does.

**The Fixed Furniture Rule.** Every caseload row carries the same parts in the same place: mini ring, name, surgery and week, phase, top flag (or "Nothing new").

## Elevation & Depth

Flat. There are no shadows anywhere in the system. Depth is tonal: the graphite rail against Porcelain, r8 and r9 fills for selected and hovered rows, and tinted washes under flags. Hierarchy within the reading surface comes from hairline rules and the cell rhythm.

### Named Rules
**The Ruled Not Boxed Rule.** Regions are separated by a 1px top rule (r3 between regions, r2 inside them), never by bordered or shadowed panels. The only filled shapes on the reading surface are flags, whose wash is part of the severity signal, and badges.

## Shapes

Gently rounded and small. Rows round to 12px, flags to 14px, badges and the Sample data tag to 6px, phase bars and legend swatches to 3px, bend marks to 2px. Status dots and checkpoint marks are circles. The ring's own geometry is the signature silhouette: concentric tracks, seven wedge-shaped day sectors, radial day separators.

**The Diamond Family.** Severity has one silhouette, a diamond, at three weights: filled for contact soon, half-filled (right half solid, outline whole) for worth a look, outline for a note. The same diamonds appear in the rail, in flags, in the day table, on the ring and in its legend. Circles are reserved for neutral or good records (clear mornings, ordinary pain logs, no check-in as an empty ring).

## Components

### Caseload Row
Quiet until chosen. Full-width button on the rail: 48px mini-ring column plus text, 12px gap, 12px by 8px padding, 12px radius, transparent at rest.
- **Hover** (fine pointers only): r9. **Selected** (`aria-current`): r8. **Press:** scales to 0.985 over 120ms; reduced motion keeps only the background change.
- **Focus:** 2px Live Teal outline drawn inset (-2px).
- **Keyboard:** Up and Down arrows move through the list and select.
- The top flag shows as a severity diamond (11px) plus its title, with the tier word for screen readers.

### Mini Ring
The week in the caseload. 44px SVG, radius 17, stroke 5 with round caps, seven segments clockwise from 12 o'clock with 6° gaps, each coloured by that morning: Live Teal clear, amber some, red flare-up, r8 no check-in.

### The Week Ring (signature)
The patient's last seven days as one ring, drawn on a 700-unit viewBox, max 520px wide.
- **Geometry, outside in:** weekday labels (r330), 168 hour ticks (r292 to 300; every sixth hour longer and r4), the week arc (r272, stroke 22: r2 track, teal arc stopping at now; clinic visits as r10 slivers 6 units thicker; bends past the limit as rotated amber squares with an r0 edge), morning marks at 8:00 (r238), pain logs at their hour (r204), activity arcs 9:00 to 20:00 in teal-soft (r170, stroke 10), hub (r140). Day separators run hub to tick edge in r3.
- **Centre:** the hours-unseen figure in teal Mono, "the hours you never see" beneath, then the in-clinic hours.
- **Interaction:** the seven day sectors are the only targets. Hover, focus or click selects a day (fill r1); arrow keys move between sectors (roving tabindex); the readout under the ring lists every entry of that day (`aria-live`).
- **Motion:** on a pointer patient switch the arc refills clockwise from 12 in 280ms on the ease-out curve. Keyboard switches and reduced motion skip it. This is the only animation on the reading surface.
- **Legend:** every mark the ring draws, grouped by track (Mornings, Pain logs, The day), always present beneath the readout.

### Readout
A two-column definition list (112px terms in r6 13px 500, values 15px) under an r2 rule. Dates and times in Mono.

### Flag
The flag and its proof. 16px mark column plus text, 2-cell padding, 14px radius, tier wash ground. First line: tier word in its ink, a middot, title in 700. Then the patient's own words or detail (r8), then meta "when · source" in 13px. Contact-soon flags carry `role="alert"`.

### Badges and Tags
Who measures a checkpoint: Clinic badge in r10 with rail text, Tape badge in teal-soft with teal-ink, others r2 with r8. The rail's Sample data tag is the outlined variant (1px r8 border, on-rail-2 text).

### Progress
Six equal phase bars (6px, 3px radius, 6px gaps): teal done, r10 current, r2 ahead, with 12px phase names beneath (current in r10 500). A facts list follows, terms left in r6, values right in Mono.

### Checkpoint List
Ruled rows (r2 between), 12px circle mark (r4 outline open, r10 outline not met, solid teal met), title with small muted value beneath, badge at the end.

### Day Table
Fixed-layout table, head in 13px r6 over an r3 rule, rows ruled r2. Day column in Mono r7, today in r10 500. Morning column leads with a 10px dot or 11px diamond.

## Do's and Don'ts

### Do:
- **Do** draw every neutral from r0 to r10, and use the graphite r10 rail for the caseload.
- **Do** give every severity signal all three codes: colour, diamond weight, and a word.
- **Do** set severity words in red-ink or amber-ink, never in red or amber.
- **Do** use Live Teal (live) instead of Week Teal on graphite.
- **Do** set every number, date and time in Atkinson Hyperlegible Mono, right-aligned in fact lists.
- **Do** separate regions with a 1px r3 top rule and 3-cell / 4-cell padding.
- **Do** pair every flag with the entry that raised it, and its date and source.
- **Do** keep the ring's refill to 280ms, pointer-only, and skip it for keyboard and reduced motion.
- **Do** use the RECO SVG wordmark at 26px tall on the rail.

### Don't:
- **Don't** add shadows, bordered panels or card grids to the reading surface.
- **Don't** use teal for buttons, links or decoration; it means recorded time.
- **Don't** carry meaning by colour alone, or draw severity with any shape but the diamond family.
- **Don't** animate the reading surface except the week arc, and only by filling clockwise from 12; rail rows keep only their 120ms hover and press feedback.
- **Don't** typeset the RECO wordmark.
- **Don't** set words in Mono, or numbers in a proportional face inside facts and readouts.
- **Don't** introduce KPI tiles or line charts for the week; the week is the ring.
