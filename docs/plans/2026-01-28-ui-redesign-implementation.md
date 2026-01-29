# UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Driwet's UI from functional to delightful with playful micro-interactions, icon morphing navbar, and cohesive animation system.

**Architecture:** Build a foundation of reusable animation utilities and components, then layer them across Home, Profile, Routes, and Onboarding screens. The navbar serves as the persistent navigation with morphing icons.

**Tech Stack:** React Native, Expo 54, Reanimated 3, expo-haptics, HugeIcons (core-free-icons)

---

## Task 1: Animation Tokens & Utilities

Create the foundation for consistent animations across the app.

**Files:**
- Create: `apps/mobile/hooks/use-animation-tokens.ts`
- Create: `apps/mobile/hooks/use-press-animation.ts`
- Create: `apps/mobile/hooks/use-reduce-motion.ts`

**Step 1: Create animation tokens hook**

```typescript
// apps/mobile/hooks/use-animation-tokens.ts
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
```

**Step 2: Create reduce motion hook**

```typescript
// apps/mobile/hooks/use-reduce-motion.ts
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReduceMotion() {
	const [reduceMotion, setReduceMotion] = useState(false);

	useEffect(() => {
		AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

		const subscription = AccessibilityInfo.addEventListener(
			"reduceMotionChanged",
			setReduceMotion,
		);

		return () => subscription.remove();
	}, []);

	return reduceMotion;
}
```

**Step 3: Create press animation hook**

```typescript
// apps/mobile/hooks/use-press-animation.ts
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
```

**Step 4: Verify files exist**

Run: `ls -la apps/mobile/hooks/use-animation-tokens.ts apps/mobile/hooks/use-press-animation.ts apps/mobile/hooks/use-reduce-motion.ts`
Expected: All three files listed

**Step 5: Commit**

```bash
git add apps/mobile/hooks/use-animation-tokens.ts apps/mobile/hooks/use-press-animation.ts apps/mobile/hooks/use-reduce-motion.ts
git commit -m "feat(mobile): add animation tokens and press animation hook"
```

---

## Task 2: AnimatedPressable Component

Create a reusable pressable with built-in scale animation and haptics.

**Files:**
- Create: `apps/mobile/components/ui/animated-pressable.tsx`

**Step 1: Create the component**

```typescript
// apps/mobile/components/ui/animated-pressable.tsx
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
```

**Step 2: Verify file exists**

Run: `ls -la apps/mobile/components/ui/animated-pressable.tsx`
Expected: File listed

**Step 3: Commit**

```bash
git add apps/mobile/components/ui/animated-pressable.tsx
git commit -m "feat(mobile): add AnimatedPressable component"
```

---

## Task 3: MorphingIcon Component

Create an icon component that smoothly transitions between stroke and solid variants.

**Files:**
- Create: `apps/mobile/components/ui/morphing-icon.tsx`

**Step 1: Create the component**

```typescript
// apps/mobile/components/ui/morphing-icon.tsx
import {
	Alert01Icon,
	AlertSolidIcon,
	Home01Icon,
	HomeSolidIcon,
	Route01Icon,
	RouteSolidIcon,
	UserIcon,
	UserSolidIcon,
	Location01Icon,
	LocationSolidIcon,
	StarIcon,
	StarSolidIcon,
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
	home: { stroke: Home01Icon, solid: HomeSolidIcon },
	alert: { stroke: Alert01Icon, solid: AlertSolidIcon },
	route: { stroke: Route01Icon, solid: RouteSolidIcon },
	user: { stroke: UserIcon, solid: UserSolidIcon },
	location: { stroke: Location01Icon, solid: LocationSolidIcon },
	star: { stroke: StarIcon, solid: StarSolidIcon },
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
		transform: [
			{ scale: interpolate(progress.value, [0, 1], [1, 0.8]) },
		],
		position: "absolute" as const,
	}));

	const solidStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0.5, 1], [0, 1]),
		transform: [
			{ scale: interpolate(progress.value, [0, 0.5, 1], [0.8, 1.15, 1.05]) },
		],
	}));

	const iconPair = iconPairs[name];
	const currentSize = isActive ? activeSize : size;

	return (
		<Animated.View style={{ width: activeSize, height: activeSize, justifyContent: "center", alignItems: "center" }}>
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
```

**Step 2: Verify file exists**

Run: `ls -la apps/mobile/components/ui/morphing-icon.tsx`
Expected: File listed

**Step 3: Commit**

