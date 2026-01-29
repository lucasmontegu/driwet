import {
	Alert01Icon,
	Alert01SolidIcon,
	Home01Icon,
	Home01SolidIcon,
	Route01Icon,
	Route01SolidIcon,
	UserIcon,
	UserSolidIcon,
	Location01Icon,
	Location01SolidIcon,
	Star01Icon,
	Star01SolidIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useEffect } from "react";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	interpolate,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { springs } from "@/hooks/use-animation-tokens";
import { useReduceMotion } from "@/hooks/use-reduce-motion";

// Icon pairs: stroke and solid versions
const iconPairs = {
	home: { stroke: Home01Icon, solid: Home01SolidIcon },
	alert: { stroke: Alert01Icon, solid: Alert01SolidIcon },
	route: { stroke: Route01Icon, solid: Route01SolidIcon },
	user: { stroke: UserIcon, solid: UserSolidIcon },
	location: { stroke: Location01Icon, solid: Location01SolidIcon },
	star: { stroke: Star01Icon, solid: Star01SolidIcon },
} as const;

export type MorphingIconName = keyof typeof iconPairs;

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
	size = 26,
	activeSize = 28,
	color,
	activeColor,
}: MorphingIconProps) {
	const colors = useThemeColors();
	const reduceMotion = useReduceMotion();
	const progress = useSharedValue(isActive ? 1 : 0);

	const strokeColor = color || colors.mutedForeground;
	const solidColor = activeColor || colors.primary;

	useEffect(() => {
		if (reduceMotion) {
			progress.value = isActive ? 1 : 0;
		} else {
			progress.value = withSpring(isActive ? 1 : 0, springs.smooth);
		}
	}, [isActive, reduceMotion]);

	const strokeStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 0.5], [1, 0]),
		transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.8]) }],
		position: "absolute" as const,
	}));

	const solidStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0.5, 1], [0, 1]),
		transform: [
			{ scale: interpolate(progress.value, [0, 0.5, 1], [0.8, 1.15, 1.05]) },
		],
	}));

	const iconPair = iconPairs[name];

	return (
		<Animated.View
			style={{
				width: activeSize,
				height: activeSize,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Animated.View style={strokeStyle}>
				<HugeiconsIcon
					icon={iconPair.stroke}
					size={size}
					color={strokeColor}
					strokeWidth={1.5}
				/>
			</Animated.View>
			<Animated.View style={solidStyle}>
				<HugeiconsIcon
					icon={iconPair.solid}
					size={activeSize}
					color={solidColor}
					strokeWidth={1.5}
				/>
			</Animated.View>
		</Animated.View>
	);
}
