import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { View } from 'react-native'
import { SOURCES } from '@reco/core'
import type { PathView } from '@reco/core'

import { Button } from '@/components/ui/button'
import { ListRow } from '@/components/ui/list-row'
import { Txt } from '@/components/ui/txt'
import { pathCopy } from '@/copy-path'
import { space } from '@/theme/tokens'

/** This protocol's own source plus the shared evidence; the other surgery's protocol is left out. */
const sourceKeys = (path: PathView): readonly string[] =>
  Object.keys(SOURCES).filter((k) => !k.startsWith('MGB-') || k === path.protocol.primarySource)

const hostOf = (url: string): string => url.replace(/^https?:\/\//, '').split('/')[0] ?? url

const open = (url: string): void => {
  WebBrowser.openBrowserAsync(url).catch((error: unknown) => console.warn('RECO: could not open source link.', error))
}

/** Footer: the source line, then a sheet of sources built from SOURCES. */
export function PathSources({ path }: { readonly path: PathView }) {
  const [shown, setShown] = useState(false)
  return (
    <View style={{ gap: space.sm }}>
      <Txt kind="small" color="textMuted">
        {pathCopy.source(path.protocol.name)}
      </Txt>
      <Txt kind="small" color="textMuted">
        {pathCopy.notReviewed}
      </Txt>
      <Button label={shown ? pathCopy.hideSources : pathCopy.sources} variant="ghost" onPress={() => setShown(!shown)} />
      {shown
        ? sourceKeys(path).map((k, i) => {
            const s = SOURCES[k]!
            return <ListRow key={k} first={i === 0} title={s.title} sub={hostOf(s.url)} onPress={() => open(s.url)} />
          })
        : null}
    </View>
  )
}
