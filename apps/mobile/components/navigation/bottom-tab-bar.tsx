import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
	MorphingIcon,
	type MorphingIconName,
} from "@/components/ui/morphing-icon";
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
				style={[styles.tabLabel, { color: colors.primary }, labelStyle]}
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
