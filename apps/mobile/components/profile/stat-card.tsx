import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withSpring,
} from "react-native-reanimated";
import { Icon, type IconName } from "@/components/icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { springs } from "@/hooks/use-animation-tokens";
import { useReduceMotion } from "@/hooks/use-reduce-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";

type StatCardProps = {
	icon: IconName;
	value: string | number;
	label: string;
	index: number;
	onPress?: () => void;
};

export function StatCard({
	icon,
	value,
	label,
	index,
	onPress,
}: StatCardProps) {
	const colors = useThemeColors();
	const reduceMotion = useReduceMotion();
	const [hasAnimated, setHasAnimated] = useState(false);

	const iconScale = useSharedValue(1);

	useEffect(() => {
		if (!hasAnimated && !reduceMotion) {
			// Bounce icon after card entry animation completes
			iconScale.value = withDelay(
				index * 100 + 600,
				withSequence(
					withSpring(1.3, springs.bouncy),
					withSpring(1, springs.smooth),
				),
			);
			setHasAnimated(true);
		}
	}, [hasAnimated, index, reduceMotion]);

	const iconStyle = useAnimatedStyle(() => ({
		transform: [{ scale: iconScale.value }],
	}));

	return (
		<Animated.View entering={FadeInUp.delay(index * 100).springify()}>
			<AnimatedPressable
				style={[
					styles.container,
					{ backgroundColor: colors.card, borderColor: colors.border },
				]}
				onPress={onPress}
			>
				<Animated.View
					style={[
						styles.iconContainer,
						{ backgroundColor: colors.primary + "15" },
						iconStyle,
					]}
				>
					<Icon name={icon} size={24} color={colors.primary} />
				</Animated.View>
				<Text style={[styles.value, { color: colors.foreground }]}>
					{value}
				</Text>
				<Text style={[styles.label, { color: colors.mutedForeground }]}>
					{label}
				</Text>
			</AnimatedPressable>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		gap: 8,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
	},
	value: {
		fontSize: 24,
		fontFamily: "Inter_700Bold",
	},
	label: {
		fontSize: 12,
		fontFamily: "Inter_400Regular",
		textAlign: "center",
	},
});
