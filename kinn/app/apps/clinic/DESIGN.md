---
name: RECO Clinic
description: A PT's patients as a plain clinic record. A table of patients, then one patient's chart in three tabs.
colors:
  bg: "#F2F4F6"
  surface: "#FFFFFF"
  surface-2: "#F6F8F9"
  line: "#D8DEE4"
  line-soft: "#E8ECF0"
  line-strong: "#AEB9C4"
  track: "#E1E6EB"
  text: "#17212B"
  text-2: "#46535F"
  text-3: "#5F6D7A"
  accent: "#0F7662"
  accent-hover: "#0B5F4F"
  accent-ink: "#0B5B4B"
  accent-mid: "#8CC4B7"
  accent-soft: "#E2F1ED"
  red: "#B42318"
  red-soft: "#FDECEA"
  red-line: "#F0B4AD"
  amber-ink: "#7A4A00"
  amber-soft: "#FFF4D6"
  amber-line: "#E5C36C"
typography:
  page-title:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "34px"
    letterSpacing: "-0.01em"
  code:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "0.12em"
  form-title:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "28px"
  phase:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "24px"
  title:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "24px"
  body:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    fontFeature: "tnum"
  control:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "20px"
  small:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  tag:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
rounded:
  link: "3px"
  tag: "4px"
  control: "6px"
  sheet: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  pad: "20px"
  page: "24px"
components:
  top-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    height: "56px"
    padding: "0 24px"
  sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sheet}"
  table-head:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-2}"
    typography: "{typography.small}"
    padding: "8px 20px"
  table-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    padding: "12px 20px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-primary-active:
    backgroundColor: "{colors.accent-ink}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 14px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-2}"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    typography: "{typography.body}"
    padding: "10px 14px"
  tab-current:
    textColor: "{colors.text}"
  tag:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-2}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    padding: "1px 8px"
  tag-contact-soon:
    backgroundColor: "{colors.red-soft}"
    textColor: "{colors.red}"
  tag-worth-a-look:
    backgroundColor: "{colors.amber-soft}"
    textColor: "{colors.amber-ink}"
  alert-contact-soon:
    backgroundColor: "{colors.red-soft}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  alert-worth-a-look:
    backgroundColor: "{colors.amber-soft}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  recovery-track:
    backgroundColor: "{colors.track}"
    rounded: "{rounded.tag}"
    width: "148px"
    height: "8px"
  recovery-fill:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.tag}"
    height: "8px"
  phase-bar:
    backgroundColor: "{colors.track}"
    rounded: "{rounded.tag}"
    height: "8px"
  phase-bar-done:
    backgroundColor: "{colors.accent-mid}"
  phase-bar-current:
    backgroundColor: "{colors.accent}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "7px 10px"
---

# Design System: RECO Clinic

## Overview

**Creative North Star: "The clinic record"**

The site looks and works like the patient-record software a physical therapist already uses. One thing per page: a table of patients, then one patient's chart in three tabs (Summary, Daily log, Exercise plan). Every action is a labelled button. Nothing on the page needs a legend.

This replaced "The Week Ring" on Nov 16, 2026. Matthew found that version confusing and "AI": a large data graphic, a dark sidebar, diamonds for severity and monospace numbers, all on one crowded page. He asked for simpler, clearer buttons and a more medical feel, and chose "clinic records software" as the reference. The familiar pattern is the design here, played straight.

**Key characteristics:**

- White sheets on a light grey desk, separated by 1px hairlines. No dark surfaces.
- Tables for anything that has rows: patients, checkpoints, days, exercises.
- One teal, used for primary buttons, the current tab and recovery progress. Nothing else is teal.
- Red and amber appear only on alerts and tags, and always with the word ("Contact soon", "Worth a look").
- One type family, Source Sans 3, with tabular figures. No monospace.
- The one RECO touch is the small recovery progress bar beside each patient.

## Colors

A restrained palette: cool neutrals, one accent, two alert colours.

### Primary

