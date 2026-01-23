// apps/native/app/(app)/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { authClient } from '@/lib/auth-client';

export default function AppLayout() {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: session, isPending, refetch } = authClient.useSession();
  const rootNavigationState = useRootNavigationState();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Wait for navigation to be ready
    if (!rootNavigationState?.key) return;

    // Wait for initial session check to complete
    if (isPending) return;

    // If no session, try refetching once before redirecting
    // This handles the case where session was just stored but hook hasn't updated
    if (!session?.user && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      refetch();
      return;
    }

    // If still no session after refetch, redirect to welcome
    if (!session?.user && hasCheckedAuth) {
      router.replace('/(auth)/welcome');
    }
  }, [session, isPending, rootNavigationState?.key, hasCheckedAuth, refetch]);

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
