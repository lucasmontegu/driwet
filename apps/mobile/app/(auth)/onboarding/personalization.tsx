// apps/mobile/app/(auth)/onboarding/personalization.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PersonalizationScreen, type TripType } from "@/components/onboarding";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";

const ONBOARDING_PREFERENCES_KEY = "@driwet/onboarding-preferences";

export default function PersonalizationRoute() {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const router = useRouter();
	const [tripPreferences, setTripPreferences] = useState<TripType[]>([]);

	const handleNext = async () => {
		// Save preferences to AsyncStorage
		if (tripPreferences.length > 0) {
			try {
				await AsyncStorage.setItem(
					ONBOARDING_PREFERENCES_KEY,
					JSON.stringify({ tripTypes: tripPreferences }),
				);
			} catch (error) {
				console.error("Failed to save preferences:", error);
			}
		}

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push("/(auth)/onboarding/demo" as any);
	};

	return (
		<View style={styles.container}>
			<PersonalizationScreen
				initialSelection={tripPreferences}
				onSelectionChange={setTripPreferences}
			/>

			{/* Bottom navigation */}
			<Animated.View
				entering={FadeInDown.delay(200).duration(400)}
				style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}
			>
				<Text style={[styles.progressText, { color: colors.mutedForeground }]}>
					Step 2 of 4
				</Text>

				<TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
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
							{t("onboarding.next")}
						</Text>
						<Text
							style={[
								styles.nextButtonArrow,
								{ color: colors.primaryForeground },
							]}
						>
							→
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
