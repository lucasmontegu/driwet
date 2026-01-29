// apps/mobile/app/(app)/(tabs)/index.tsx

import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
	Easing,
	FadeIn,
	SlideInDown,
	SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocationChips, type RouteLocation } from "@/components/location-chips";
import { MapViewComponent, type WeatherAlert } from "@/components/map-view";
import { useProvidersReady } from "@/components/provider-guard";
import { RouteChips as RouteInfoChips } from "@/components/route-chips";
import { PaywallModal } from "@/components/subscription";
import { SuggestionsSheet } from "@/components/suggestions-sheet";
import { useActiveAlerts, useCurrentWeather } from "@/hooks/use-api";
import { useLocation } from "@/hooks/use-location";
import { usePaywall } from "@/hooks/use-paywall";
import { useRouteDirections } from "@/hooks/use-route-directions";
import { useTranslation } from "@/lib/i18n";

// Loading screen while providers initialize
function LoadingScreen() {
	return (
		<View style={styles.loadingContainer}>
			<ActivityIndicator size="large" color="#0936d6" />
		</View>
	);
}

// Main map screen content
function MapScreenContent() {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const { location, isLoading: locationLoading } = useLocation();

	// Subscription/Trial state
	const paywall = usePaywall({ autoShowOnTrialExpiry: false });

	// Route state
	const [origin, setOrigin] = useState<RouteLocation | null>(null);
	const [destination, setDestination] = useState<RouteLocation | null>(null);
	const [showSuggestions, setShowSuggestions] = useState(false);

	// Fetch alerts for current location
	const { data: alertsData } = useActiveAlerts(
		location?.latitude ?? 0,
		location?.longitude ?? 0,
		!locationLoading && location !== null,
	);

	// Fetch weather for current location
	const { data: weatherData } = useCurrentWeather(
		location?.latitude ?? 0,
		location?.longitude ?? 0,
		!locationLoading && location !== null,
	);

	// Transform API alerts to map format
	const alerts: WeatherAlert[] = (alertsData?.alerts ?? []).map((alert) => ({
		id: alert.id,
		type: alert.type,
		severity: alert.severity,
		headline: alert.headline,
		polygon: alert.polygon,
	}));

	// Fetch route directions when origin and destination are set
	const { data: routeDirections } = useRouteDirections(
		origin?.coordinates ?? null,
		destination?.coordinates ?? null,
		!!origin && !!destination,
	);

	const handleRouteChange = useCallback(
		(newOrigin: RouteLocation | null, newDestination: RouteLocation | null) => {
			setOrigin(newOrigin);
			setDestination(newDestination);
			// Show suggestions when route is complete
			if (newOrigin && newDestination) {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				setShowSuggestions(true);
			}
		},
		[],
	);

	const handleClearRoute = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setOrigin(null);
		setDestination(null);
		setShowSuggestions(false);
	}, []);

	const hasRoute = origin && destination;

	// Route data for suggestions sheet
	const routeSuggestionsData = useMemo(
		() => ({
			distance: routeDirections?.distance ?? 0,
			duration: routeDirections?.duration ?? 0,
			temperature: weatherData?.data?.temperature,
			alerts: alerts.map((alert) => ({
				id: alert.id,
				type: alert.type,
				severity: alert.severity,
				description: alert.headline || t("alerts.weatherAlert"),
				kmRange: "",
			})),
			stops: [] as Array<{
				id: string;
				name: string;
				type: "gas" | "rest" | "food";
				km: number;
				reason: string;
			}>,
			destinations: [] as Array<{
				name: string;
				crowdLevel: "low" | "medium" | "high";
				currentCount: number;
				maxCapacity: number;
			}>,
		}),
		[alerts, weatherData?.data?.temperature, routeDirections, t],
	);

	return (
		<GestureHandlerRootView style={styles.container}>
			<View
				style={styles.container}
				accessible={false}
				accessibilityLabel="Mapa principal"
			>
				{/* Fullscreen Map - extends behind notch */}
				<MapViewComponent
					alerts={alerts}
					origin={origin?.coordinates}
					destination={destination?.coordinates}
					routeGeometry={routeDirections?.geometry?.coordinates}
				/>

				{/* Top overlay - Location Chips */}
				<Animated.View
					entering={FadeIn.duration(300).easing(Easing.out(Easing.quad))}
					style={[styles.topOverlay, { paddingTop: insets.top + 12 }]}
					pointerEvents="box-none"
				>
					{!showSuggestions && (
						<LocationChips
							origin={origin}
							destination={destination}
							onRouteChange={handleRouteChange}
						/>
					)}
				</Animated.View>

				{/* Route Info Chips - shown when route is active */}
				{hasRoute && !showSuggestions && (
					<Animated.View
						entering={SlideInDown.duration(250).easing(
							Easing.bezier(0.2, 0, 0, 1),
						)}
						exiting={SlideOutDown.duration(200).easing(
							Easing.bezier(0.4, 0, 1, 1),
						)}
						style={styles.routeChipsContainer}
					>
						<RouteInfoChips
							origin={origin}
							destination={destination}
							distance={routeDirections?.distance}
							duration={routeDirections?.duration}
							onClear={handleClearRoute}
						/>
					</Animated.View>
				)}

				{/* Suggestions Sheet */}
				{hasRoute && showSuggestions && (
					<SuggestionsSheet
						origin={origin}
						destination={destination}
						distance={routeSuggestionsData.distance}
						duration={routeSuggestionsData.duration}
						temperature={routeSuggestionsData.temperature}
						alerts={routeSuggestionsData.alerts}
						stops={routeSuggestionsData.stops}
						destinations={routeSuggestionsData.destinations}
						onClose={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							setShowSuggestions(false);
						}}
					/>
				)}

				{/* Paywall Modal - shown when trial expires */}
				<PaywallModal
					visible={paywall.isVisible}
					onDismiss={paywall.dismiss}
					allowDismiss={paywall.canDismiss}
				/>
			</View>
		</GestureHandlerRootView>
	);
}

// Main export - checks providers before rendering
export default function MapScreen() {
	const isReady = useProvidersReady();

	if (!isReady) {
		return <LoadingScreen />;
	}

	return <MapScreenContent />;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000",
	},
	topOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
	},
	routeChipsContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
});
