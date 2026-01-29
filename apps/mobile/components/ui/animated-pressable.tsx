import type { ReactNode } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { usePressAnimation } from "@/hooks/use-press-animation";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = Omit<PressableProps, "style"> & {
	children: ReactNode;
	style?: ViewStyle;
	scaleDown?: number;
	enableHaptics?: boolean;
};

export function AnimatedPressable({
	children,
	style,
	scaleDown = 0.95,
	enableHaptics = true,
	onPressIn: onPressInProp,
	onPressOut: onPressOutProp,
	...props
}: AnimatedPressableProps) {
	const { onPressIn, onPressOut, animatedStyle } = usePressAnimation({
		scaleDown,
		enableHaptics,
	});

	const handlePressIn = (e: any) => {
		onPressIn();
		onPressInProp?.(e);
	};

	const handlePressOut = (e: any) => {
		onPressOut();
		onPressOutProp?.(e);
	};

	return (
		<AnimatedPressableBase
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[animatedStyle, style]}
			{...props}
		>
			{children}
		</AnimatedPressableBase>
	);
}
