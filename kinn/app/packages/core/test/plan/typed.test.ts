import { scheduledWeekdays, typedPlan, weekStartOf } from '../../src/plan/typed'
import type { PlanExercise } from '../../src/manual/types'

// 2026-11-02 is a Monday.
const quad: PlanExercise = { id: 'q', name: 'Quad sets', sets: 3, reps: 10, daysPerWeek: 7 }
const heel: PlanExercise = { id: 'h', name: 'Heel slides', sets: 2, reps: 15, daysPerWeek: 2 }

describe('typedPlan', () => {
  test('weeks start on Monday', () => {
    expect(weekStartOf('2026-11-02')).toBe('2026-11-02')
    expect(weekStartOf('2026-11-08')).toBe('2026-11-02')
  })
  test('spreads days across the week', () => {
    expect(scheduledWeekdays(7)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(scheduledWeekdays(2)).toEqual([0, 3])
    expect(scheduledWeekdays(1)).toEqual([0])
  })
  test('shows what is due today and counts the week', () => {
    const marks = [{ date: '2026-11-02', itemId: 'q', done: true }, { date: '2026-11-02', itemId: 'h', done: true }]
    const plan = typedPlan([quad, heel], marks, '2026-11-03')
    expect(plan.today.items.map((i) => i.id)).toEqual(['q'])
    expect(plan.today.items[0]?.detail).toBe('3 sets of 10')
    expect(plan.doneThisWeek).toBe(2)
    expect(plan.plannedThisWeek).toBe(9)
    expect(plan.week).toHaveLength(7)
  })
  test('a day with nothing scheduled is a rest day', () => {
    const plan = typedPlan([heel], [], '2026-11-03')
    expect(plan.today.rest).toBe(true)
    expect(plan.tomorrow.items.map((i) => i.id)).toEqual([])
  })
  test('an empty list has no count', () => {
    const plan = typedPlan([], [], '2026-11-03')
    expect(plan.plannedThisWeek).toBe(0)
    expect(plan.today.rest).toBe(true)
  })
  test('a day counts as done only when all of it is', () => {
    const plan = typedPlan([quad, heel], [{ date: '2026-11-02', itemId: 'q', done: true }], '2026-11-03')
    expect(plan.week[0]?.allDone).toBe(false)
    expect(plan.week[1]?.allDone).toBe(false)
  })
})
