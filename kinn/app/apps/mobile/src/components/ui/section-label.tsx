import { Txt } from './txt'
import { space } from '@/theme/tokens'

interface SectionLabelProps {
  readonly children: string
  /** Leaves room above a list whose first row draws a divider. */
  readonly spaced?: boolean
}

export function SectionLabel({ children, spaced = false }: SectionLabelProps) {
  return (
    <Txt kind="label" color="textMuted" {...(spaced ? { style: { paddingBottom: space.sm } } : {})}>
      {children}
    </Txt>
  )
}
