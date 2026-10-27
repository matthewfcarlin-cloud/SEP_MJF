// Web-only tab layout. NativeTabs renders a top strip on the web that sits over the
// header, so the browser build (served at reco site /try) uses expo-router's JS tabs with
// a bottom bar styled from the same tokens. iOS keeps _layout.tsx and its SF Symbols.
import { Redirect, Tabs } from 'expo-router'
import { useEffect } from 'react'
import type { ColorValue } from 'react-native'
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg'

import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { useColors } from '@/theme/use-tokens'

type IconProps = { color: ColorValue; size: number }
const stroke = { strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

function SunIcon({ color, size }: IconProps) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
    const a = (deg * Math.PI) / 180
    return <Line key={deg} x1={12 + 7.5 * Math.cos(a)} y1={12 + 7.5 * Math.sin(a)} x2={12 + 10 * Math.cos(a)} y2={12 + 10 * Math.sin(a)} stroke={color} {...stroke} />
  })
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={4} stroke={color} {...stroke} />
      {rays}
    </Svg>
  )
}

function ListIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {[6, 12, 18].map(y => (
        <Line key={y} x1={8} y1={y} x2={20} y2={y} stroke={color} {...stroke} />
      ))}
      {[6, 12, 18].map(y => (
        <Circle key={y} cx={4} cy={y} r={1.1} fill={color} />
      ))}
    </Svg>
  )
}

function SparkIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" stroke={color} {...stroke} />
      <Path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" fill={color} />
    </Svg>
  )
}

function TrendIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="3,17 9,11 13,14 21,6" stroke={color} {...stroke} />
      <Polyline points="15,6 21,6 21,12" stroke={color} {...stroke} />
    </Svg>
  )
}

function DocIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={3} width={14} height={18} rx={2} stroke={color} {...stroke} />
      <Line x1={9} y1={9} x2={15} y2={9} stroke={color} {...stroke} />
      <Line x1={9} y1={13} x2={15} y2={13} stroke={color} {...stroke} />
      <Line x1={9} y1={17} x2={13} y2={17} stroke={color} {...stroke} />
    </Svg>
  )
}

const TAB_ICON_SIZE = 22
const TAB_BAR_HEIGHT = 64

/** Site links such as /try/?tape=demo or /try/?sample=1 should land on a live Today, not on onboarding. */
function sampleRequestedByUrl(): boolean {
  if (typeof window === 'undefined') return false
  const q = window.location.search
  return q.includes('tape=demo') || q.includes('sample=1')
}

export default function TabsLayout() {
  const { ready, state, startWithSample } = useStore()
  const colors = useColors()
  const autoSample = ready && !state.onboarded && sampleRequestedByUrl()
  useEffect(() => {
    if (autoSample) startWithSample()
  }, [autoSample, startWithSample])
  if (!ready || autoSample) return null
  if (!state.onboarded) return <Redirect href="/onboarding" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border, height: TAB_BAR_HEIGHT, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: copy.tabs.today, tabBarIcon: ({ color }) => <SunIcon color={color} size={TAB_ICON_SIZE} /> }} />
      <Tabs.Screen name="log" options={{ title: copy.tabs.log, tabBarIcon: ({ color }) => <ListIcon color={color} size={TAB_ICON_SIZE} /> }} />
      <Tabs.Screen name="insights" options={{ title: copy.tabs.insights, tabBarIcon: ({ color }) => <SparkIcon color={color} size={TAB_ICON_SIZE} /> }} />
      <Tabs.Screen name="progress" options={{ title: copy.tabs.progress, tabBarIcon: ({ color }) => <TrendIcon color={color} size={TAB_ICON_SIZE} /> }} />
      <Tabs.Screen name="report" options={{ title: copy.tabs.report, tabBarIcon: ({ color }) => <DocIcon color={color} size={TAB_ICON_SIZE} /> }} />
    </Tabs>
  )
}
