// apps/mobile/app/(app)/(tabs)/alerts.tsx
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { useActiveAlerts } from "@/hooks/use-api";
import { useLocation } from "@/hooks/use-location";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";

export default function AlertsScreen() {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const { location, isLoading: locationLoading } = useLocation();

	// Fetch alerts for current location
	const { data: alertsData, isLoading } = useActiveAlerts(
		location?.latitude ?? 0,
		location?.longitude ?? 0,
		!locationLoading && location !== null,
	);

	const alerts = alertsData?.alerts ?? [];
	const hasAlerts = alerts.length > 0;

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View
				style={[
					styles.header,
					{
						paddingTop: insets.top + 16,
						backgroundColor: colors.background,
						borderBottomColor: colors.border,
					},
				]}
			>
				<Text style={[styles.headerTitle, { color: colors.foreground }]}>
					{t("tabs.alerts")}
				</Text>
				<Text
					style={[styles.headerSubtitle, { color: colors.mutedForeground }]}
				>
					{hasAlerts
						? `${alerts.length} ${t("alerts.activeNow")}`
						: t("routes.noAlerts")}
				</Text>
			</View>

			{/* Content */}
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: insets.bottom + 100 },
				]}
				showsVerticalScrollIndicator={false}
			>
				{isLoading && (
					<View style={styles.emptyState}>
						<Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
							{t("common.loading")}
						</Text>
					</View>
				)}

				{!isLoading && !hasAlerts && (
					<Animated.View
						entering={FadeInDown.duration(400).delay(100)}
						style={styles.emptyState}
					>
						<Icon name="checkCircle" size={64} color={colors.primary} />
						<Text
							style={[
								styles.emptyTitle,
								{ color: colors.foreground, marginTop: 24 },
							]}
						>
							{t("routes.clear")}
						</Text>
						<Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
							{t("safetyStatus.allClear")}
						</Text>
					</Animated.View>
				)}

				{!isLoading &&
					hasAlerts &&
					alerts.map((alert, index) => (
						<Animated.View
							key={alert.id}
							entering={FadeInDown.duration(400).delay(index * 80)}
							style={[
								styles.alertCard,
								{
									backgroundColor: colors.card,
									borderColor:
										alert.severity === "extreme"
											? "#DC2626"
											: alert.severity === "severe"
												? "#EA580C"
												: alert.severity === "moderate"
													? "#F59E0B"
													: colors.border,
								},
							]}
						>
							<View style={styles.alertHeader}>
								<Icon
									name="alert"
									size={24}
									color={
										alert.severity === "extreme"
											? "#DC2626"
											: alert.severity === "severe"
												? "#EA580C"
												: alert.severity === "moderate"
													? "#F59E0B"
													: colors.mutedForeground
									}
								/>
								<View style={styles.alertInfo}>
									<Text
										style={[styles.alertType, { color: colors.foreground }]}
									>
										{alert.type}
									</Text>
									<Text
										style={[
											styles.alertSeverity,
											{
												color:
													alert.severity === "extreme"
														? "#DC2626"
														: alert.severity === "severe"
															? "#EA580C"
															: alert.severity === "moderate"
																? "#F59E0B"
																: colors.mutedForeground,
											},
										]}
									>
										{alert.severity === "extreme"
											? t("alerts.extreme")
											: alert.severity === "severe"
												? t("alerts.severe")
												: alert.severity === "moderate"
													? t("alerts.moderate")
													: t("alerts.minor")}
									</Text>
								</View>
							</View>

							<Text
								style={[
									styles.alertDescription,
									{ color: colors.mutedForeground },
								]}
							>
								{alert.headline || t("alerts.activeWeatherAlert")}
							</Text>

							<View style={styles.alertFooter}>
								<View style={styles.alertMeta}>
									<Icon name="clock" size={14} color={colors.mutedForeground} />
									<Text
										style={[
											styles.alertMetaText,
											{ color: colors.mutedForeground },
										]}
									>
										{t("alerts.activeNow")}
									</Text>
								</View>
							</View>
						</Animated.View>
					))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 24,
		paddingBottom: 16,
		borderBottomWidth: 1,
	},
	headerTitle: {
		fontFamily: "Inter_700Bold",
		fontSize: 32,
		marginBottom: 4,
	},
	headerSubtitle: {
		fontFamily: "Inter_400Regular",
		fontSize: 15,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 80,
	},
	emptyTitle: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 20,
		marginBottom: 8,
	},
	emptyText: {
		fontFamily: "Inter_400Regular",
		fontSize: 15,
		textAlign: "center",
	},
	alertCard: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		borderWidth: 2,
	},
	alertHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 12,
		gap: 12,
	},
	alertInfo: {
		flex: 1,
	},
	alertType: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 16,
		marginBottom: 2,
	},
	alertSeverity: {
		fontFamily: "Inter_500Medium",
		fontSize: 13,
		textTransform: "uppercase",
	},
	alertDescription: {
		fontFamily: "Inter_400Regular",
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 12,
	},
	alertFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	alertMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	alertMetaText: {
		fontFamily: "Inter_400Regular",
		fontSize: 12,
	},
});
