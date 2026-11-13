import { View } from 'react-native'
import { addDays } from '@reco/core'
import type { BendAlert, PathView } from '@reco/core'

import { Txt } from '@/components/ui/txt'
import { pathCopy } from '@/copy-path'
import { radius, space } from '@/theme/tokens'
import { useColors } from '@/theme/use-tokens'

const ALERT_WINDOW_DAYS = 7

interface LimitBannerProps {
  readonly limits: PathView['limits']
  readonly alerts: readonly BendAlert[]
  readonly today: string
  /** True once the tape's bend is set up in degrees, so alerts can fire. */
  readonly tapeReady: boolean
}

/** Shown while a bend limit is in force, saying who set it. */
export function LimitBanner({ limits, alerts, today, tapeReady }: LimitBannerProps) {
  const colors = useColors()
  const { flexionMaxDeg, loadedFlexionMaxDeg, setBy } = limits
  if (flexionMaxDeg === null && loadedFlexionMaxDeg === null) return null
  const recent = alerts.filter((a) => a.date > addDays(today, -ALERT_WINDOW_DAYS) && a.date <= today).length
  const title = flexionMaxDeg !== null ? pathCopy.limitTitle(flexionMaxDeg) : pathCopy.loadedLimitTitle(loadedFlexionMaxDeg ?? 0)
  return (
    <View accessibilityRole="summary" style={{ gap: space.xs, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.caution, backgroundColor: `${colors.caution}1A` }}>
      <Txt kind="bodyStrong">{title}</Txt>
      {flexionMaxDeg !== null && loadedFlexionMaxDeg !== null ? (
        <Txt kind="small" color="textSecondary">
          {pathCopy.loadedLimitTitle(loadedFlexionMaxDeg)}
        </Txt>
      ) : null}
      <Txt kind="small" color="textSecondary">
        {setBy === 'pt' ? pathCopy.limitBy.pt : pathCopy.limitBy.protocol}
      </Txt>
      {recent > 0 ? (
        <Txt kind="small" color="text">
          {pathCopy.limitAlerts(recent)}
        </Txt>
      ) : (
        <Txt kind="small" color="textMuted">
          {tapeReady ? pathCopy.limitTape : pathCopy.limitTapeSetup}
        </Txt>
      )}
    </View>
  )
}
