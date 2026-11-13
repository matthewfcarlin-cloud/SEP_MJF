import { View } from 'react-native'
import { daysBetween } from '@reco/core'
import type { PathView } from '@reco/core'

import { Card } from '@/components/ui/card'
import { SectionLabel } from '@/components/ui/section-label'
import { Txt } from '@/components/ui/txt'
import { pathCopy } from '@/copy-path'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const DAYS_PER_WEEK = 7
const DOT = 12

/** All phases: done (with the week done), current, upcoming (typical window). */
export function PhaseTimeline({ path, surgeryDate, index }: { readonly path: PathView; readonly surgeryDate: string; readonly index: number }) {
  const colors = useColors()
  return (
    <Card index={index} style={{ gap: 0 }}>
      <SectionLabel spaced>{pathCopy.timeline}</SectionLabel>
      {path.timeline.map((row, i) => {
        const doneWeek = row.completedOn ? Math.round(daysBetween(surgeryDate, row.completedOn) / DAYS_PER_WEEK) : undefined
        const sub = row.status === 'done'
          ? doneWeek !== undefined ? pathCopy.done(doneWeek) : undefined
          : row.status === 'current' ? pathCopy.current : pathCopy.typical(row.typicalWeeks[0], row.typicalWeeks[1])
        const fill = row.status === 'done' ? colors.good : row.status === 'current' ? colors.live : 'transparent'
        return (
          <View key={row.n} style={{ flexDirection: 'row', gap: space.md, paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
            <View style={{ width: DOT, height: DOT, marginTop: 6, borderRadius: radius.pill, backgroundColor: fill, borderWidth: 2, borderColor: row.status === 'upcoming' ? colors.track : fill }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt kind="bodyStrong" color={row.status === 'upcoming' ? 'textSecondary' : 'text'}>{`${row.n}. ${row.name}`}</Txt>
              {sub ? (
                <Txt kind="small" color="textMuted">
                  {sub}
                </Txt>
              ) : null}
            </View>
          </View>
        )
      })}
    </Card>
  )
}
