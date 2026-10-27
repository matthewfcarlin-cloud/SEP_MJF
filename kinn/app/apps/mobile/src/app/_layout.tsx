import * as Notifications from 'expo-notifications'
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { LogBox, useColorScheme } from 'react-native'

import { installDevLogMirror } from '@/dev-log-mirror'
import { StoreProvider } from '@/store/provider'
import '@/notifications'

installDevLogMirror()
// Development builds only: keep the yellow LogBox toast off the demo screens. Warnings still reach the
// Metro terminal through the dev log mirror above, so nothing is hidden from us.
LogBox.ignoreAllLogs(true)
SplashScreen.preventAutoHideAsync()

function useNotificationTaps() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route
      if (route === '/settle') router.push('/settle')
    })
    return () => sub.remove()
  }, [])
}

export default function RootLayout() {
  const scheme = useColorScheme()
  useNotificationTaps()
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])
  return (
    <StoreProvider>
      <ThemeProvider value={scheme === 'light' ? DefaultTheme : DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="pain" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settle" options={{ presentation: 'modal' }} />
          <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="tape" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  )
}
