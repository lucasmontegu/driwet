import { Easing, type WithSpringConfig } from "react-native-reanimated";

// Refined springs - higher damping for less bounce, more elegant feel
export const springs = {
	// Subtle spring for micro-interactions - minimal bounce
	gentle: { damping: 28, stiffness: 300 } as WithSpringConfig,
	// Standard spring - almost no visible bounce
	smooth: { damping: 26, stiffness: 200 } as WithSpringConfig,
	// Quick response - crisp, no bounce
	snappy: { damping: 30, stiffness: 400 } as WithSpringConfig,
	// Legacy bouncy - avoid using, kept for backwards compat
	bouncy: { damping: 20, stiffness: 180 } as WithSpringConfig,
} as const;

// Timing durations for non-spring animations
export const durations = {
	instant: 100,
	fast: 150,
	normal: 200,
	slow: 300,
	emphasis: 400,
} as const;

// Easing curves for refined animations
export const easings = {
	// Standard ease for most UI transitions
	standard: Easing.bezier(0.4, 0, 0.2, 1),
	// Enter/appear animations
	enter: Easing.bezier(0, 0, 0.2, 1),
	// Exit/disappear animations
	exit: Easing.bezier(0.4, 0, 1, 1),
	// Emphasized movements
	emphasis: Easing.bezier(0.2, 0, 0, 1),
} as const;

export type SpringType = keyof typeof springs;
export type DurationType = keyof typeof durations;
export type EasingType = keyof typeof easings;
