import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
	Easing,
} from "react-native-reanimated";
import { Car01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { springs } from "@/hooks/use-animation-tokens";
import { useReduceMotion } from "@/hooks/use-reduce-motion";

type DrivingProgressProps = {
	progress: number; // 0-100
	isComplete?: boolean;
};

export function DrivingProgress({
	progress,
	isComplete = false,
}: DrivingProgressProps) {
	const colors = useThemeColors();
	const reduceMotion = useReduceMotion();

	const carPosition = useSharedValue(0);
	const carBounce = useSharedValue(0);
	const roadOffset = useSharedValue(0);

	useEffect(() => {
		if (reduceMotion) {
			carPosition.value = progress;
			return;
		}

		carPosition.value = withSpring(progress, springs.smooth);

		// Bounce on progress change
		carBounce.value = withSequence(
			withSpring(-4, { damping: 8, stiffness: 300 }),
			withSpring(0, springs.bouncy),
		);
	}, [progress, reduceMotion]);

	useEffect(() => {
		if (reduceMotion) return;

		// Animate road dashes continuously
		roadOffset.value = withRepeat(
			withTiming(-20, { duration: 500, easing: Easing.linear }),
			-1,
		);
	}, [reduceMotion]);

	useEffect(() => {
		if (isComplete && !reduceMotion) {
			// Celebratory wiggle
			carBounce.value = withRepeat(
				withSequence(
					withTiming(3, { duration: 100 }),
					withTiming(-3, { duration: 100 }),
				),
				3,
				true,
			);
		}
	}, [isComplete, reduceMotion]);

	const carStyle = useAnimatedStyle(() => ({
		left: `${carPosition.value}%`,
		transform: [
			{ translateX: -12 },
			{ translateY: carBounce.value },
			{ rotate: `${isComplete ? carBounce.value : 0}deg` },
		],
	}));

	const progressStyle = useAnimatedStyle(() => ({
		width: `${carPosition.value}%`,
	}));

	const roadStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: roadOffset.value }],
	}));

	return (
		<View style={styles.container}>
			{/* Road background */}
			<View style={[styles.road, { backgroundColor: colors.muted }]}>
				{/* Road dashes */}
				<Animated.View style={[styles.roadDashes, roadStyle]}>
					{Array.from({ length: 20 }).map((_, i) => (
						<View
							key={i}
							style={[
								styles.dash,
								{ backgroundColor: colors.mutedForeground + "40" },
							]}
						/>
					))}
				</Animated.View>

				{/* Progress fill */}
				<Animated.View
					style={[
						styles.progressFill,
						{ backgroundColor: colors.primary },
						progressStyle,
					]}
				/>
			</View>

			{/* Car */}
			<Animated.View style={[styles.car, carStyle]}>
				<HugeiconsIcon icon={Car01Icon} size={24} color={colors.foreground} />
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: 32,
		justifyContent: "center",
	},
	road: {
		height: 6,
		borderRadius: 3,
		overflow: "hidden",
	},
	roadDashes: {
		position: "absolute",
		flexDirection: "row",
		top: 2,
		left: 0,
		gap: 10,
	},
	dash: {
		width: 10,
		height: 2,
		borderRadius: 1,
	},
	progressFill: {
		height: "100%",
		borderRadius: 3,
	},
	car: {
		position: "absolute",
		top: 0,
	},
});
