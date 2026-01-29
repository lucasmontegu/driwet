// apps/mobile/app/(app)/(tabs)/routes.tsx

import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { ScheduleTripSheet } from "@/components/schedule-trip-sheet";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
	useDeleteRoute,
	useSavedRoutes,
	useToggleRouteFavorite,
	useTripHistory,
} from "@/hooks/use-api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";
import { useScheduledTripsStore } from "@/stores/scheduled-trips-store";

type RouteForScheduling = {
	id: string;
	name: string;
	originName: string;
	destinationName: string;
	originCoordinates: { latitude: number; longitude: number };
	destinationCoordinates: { latitude: number; longitude: number };
} | null;

export default function RoutesScreen() {
	const colors = useThemeColors();
	const router = useRouter();
	const { t } = useTranslation();
	const { requireAuth } = useRequireAuth();

	const { data: savedRoutes, isLoading: routesLoading } = useSavedRoutes();
	const { data: tripHistory, isLoading: historyLoading } = useTripHistory(10);
	const deleteRoute = useDeleteRoute();
	const toggleFavorite = useToggleRouteFavorite();

	const [scheduleRoute, setScheduleRoute] = useState<RouteForScheduling>(null);
	const getTripsByRouteId = useScheduledTripsStore(
		(state) => state.getTripsByRouteId,
	);

	const handleAddRoute = () => {
		requireAuth(() => {
			router.push("/add-route");
		});
	};

	const handleScheduleTrip = useCallback(
		(route: NonNullable<RouteForScheduling>) => {
			requireAuth(() => {
				setScheduleRoute(route);
			});
		},
		[requireAuth],
	);

	const handleCloseScheduleSheet = useCallback(() => {
		setScheduleRoute(null);
	}, []);

	const handleTripScheduled = useCallback((tripId: string) => {
		console.log("Trip scheduled:", tripId);
	}, []);

	const formatDate = (date: string | Date) => {
		const d = new Date(date);
		const now = new Date();
		const diffDays = Math.floor(
			(now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
		);

		if (diffDays === 0) return t("routes.today");
		if (diffDays === 1) return t("routes.yesterday");
		return d.toLocaleDateString(undefined, {
			weekday: "short",
			day: "numeric",
		});
	};

	const getOutcomeText = (outcome: string) => {
		switch (outcome) {
			case "avoided_storm":
				return t("routes.avoidedStorm");
			case "completed":
				return t("routes.safeRoute");
			default:
				return outcome;
		}
	};

	return (
		<GestureHandlerRootView style={styles.root}>
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}
			>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
				>
					{/* Header */}
					<Animated.Text
						entering={FadeInDown.delay(0).springify()}
						style={[styles.title, { color: colors.foreground }]}
						accessibilityRole="header"
					>
						{t("routes.title")}
					</Animated.Text>

					{/* Saved Routes */}
					{routesLoading ? (
						<ActivityIndicator
							size="large"
							color={colors.primary}
							style={styles.loader}
						/>
					) : (
						<View style={styles.routesContainer}>
							{savedRoutes?.map((route, index) => {
								const scheduledTrips = getTripsByRouteId(route.id);
								const hasScheduledTrip = scheduledTrips.length > 0;
								const nextScheduled = hasScheduledTrip
									? scheduledTrips[0]
									: null;

								return (
									<Animated.View
										key={route.id}
										entering={FadeInDown.delay(100 + index * 100).springify()}
									>
										{/* Scheduled trip badge */}
										{hasScheduledTrip && nextScheduled && (
											<View
												style={[
													styles.scheduledBadge,
													{ backgroundColor: colors.primary + "15" },
												]}
											>
												<Icon name="clock" size={14} color={colors.primary} />
												<Text
													style={[
														styles.scheduledText,
														{ color: colors.primary },
													]}
												>
													{t("routes.scheduled")}{" "}
													{new Date(
														nextScheduled.departureTime,
													).toLocaleDateString(undefined, {
														weekday: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</Text>
											</View>
										)}

										<AnimatedPressable
											onPress={() =>
												router.push(`/route-detail?id=${route.id}`)
											}
											style={[
												styles.routeCard,
												{
													backgroundColor: colors.card,
													borderColor: hasScheduledTrip
														? colors.primary
														: route.isFavorite
															? colors.primary
															: colors.border,
													borderRadius: hasScheduledTrip ? 0 : 12,
													borderBottomLeftRadius: 12,
													borderBottomRightRadius: 12,
													borderTopLeftRadius: hasScheduledTrip ? 0 : 12,
													borderTopRightRadius: hasScheduledTrip ? 0 : 12,
													borderTopWidth: hasScheduledTrip ? 0 : 1,
												},
											]}
											accessibilityRole="button"
											accessibilityLabel={`${route.name}: ${route.originName} ${t("common.to")} ${route.destinationName}`}
											accessibilityHint={t("routes.tapToViewDetails")}
										>
											<View style={styles.routeHeader}>
												<Icon
													name="location"
													size={18}
													color={colors.foreground}
												/>
												<Text
													style={[
														styles.routeName,
														{ color: colors.foreground },
													]}
													numberOfLines={1}
												>
													{route.name}
												</Text>
												<AnimatedPressable
													onPress={() => toggleFavorite.mutate(route.id)}
													style={styles.favoriteButton}
													accessibilityRole="button"
													accessibilityLabel={
														route.isFavorite
															? t("routes.removeFavorite")
															: t("routes.addFavorite")
													}
													scaleDown={0.8}
												>
													<Icon
														name="star"
														size={18}
														color={
															route.isFavorite
																? colors.primary
																: colors.mutedForeground
														}
													/>
												</AnimatedPressable>
											</View>
											<View style={styles.routeDetails}>
												<Text
													style={[
														styles.routeSubtitle,
														{ color: colors.mutedForeground },
													]}
													numberOfLines={1}
												>
													{route.originName} → {route.destinationName}
												</Text>
											</View>

											{/* Action buttons */}
											<View style={styles.routeActions}>
												<AnimatedPressable
													onPress={(e) => {
														e.stopPropagation();
														handleScheduleTrip({
															id: route.id,
															name: route.name,
															originName: route.originName,
															destinationName: route.destinationName,
															originCoordinates: {
																latitude: Number.parseFloat(
																	route.originLatitude,
																),
																longitude: Number.parseFloat(
																	route.originLongitude,
																),
															},
															destinationCoordinates: {
																latitude: Number.parseFloat(
																	route.destinationLatitude,
																),
																longitude: Number.parseFloat(
																	route.destinationLongitude,
																),
															},
														});
													}}
													style={[
														styles.scheduleButton,
														{ backgroundColor: colors.muted },
													]}
												>
													<Icon name="clock" size={14} color={colors.primary} />
													<Text
														style={[
															styles.scheduleButtonText,
															{ color: colors.primary },
														]}
													>
														{t("schedule.schedule")}
													</Text>
												</AnimatedPressable>
											</View>
										</AnimatedPressable>
									</Animated.View>
								);
							})}

							{/* Add new route */}
							<Animated.View
								entering={FadeInUp.delay(
									100 + (savedRoutes?.length ?? 0) * 100,
								).springify()}
							>
								<AnimatedPressable
									onPress={handleAddRoute}
									style={[
										styles.addRouteButton,
										{
											backgroundColor: colors.muted,
											borderColor: colors.border,
										},
									]}
									accessibilityRole="button"
									accessibilityLabel={t("routes.addNew")}
									accessibilityHint={t("routes.addNewHint")}
								>
									<Icon name="route" size={18} color={colors.primary} />
									<Text
										style={[styles.addRouteText, { color: colors.primary }]}
									>
										{t("routes.addNew")}
									</Text>
								</AnimatedPressable>
							</Animated.View>
						</View>
					)}

					{/* History */}
					<Animated.Text
						entering={FadeInDown.delay(400).springify()}
						style={[styles.sectionTitle, { color: colors.foreground }]}
						accessibilityRole="header"
					>
						{t("routes.history")}
					</Animated.Text>

					{historyLoading ? (
						<ActivityIndicator size="small" color={colors.mutedForeground} />
					) : tripHistory && tripHistory.length > 0 ? (
						<View style={styles.historyContainer}>
							{tripHistory.map((trip, index) => (
								<Animated.View
									key={trip.id}
									entering={FadeInDown.delay(450 + index * 50).springify()}
									style={styles.historyItem}
									accessible={true}
									accessibilityRole="text"
									accessibilityLabel={`${formatDate(trip.startedAt)}: ${getOutcomeText(trip.outcome)}, ${trip.originName} ${t("common.to")} ${trip.destinationName}`}
								>
									<View
										style={[
											styles.historyIcon,
											{
												backgroundColor:
													trip.outcome === "avoided_storm"
														? colors.safe
														: colors.muted,
											},
										]}
									>
										<Icon
											name={
												trip.outcome === "avoided_storm"
													? "storm"
													: "checkCircle"
											}
											size={16}
											color={
												trip.outcome === "avoided_storm"
													? "#FFFFFF"
													: colors.mutedForeground
											}
										/>
									</View>
									<View style={styles.historyContent}>
										<Text
											style={[
												styles.historyDate,
												{ color: colors.mutedForeground },
											]}
										>
											{formatDate(trip.startedAt)}
										</Text>
										<Text
											style={[
												styles.historyOutcome,
												{ color: colors.foreground },
											]}
										>
											{getOutcomeText(trip.outcome)}
										</Text>
										<Text
											style={[
												styles.historyRoute,
												{ color: colors.mutedForeground },
											]}
											numberOfLines={1}
										>
											{trip.originName} → {trip.destinationName}
										</Text>
										{trip.estimatedSavings &&
											Number(trip.estimatedSavings) > 0 && (
												<Text
													style={[styles.historySavings, { color: colors.safe }]}
												>
													{t("routes.estimatedSavings", {
														amount: `$${Number(trip.estimatedSavings).toLocaleString()}`,
													})}
												</Text>
											)}
									</View>
								</Animated.View>
							))}
						</View>
					) : (
						<Animated.Text
							entering={FadeInDown.delay(500).springify()}
							style={[styles.emptyText, { color: colors.mutedForeground }]}
						>
							{t("routes.noAlerts")}
						</Animated.Text>
					)}
				</ScrollView>

				{/* Schedule Trip Sheet */}
				{scheduleRoute && (
					<ScheduleTripSheet
						route={scheduleRoute}
						isVisible={true}
						onClose={handleCloseScheduleSheet}
						onScheduled={handleTripScheduled}
					/>
				)}
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
	},
	title: {
		fontFamily: "Inter_700Bold",
		fontSize: 28,
		marginBottom: 24,
	},
	loader: {
		marginVertical: 40,
	},
	routesContainer: {
		gap: 12,
		marginBottom: 24,
	},
	scheduledBadge: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	scheduledText: {
		fontFamily: "Inter_500Medium",
		fontSize: 12,
	},
	routeCard: {
		padding: 16,
		borderWidth: 1,
	},
	routeHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	routeName: {
		marginLeft: 8,
		fontFamily: "Inter_600SemiBold",
		flex: 1,
	},
	favoriteButton: {
		padding: 4,
	},
	routeDetails: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	routeSubtitle: {
		fontFamily: "Inter_400Regular",
		fontSize: 13,
		flex: 1,
	},
	routeActions: {
		flexDirection: "row",
		gap: 8,
		marginTop: 12,
	},
	scheduleButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
	},
	scheduleButtonText: {
		fontFamily: "Inter_500Medium",
		fontSize: 12,
	},
	addRouteButton: {
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderStyle: "dashed",
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
	},
	addRouteText: {
		fontFamily: "Inter_600SemiBold",
	},
	sectionTitle: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 18,
		marginBottom: 16,
	},
	historyContainer: {
		gap: 12,
	},
	historyItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
	},
	historyIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	historyContent: {
		flex: 1,
	},
	historyDate: {
		fontFamily: "Inter_400Regular",
		fontSize: 12,
	},
	historyOutcome: {
		fontFamily: "Inter_600SemiBold",
	},
	historyRoute: {
		fontFamily: "Inter_400Regular",
		fontSize: 13,
	},
	historySavings: {
		fontFamily: "Inter_400Regular",
		fontSize: 14,
		marginTop: 2,
	},
	emptyText: {
		fontFamily: "Inter_400Regular",
		textAlign: "center",
		paddingVertical: 20,
	},
});