```bash
git add apps/mobile/components/ui/morphing-icon.tsx
git commit -m "feat(mobile): add MorphingIcon component for icon transitions"
```

---

## Task 4: Bottom Tab Bar Component

Create the new non-floating navbar with icon morphing.

**Files:**
- Create: `apps/mobile/components/navigation/bottom-tab-bar.tsx`
- Modify: `apps/mobile/app/(app)/(tabs)/_layout.tsx`

**Step 1: Create the bottom tab bar**

```typescript
// apps/mobile/components/navigation/bottom-tab-bar.tsx
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withDelay,
	interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { MorphingIcon, type MorphingIconName } from "@/components/ui/morphing-icon";
import { springs } from "@/hooks/use-animation-tokens";
import { useReduceMotion } from "@/hooks/use-reduce-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";

type TabConfig = {
	key: string;
	icon: MorphingIconName;
	label: string;
};

const TABS: TabConfig[] = [
	{ key: "(tabs)", icon: "home", label: "Inicio" },
	{ key: "alerts", icon: "alert", label: "Alertas" },
	{ key: "routes", icon: "route", label: "Rutas" },
	{ key: "profile", icon: "user", label: "Perfil" },
];

type BottomTabBarProps = {
	activeRoute: string;
	onTabPress: (route: string) => void;
};

function TabItem({
	tab,
	isActive,
	onPress,
}: {
	tab: TabConfig;
	isActive: boolean;
	onPress: () => void;
}) {
	const colors = useThemeColors();
	const reduceMotion = useReduceMotion();

	const labelProgress = useSharedValue(isActive ? 1 : 0);
	const pillProgress = useSharedValue(isActive ? 1 : 0);

	useEffect(() => {
		if (reduceMotion) {
			labelProgress.value = isActive ? 1 : 0;
			pillProgress.value = isActive ? 1 : 0;
		} else {
			if (isActive) {
				pillProgress.value = withSpring(1, springs.smooth);
				labelProgress.value = withDelay(150, withSpring(1, springs.smooth));
			} else {
				labelProgress.value = withSpring(0, springs.snappy);
				pillProgress.value = withDelay(100, withSpring(0, springs.smooth));
			}
		}
	}, [isActive, reduceMotion]);

	const labelStyle = useAnimatedStyle(() => ({
		opacity: labelProgress.value,
		transform: [
			{ translateY: interpolate(labelProgress.value, [0, 1], [8, 0]) },
		],
	}));

	const pillStyle = useAnimatedStyle(() => ({
		opacity: pillProgress.value,
		transform: [{ scale: interpolate(pillProgress.value, [0, 1], [0.8, 1]) }],
	}));

	const handlePress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	};

	return (
		<AnimatedPressable
			onPress={handlePress}
			style={styles.tabItem}
			scaleDown={0.9}
			enableHaptics={false}
		>
			{/* Background pill */}
			<Animated.View
				style={[
					styles.tabPill,
					{ backgroundColor: colors.primary + "15" },
					pillStyle,
				]}
			/>

			{/* Icon */}
			<MorphingIcon
				name={tab.icon}
				isActive={isActive}
				activeColor={colors.primary}
				color={colors.mutedForeground}
			/>

			{/* Label */}
			<Animated.Text
				style={[
					styles.tabLabel,
					{ color: colors.primary },
					labelStyle,
				]}
			>
				{tab.label}
			</Animated.Text>
		</AnimatedPressable>
	);
}

export function BottomTabBar({ activeRoute, onTabPress }: BottomTabBarProps) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: colors.card,
					paddingBottom: insets.bottom,
					borderTopColor: colors.border,
				},
			]}
		>
			{TABS.map((tab) => (
				<TabItem
					key={tab.key}
					tab={tab}
					isActive={activeRoute === tab.key}
					onPress={() => onTabPress(tab.key)}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		height: 72,
		borderTopWidth: 1,
		paddingTop: 8,
	},
	tabItem: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
	},
	tabPill: {
		position: "absolute",
		width: 64,
		height: 56,
		borderRadius: 16,
	},
	tabLabel: {
		fontSize: 11,
		fontFamily: "Inter_500Medium",
	},
});
```

**Step 2: Update tabs layout to use new navbar**

Modify `apps/mobile/app/(app)/(tabs)/_layout.tsx`:

```typescript
// apps/mobile/app/(app)/(tabs)/_layout.tsx
import { Tabs, usePathname, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";

export default function TabLayout() {
	const router = useRouter();
	const pathname = usePathname();

	const getActiveRoute = () => {
		if (pathname.includes("/alerts")) return "alerts";
		if (pathname.includes("/routes")) return "routes";
		if (pathname.includes("/profile")) return "profile";
		return "(tabs)";
	};

	const activeRoute = getActiveRoute();

	const handleTabPress = (route: string) => {
		if (route === "(tabs)") {
			router.push("/");
		} else if (route === "alerts") {
			router.push("/alerts");
		} else if (route === "routes") {
			router.push("/routes");
		} else if (route === "profile") {
			router.push("/profile");
		}
	};

	return (
		<View style={styles.container}>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						display: "none",
					},
				}}
			>
				<Tabs.Screen name="index" options={{ title: "Mapa" }} />
				<Tabs.Screen name="alerts" options={{ title: "Alertas" }} />
				<Tabs.Screen name="routes" options={{ title: "Rutas" }} />
				<Tabs.Screen name="profile" options={{ title: "Perfil" }} />
			</Tabs>

			<BottomTabBar activeRoute={activeRoute} onTabPress={handleTabPress} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
```

**Step 3: Verify files**

Run: `ls -la apps/mobile/components/navigation/bottom-tab-bar.tsx`
Expected: File listed

**Step 4: Test the app**

Run: `cd apps/mobile && pnpm ios`
Expected: App launches with new bottom tab bar, icons morph on tap

**Step 5: Commit**

```bash
git add apps/mobile/components/navigation/bottom-tab-bar.tsx apps/mobile/app/(app)/(tabs)/_layout.tsx
git commit -m "feat(mobile): add morphing bottom tab bar navigation"
```

---

## Task 5: Connector Dots Component

Create animated connector dots between location chips.

**Files:**
- Create: `apps/mobile/components/home/connector-dots.tsx`

**Step 1: Create the component**

```typescript
// apps/mobile/components/home/connector-dots.tsx
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
	cancelAnimation,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useReduceMotion } from "@/hooks/use-reduce-motion";

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

	const dotColor = state === "calculating" ? colors.primary : colors.mutedForeground;

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
			<Animated.View style={[styles.dot, { backgroundColor: dotColor }, dot1Style]} />
			<Animated.View style={[styles.dot, { backgroundColor: dotColor }, dot2Style]} />
			<Animated.View style={[styles.dot, { backgroundColor: dotColor }, dot3Style]} />
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
```

**Step 2: Verify file exists**

Run: `ls -la apps/mobile/components/home/connector-dots.tsx`
Expected: File listed

**Step 3: Commit**

```bash
git add apps/mobile/components/home/connector-dots.tsx
git commit -m "feat(mobile): add animated connector dots component"
```

---

## Task 6: Enhanced Location Chips

Update location chips with micro-interactions and connector dots.

**Files:**
- Modify: `apps/mobile/components/location-chips.tsx`

**Step 1: Update imports and add animations**

Replace the entire file with enhanced version:

```typescript
// apps/mobile/components/location-chips.tsx
// Premium location selector with chips for origin and destination

import { env } from "@driwet/env/mobile";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Keyboard,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
	Easing,
	runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConnectorDots } from "@/components/home/connector-dots";
import { Icon } from "@/components/icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { springs } from "@/hooks/use-animation-tokens";
import { useLocation } from "@/hooks/use-location";
import { useReduceMotion } from "@/hooks/use-reduce-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type RouteLocation = {
	name: string;
	coordinates: { latitude: number; longitude: number };
};

type MapboxFeature = {
	id: string;
	place_name: string;
	center: [number, number];
};

type LocationChipsProps = {
	origin: RouteLocation | null;
	destination: RouteLocation | null;
	onRouteChange: (
		origin: RouteLocation | null,
		destination: RouteLocation | null,
	) => void;
	isDisabled?: boolean;
	isCalculating?: boolean;
};

export function LocationChips({
	origin,
	destination,
	onRouteChange,
	isDisabled = false,
	isCalculating = false,
}: LocationChipsProps) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { location: userLocation } = useLocation();
	const { t } = useTranslation();
	const reduceMotion = useReduceMotion();

	// Modal state
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [activeField, setActiveField] = useState<"origin" | "destination" | null>(null);

	// Search state
	const [searchQuery, setSearchQuery] = useState("");
	const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Animation values
	const modalY = useSharedValue(SCREEN_HEIGHT);
	const backdropOpacity = useSharedValue(0);
	const destinationBreathing = useSharedValue(1);
	const placeholderOpacity = useSharedValue(0.5);

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Breathing animation for empty destination
	useEffect(() => {
		if (!destination && !reduceMotion) {
			destinationBreathing.value = withRepeat(
				withSequence(
					withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
					withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
				),
				-1,
			);
			placeholderOpacity.value = withRepeat(
				withSequence(
					withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
					withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
				),
				-1,
			);
		} else {
			destinationBreathing.value = 1;
			placeholderOpacity.value = 0.5;
		}
	}, [destination, reduceMotion]);

	const destinationStyle = useAnimatedStyle(() => ({
		transform: [{ scale: destinationBreathing.value }],
	}));

	const placeholderStyle = useAnimatedStyle(() => ({
		opacity: placeholderOpacity.value,
	}));

	// Modal animation styles
	const modalStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: modalY.value }],
	}));

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value,
	}));

	const openModal = useCallback(
		(field: "origin" | "destination") => {
			if (isDisabled) return;

			setActiveField(field);
			setSearchQuery("");
			setSuggestions([]);
			setIsModalVisible(true);

			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

			modalY.value = withSpring(0, springs.smooth);
			backdropOpacity.value = withTiming(1, { duration: 300 });
		},
		[isDisabled],
	);

	const closeModal = useCallback(() => {
		Keyboard.dismiss();
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		modalY.value = withSpring(SCREEN_HEIGHT, springs.snappy);
		backdropOpacity.value = withTiming(0, { duration: 250 });

		setTimeout(() => {
			setIsModalVisible(false);
			setActiveField(null);
			setSearchQuery("");
			setSuggestions([]);
		}, 300);
	}, []);

	const searchPlaces = useCallback(
		async (query: string) => {
			if (query.length < 2) {
				setSuggestions([]);
				return;
			}

			setIsSearching(true);
			try {
				let url =
					`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
					`access_token=${env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
					"types=place,locality,region,country,address&" +
					"language=es&" +
					"limit=8";

				if (userLocation) {
					url += `&proximity=${userLocation.longitude},${userLocation.latitude}`;
				}

				const response = await fetch(url);
				const data = await response.json();
				setSuggestions(data.features || []);
			} catch (error) {
				console.error("Geocoding error:", error);
				setSuggestions([]);
			} finally {
				setIsSearching(false);
			}
		},
		[userLocation],
	);

	const handleSearchChange = useCallback(
		(text: string) => {
			setSearchQuery(text);

			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}

			searchTimeoutRef.current = setTimeout(() => {
				searchPlaces(text);
			}, 300);
		},
		[searchPlaces],
	);

	const handleSelectSuggestion = useCallback(
		(feature: MapboxFeature) => {
			const location: RouteLocation = {
				name: feature.place_name.split(",")[0] || feature.place_name,
				coordinates: {
					latitude: feature.center[1],
					longitude: feature.center[0],
				},
			};

			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

			if (activeField === "origin") {
				onRouteChange(location, destination);
				if (!destination) {
					closeModal();
					setTimeout(() => openModal("destination"), 350);
				} else {
					closeModal();
				}
			} else {
				onRouteChange(origin, location);
				closeModal();
			}
		},
		[activeField, origin, destination, onRouteChange, closeModal, openModal],
	);

	const handleClearField = useCallback(
		(field: "origin" | "destination") => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			if (field === "origin") {
				onRouteChange(null, destination);
			} else {
				onRouteChange(origin, null);
			}
		},
		[origin, destination, onRouteChange],
	);

	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	const handleUseCurrentLocation = useCallback(async () => {
		if (userLocation && activeField) {
			try {
				const url =
					`https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation.longitude},${userLocation.latitude}.json?` +
					`access_token=${env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
					"types=place,address&" +
					"language=es&" +
					"limit=1";

				const response = await fetch(url);
				const data = await response.json();

				if (data.features?.[0]) {
					const feature = data.features[0];
					const location: RouteLocation = {
						name: feature.place_name.split(",")[0] || t("locations.myLocation"),
						coordinates: userLocation,
					};

					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

					if (activeField === "origin") {
						onRouteChange(location, destination);
						if (!destination) {
							closeModal();
							setTimeout(() => openModal("destination"), 350);
						} else {
							closeModal();
						}
					} else {
						onRouteChange(origin, location);
						closeModal();
					}
				}
			} catch (error) {
				console.error("Reverse geocoding error:", error);
				const location: RouteLocation = {
					name: t("locations.myLocation"),
					coordinates: userLocation,
				};

				if (activeField === "origin") {
					onRouteChange(location, destination);
				} else {
					onRouteChange(origin, location);
				}
				closeModal();
			}
		}
	}, [userLocation, activeField, origin, destination, onRouteChange, closeModal, openModal, t]);

	const hasRoute = origin && destination;
	const connectorState = isCalculating ? "calculating" : hasRoute ? "ready" : "idle";

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.chipsContainer,
					{
						backgroundColor: colors.card,
						shadowColor: "#000000",
					},
				]}
			>
				{/* Origin Chip */}
				<AnimatedPressable
					style={[styles.chip, isDisabled && styles.chipDisabled]}
					onPress={() => openModal("origin")}
					disabled={isDisabled}
				>
					<View style={[styles.chipIcon, { backgroundColor: colors.primary + "20" }]}>
						<Icon name="location" size={14} color={colors.primary} />
					</View>
					<View style={styles.chipContent}>
						<Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>
							Desde
						</Text>
						<Text
							style={[styles.chipValue, { color: colors.foreground }]}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{origin ? origin.name : "Seleccionar origen"}
						</Text>
					</View>
					{origin && (
						<AnimatedPressable
							style={styles.clearButton}
							onPress={() => handleClearField("origin")}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Icon name="close" size={14} color={colors.mutedForeground} />
						</AnimatedPressable>
					)}
				</AnimatedPressable>

				{/* Connector Dots */}
				<ConnectorDots state={connectorState} />

				{/* Destination Chip */}
				<Animated.View style={!destination ? destinationStyle : undefined}>
					<AnimatedPressable
						style={[styles.chip, isDisabled && styles.chipDisabled]}
						onPress={() => openModal("destination")}
						disabled={isDisabled}
					>
						<View style={[styles.chipIcon, { backgroundColor: colors.safe + "20" }]}>
							<Icon name="flag" size={14} color={colors.safe} />
						</View>
						<View style={styles.chipContent}>
							<Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>
								Hasta
							</Text>
							{destination ? (
								<Text
									style={[styles.chipValue, { color: colors.foreground }]}
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{destination.name}
								</Text>
							) : (
								<Animated.Text
									style={[styles.chipValue, { color: colors.foreground }, placeholderStyle]}
								>
									¿A dónde vas?
								</Animated.Text>
							)}
						</View>
						{destination && (
							<AnimatedPressable
								style={styles.clearButton}
								onPress={() => handleClearField("destination")}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Icon name="close" size={14} color={colors.mutedForeground} />
							</AnimatedPressable>
						)}
					</AnimatedPressable>
				</Animated.View>
			</View>

			{/* Search Modal */}
			<Modal
				visible={isModalVisible}
				transparent
				animationType="none"
				onRequestClose={closeModal}
				statusBarTranslucent
			>
				<Animated.View style={[styles.modalOverlay, backdropStyle]}>
					<AnimatedPressable
						style={styles.modalBackdrop}
						onPress={closeModal}
						enableHaptics={false}
					/>
				</Animated.View>

				<Animated.View
					style={[
						styles.modalContent,
						{
							backgroundColor: colors.background,
							paddingBottom: insets.bottom,
						},
						modalStyle,
					]}
				>
					{/* Modal Header */}
					<View style={styles.modalHeader}>
						<AnimatedPressable style={styles.closeButton} onPress={closeModal}>
							<Icon name="close" size={24} color={colors.foreground} />
						</AnimatedPressable>
						<Text style={[styles.modalTitle, { color: colors.foreground }]}>
							{activeField === "origin" ? "Origen" : "Destino"}
						</Text>
						<View style={styles.closeButton} />
					</View>

					{/* Search Input */}
					<View
						style={[
							styles.searchContainer,
							{
								backgroundColor: colors.card,
								borderColor: colors.border,
							},
						]}
					>
						<Icon name="search" size={20} color={colors.mutedForeground} style={styles.searchIcon} />
						<TextInput
							style={[styles.searchInput, { color: colors.foreground }]}
							placeholder={t("locations.searchAddress")}
							placeholderTextColor={colors.mutedForeground}
							value={searchQuery}
							onChangeText={handleSearchChange}
							autoFocus
							returnKeyType="search"
						/>
						{searchQuery.length > 0 && (
							<AnimatedPressable
								onPress={() => {
									setSearchQuery("");
									setSuggestions([]);
								}}
							>
								<Icon name="close" size={18} color={colors.mutedForeground} />
							</AnimatedPressable>
						)}
					</View>

					{/* Current Location Button */}
					{activeField === "origin" && userLocation && (
						<AnimatedPressable
							style={[styles.currentLocationButton, { backgroundColor: colors.card }]}
							onPress={handleUseCurrentLocation}
						>
							<View style={[styles.currentLocationIcon, { backgroundColor: colors.primary + "20" }]}>
								<Icon name="location" size={18} color={colors.primary} />
							</View>
							<Text style={[styles.currentLocationText, { color: colors.foreground }]}>
								Usar mi ubicación actual
							</Text>
							<Icon name="arrowRight" size={16} color={colors.mutedForeground} />
						</AnimatedPressable>
					)}

					{/* Suggestions List */}
					<ScrollView
						style={styles.suggestionsList}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						{isSearching ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={colors.primary} />
								<Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
									Buscando lugares...
								</Text>
							</View>
						) : suggestions.length > 0 ? (
							<View style={styles.suggestionsContainer}>
								{suggestions.map((feature, index) => (
									<Animated.View
										key={feature.id}
										entering={FadeInDown.delay(index * 50).springify()}
									>
										<AnimatedPressable
											style={[
												styles.suggestionItem,
												index !== suggestions.length - 1 && {
													borderBottomWidth: 1,
													borderBottomColor: colors.border,
												},
											]}
											onPress={() => handleSelectSuggestion(feature)}
										>
											<View
												style={[
													styles.suggestionIcon,
													{
														backgroundColor:
															activeField === "origin"
																? colors.primary + "20"
																: colors.safe + "20",
													},
												]}
											>
												<Icon
													name="location"
													size={16}
													color={activeField === "origin" ? colors.primary : colors.safe}
												/>
											</View>
											<View style={styles.suggestionContent}>
												<Text
													style={[styles.suggestionTitle, { color: colors.foreground }]}
													numberOfLines={1}
												>
													{feature.place_name.split(",")[0]}
												</Text>
												<Text
													style={[styles.suggestionSubtitle, { color: colors.mutedForeground }]}
													numberOfLines={1}
												>
													{feature.place_name.split(",").slice(1).join(",").trim()}
												</Text>
											</View>
											<Icon name="arrowRight" size={16} color={colors.mutedForeground} />
										</AnimatedPressable>
									</Animated.View>
								))}
							</View>
						) : searchQuery.length >= 2 ? (
							<View style={styles.emptyState}>
								<Icon name="search" size={48} color={colors.mutedForeground} />
								<Text style={[styles.emptyStateTitle, { color: colors.foreground }]}>
									No se encontraron resultados
								</Text>
								<Text style={[styles.emptyStateSubtitle, { color: colors.mutedForeground }]}>
									Intenta con otra búsqueda
								</Text>
							</View>
						) : (
							<View style={styles.emptyState}>
								<Icon name="location" size={48} color={colors.mutedForeground} />
								<Text style={[styles.emptyStateTitle, { color: colors.foreground }]}>
									{activeField === "origin" ? t("locations.whereFrom") : t("locations.whereTo")}
								</Text>
								<Text style={[styles.emptyStateSubtitle, { color: colors.mutedForeground }]}>
									{t("locations.typeAddress")}
								</Text>
							</View>
						)}
					</ScrollView>
				</Animated.View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	chipsContainer: {
		borderRadius: 16,
		padding: 12,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
	},
	chipDisabled: {
		opacity: 0.5,
	},
	chipIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	chipContent: {
		flex: 1,
	},
	chipLabel: {
		fontSize: 11,
		fontWeight: "500",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 2,
	},
	chipValue: {
		fontSize: 15,
		fontWeight: "600",
	},
	clearButton: {
		padding: 4,
	},
	modalOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalBackdrop: {
		flex: 1,
	},
	modalContent: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: "80%",
		minHeight: "50%",
	},
	modalHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	modalTitle: {
		fontSize: 17,
		fontWeight: "600",
	},
	closeButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginTop: 16,
		marginBottom: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
		borderWidth: 1,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		paddingVertical: 4,
	},
	currentLocationButton: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginBottom: 12,
		padding: 12,
		borderRadius: 12,
	},
	currentLocationIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	currentLocationText: {
		flex: 1,
		fontSize: 15,
		fontWeight: "500",
	},
	suggestionsList: {
		flex: 1,
	},
	suggestionsContainer: {
		marginHorizontal: 16,
		marginBottom: 16,
		borderRadius: 12,
		overflow: "hidden",
	},
	suggestionItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		backgroundColor: "transparent",
	},
	suggestionIcon: {
		width: 36,
		height: 36,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	suggestionContent: {
		flex: 1,
	},
	suggestionTitle: {
		fontSize: 15,
		fontWeight: "600",
		marginBottom: 2,
	},
	suggestionSubtitle: {
		fontSize: 13,
	},
	loadingContainer: {
		padding: 40,
		alignItems: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 14,
	},
	emptyState: {
		padding: 40,
		alignItems: "center",
	},
	emptyStateTitle: {
		marginTop: 16,
		fontSize: 17,
		fontWeight: "600",
		textAlign: "center",
	},
	emptyStateSubtitle: {
		marginTop: 8,
		fontSize: 14,
		textAlign: "center",
	},
});
```

**Step 2: Test the app**

Run: `cd apps/mobile && pnpm ios`
Expected: Location chips have breathing animation, connector dots pulse, staggered suggestion animations

**Step 3: Commit**

```bash
git add apps/mobile/components/location-chips.tsx
git commit -m "feat(mobile): enhance location chips with micro-interactions"
```

---

## Task 7: CountUpText Component

Create animated count-up text for profile stats.

**Files:**
- Create: `apps/mobile/components/ui/count-up-text.tsx`

**Step 1: Create the component**

```typescript
// apps/mobile/components/ui/count-up-text.tsx
import { useEffect } from "react";
import { Text, type TextStyle } from "react-native";
import Animated, {
	useAnimatedProps,
	useSharedValue,
	withTiming,
	Easing,
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
		const displayValue = decimals > 0
			? animatedValue.value.toFixed(decimals)
			: Math.floor(animatedValue.value).toLocaleString();

		return {
			text: `${prefix}${displayValue}${suffix}`,
		} as any;
	});

	return (
		<AnimatedText
			style={style}
			animatedProps={animatedProps}
		>
			{`${prefix}${value}${suffix}`}
		</AnimatedText>
	);
}
```

**Step 2: Verify file exists**

Run: `ls -la apps/mobile/components/ui/count-up-text.tsx`
Expected: File listed

**Step 3: Commit**

```bash
git add apps/mobile/components/ui/count-up-text.tsx
git commit -m "feat(mobile): add CountUpText component for animated numbers"
```

---

## Task 8: StatCard Component for Profile

Create animated stat cards for the profile screen.

**Files:**
- Create: `apps/mobile/components/profile/stat-card.tsx`

**Step 1: Create the component**

```typescript
// apps/mobile/components/profile/stat-card.tsx
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

