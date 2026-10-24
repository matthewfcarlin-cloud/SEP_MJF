import * as Notifications from 'expo-notifications'
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'

import { StoreProvider } from '@/store/provider'
import '@/notifications'

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
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  )
}
