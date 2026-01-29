import {
	Alert01Icon,
	Home01Icon,
	Location01Icon,
	Route01Icon,
	StarIcon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useEffect } from "react";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { springs } from "@/hooks/use-animation-tokens";
import { useReduceMotion } from "@/hooks/use-reduce-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";

// Icon map (free icons only have stroke versions)
const iconMap = {
	home: Home01Icon,
	alert: Alert01Icon,
	route: Route01Icon,
	user: UserIcon,
	location: Location01Icon,
	star: StarIcon,
} as const;

export type MorphingIconName = keyof typeof iconMap;

type MorphingIconProps = {
	name: MorphingIconName;
	isActive: boolean;
	size?: number;
	activeSize?: number;
	color?: string;
	activeColor?: string;
};

export function MorphingIcon({
	name,
	isActive,
	size = 24,
	activeSize = 26,
	color,
	activeColor,
}: MorphingIconProps) {
	const colors = useThemeColors();
	const reduceMotion = useReduceMotion();
	const progress = useSharedValue(isActive ? 1 : 0);

	const inactiveColor = color || colors.mutedForeground;
	const activeIconColor = activeColor || colors.primary;

	useEffect(() => {
		if (reduceMotion) {
			progress.value = isActive ? 1 : 0;
		} else {
			progress.value = withSpring(isActive ? 1 : 0, springs.smooth);
		}
	}, [isActive, reduceMotion]);

	// Inactive state: smaller, thinner stroke, muted color
	const inactiveStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 0.5], [1, 0]),
		transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.8]) }],
		position: "absolute" as const,
	}));

	// Active state: larger, thicker stroke, primary color with bounce
	const activeStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0.5, 1], [0, 1]),
		transform: [
			{ scale: interpolate(progress.value, [0, 0.5, 1], [0.8, 1.15, 1.05]) },
		],
	}));

	const IconComponent = iconMap[name];

	return (
		<Animated.View
			style={{
				width: activeSize,
				height: activeSize,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			{/* Inactive icon: thinner stroke */}
			<Animated.View style={inactiveStyle}>
				<HugeiconsIcon
					icon={IconComponent}
					size={size}
					color={inactiveColor}
					strokeWidth={1.5}
				/>
			</Animated.View>
			{/* Active icon: thicker stroke for bolder look */}
			<Animated.View style={activeStyle}>
				<HugeiconsIcon
					icon={IconComponent}
					size={activeSize}
					color={activeIconColor}
					strokeWidth={2.5}
				/>
			</Animated.View>
		</Animated.View>
	);
}
