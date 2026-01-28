// apps/mobile/components/floating-tab-bar.tsx
// Custom floating tab bar with Reanimated animations

import { useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TAB_COUNT = 4;
const TAB_WIDTH = 320;
const TAB_HEIGHT = 56;
const TAB_ITEM_WIDTH = TAB_WIDTH / TAB_COUNT;
const CIRCLE_SIZE = 48;

const tabs = [
	{ nameKey: "tabs.map", icon: "map", route: "(tabs)" },
	{ nameKey: "tabs.alerts", icon: "alert", route: "alerts" },
	{ nameKey: "tabs.routes", icon: "route", route: "routes" },
	{ nameKey: "tabs.profile", icon: "user", route: "profile" },
] as const;

type FloatingTabBarProps = {
	activeRoute: string;
	onTabPress: (route: string) => void;
};

export function FloatingTabBar({
	activeRoute,
	onTabPress,
}: FloatingTabBarProps) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	const foundIndex = tabs.findIndex((tab) => tab.route === activeRoute);
	const activeIndex = foundIndex === -1 ? 0 : foundIndex;

	// Animated value for the indicator position
	const indicatorX = useSharedValue(activeIndex * TAB_ITEM_WIDTH);

	// Update indicator position when active tab changes
	useEffect(() => {
		const targetX = activeIndex * TAB_ITEM_WIDTH;
		indicatorX.value = withSpring(targetX, {
			damping: 16,
			stiffness: 140,
			mass: 0.8,
			overshootClamping: false,
		});
	}, [activeIndex, indicatorX]);

	// Animated style for the indicator
	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: indicatorX.value }],
	}));

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom }]}>
			<View style={[styles.tabBar, { backgroundColor: colors.card }]}>
				{/* Animated indicator circle */}
				<Animated.View
					style={[
						styles.indicator,
						{
							backgroundColor: colors.primary,
							left: TAB_ITEM_WIDTH / 2 - CIRCLE_SIZE / 2,
						},
						indicatorStyle,
					]}
				/>

				{/* Tab buttons */}
				{tabs.map((tab, index) => (
					<TouchableOpacity
						key={tab.route}
						style={styles.tabItem}
						onPress={() => onTabPress(tab.route)}
						activeOpacity={0.7}
					>
						<Icon
							name={tab.icon as any}
							size={index === activeIndex ? 20 : 18}
							color={
								index === activeIndex
									? colors.primaryForeground
									: colors.mutedForeground
							}
						/>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: "center",
		paddingBottom: 12,
	},
	tabBar: {
		width: TAB_WIDTH,
		height: TAB_HEIGHT,
		borderRadius: 32,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
	},
	indicator: {
		position: "absolute",
		width: CIRCLE_SIZE,
		height: CIRCLE_SIZE,
		borderRadius: CIRCLE_SIZE / 2,
		top: (TAB_HEIGHT - CIRCLE_SIZE) / 2,
	},
	tabItem: {
		width: TAB_ITEM_WIDTH,
		height: TAB_HEIGHT,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1,
	},
});
