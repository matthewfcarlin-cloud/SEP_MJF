/**
 * Published, criterion-based rehab protocols as data.
 *
 * Every phase has two gates, the way the source protocols work:
 *  1. a time floor (tissue healing) — `startsWeek`
 *  2. criteria to leave the phase — `exitCriteria`
 * A person moves on only when BOTH the next phase's floor has passed AND every
 * required exit criterion of the current phase is met. Meeting criteria early
 * never skips the floor; passing the floor never skips the criteria.
 *
 * Sources (summarised, not copied — check wording before quoting in UI/marketing):
 *  - MGB-ACL-2024: Mass General Brigham Sports Medicine, Rehabilitation Protocol for ACL
 *    Reconstruction, rev. 8/2024.
 *  - MGB-MEN-2021: Mass General Brigham Sports Medicine, Rehabilitation Protocol for
 *    Arthroscopic Meniscal Repair, rev. 4/2021 (not for root repairs or transplants).
 *  - MOON-2015: Wright RW et al., "ACL Reconstruction Rehabilitation: MOON Guidelines",
 *    Sports Health 2015;7(3):239-243. doi:10.1177/1941738113517855
 *  - GRINDEM-2016: Grindem H et al., "Simple decision rules can reduce reinjury risk by 84%
 *    after ACL reconstruction", Br J Sports Med 2016. PMC4912389
 *  - STURGILL-2009: Sturgill LP et al., JOSPT 2009;39(12):845-9 (modified stroke test).
 *
 * Status: reference data for the build. Not reviewed by a PT yet. A PT-set phase or
 * limit always overrides these defaults.
 */

export type ProtocolId = 'acl-reconstruction' | 'meniscus-repair'

/** Who can produce the number. Drives the badge shown next to each criterion. */
export type MeasuredBy =
  | 'tape' // RECO tape/coin measures it passively
  | 'self-test' // guided 1-minute test in the app (tape helps where noted)
  | 'check-in' // morning check-in or pain button
  | 'pt' // only a clinician can measure it (strength dynamometry, hop tests, clearance)

/** Effusion grade on the modified stroke test (STURGILL-2009). Ordered. */
export type EffusionGrade = 'zero' | 'trace' | '1+' | '2+' | '3+'
export const EFFUSION_ORDER: readonly EffusionGrade[] = ['zero', 'trace', '1+', '2+', '3+']

export type Metric =
  | 'extensionDeficitDeg' // 0 = fully straight (lower is better)
  | 'flexionDeg' // peak bend, degrees
  | 'flexionGapToOtherKneeDeg' // other knee flexion minus this knee (lower is better)
  | 'extensionGapToOtherKneeDeg'
  | 'effusionGrade'
  | 'painOrSwellingAfterExercise' // boolean: any in last 7 days
  | 'slrNoLag' // boolean
  | 'quadActivationFullExtension' // boolean
  | 'normalGait' // boolean
  | 'instabilityEpisodes7d' // count, "gave way"
  | 'singleLegSquats60' // count of good-form reps through >= 60° (tape can confirm depth)
  | 'jointPositionErrorDeg' // tape can run this test: match a target angle with eyes closed
  | 'quadIndexPct' // involved / uninvolved strength, %
  | 'hamstringIndexPct'
  | 'gluteIndexPct'
  | 'hqRatioPct'
  | 'hopLsiPct'
  | 'koosSportPct'
  | 'ikdcScore'
  | 'aclRsiPct'
  | 'runProgramDonePainFree' // boolean
  | 'mdClearance' // boolean

export type Comparator = '<=' | '>=' | '==' | '<' | '>'

/**
 * Tape tolerance: protocols say "equal to the other side". A goniometer is about ±3-5°
 * between clinicians, so "equal" here means within 3° (flexion) / 2° (extension).
 * Confirm with PTs.
 */
export interface Criterion {
  readonly id: string
  /** Plain-language label for the UI. Keep under ~40 chars. */
  readonly label: string
  readonly metric: Metric
  readonly op: Comparator
  readonly value: number | boolean | EffusionGrade
  readonly measuredBy: MeasuredBy
  /** Some criteria are informational in-app (we can't measure them); the PT ticks them. */
  readonly required: boolean
  readonly source: string
}

export interface Precaution {
  readonly label: string
  /** Machine-readable limits the tape can watch in real time. */
  readonly flexionMaxDeg?: number
  readonly loadedFlexionMaxDeg?: number
  readonly source: string
}

