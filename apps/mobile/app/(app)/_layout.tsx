// apps/native/app/(app)/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { authClient } from '@/lib/auth-client';

export default function AppLayout() {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: session, isPending } = authClient.useSession();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for navigation and session to be ready
    if (!rootNavigationState?.key || isPending) return;

    // If not authenticated, redirect to welcome/sign-in
    if (!session?.user) {
      router.replace('/(auth)/welcome');
    }
  }, [session, isPending, rootNavigationState?.key]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="premium"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="route-detail"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="login-incentive"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="locations"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
