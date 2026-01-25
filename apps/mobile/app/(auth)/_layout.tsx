// apps/mobile/app/(auth)/_layout.tsx

import { Stack } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function AuthLayout() {
	const colors = useThemeColors();

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: colors.background },
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="onboarding" />
			<Stack.Screen name="welcome" />
			<Stack.Screen name="sign-in" />
			<Stack.Screen name="email-input" />
		</Stack>
	);
}
