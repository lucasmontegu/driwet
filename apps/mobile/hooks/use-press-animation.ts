import * as Haptics from "expo-haptics";
import {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { springs } from "./use-animation-tokens";
import { useReduceMotion } from "./use-reduce-motion";

type PressAnimationOptions = {
	scaleDown?: number;
	enableHaptics?: boolean;
};

export function usePressAnimation(options: PressAnimationOptions = {}) {
	const { scaleDown = 0.95, enableHaptics = true } = options;
	const scale = useSharedValue(1);
	const reduceMotion = useReduceMotion();

	const onPressIn = () => {
		if (!reduceMotion) {
			scale.value = withSpring(scaleDown, springs.snappy);
		}
		if (enableHaptics) {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
	};

	const onPressOut = () => {
		if (!reduceMotion) {
			scale.value = withSpring(1, springs.bouncy);
		}
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return { onPressIn, onPressOut, animatedStyle };
}
