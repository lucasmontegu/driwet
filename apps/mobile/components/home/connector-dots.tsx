import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "@/hooks/use-reduce-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";

type ConnectorDotsProps = {
	state: "idle" | "calculating" | "ready";
};

export function ConnectorDots({ state }: ConnectorDotsProps) {
	const colors = useThemeColors();
	const reduceMotion = useReduceMotion();

	const dot1Opacity = useSharedValue(0.4);
	const dot2Opacity = useSharedValue(0.4);
	const dot3Opacity = useSharedValue(0.4);

	useEffect(() => {
		if (reduceMotion) {
			dot1Opacity.value = 0.6;
			dot2Opacity.value = 0.6;
			dot3Opacity.value = 0.6;
			return;
		}

		// Cancel existing animations
		cancelAnimation(dot1Opacity);
		cancelAnimation(dot2Opacity);
		cancelAnimation(dot3Opacity);

		const duration = state === "calculating" ? 200 : 400;
		const pauseDuration = state === "calculating" ? 100 : 200;

		// Sequential pulse animation
		const createPulse = (delay: number) =>
			withDelay(
				delay,
				withRepeat(
					withSequence(
						withTiming(1, { duration }),
						withTiming(0.4, { duration: pauseDuration }),
					),
					-1,
				),
			);

		dot1Opacity.value = createPulse(0);
		dot2Opacity.value = createPulse(duration / 3);
		dot3Opacity.value = createPulse((duration / 3) * 2);
	}, [state, reduceMotion]);

	const dotColor =
		state === "calculating" ? colors.primary : colors.mutedForeground;

	const dot1Style = useAnimatedStyle(() => ({
		opacity: dot1Opacity.value,
	}));

	const dot2Style = useAnimatedStyle(() => ({
		opacity: dot2Opacity.value,
	}));

	const dot3Style = useAnimatedStyle(() => ({
		opacity: dot3Opacity.value,
	}));

	if (state === "ready") {
		// Show mini route line instead of dots
		return (
			<View style={styles.container}>
				<View style={[styles.routeLine, { backgroundColor: colors.primary }]} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Animated.View
				style={[styles.dot, { backgroundColor: dotColor }, dot1Style]}
			/>
			<Animated.View
				style={[styles.dot, { backgroundColor: dotColor }, dot2Style]}
			/>
			<Animated.View
				style={[styles.dot, { backgroundColor: dotColor }, dot3Style]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		height: 24,
		gap: 4,
	},
	dot: {
		width: 4,
		height: 4,
		borderRadius: 2,
	},
	routeLine: {
		width: 2,
		height: 16,
		borderRadius: 1,
	},
});