export interface ProtocolPhase {
  readonly n: number
  readonly name: string
  /** Earliest week this phase can start (time floor from tissue healing). */
  readonly startsWeek: number
  /** Typical window the protocol gives, for "typical for you" bands. [startWeek, endWeek] */
  readonly typicalWeeks: readonly [number, number]
  readonly goals: readonly string[]
  readonly precautions: readonly Precaution[]
  readonly exitCriteria: readonly Criterion[]
  /** What this phase unlocks for the person, in their words. Motivating copy. */
  readonly unlocks: readonly string[]
}

export interface Protocol {
  readonly id: ProtocolId
  readonly name: string
  readonly primarySource: string
  readonly notes: readonly string[]
  readonly phases: readonly ProtocolPhase[]
}

const C = (
  id: string, label: string, metric: Metric, op: Comparator, value: Criterion['value'],
  measuredBy: MeasuredBy, source: string, required = true,
): Criterion => ({ id, label, metric, op, value, measuredBy, required, source })

// ---------------------------------------------------------------------------
// ACL reconstruction — MGB 2024 phases and gates, cross-checked against MOON 2015.
// ---------------------------------------------------------------------------

export const ACL_RECONSTRUCTION: Protocol = {
  id: 'acl-reconstruction',
  name: 'ACL reconstruction',
  primarySource: 'MGB-ACL-2024',
  notes: [
    'Time-based AND criterion-based (MGB-ACL-2024); MOON-2015 states progression is by criteria, timeframes are averages.',
    'Hamstring autograft or allograft: partial weight bearing 6 wk; resisted hamstring work from 12 wk; return-to-sport phase expected later (MGB-ACL-2024).',
    'With a meniscus repair, follow the more conservative protocol for ROM and weight bearing (MGB-ACL-2024) → use MENISCUS_REPAIR precautions for phases 1-3.',
    'Return to sport: reinjury rate fell 51% per month of delay up to 9 months; 38.2% of those failing RTS criteria were reinjured vs 5.6% of those passing (GRINDEM-2016).',
  ],
  phases: [
    {
      n: 1, name: 'Protect and straighten', startsWeek: 0, typicalWeeks: [0, 2],
      goals: ['Protect the graft', 'Get swelling and pain down', 'Get the knee fully straight', 'Wake the quad back up'],
      precautions: [
        { label: 'Nothing under the knee when resting — keep it straight', source: 'MGB-ACL-2024' },
        { label: 'No pivoting on the surgical leg', source: 'MGB-ACL-2024' },
      ],
      exitCriteria: [
        C('acl1-ext', 'Knee fully straight (0°)', 'extensionDeficitDeg', '<=', 0, 'tape', 'MGB-ACL-2024'),
        C('acl1-quad', 'Quad fires with knee locked straight', 'quadActivationFullExtension', '==', true, 'self-test', 'MGB-ACL-2024'),
        C('acl1-slr', 'Straight-leg raise with no sag', 'slrNoLag', '==', true, 'self-test', 'MGB-ACL-2024'),
      ],
      unlocks: ['Bike for range', 'Step-ups and mini squats', 'Balance work'],
    },
    {
      n: 2, name: 'Get your bend back', startsWeek: 2, typicalWeeks: [3, 5],
      goals: ['Keep it straight', 'Bend within 10° of your other knee', 'Walk normally'],
      precautions: [{ label: 'Mini squats only to 60°', loadedFlexionMaxDeg: 60, source: 'MGB-ACL-2024' }],
      exitCriteria: [
        C('acl2-swell', 'Swelling 1+ or less, and stable', 'effusionGrade', '<=', '1+', 'check-in', 'MGB-ACL-2024'),
        C('acl2-flex', 'Bend within 10° of other knee', 'flexionGapToOtherKneeDeg', '<=', 10, 'tape', 'MGB-ACL-2024'),
        C('acl2-ext', 'Straightens as far as other knee (±2°)', 'extensionGapToOtherKneeDeg', '<=', 2, 'tape', 'MGB-ACL-2024'),
      ],
      unlocks: ['Squats to a chair', 'Lunges and deadlifts', 'Single-leg strength'],
    },
    {
      n: 3, name: 'Build strength', startsWeek: 6, typicalWeeks: [6, 8],
      goals: ['Full range, same as other knee', 'Strength without pain or swelling after'],
      precautions: [{ label: 'Stop anything that swells it up the next day', source: 'MGB-ACL-2024' }],
      exitCriteria: [
        C('acl3-noreact', 'No pain or swelling after workouts', 'painOrSwellingAfterExercise', '==', false, 'check-in', 'MGB-ACL-2024'),
        C('acl3-gait', 'Normal walking', 'normalGait', '==', true, 'pt', 'MGB-ACL-2024'),
        C('acl3-rom', 'Range matches other knee (±3°)', 'flexionGapToOtherKneeDeg', '<=', 3, 'tape', 'MGB-ACL-2024'),
        C('acl3-jps', 'Knee sense within 5° (angle-match test)', 'jointPositionErrorDeg', '<', 5, 'self-test', 'MGB-ACL-2024'),
      ],
      unlocks: ['Elliptical, stairs, pool jogging (from wk 8)', 'Early hops and jumps'],
    },
    {
      n: 4, name: 'Bridge to sport', startsWeek: 9, typicalWeeks: [9, 12],
      goals: ['Keep full range', 'Strength to 80% of other leg', 'Clean landings'],
      precautions: [{ label: 'Straight-line only, no cutting yet', source: 'MGB-ACL-2024' }],
      exitCriteria: [
        C('acl4-inst', 'No giving-way episodes', 'instabilityEpisodes7d', '==', 0, 'check-in', 'MGB-ACL-2024'),
        C('acl4-sls', '10 single-leg squats to 60°', 'singleLegSquats60', '>=', 10, 'self-test', 'MGB-ACL-2024'),
        C('acl4-koos', 'KOOS-Sport above 70%', 'koosSportPct', '>', 70, 'self-test', 'MGB-ACL-2024'),
        C('acl4-quad', 'Quad strength ≥80% of other leg', 'quadIndexPct', '>=', 80, 'pt', 'MGB-ACL-2024'),
        C('acl4-ham', 'Hamstring strength ≥80%', 'hamstringIndexPct', '>=', 80, 'pt', 'MGB-ACL-2024'),
        C('acl4-glute', 'Glute strength ≥80%', 'gluteIndexPct', '>=', 80, 'pt', 'MGB-ACL-2024'),
      ],
      unlocks: ['Return-to-run program', 'Agility and plyometrics'],
    },
    {
      n: 5, name: 'Run, jump, train', startsWeek: 13, typicalWeeks: [13, 22],
      goals: ['Finish the run program', 'Single-leg plyometrics', 'Sport-specific drills'],
      precautions: [{ label: 'Raise mileage before pace, ≤10% a week', source: 'MGB-ACL-2024' }],
      exitCriteria: [
        C('acl5-run', 'Run program done, no pain or swelling', 'runProgramDonePainFree', '==', true, 'check-in', 'MGB-ACL-2024'),
        C('acl5-str', 'Quad/ham/glute ≥90% of other leg', 'quadIndexPct', '>=', 90, 'pt', 'MGB-ACL-2024'),
        C('acl5-hq', 'Hamstring:quad ratio ≥66%', 'hqRatioPct', '>=', 66, 'pt', 'MGB-ACL-2024'),
        C('acl5-hop', 'Hop tests ≥90% of other leg', 'hopLsiPct', '>=', 90, 'pt', 'MGB-ACL-2024'),
        C('acl5-md', 'Surgeon and PT sign-off', 'mdClearance', '==', true, 'pt', 'MGB-ACL-2024'),
      ],
      unlocks: ['Cutting and pivoting (typically 7–9 mo)', 'Non-contact practice'],
    },
    {
      n: 6, name: 'Back to your sport', startsWeek: 26, typicalWeeks: [26, 52],
      goals: ['Symmetric, confident sport performance', 'Non-contact → full practice → full play'],
      precautions: [{ label: 'Full play typically 9–12 months, after return-to-sport testing', source: 'MGB-ACL-2024' }],
      exitCriteria: [
        C('acl6-str', 'Strength ≥95% of other leg', 'quadIndexPct', '>=', 95, 'pt', 'MGB-ACL-2024'),
        C('acl6-hop', 'Hop tests ≥95%', 'hopLsiPct', '>=', 95, 'pt', 'MGB-ACL-2024'),
        C('acl6-koos', 'KOOS-Sport above 90%', 'koosSportPct', '>', 90, 'self-test', 'MGB-ACL-2024'),
        C('acl6-ikdc', 'IKDC above 93', 'ikdcScore', '>', 93, 'self-test', 'MGB-ACL-2024'),
        C('acl6-rsi', 'Confidence (ACL-RSI) ≥90%', 'aclRsiPct', '>=', 90, 'self-test', 'MGB-ACL-2024'),
      ],
      unlocks: ['Full play'],
    },
  ],
}

