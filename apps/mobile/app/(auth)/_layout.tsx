import { Stack } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function AuthLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="email-input" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
