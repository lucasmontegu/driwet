// apps/mobile/app/(auth)/onboarding/_layout.tsx
import { LinearGradient } from "expo-linear-gradient";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";

const STEPS = ["hook", "promise", "personalization", "demo", "signup"];

function getStepLabel(step: string): string {
	const labels: Record<string, string> = {
		hook: "",
		promise: "Welcome",
		personalization: "Customize",
		demo: "Preview",
		signup: "Start",
	};
	return labels[step] || "";
}

export default function OnboardingLayout() {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const router = useRouter();
	const pathname = usePathname();

	// Extract current step from pathname
	const currentStep = pathname.split("/").pop() || "hook";
	const currentIndex = STEPS.indexOf(currentStep);
	const canGoBack = currentIndex > 1; // Can go back after promise screen
	const showProgressBar = currentStep !== "hook";

	// Animated progress value
	const progressValue = useSharedValue(0);
	const progressGlow = useSharedValue(0.5);

	// Update progress animation when step changes
	useEffect(() => {
		const totalSteps = STEPS.length - 1;
		const currentProgress =
			currentStep === "hook" ? 0 : (currentIndex / totalSteps) * 100;

		progressValue.value = withSpring(currentProgress, {
			damping: 16,
			stiffness: 120,
			mass: 0.8,
		});

		// Pulse glow when progress changes
		progressGlow.value = withTiming(1, { duration: 300 }, () => {
			progressGlow.value = withTiming(0.5, { duration: 500 });
		});
	}, [currentStep, currentIndex]);

	const progressStyle = useAnimatedStyle(() => ({
		width: `${progressValue.value}%`,
	}));

	const progressGlowStyle = useAnimatedStyle(() => ({
		opacity: progressGlow.value,
	}));

	const handleBack = () => {
		router.back();
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<Stack
				screenOptions={{
					headerShown: false,
					animation: "slide_from_right",
					animationDuration: 300,
				}}
			>
				<Stack.Screen name="hook" />
				<Stack.Screen name="promise" />
				<Stack.Screen name="personalization" />
				<Stack.Screen name="demo" />
				<Stack.Screen name="signup" />
			</Stack>

			{/* Animated Progress Bar - shows on all screens except hook */}
			{showProgressBar && (
				<View
					style={[styles.progressContainer, { paddingTop: insets.top + 8 }]}
					pointerEvents="box-none"
				>
					<View
						style={[styles.progressTrack, { backgroundColor: colors.muted }]}
					>
						<Animated.View style={[styles.progressFill, progressStyle]}>
							<LinearGradient
								colors={[colors.primary, "#4F46E5"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={StyleSheet.absoluteFillObject}
							/>
							<Animated.View
								style={[
									styles.progressGlow,
									{ backgroundColor: colors.primary },
									progressGlowStyle,
								]}
							/>
						</Animated.View>
					</View>

					{/* Step indicators */}
					<View style={styles.stepIndicators}>
						{STEPS.slice(1).map((step, index) => {
							const stepIndex = index + 1;
							const isCompleted = stepIndex < currentIndex;
							const isCurrent = stepIndex === currentIndex;

							return (
								<View key={step} style={styles.stepIndicator}>
									<View
										style={[
											styles.stepDot,
											{
												backgroundColor: isCompleted
													? colors.primary
													: isCurrent
														? colors.primary + "50"
														: colors.muted,
												borderColor: isCurrent ? colors.primary : "transparent",
												borderWidth: isCurrent ? 2 : 0,
											},
										]}
									>
										{isCompleted && (
											<Icon
												name="check"
												size={10}
												color={colors.primaryForeground}
											/>
										)}
									</View>
									<Text
										style={[
											styles.stepLabel,
											{
												color:
													isCompleted || isCurrent
														? colors.foreground
														: colors.mutedForeground,
												fontFamily: isCurrent
													? "Inter_600SemiBold"
													: "Inter_400Regular",
											},
										]}
									>
										{getStepLabel(step)}
									</Text>
								</View>
							);
						})}
					</View>

					{/* Back button */}
					{canGoBack && (
						<View style={[styles.topBar, { paddingTop: insets.top + 80 }]}>
							<TouchableOpacity
								onPress={handleBack}
								style={styles.backButton}
								activeOpacity={0.7}
							>
								<View
									style={[
										styles.backButtonInner,
										{ backgroundColor: colors.muted },
									]}
								>
									<Icon name="close" size={16} color={colors.mutedForeground} />
								</View>
							</TouchableOpacity>
						</View>
					)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	progressContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 24,
		zIndex: 10,
	},
	progressTrack: {
		height: 4,
		borderRadius: 2,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: 2,
		overflow: "hidden",
	},
	progressGlow: {
		position: "absolute",
		right: 0,
		top: -4,
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	stepIndicators: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 12,
		paddingHorizontal: 8,
	},
	stepIndicator: {
		alignItems: "center",
		flex: 1,
	},
	stepDot: {
		width: 20,
		height: 20,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 4,
	},
	stepLabel: {
		fontSize: 11,
		textAlign: "center",
	},
	topBar: {
		position: "absolute",
		top: 0,
		left: 24,
		zIndex: 20,
	},
	backButton: {
		minWidth: 40,
	},
	backButtonInner: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
});
