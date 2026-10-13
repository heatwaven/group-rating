import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';
import { SessionProvider, useSession } from '../lib/session';
import { colors, fonts } from '../lib/ui';

function Gate() {
  const { session, loading } = useSession();
  const segments = useSegments();
  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: colors.bg }} color={colors.primary} />;
  const onLogin = segments[0] === 'login';
  if (!session && !onLogin) return <Redirect href="/login" />;
  if (session && onLogin) return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 18 },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="group/new" options={{ title: 'Neue Gruppe' }} />
      <Stack.Screen name="group/join" options={{ title: 'Mit Code beitreten' }} />
      <Stack.Screen name="group/[id]" options={{ title: 'Gruppe' }} />
      <Stack.Screen name="item/[id]" options={{ title: 'Eintrag' }} />
      <Stack.Screen name="account/avatar" options={{ title: 'Profilbild ändern' }} />
    </Stack>
  );
}

export default function Root() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  if (!fontsLoaded) return <ActivityIndicator style={{ flex: 1, backgroundColor: colors.bg }} color={colors.primary} />;
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Gate />
    </SessionProvider>
  );
}
