import { parseIntake } from '../../src/intake/parse'

const FIGMA =
  'I tore my ACL playing basketball about eight weeks ago, left knee. Had the reconstruction in September. I want to be back for spring season, and my PT is Lena at Westside.'

describe('parseIntake', () => {
  test('pulls every field out of the sentence on the onboarding screen', () => {
    const r = parseIntake(FIGMA)
    expect(r.joint).toBe('knee')
    expect(r.side).toBe('left')
    expect(r.injury).toBe('acl')
    expect(r.weeksAgo).toBe(8)
    expect(r.hadSurgery).toBe(true)
    expect(r.sport).toBe('Basketball')
    expect(r.goal).toBe('Back for spring season')
    expect(r.ptName).toBe('Lena')
    expect(r.ptClinic).toBe('Westside')
    expect(r.hasPt).toBe(true)
  })

  test('reads shoulder and elbow injuries and digit or word durations', () => {
    expect(parseIntake('Dislocated my right shoulder 3 months ago skiing').joint).toBe('shoulder')
    expect(parseIntake('Dislocated my right shoulder 3 months ago skiing').injury).toBe('shoulder-dislocation')
    expect(parseIntake('Dislocated my right shoulder 3 months ago skiing').weeksAgo).toBe(13)
    expect(parseIntake('rotator cuff surgery two weeks ago').injury).toBe('rotator-cuff')
    expect(parseIntake('tennis elbow from climbing, a month ago').joint).toBe('elbow')
    expect(parseIntake('UCL tear pitching six weeks ago').injury).toBe('ucl')
    expect(parseIntake('torn meniscus, 10 days ago').weeksAgo).toBe(1)
  })

  test('understands no surgery and no PT', () => {
    const r = parseIntake("Sprained my knee playing soccer, didn't have surgery, no PT, I just want to run again")
    expect(r.hadSurgery).toBe(false)
    expect(r.hasPt).toBe(false)
    expect(r.sport).toBe('Soccer')
    expect(r.goal).toBe('Run again')
  })

  test('leaves unknown fields undefined instead of guessing', () => {
    const r = parseIntake('my knee hurts')
    expect(r.joint).toBe('knee')
    expect(r.injury).toBeUndefined()
    expect(r.weeksAgo).toBeUndefined()
    expect(r.hadSurgery).toBeUndefined()
    expect(r.sport).toBeUndefined()
    expect(r.found).toEqual(['joint'])
  })
})
