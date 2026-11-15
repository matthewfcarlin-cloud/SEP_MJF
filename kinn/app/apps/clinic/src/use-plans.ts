/**
 * Published PT plans, per patient. Until the backend exists they're kept on this computer, so a
 * published plan survives a reload but never reaches a patient's phone; the editor says so.
 */
import type { RecoveryPlan } from '@reco/core'
import { useCallback, useState } from 'react'

const KEY = 'reco.clinic.plans.v1'

type Plans = Readonly<Record<string, RecoveryPlan>>

const isPlan = (x: unknown): x is RecoveryPlan =>
  typeof x === 'object' && x !== null && Array.isArray((x as RecoveryPlan).entries) && typeof (x as RecoveryPlan).version === 'number'

function load(): Plans {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => isPlan(v))) as Plans
  } catch (error) {
    console.warn('RECO: saved plans could not be read.', error)
    return {}
  }
}

function save(plans: Plans): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(plans))
  } catch (error) {
    console.warn('RECO: the plan could not be saved on this computer.', error)
  }
}

export function usePlans(): readonly [Plans, (patientId: string, plan: RecoveryPlan) => void] {
  const [plans, setPlans] = useState<Plans>(() => (typeof window === 'undefined' ? {} : load()))
  const publish = useCallback((patientId: string, plan: RecoveryPlan) => {
    setPlans((current) => {
      const next = { ...current, [patientId]: plan }
      save(next)
      return next
    })
  }, [])
  return [plans, publish]
}
