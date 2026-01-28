// apps/mobile/app/(auth)/onboarding/demo.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DemoScreen } from "@/components/onboarding";
import { useCompleteOnboarding } from "@/hooks/use-api";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@/lib/i18n";

const ONBOARDING_COMPLETE_KEY = "@driwet/onboarding-v2-complete";
const ONBOARDING_PREFERENCES_KEY = "@driwet/onboarding-preferences";

export default function DemoRoute() {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const router = useRouter();

	const { data: session, refetch: refetchSession } = authClient.useSession();
	const isLoggedIn = !!session?.user;
	const completeOnboardingMutation = useCompleteOnboarding();

	const handleFinish = async () => {
		try {
			// Load saved preferences
			const prefsJson = await AsyncStorage.getItem(ONBOARDING_PREFERENCES_KEY);
			const prefs = prefsJson ? JSON.parse(prefsJson) : null;

			// Mark onboarding complete
			await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");

			// If logged in, save to server
			if (isLoggedIn) {
				await completeOnboardingMutation.mutateAsync({
					tripPreferences: prefs?.tripTypes,
				});
				await refetchSession();
			}

			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

			// If logged in, go to app. If not, go to signup
			if (isLoggedIn) {
				router.replace("/(app)/(tabs)");
			} else {
				router.push("/(auth)/onboarding/signup" as any);
			}
		} catch (error) {
			console.error("Failed to complete onboarding:", error);
		}
	};

	return (
		<View style={styles.container}>
			<DemoScreen />

			{/* Bottom navigation */}
			<Animated.View
				entering={FadeInDown.delay(200).duration(400)}
				style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}
			>
				<Text style={[styles.progressText, { color: colors.mutedForeground }]}>
					Step 3 of 4
				</Text>

				<TouchableOpacity onPress={handleFinish} activeOpacity={0.8}>
					<LinearGradient
						colors={[colors.primary, "#4F46E5"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.nextButton}
					>
						<Text
							style={[
								styles.nextButtonText,
								{ color: colors.primaryForeground },
							]}
						>
							{isLoggedIn ? t("onboarding.finish") : t("onboarding.next")}
						</Text>
						<Text
							style={[
								styles.nextButtonArrow,
								{ color: colors.primaryForeground },
							]}
						>
							{isLoggedIn ? "✓" : "→"}
						</Text>
					</LinearGradient>
				</TouchableOpacity>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	bottomBar: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	progressText: {
		fontFamily: "Inter_400Regular",
		fontSize: 13,
	},
	nextButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 14,
		gap: 8,
	},
	nextButtonText: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 16,
	},
	nextButtonArrow: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 18,
	},
});
