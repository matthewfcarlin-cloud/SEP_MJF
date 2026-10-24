import { Redirect } from 'expo-router'
import { NativeTabs } from 'expo-router/native-tabs'

import { copy } from '@/copy'
import { useStore } from '@/store/provider'
import { useColors } from '@/theme/use-tokens'

export default function TabsLayout() {
  const { ready, state } = useStore()
  const colors = useColors()
  if (!ready) return null
  if (!state.onboarded) return <Redirect href="/onboarding" />

  return (
    <NativeTabs backgroundColor={colors.bg} indicatorColor={colors.surfaceRaised} labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{copy.tabs.today}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="log">
        <NativeTabs.Trigger.Label>{copy.tabs.log}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Label>{copy.tabs.insights}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkles" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label>{copy.tabs.progress}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="report">
        <NativeTabs.Trigger.Label>{copy.tabs.report}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