- **Clinic Teal** (`accent` #0F7662): primary buttons, the current tab's underline, the recovery progress fill, the current phase. `accent-hover` and `accent-ink` are its hover and pressed states; `accent-ink` is also link text. `accent-mid` marks phases already passed. `accent-soft` is the selected state of a toggle.

### Secondary (alerts)

- **Contact soon** (`red` #B42318 on `red-soft`, edged with `red-line`): pain 8 or more, red-flag words, the knee giving way.
- **Worth a look** (`amber-ink` #7A4A00 on `amber-soft`, edged with `amber-line`): flare-ups, bends past the limit. Also the flare-up dose line in the plan editor and a bend limit in force.

### Neutral

- **Desk** (`bg` #F2F4F6): the page behind the sheets.
- **Sheet** (`surface` #FFFFFF): cards, tables, the top bar, fields.
- **Header row** (`surface-2` #F6F8F9): table header rows, row hover, the neutral tag.
- **Hairlines**: `line` around sheets and under header rows, `line-soft` between rows, `line-strong` around fields and secondary buttons.
- **Text**: `text` for content, `text-2` for labels and column headers, `text-3` for secondary notes. All three pass 4.5:1 on both the sheet and the desk.
- **Track** (`track` #E1E6EB): the empty part of a progress bar.

### Named Rules

**The One Teal Rule.** Teal means "act here" or "recovery progress". It is never decoration, and no second accent is added.

**The Word Rule.** Red and amber never appear without the tier in words beside them. Severity is not carried by colour or shape alone.

## Typography

**Family:** Source Sans 3, self-hosted (400, 600, 700). A plain, open face that clinic and public-health software already use. Numbers use tabular figures so columns line up. There is no second family and no monospace.

**Character:** quiet and readable. Weight and size carry hierarchy; there are no uppercase tracked labels and no display type.

### Hierarchy

- **Page title** (700, 28px/34px): the page's one heading: "Patients", a patient's name.
- **Title** (700, 17px/24px): a sheet's heading, a patient's name in the table, a fact's value.
- **Phase** (700, 18px/24px): "Phase 4 of 6: Bridge to sport".
- **Body** (400, 16px/24px): table cells and sentences.
- **Control** (600, 15px/20px): buttons and the back link.
- **Small** (400 or 600, 14px/20px): column headers, labels, notes.
- **Tag** (600, 13px/18px): tier tags.
- **Form title** (700, 22px/28px) and **Code** (700, 34px/40px): sign-in headings and the sharing code.

### Named Rules

**The Fixed Scale Rule.** Sizes are fixed pixels from the list above. Nothing scales with the viewport except the page title, which drops to 22px on a phone.

## Layout

- A 56px top bar, then one page column up to 1200px wide with 24px gutters (16px on a phone). Add-a-patient is narrower, 720px.
- A page is a stack of sheets 20px apart. Inside a sheet: a header row (14px 20px), then a body or a table that runs edge to edge.
- Facts are a grid of label-over-value pairs that wraps on its own.
- The plan editor is two columns: the exercise list, and the library held in view beside it. Below 1080px the library drops underneath.
- Below 860px, the patients table hides the Procedure and Week columns and shows them under the name. Below 560px the "Needs attention" column hides and its tag moves under the name, so an alert is never lost.

### Named Rules

**The One Thing Rule.** A page or a tab holds one subject. If a screen needs a second column of unrelated content, it needs another tab instead.

## Elevation & Depth

Flat. Sheets are separated from the desk by a 1px hairline and their own white, not by shadow.

### Named Rules

**The One Shadow Rule.** The only shadow is on the plan editor's publish bar (`0 4px 16px rgba(23, 33, 43, 0.1)`), because it floats over the list while it scrolls. Nothing else is lifted.

## Shapes

- 8px corners on sheets, 6px on buttons, fields and alerts, 4px on tags and bars.
- The only circle is the step number on the add-a-patient page.
- Icons are drawn SVG in one 1.75px stroke: back, move up, move down, remove.

## Components

### Top Bar
White, 56px, a hairline under it. Left: the RECO wordmark (the brand SVG, linking to the patients table) and "For clinicians". Right: a "Sample data" tag, or who is signed in and a "Sign out" button.

### Buttons
One shape, 36px tall. **Primary** is solid teal with white text: one per page ("Add a patient", "Write exercise plan", "Publish version 3"). **Secondary** is white with a strong hairline ("Open chart", "Sign out"). A link that navigates wears the same shape. Hover darkens; there is no press animation.

### Patients Table
Columns: Patient, Procedure, Week, Recovery progress, Needs attention, and an "Open chart" button. The name is also a link. Most urgent first.

### Recovery Progress Bar
A 148px by 8px track with a teal fill, and "Phase 4 of 6 · Bridge to sport" under it. The fill is the phases behind the patient plus the share of the current phase's checkpoints they have met. It never shows a percentage.

### Tags
The tier as a word in a small bordered tag: red for "Contact soon", amber for "Worth a look", grey for "Note" and "Sample data".

### Tabs
Plain text links with a 3px teal underline on the current one. They are links, so the back button and a shared URL land on the same tab.

### Alert
A bordered, tinted block inside "Needs attention": the tag, the title in bold, the patient's own words or the reading that raised it, then when and where it came from.

### Phase Steps
Six labelled bars in a row: passed phases in light teal, the current one in teal with a bold label, the rest grey.

### Fields
White, strong hairline, 6px corners, a visible label above. Focus is a 2px teal outline.

## Do's and Don'ts

### Do:

- **Do** give every action a labelled button, and make the page's main action the only solid teal one.
- **Do** use a table when the content has rows and columns.
- **Do** pair every red or amber with the tier in words.
- **Do** keep one subject per page or tab.
- **Do** keep the recovery progress bar small and beside the patient; it is the one RECO touch.

### Don't:

- **Don't** bring back the Week Ring, a dark sidebar, diamonds or any chart that needs a legend.
- **Don't** use monospace, or a font that draws zero with a slash.
- **Don't** add a second accent colour, gradients or decorative shadows.
- **Don't** show a percentage, a score or a risk level for a patient. The bar places them on the protocol; the clinical call is the PT's.
- **Don't** count what a patient did or didn't do. Flags are about the knee only.
- **Don't** use a coloured side stripe on a card or alert.