export function StatCard({ icon, value, label, index, onPress }: StatCardProps) {
	const colors = useThemeColors();
	const reduceMotion = useReduceMotion();
	const [hasAnimated, setHasAnimated] = useState(false);

	const iconScale = useSharedValue(1);
	const displayValue = useSharedValue(0);

	useEffect(() => {
		if (!hasAnimated && !reduceMotion) {
			// Bounce icon after count completes
			iconScale.value = withDelay(
				index * 100 + 800,
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
		<Animated.View
			entering={FadeInUp.delay(index * 100).springify()}
		>
			<AnimatedPressable
				style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
				onPress={onPress}
			>
				<Animated.View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }, iconStyle]}>
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
```

**Step 2: Verify file exists**

Run: `ls -la apps/mobile/components/profile/stat-card.tsx`
Expected: File listed

**Step 3: Commit**

```bash
git add apps/mobile/components/profile/stat-card.tsx
git commit -m "feat(mobile): add animated StatCard component for profile"
```

---

## Task 9: Enhanced Profile Screen

Update the profile screen with animated stats and improved interactions.

**Files:**
- Modify: `apps/mobile/app/(app)/(tabs)/profile.tsx`

**Step 1: Update profile screen with animations**

This is a larger file. Key changes:
- Replace stat section with StatCard components
- Add AnimatedPressable to settings rows
- Add entry animations

The user will implement specific micro-interactions here. Key areas to enhance:

1. **User card**: Add pulsing ring around avatar
2. **Stats section**: Use StatCard with staggered animations
3. **Settings rows**: Add icon animations and ripple effects
4. **Logout**: Add shake warning animation

**Step 2: Test the app**

Run: `cd apps/mobile && pnpm ios`
Expected: Profile stats animate on entry, icons bounce after count

**Step 3: Commit**

```bash
git add apps/mobile/app/(app)/(tabs)/profile.tsx
git commit -m "feat(mobile): enhance profile screen with micro-interactions"
```

---

## Task 10: Enhanced Routes Screen

Update routes with card animations and improved empty states.

**Files:**
- Modify: `apps/mobile/app/(app)/(tabs)/routes.tsx`

**Step 1: Add entry animations and card interactions**

Key enhancements:
1. **Card entry**: Staggered FadeInUp with slight rotation
2. **Favorite star**: Burst animation on tap
3. **Empty state**: Breathing CTA button
4. **Trip history**: Timeline with pulsing nodes

**Step 2: Test the app**

Run: `cd apps/mobile && pnpm ios`
Expected: Route cards cascade in, star favorites bounce

**Step 3: Commit**

```bash
git add apps/mobile/app/(app)/(tabs)/routes.tsx
git commit -m "feat(mobile): enhance routes screen with card animations"
```

---

## Task 11: Driving Progress Component for Onboarding

Create the car-driving progress indicator.

**Files:**
- Create: `apps/mobile/components/onboarding/driving-progress.tsx`

**Step 1: Create the component**

```typescript
// apps/mobile/components/onboarding/driving-progress.tsx
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

export function DrivingProgress({ progress, isComplete = false }: DrivingProgressProps) {
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

		// Animate road dashes
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
							style={[styles.dash, { backgroundColor: colors.mutedForeground + "40" }]}
						/>
					))}
				</Animated.View>

				{/* Progress fill */}
				<Animated.View
					style={[styles.progressFill, { backgroundColor: colors.primary }, progressStyle]}
				/>
			</View>

			{/* Car */}
			<Animated.View style={[styles.car, carStyle]}>
				<HugeiconsIcon
					icon={Car01Icon}
					size={24}
					color={colors.foreground}
				/>
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
```

**Step 2: Verify file exists**

Run: `ls -la apps/mobile/components/onboarding/driving-progress.tsx`
Expected: File listed

**Step 3: Commit**

```bash
git add apps/mobile/components/onboarding/driving-progress.tsx
git commit -m "feat(mobile): add driving progress component for onboarding"
```

---

## Task 12: Enhanced Onboarding Flow

Integrate driving progress and improve screen transitions.

**Files:**
- Modify: `apps/mobile/components/onboarding/new-onboarding-flow.tsx`

**Step 1: Update onboarding with new progress bar**

Replace the progress bar section with DrivingProgress component and add card-stack transitions between screens.

**Step 2: Test onboarding flow**

Run: `cd apps/mobile && pnpm ios`
Expected: Car drives along progress bar, screens transition with rotation

**Step 3: Commit**

```bash
git add apps/mobile/components/onboarding/new-onboarding-flow.tsx
git commit -m "feat(mobile): enhance onboarding with driving progress and transitions"
```

---

## Task 13: Final Polish & Cleanup

Ensure all components export correctly and clean up unused code.

**Files:**
- Create: `apps/mobile/components/ui/index.ts`
- Remove: `apps/mobile/components/floating-tab-bar.tsx` (no longer used)

**Step 1: Create barrel export for UI components**

```typescript
// apps/mobile/components/ui/index.ts
export { AnimatedPressable } from "./animated-pressable";
export { MorphingIcon, type MorphingIconName } from "./morphing-icon";
export { CountUpText } from "./count-up-text";
```

**Step 2: Remove unused floating tab bar**

Run: `rm apps/mobile/components/floating-tab-bar.tsx`

**Step 3: Run type check**

Run: `cd apps/mobile && pnpm check-types`
Expected: No type errors

**Step 4: Final commit**

```bash
git add apps/mobile/components/ui/index.ts
git rm apps/mobile/components/floating-tab-bar.tsx
git commit -m "chore(mobile): add UI component exports and remove unused floating tab bar"
```

---

## Summary

This plan implements:

1. **Animation Foundation** (Tasks 1-3): Reusable tokens, hooks, and base components
2. **Navigation** (Task 4): Non-floating bottom tab bar with icon morphing
3. **Home Screen** (Tasks 5-6): Enhanced location chips with connector dots and breathing animations
4. **Profile Screen** (Tasks 7-9): Animated stat cards with count-up numbers
5. **Routes Screen** (Task 10): Card cascade animations and improved empty states
6. **Onboarding** (Tasks 11-12): Driving car progress bar and card-stack transitions
7. **Cleanup** (Task 13): Final polish and exports

Total estimated tasks: 13 bite-sized implementation tasks
