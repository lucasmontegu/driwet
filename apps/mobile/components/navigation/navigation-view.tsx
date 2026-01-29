// apps/mobile/components/navigation/navigation-view.tsx
// Turn-by-turn navigation map component using Mapbox

import { env } from "@driwet/env/mobile";
import Mapbox, {
	Camera,
	LocationPuck,
	PointAnnotation,
	MapView as RNMapView,
	UserTrackingMode,
} from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";

// Initialize Mapbox
Mapbox.setAccessToken(env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

// Exported types for use in hooks and screens
export type NavigationCoordinate = {
	latitude: number;
	longitude: number;
};

export type NavigationWaypoint = NavigationCoordinate & {
	name?: string;
};

export type RouteProgress = {
	distanceRemaining: number; // meters
	durationRemaining: number; // seconds
	distanceTraveled: number; // meters
	fractionTraveled: number; // 0-1
	currentStepIndex: number;
	currentInstruction?: string;
	nextInstruction?: string;
	distanceToNextStep: number; // meters
};

type NavigationViewProps = {
	origin: NavigationCoordinate;
	destination: NavigationCoordinate;
	waypoints?: NavigationWaypoint[];
	locale?: string;
	showCancelButton?: boolean;
	onArrival?: () => void;
	onCancelNavigation?: () => void;
	onRouteProgress?: (progress: RouteProgress) => void;
	onRouteReady?: () => void;
	onError?: (error: string) => void;
};

type RouteStep = {
	instruction: string;
	distance: number; // meters
	duration: number; // seconds
	coordinates: [number, number][];
};

type RouteData = {
	geometry: [number, number][];
	distance: number;
	duration: number;
	steps: RouteStep[];
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371000; // Earth's radius in meters
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

// Find closest point on route to current location
function findClosestPointOnRoute(
	location: NavigationCoordinate,
	routeCoordinates: [number, number][],
): { index: number; distance: number; fractionAlongRoute: number } {
	let closestIndex = 0;
	let minDistance = Number.POSITIVE_INFINITY;

	for (let i = 0; i < routeCoordinates.length; i++) {
		const [lng, lat] = routeCoordinates[i];
		const distance = calculateDistance(
			location.latitude,
			location.longitude,
			lat,
			lng,
		);
		if (distance < minDistance) {
			minDistance = distance;
			closestIndex = i;
		}
	}

	const fractionAlongRoute = closestIndex / (routeCoordinates.length - 1);
	return { index: closestIndex, distance: minDistance, fractionAlongRoute };
}

export function NavigationView({
	origin,
	destination,
	waypoints = [],
	locale = "es",
	showCancelButton = true,
	onArrival,
	onCancelNavigation,
	onRouteProgress,
	onRouteReady,
	onError,
}: NavigationViewProps) {
	const colors = useThemeColors();
	const [routeData, setRouteData] = useState<RouteData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [userLocation, setUserLocation] = useState<NavigationCoordinate | null>(
		null,
	);
	const [hasArrived, setHasArrived] = useState(false);

	const locationSubscription = useRef<Location.LocationSubscription | null>(
		null,
	);
	const mapRef = useRef<RNMapView>(null);

	// Fetch route from Mapbox Directions API
	const fetchRoute = useCallback(async () => {
		try {
			setIsLoading(true);

			// Build coordinates string: origin, waypoints, destination
			const coords = [
				`${origin.longitude},${origin.latitude}`,
				...waypoints.map((wp) => `${wp.longitude},${wp.latitude}`),
				`${destination.longitude},${destination.latitude}`,
			].join(";");

			const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}&geometries=geojson&steps=true&overview=full&language=${locale}`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.code !== "Ok" || !data.routes?.length) {
				throw new Error(data.message || "No route found");
			}

			const route = data.routes[0];
			const steps: RouteStep[] = route.legs.flatMap(
				(leg: {
					steps: Array<{
						maneuver: { instruction: string };
						distance: number;
						duration: number;
						geometry: { coordinates: [number, number][] };
					}>;
				}) =>
					leg.steps.map(
						(step: {
							maneuver: { instruction: string };
							distance: number;
							duration: number;
							geometry: { coordinates: [number, number][] };
						}) => ({
							instruction: step.maneuver.instruction,
							distance: step.distance,
							duration: step.duration,
							coordinates: step.geometry.coordinates,
						}),
					),
			);

			setRouteData({
				geometry: route.geometry.coordinates,
				distance: route.distance,
				duration: route.duration,
				steps,
			});

			onRouteReady?.();
		} catch (err) {
			console.error("[NavigationView] Route fetch error:", err);
			onError?.(err instanceof Error ? err.message : "Failed to fetch route");
		} finally {
			setIsLoading(false);
		}
	}, [origin, destination, waypoints, locale, onRouteReady, onError]);

	// Start location tracking
	const startLocationTracking = useCallback(async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				onError?.("Location permission denied");
				return;
			}

			locationSubscription.current = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.BestForNavigation,
					timeInterval: 1000,
					distanceInterval: 5,
				},
				(location) => {
					setUserLocation({
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
					});
				},
			);
		} catch (err) {
			console.error("[NavigationView] Location tracking error:", err);
			onError?.(
				err instanceof Error ? err.message : "Failed to track location",
			);
		}
	}, [onError]);

	// Fetch route on mount
	useEffect(() => {
		fetchRoute();
	}, [fetchRoute]);

	// Start location tracking on mount
	useEffect(() => {
		startLocationTracking();
		return () => {
			locationSubscription.current?.remove();
		};
	}, [startLocationTracking]);

	// Update progress based on user location
	useEffect(() => {
		if (!userLocation || !routeData || hasArrived) return;

		// Find closest point on route
		const { index, fractionAlongRoute } = findClosestPointOnRoute(
			userLocation,
			routeData.geometry,
		);

		// Calculate remaining distance and duration
		const distanceTraveled = routeData.distance * fractionAlongRoute;
		const distanceRemaining = routeData.distance - distanceTraveled;
		const durationRemaining = routeData.duration * (1 - fractionAlongRoute);

		// Find current step
		let accumulatedDistance = 0;
		let currentStepIndex = 0;
		let distanceToNextStep = 0;

		for (let i = 0; i < routeData.steps.length; i++) {
			accumulatedDistance += routeData.steps[i].distance;
			if (distanceTraveled < accumulatedDistance) {
				currentStepIndex = i;
				distanceToNextStep = accumulatedDistance - distanceTraveled;
				break;
			}
		}

		const progress: RouteProgress = {
			distanceRemaining,
			durationRemaining,
			distanceTraveled,
			fractionTraveled: fractionAlongRoute,
			currentStepIndex,
			currentInstruction: routeData.steps[currentStepIndex]?.instruction,
			nextInstruction: routeData.steps[currentStepIndex + 1]?.instruction,
			distanceToNextStep,
		};

		onRouteProgress?.(progress);

		// Check for arrival (within 50 meters of destination)
		const distanceToDestination = calculateDistance(
			userLocation.latitude,
			userLocation.longitude,
			destination.latitude,
			destination.longitude,
		);

		if (distanceToDestination < 50 && !hasArrived) {
			setHasArrived(true);
			onArrival?.();
		}
	}, [
		userLocation,
		routeData,
		destination,
		hasArrived,
		onArrival,
		onRouteProgress,
	]);

	// Calculate camera bounds
	const bounds = useCallback(() => {
		if (!routeData?.geometry?.length) return null;

		let minLng = Number.POSITIVE_INFINITY;
		let maxLng = Number.NEGATIVE_INFINITY;
		let minLat = Number.POSITIVE_INFINITY;
		let maxLat = Number.NEGATIVE_INFINITY;

		for (const [lng, lat] of routeData.geometry) {
			minLng = Math.min(minLng, lng);
			maxLng = Math.max(maxLng, lng);
			minLat = Math.min(minLat, lat);
			maxLat = Math.max(maxLat, lat);
		}

		const padding = 0.01;
		return {
			ne: [maxLng + padding, maxLat + padding] as [number, number],
			sw: [minLng - padding, minLat - padding] as [number, number],
		};
	}, [routeData]);

	if (isLoading) {
		return (
			<View style={[styles.container, { backgroundColor: colors.background }]}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	const cameraBounds = bounds();

	return (
		<View style={styles.container}>
			<RNMapView
				ref={mapRef}
				style={styles.map}
				styleURL={Mapbox.StyleURL.Dark}
				logoEnabled={false}
				attributionEnabled={false}
				scaleBarEnabled={false}
				zoomEnabled={true}
				scrollEnabled={true}
				rotateEnabled={true}
				pitchEnabled={true}
			>
				{/* Camera follows user during navigation */}
				{userLocation ? (
					<Camera
						zoomLevel={16}
						centerCoordinate={[userLocation.longitude, userLocation.latitude]}
						followUserLocation={true}
						followUserMode={UserTrackingMode.FollowWithHeading}
						followPitch={60}
						animationMode="flyTo"
						animationDuration={500}
					/>
				) : cameraBounds ? (
					<Camera
						bounds={cameraBounds}
						padding={{
							paddingTop: 100,
							paddingBottom: 200,
							paddingLeft: 50,
							paddingRight: 50,
						}}
						animationMode="flyTo"
						animationDuration={1500}
					/>
				) : null}

				{/* User location puck */}
				<LocationPuck
					puckBearing="heading"
					puckBearingEnabled
					pulsing={{ isEnabled: true, color: colors.primary, radius: 50 }}
				/>

				{/* Route line */}
				{routeData?.geometry && (
					<Mapbox.ShapeSource
						id="navigation-route-source"
						shape={{
							type: "Feature",
							geometry: {
								type: "LineString",
								coordinates: routeData.geometry,
							},
							properties: {},
						}}
					>
						{/* Route outline */}
						<Mapbox.LineLayer
							id="navigation-route-outline"
							style={{
								lineColor: "#1e40af",
								lineWidth: 10,
								lineCap: "round",
								lineJoin: "round",
							}}
						/>
						{/* Route main line */}
						<Mapbox.LineLayer
							id="navigation-route-line"
							style={{
								lineColor: "#3b82f6",
								lineWidth: 6,
								lineCap: "round",
								lineJoin: "round",
							}}
						/>
					</Mapbox.ShapeSource>
				)}

				{/* Origin marker */}
				<PointAnnotation
					id="navigation-origin"
					coordinate={[origin.longitude, origin.latitude]}
				>
					<View style={styles.originMarker}>
						<View style={styles.originMarkerInner} />
					</View>
				</PointAnnotation>

				{/* Destination marker */}
				<PointAnnotation
					id="navigation-destination"
					coordinate={[destination.longitude, destination.latitude]}
				>
					<View style={styles.destinationMarker}>
						<View style={styles.destinationMarkerInner} />
					</View>
				</PointAnnotation>

				{/* Waypoint markers */}
				{waypoints.map((wp, index) => (
					<PointAnnotation
						key={`waypoint-${index}`}
						id={`waypoint-${index}`}
						coordinate={[wp.longitude, wp.latitude]}
					>
						<View style={styles.waypointMarker}>
							<View style={styles.waypointMarkerInner} />
						</View>
					</PointAnnotation>
				))}
			</RNMapView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		flex: 1,
	},
	originMarker: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#22c55e",
		borderColor: "#ffffff",
		borderWidth: 3,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	originMarkerInner: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "#ffffff",
	},
	destinationMarker: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#ef4444",
		borderColor: "#ffffff",
		borderWidth: 3,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	destinationMarkerInner: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: "#ffffff",
	},
	waypointMarker: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: "#f59e0b",
		borderColor: "#ffffff",
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	waypointMarkerInner: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: "#ffffff",
	},
});
