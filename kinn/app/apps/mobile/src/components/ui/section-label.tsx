import { Txt } from './txt'

export function SectionLabel({ children }: { readonly children: string }) {
  return (
    <Txt kind="label" color="textMuted">
      {children}
    </Txt>
  )
}
