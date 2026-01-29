import { useEffect } from "react";
import { Text, type TextStyle } from "react-native";
import Animated, {
	Easing,
	useAnimatedProps,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "@/hooks/use-reduce-motion";

const AnimatedText = Animated.createAnimatedComponent(Text);

type CountUpTextProps = {
	value: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
	style?: TextStyle;
	decimals?: number;
};

export function CountUpText({
	value,
	duration = 800,
	prefix = "",
	suffix = "",
	style,
	decimals = 0,
}: CountUpTextProps) {
	const reduceMotion = useReduceMotion();
	const animatedValue = useSharedValue(0);

	useEffect(() => {
		if (reduceMotion) {
			animatedValue.value = value;
		} else {
			animatedValue.value = withTiming(value, {
				duration,
				easing: Easing.out(Easing.cubic),
			});
		}
	}, [value, duration, reduceMotion]);

	const animatedProps = useAnimatedProps(() => {
		const displayValue =
			decimals > 0
				? animatedValue.value.toFixed(decimals)
				: Math.floor(animatedValue.value).toLocaleString();

		return {
			text: `${prefix}${displayValue}${suffix}`,
		} as any;
	});

	return (
		<AnimatedText style={style} animatedProps={animatedProps}>
			{`${prefix}${value}${suffix}`}
		</AnimatedText>
	);
}