// ---------------------------------------------------------------------------
// Meniscus repair — MGB 2021. Flexion cap is what makes the tape valuable early.
// ---------------------------------------------------------------------------

export const MENISCUS_REPAIR: Protocol = {
  id: 'meniscus-repair',
  name: 'Meniscus repair',
  primarySource: 'MGB-MEN-2021',
  notes: [
    'Not for meniscus root repairs or transplants (MGB-MEN-2021). Complex / all-inside repairs: more conservative.',
    'Surgeons vary: some cap loaded flexion lower early (e.g. 45°–60°). The PT/surgeon value replaces the default cap.',
  ],
  phases: [
    {
      n: 1, name: 'Protect the repair', startsWeek: 0, typicalWeeks: [0, 3],
      goals: ['Protect the repair', 'Fully straight', 'Bend under 90°', 'Quad control'],
      precautions: [
        { label: 'Keep bend under 90°', flexionMaxDeg: 90, source: 'MGB-MEN-2021' },
        { label: 'Brace locked, crutches, partial weight', source: 'MGB-MEN-2021' },
        { label: 'No pivoting', source: 'MGB-MEN-2021' },
      ],
      exitCriteria: [
        C('men1-ext', 'Knee fully straight (0°)', 'extensionDeficitDeg', '<=', 0, 'tape', 'MGB-MEN-2021'),
        C('men1-flex', 'Bend reaches 90°', 'flexionDeg', '>=', 90, 'tape', 'MGB-MEN-2021'),
        C('men1-quad', 'Quad fires with knee locked straight', 'quadActivationFullExtension', '==', true, 'self-test', 'MGB-MEN-2021'),
        C('men1-slr', 'Straight-leg raise with no sag', 'slrNoLag', '==', true, 'self-test', 'MGB-MEN-2021'),
      ],
      unlocks: ['More active exercises (still under 90°)'],
    },
    {
      n: 2, name: 'Calm it down', startsWeek: 3, typicalWeeks: [3, 6],
      goals: ['Keep it straight', 'Get swelling to zero', 'Still under 90° until your surgeon says otherwise'],
      precautions: [
        { label: 'Keep bend under 90° until your surgeon lifts it', flexionMaxDeg: 90, source: 'MGB-MEN-2021' },
        { label: 'Partial weight; ask your surgeon before unlocking the brace', source: 'MGB-MEN-2021' },
      ],
      exitCriteria: [
        C('men2-swell', 'No swelling (stroke test zero)', 'effusionGrade', '<=', 'zero', 'check-in', 'MGB-MEN-2021'),
        C('men2-flex', 'Bend reaches 120°', 'flexionDeg', '>=', 120, 'tape', 'MGB-MEN-2021'),
        C('men2-ext', 'Straightens as far as other knee (±2°)', 'extensionGapToOtherKneeDeg', '<=', 2, 'tape', 'MGB-MEN-2021'),
      ],
      unlocks: ['Off brace and crutches (when your surgeon says)', 'Normal walking practice'],
    },
    {
      n: 3, name: 'Walk normal, build strength', startsWeek: 6, typicalWeeks: [6, 9],
      goals: ['Normal walking', 'Bend within 10° of other knee', 'Strength with no reaction after'],
      precautions: [{ label: 'Avoid post-exercise pain or swelling', source: 'MGB-MEN-2021' }],
      exitCriteria: [
        C('men3-noreact', 'No pain or swelling after workouts', 'painOrSwellingAfterExercise', '==', false, 'check-in', 'MGB-MEN-2021'),
        C('men3-gait', 'Normal walking', 'normalGait', '==', true, 'pt', 'MGB-MEN-2021'),
        C('men3-rom', 'Range matches other knee (±3°)', 'flexionGapToOtherKneeDeg', '<=', 3, 'tape', 'MGB-MEN-2021'),
        C('men3-jps', 'Knee sense within 5° (angle-match test)', 'jointPositionErrorDeg', '<', 5, 'self-test', 'MGB-MEN-2021'),
      ],
      unlocks: ['Single-leg strength', 'Bridge-to-sport drills'],
    },
    {
      n: 4, name: 'Bridge to sport', startsWeek: 9, typicalWeeks: [9, 12],
      goals: ['Strength to 80% of other leg', 'Good single-leg control'],
      precautions: [],
      exitCriteria: [
        C('men4-inst', 'No giving-way episodes', 'instabilityEpisodes7d', '==', 0, 'check-in', 'MGB-MEN-2021'),
        C('men4-sls', '10 single-leg squats to 60°', 'singleLegSquats60', '>=', 10, 'self-test', 'MGB-MEN-2021'),
        C('men4-koos', 'KOOS-Sport above 70%', 'koosSportPct', '>', 70, 'self-test', 'MGB-MEN-2021'),
        C('men4-quad', 'Quad strength ≥80% of other leg', 'quadIndexPct', '>=', 80, 'pt', 'MGB-MEN-2021'),
      ],
      unlocks: ['Return-to-run program', 'Agility and plyometrics'],
    },
    {
      n: 5, name: 'Run, jump, train', startsWeek: 13, typicalWeeks: [13, 22],
      goals: ['Finish the run program', 'Sport-specific training'],
      precautions: [{ label: 'Functional brace for agility if prescribed', source: 'MGB-MEN-2021' }],
      exitCriteria: [
        C('men5-run', 'Run program done, no pain or swelling', 'runProgramDonePainFree', '==', true, 'check-in', 'MGB-MEN-2021'),
        C('men5-str', 'Quad/ham/glute ≥90% of other leg', 'quadIndexPct', '>=', 90, 'pt', 'MGB-MEN-2021'),
        C('men5-hq', 'Hamstring:quad ratio ≥70%', 'hqRatioPct', '>=', 70, 'pt', 'MGB-MEN-2021'),
        C('men5-hop', 'Hop tests ≥90% of other leg', 'hopLsiPct', '>=', 90, 'pt', 'MGB-MEN-2021'),
        C('men5-koos', 'KOOS-Sport above 90%', 'koosSportPct', '>', 90, 'self-test', 'MGB-MEN-2021'),
        C('men5-ikdc', 'IKDC above 93', 'ikdcScore', '>', 93, 'self-test', 'MGB-MEN-2021'),
        C('men5-md', 'Surgeon and PT sign-off', 'mdClearance', '==', true, 'pt', 'MGB-MEN-2021'),
      ],
      unlocks: ['Unrestricted return to sport'],
    },
    {
      n: 6, name: 'Back to your sport', startsWeek: 26, typicalWeeks: [26, 30],
      goals: ['Non-contact → full practice → full play'],
      precautions: [],
      exitCriteria: [
        C('men6-str', 'Strength ≥90% of other leg', 'quadIndexPct', '>=', 90, 'pt', 'MGB-MEN-2021'),
        C('men6-hop', 'Hop tests ≥90%', 'hopLsiPct', '>=', 90, 'pt', 'MGB-MEN-2021'),
      ],
      unlocks: ['Discharge'],
    },
  ],
}

