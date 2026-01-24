// apps/mobile/components/home/quick-routes-bar.tsx
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInRight,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Icon } from "@/components/icons";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";
import { colors as themeColors } from "@/theme/colors";

export type SafetyLevel = "safe" | "caution" | "warning" | "danger";

export type QuickRoute = {
	id: string;
	name: string;
	origin: string;
	destination: string;
	durationMinutes: number;
	distanceKm: number;
	safetyLevel: SafetyLevel;
	lastUsed?: Date;
};

type QuickRoutesBarProps = {
	routes: QuickRoute[];
	onRoutePress: (route: QuickRoute) => void;
	onAddRoute?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function QuickRoutesBar({
	routes,
	onRoutePress,
	onAddRoute,
}: QuickRoutesBarProps) {
	const colors = useThemeColors();
	const { t } = useTranslation();

	if (routes.length === 0 && !onAddRoute) {
		return null;
	}

	return (
		<Animated.View entering={FadeIn.duration(400)} style={styles.container}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{routes.map((route, index) => (
					<QuickRouteChip
						key={route.id}
						route={route}
						index={index}
						onPress={() => onRoutePress(route)}
						colors={colors}
					/>
				))}

				{/* Add Route Button */}
				{onAddRoute && (
					<Animated.View
						entering={FadeInRight.delay(routes.length * 50).duration(300)}
					>
						<Pressable
							onPress={onAddRoute}
							style={[styles.addRouteChip, { backgroundColor: colors.muted }]}
							accessibilityRole="button"
							accessibilityLabel={t("routes.addRoute")}
						>
							<Icon name="route" size={18} color={colors.mutedForeground} />
							<Text
								style={[styles.addRouteText, { color: colors.mutedForeground }]}
							>
								{t("routes.addRoute")}
							</Text>
						</Pressable>
					</Animated.View>
				)}
			</ScrollView>
		</Animated.View>
	);
}

type QuickRouteChipProps = {
	route: QuickRoute;
	index: number;
	onPress: () => void;
	colors: ReturnType<typeof useThemeColors>;
};

function QuickRouteChip({
	route,
	index,
	onPress,
	colors,
}: QuickRouteChipProps) {
	const scale = useSharedValue(1);

	const safetyColors = themeColors.safety[route.safetyLevel];
	const safetyIcon = route.safetyLevel === "safe" ? "check" : "alert";

	const handlePressIn = () => {
		scale.value = withSpring(0.95);
	};

	const handlePressOut = () => {
		scale.value = withSpring(1);
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const formatDuration = (minutes: number): string => {
		if (minutes < 60) {
			return `${minutes} min`;
		}
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	};

	return (
		<AnimatedPressable
			entering={FadeInRight.delay(index * 50).duration(300)}
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[
				styles.routeChip,
				{ backgroundColor: colors.card },
				animatedStyle,
			]}
			accessibilityRole="button"
			accessibilityLabel={`${route.name}. ${formatDuration(route.durationMinutes)}. ${getSafetyLabel(route.safetyLevel)}`}
		>
			{/* Route icon */}
			<View
				style={[styles.routeIcon, { backgroundColor: colors.primary + "15" }]}
			>
				<Icon name="route" size={16} color={colors.primary} />
			</View>

			{/* Route info */}
			<View style={styles.routeInfo}>
				<Text
					style={[styles.routeName, { color: colors.foreground }]}
					numberOfLines={1}
				>
					{route.name}
				</Text>
				<Text
					style={[styles.routeDetails, { color: colors.mutedForeground }]}
					numberOfLines={1}
				>
					{formatDuration(route.durationMinutes)}
				</Text>
			</View>

			{/* Safety indicator */}
			<View
				style={[
					styles.safetyBadge,
					{ backgroundColor: safetyColors.icon + "20" },
				]}
			>
				<Icon name={safetyIcon} size={12} color={safetyColors.icon} />
			</View>
		</AnimatedPressable>
	);
}

function getSafetyLabel(level: SafetyLevel): string {
	const labels: Record<SafetyLevel, string> = {
		safe: "Safe conditions",
		caution: "Use caution",
		warning: "Weather warning",
		danger: "Dangerous conditions",
	};
	return labels[level];
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	scrollContent: {
		paddingHorizontal: 16,
		gap: 10,
	},
	routeChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 14,
		gap: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	routeIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	routeInfo: {
		maxWidth: 120,
	},
	routeName: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 14,
	},
	routeDetails: {
		fontFamily: "Inter_400Regular",
		fontSize: 12,
		marginTop: 1,
	},
	safetyBadge: {
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	addRouteChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 14,
		gap: 6,
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: "rgba(128, 128, 128, 0.3)",
	},
	addRouteText: {
		fontFamily: "Inter_500Medium",
		fontSize: 13,
	},
});
