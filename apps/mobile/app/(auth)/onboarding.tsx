// apps/mobile/app/(auth)/onboarding.tsx
import { Redirect } from "expo-router";

export default function OnboardingScreen() {
	// Redirect to first step of onboarding
	return <Redirect href="/(auth)/onboarding/hook" />;
}
