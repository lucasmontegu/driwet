// apps/mobile/components/route-weather-layer.tsx
import { LineLayer, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import { useMemo } from "react";
import type { RoadRisk, RouteWeatherSegment } from "@/hooks/use-route-weather";

type RouteWeatherLayerProps = {
	segments: RouteWeatherSegment[];
	showIcons?: boolean;
	lineWidth?: number;
};

const getRiskColor = (risk: RoadRisk): string => {
	switch (risk) {
		case "low":
			return "#22c55e"; // green
		case "moderate":
			return "#eab308"; // yellow
		case "high":
			return "#f97316"; // orange
		case "extreme":
			return "#ef4444"; // red
		default:
			return "#6b7280"; // gray
	}
};

const getWeatherIcon = (
	weatherCode: number,
): "clear" | "cloudy" | "rain" | "storm" | "snow" => {
	if (weatherCode >= 200 && weatherCode < 300) return "storm";
	if (weatherCode >= 300 && weatherCode < 600) return "rain";
	if (weatherCode >= 600 && weatherCode < 700) return "snow";
	if (weatherCode >= 700 && weatherCode < 800) return "cloudy";
	if (weatherCode >= 801) return "cloudy";
	return "clear";
};

export function RouteWeatherLayer({
	segments,
	showIcons = false,
	lineWidth = 6,
}: RouteWeatherLayerProps) {
	// Create GeoJSON line features for each segment pair with risk-based colors
	const routeFeatures = useMemo(() => {
		if (segments.length < 2) return null;

		const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];

		for (let i = 0; i < segments.length - 1; i++) {
			const current = segments[i];
			const next = segments[i + 1];

			features.push({
				type: "Feature",
				properties: {
					risk: current.weather.roadRisk,
					color: getRiskColor(current.weather.roadRisk),
					temperature: current.weather.temperature,
					weatherCode: current.weather.weatherCode,
				},
				geometry: {
					type: "LineString",
					coordinates: [
						[current.lng, current.lat],
						[next.lng, next.lat],
					],
				},
			});
		}

		return {
			type: "FeatureCollection" as const,
			features,
		};
	}, [segments]);

	// Create point features for weather icons at segment midpoints
	const iconFeatures = useMemo(() => {
		if (!showIcons || segments.length < 2) return null;

		// Show icons every ~50km or so, not at every segment
		const iconInterval = Math.max(1, Math.floor(segments.length / 5));

		const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

		for (let i = 0; i < segments.length; i += iconInterval) {
			const segment = segments[i];
			const icon = getWeatherIcon(segment.weather.weatherCode);

			features.push({
				type: "Feature",
				properties: {
					icon,
					temperature: Math.round(segment.weather.temperature),
					risk: segment.weather.roadRisk,
				},
				geometry: {
					type: "Point",
					coordinates: [segment.lng, segment.lat],
				},
			});
		}

		return {
			type: "FeatureCollection" as const,
			features,
		};
	}, [segments, showIcons]);

	if (!routeFeatures) return null;

	return (
		<>
			{/* Route line segments colored by risk */}
			<ShapeSource id="route-weather-source" shape={routeFeatures}>
				<LineLayer
					id="route-weather-line"
					style={{
						lineColor: ["get", "color"],
						lineWidth: lineWidth,
						lineCap: "round",
						lineJoin: "round",
					}}
				/>
			</ShapeSource>

			{/* Weather icons along the route */}
			{showIcons && iconFeatures && (
				<ShapeSource id="route-weather-icons" shape={iconFeatures}>
					<SymbolLayer
						id="route-weather-icon-layer"
						style={{
							textField: ["concat", ["get", "temperature"], "°"],
							textSize: 12,
							textColor: "#ffffff",
							textHaloColor: "#000000",
							textHaloWidth: 1,
							textOffset: [0, 1.5],
							textAnchor: "top",
						}}
					/>
				</ShapeSource>
			)}
		</>
	);
}