export const PROTOCOLS: Readonly<Record<ProtocolId, Protocol>> = {
  'acl-reconstruction': ACL_RECONSTRUCTION,
  'meniscus-repair': MENISCUS_REPAIR,
}

export const SOURCES: Readonly<Record<string, { readonly title: string; readonly url: string }>> = {
  'MGB-ACL-2024': { title: 'Mass General Brigham — ACL Reconstruction Rehab Protocol (rev. 8/2024)', url: 'https://www.massgeneralbrigham.org/content/dam/unified-xwalk/pdf/patient-education/english/rehabilitation-protocol-for-acl.pdf' },
  'MGB-MEN-2021': { title: 'Mass General Brigham — Meniscal Repair Rehab Protocol (rev. 4/2021)', url: 'https://www.massgeneralbrigham.org/content/dam/unified-xwalk/pdf/patient-education/english/rehabilitation-protocol-for-meniscus-repair.pdf' },
  'MOON-2015': { title: 'Wright et al. 2015, MOON ACL Rehabilitation Guidelines, Sports Health', url: 'https://doi.org/10.1177/1941738113517855' },
  'GRINDEM-2016': { title: 'Grindem et al. 2016, Br J Sports Med (Delaware-Oslo cohort)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4912389' },
  'STURGILL-2009': { title: 'Sturgill et al. 2009, JOSPT — knee effusion grading scale', url: 'https://pubmed.ncbi.nlm.nih.gov/20032559/' },
}
