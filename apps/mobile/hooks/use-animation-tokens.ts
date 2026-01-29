import type { WithSpringConfig } from "react-native-reanimated";

export const springs = {
	bouncy: { damping: 12, stiffness: 180 } as WithSpringConfig,
	smooth: { damping: 20, stiffness: 120 } as WithSpringConfig,
	snappy: { damping: 18, stiffness: 200 } as WithSpringConfig,
} as const;

export const durations = {
	fast: 150,
	normal: 200,
	slow: 300,
} as const;

export type SpringType = keyof typeof springs;
export type DurationType = keyof typeof durations;
