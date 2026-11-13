import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from '@expo-google-fonts/geist'
import { GeistMono_400Regular, GeistMono_500Medium } from '@expo-google-fonts/geist-mono'
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif'
import { useFonts } from 'expo-font'
import * as Notifications from 'expo-notifications'
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { LogBox, useColorScheme } from 'react-native'

import { installDevLogMirror } from '@/dev-log-mirror'
import { BendWatch } from '@/tape/bend-watch'
import { StoreProvider } from '@/store/provider'
import { TapeProvider } from '@/tape/use-tape'
import { palette } from '@/theme/tokens'
import '@/notifications'

installDevLogMirror()
// Development builds only: keep the yellow LogBox toast off the demo screens. Warnings still reach the
// Metro terminal through the dev log mirror above, so nothing is hidden from us.
LogBox.ignoreAllLogs(true)
SplashScreen.preventAutoHideAsync()

const NOTIFICATION_ROUTES = ['/', '/evening', '/report', '/settle'] as const
type NotificationRoute = (typeof NOTIFICATION_ROUTES)[number]
const isNotificationRoute = (x: unknown): x is NotificationRoute => NOTIFICATION_ROUTES.includes(x as NotificationRoute)

function useNotificationTaps() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route
      if (isNotificationRoute(route)) router.push(route)
    })
    return () => sub.remove()
  }, [])
}

const SHEET = { presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: 'fitToContents' } as const

export default function RootLayout() {
  const scheme = useColorScheme()
  const [fontsLoaded, fontError] = useFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold, GeistMono_400Regular, GeistMono_500Medium, InstrumentSerif_400Regular })
  useNotificationTaps()
  const fontsSettled = fontsLoaded || fontError !== null
  useEffect(() => {
    if (fontError) console.warn('RECO: fonts did not load.', fontError)
    if (fontsSettled) SplashScreen.hideAsync()
  }, [fontsSettled, fontError])
  if (!fontsSettled) return null
  // A solid sheet, as designed. iOS 26's default glass lets the screen behind show through the text.
  const sheet = { ...SHEET, contentStyle: { backgroundColor: palette[scheme === 'dark' ? 'dark' : 'light'].bg } }
  return (
    <StoreProvider>
      <TapeProvider>
        <BendWatch />
        <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
            <Stack.Screen name="pain" options={sheet} />
            <Stack.Screen name="evening" options={sheet} />
            <Stack.Screen name="backup" options={sheet} />
            <Stack.Screen name="delete" options={sheet} />
            <Stack.Screen name="settle" options={{ presentation: 'modal' }} />
            <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add-day" options={{ presentation: 'modal' }} />
            <Stack.Screen name="guidance" options={{ presentation: 'modal' }} />
            <Stack.Screen name="red-flags" options={{ presentation: 'modal' }} />
            <Stack.Screen name="tape" options={{ presentation: 'modal' }} />
            <Stack.Screen name="path" />
            <Stack.Screen name="self-test" options={{ presentation: 'modal' }} />
            <Stack.Screen name="from-pt" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </TapeProvider>
    </StoreProvider>
  )
}
