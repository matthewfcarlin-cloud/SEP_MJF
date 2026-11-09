import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Pressable, View, useWindowDimensions } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

import { Arrive } from '@/components/arrive'
import { Ring } from '@/components/ring'
import { Txt } from '@/components/ui/txt'
import { copy } from '@/copy'
import { tapFeedback } from '@/haptics'
import { STAGGER_MS } from '@/theme/motion'
import { palette, radius, space } from '@/theme/tokens'

const ATHLETE = require('../../../assets/images/intro-athlete.jpg')

/** The intro sits on a photo in both light and dark mode, so its colours are fixed, not themed. */
const ON_PHOTO = palette.light.bg
const SHADE = palette.dark.bg
const PHOTO_FADE_MS = 600
const MARK_O = 19
const MARK_STROKE = 2.6
/** Headline, body and buttons arrive one after another once the O is drawn. */
const STEP = 2 * STAGGER_MS

interface WelcomeIntroProps {
  readonly onStart: () => void
  readonly onSample: () => void
}

/** RECO, with the O drawn by the ring: the same shape as the coin and the morning score. */
function Wordmark({ onDrawn }: { readonly onDrawn: () => void }) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={copy.appName} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Txt kind="heading" style={{ color: ON_PHOTO, letterSpacing: 1.5, fontSize: 22, lineHeight: 26 }}>
        REC
      </Txt>
      {/* Pulls the O in by the letter spacing the C carries after it. */}
      <View style={{ marginLeft: -2 }}>
        <Ring value={100} color="live" size={MARK_O} stroke={MARK_STROKE} sweep delayMs={200} showTrack={false} onLanded={onDrawn} />
      </View>
    </View>
  )
}

/** Darkens the lower photo so the words always read, while the balls and grass still show through. */
function PhotoShade({ height }: { readonly height: number }) {
  return (
    <Svg width="100%" height={height} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} pointerEvents="none">
      <Defs>
        <LinearGradient id="intro-shade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={SHADE} stopOpacity={0.3} />
          <Stop offset="0.18" stopColor={SHADE} stopOpacity={0} />
          <Stop offset="0.5" stopColor={SHADE} stopOpacity={0.1} />
          <Stop offset="0.75" stopColor={SHADE} stopOpacity={0.6} />
          <Stop offset="1" stopColor={SHADE} stopOpacity={0.9} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#intro-shade)" />
    </Svg>
  )
}

/** First open: the ring draws the O in RECO, then the photo, the serif headline and the two ways in. */
export function WelcomeIntro({ onStart, onSample }: WelcomeIntroProps) {
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const [isDrawn, setIsDrawn] = useState(false)
  const photoHeight = height

  return (
    <View style={{ flex: 1, backgroundColor: SHADE }}>
      <StatusBar style="light" />
      <Animated.View entering={FadeIn.duration(PHOTO_FADE_MS)} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: photoHeight }}>
        <Image source={ATHLETE} contentFit="cover" contentPosition={{ left: '60%', top: '0%' }} style={{ width: '100%', height: '100%' }} accessible={false} />
        <PhotoShade height={photoHeight} />
      </Animated.View>

      <View style={{ flex: 1, paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.md, paddingHorizontal: space.lg, justifyContent: 'space-between' }}>
        <Wordmark onDrawn={() => setIsDrawn(true)} />
        <View style={{ gap: space.md }}>
          <Arrive shown={isDrawn}>
            <Txt kind="serif" style={{ color: ON_PHOTO, fontSize: 54, lineHeight: 56 }}>
              {copy.setup.welcomeTagline}
            </Txt>
          </Arrive>
          <Arrive shown={isDrawn} delayMs={STEP}>
            <Txt style={{ color: ON_PHOTO, opacity: 0.82 }}>{copy.setup.welcomeBody}</Txt>
          </Arrive>
          <Arrive shown={isDrawn} delayMs={2 * STEP} style={{ gap: space.sm, marginTop: space.md }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                tapFeedback()
                onStart()
              }}
              style={({ pressed }) => ({ backgroundColor: ON_PHOTO, borderRadius: radius.pill, paddingVertical: space.md, alignItems: 'center', opacity: pressed ? 0.85 : 1 })}>
              <Txt kind="bodyStrong" style={{ color: SHADE }}>
                {copy.setup.getStarted}
              </Txt>
            </Pressable>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onSample} style={({ pressed }) => ({ paddingVertical: space.md, alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
              <Txt kind="bodyStrong" style={{ color: ON_PHOTO }}>
                {copy.setup.lookAround}
              </Txt>
            </Pressable>
          </Arrive>
        </View>
      </View>
    </View>
  )
}
