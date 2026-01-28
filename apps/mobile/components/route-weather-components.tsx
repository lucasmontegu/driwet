// apps/mobile/components/route-weather-components.tsx
// Route weather visualization components

import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, type IconName } from "@/components/icons";
import type { RoadRisk } from "@/hooks/use-route-weather";
import { useThemeColors } from "@/hooks/use-theme-colors";

// Types
export type WeatherCondition =
	| "clear"
	| "clouds"
	| "rain"
	| "snow"
	| "storm"
	| "fog";

export type WeatherSegmentData = {
	kmStart: number;
	kmEnd: number;
	condition: WeatherCondition;
	temperature: number;
	risk: RoadRisk;
	precipitationIntensity?: number;
	windSpeed?: number;
};

export type SafetyAlert = {
	id: string;
	type: string;
	severity: "minor" | "moderate" | "severe" | "extreme";
	title: string;
	location?: string;
};

export type SafeStopSuggestion = {
	id: string;
	name: string;
	km: number;
	reason: string;
	amenities?: string[];
};

export type SafeStopData = {
	id: string;
	name: string;
	type: "gas_station" | "rest_area" | "town";
	km: number;
	distanceFromDanger?: number;
	waitTime?: number;
	amenities: ("fuel" | "restrooms" | "food" | "parking")[];
	aiMessage?: string;
	coordinates?: { latitude: number; longitude: number };
};

// Helper functions
const getWeatherIcon = (condition: WeatherCondition): IconName => {
	switch (condition) {
		case "clear":
			return "weather";
		case "clouds":
			return "rain";
		case "rain":
			return "rain";
		case "storm":
			return "storm";
		case "snow":
			return "weather";
		case "fog":
			return "rain";
		default:
			return "rain";
	}
};

const getRiskColor = (risk: RoadRisk): string => {
	switch (risk) {
		case "low":
			return "#22c55e";
		case "moderate":
			return "#f59e0b";
		case "high":
			return "#ef4444";
		case "extreme":
			return "#dc2626";
		default:
			return "#6b7280";
	}
};

// WeatherTimeline Component
type WeatherTimelineProps = {
	segments: WeatherSegmentData[];
	overallRisk: RoadRisk;
	totalDistanceKm?: number;
	isLoading?: boolean;
};

export function WeatherTimeline({
	segments,
	overallRisk,
	totalDistanceKm,
	isLoading,
}: WeatherTimelineProps) {
	const colors = useThemeColors();

	if (isLoading || segments.length === 0) {
		return null;
	}

	return (
		<View style={styles.timelineContainer}>
			<View style={[styles.timelineHeader, { paddingHorizontal: 16 }]}>
				<Text style={[styles.timelineTitle, { color: colors.foreground }]}>
					Weather Timeline
				</Text>
				{totalDistanceKm && (
					<Text
						style={[styles.timelineDistance, { color: colors.mutedForeground }]}
					>
						{totalDistanceKm} km
					</Text>
				)}
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.segmentsContainer}
			>
				{segments.map((segment, index) => (
					<Animated.View
						key={`segment-${segment.kmStart}`}
						entering={FadeInDown.delay(index * 50)}
						style={[
							styles.segmentCard,
							{
								backgroundColor: colors.card,
								borderLeftColor: getRiskColor(segment.risk),
							},
						]}
					>
						<Icon
							name={getWeatherIcon(segment.condition)}
							size={24}
							color={colors.foreground}
						/>
						<Text style={[styles.segmentTemp, { color: colors.foreground }]}>
							{Math.round(segment.temperature)}°
						</Text>
						<Text style={[styles.segmentKm, { color: colors.mutedForeground }]}>
							km {segment.kmStart}-{segment.kmEnd}
						</Text>
						{segment.windSpeed && segment.windSpeed > 30 && (
							<View style={styles.segmentDetail}>
								<Icon name="weather" size={12} color={colors.mutedForeground} />
								<Text
									style={[
										styles.segmentDetailText,
										{ color: colors.mutedForeground },
									]}
								>
									{Math.round(segment.windSpeed)} km/h
								</Text>
							</View>
						)}
					</Animated.View>
				))}
			</ScrollView>
		</View>
	);
}

// AISafetySummary Component
type AISafetySummaryProps = {
	overallRisk: RoadRisk;
	alerts: SafetyAlert[];
	suggestions: SafeStopSuggestion[];
	onSuggestionPress?: (suggestion: SafeStopSuggestion) => void;
};

export function AISafetySummary({
	overallRisk,
	alerts,
	suggestions,
	onSuggestionPress,
}: AISafetySummaryProps) {
	const colors = useThemeColors();

	const getMessage = () => {
		switch (overallRisk) {
			case "low":
				return "Route conditions look good. Safe travels!";
			case "moderate":
				return "Some areas may have challenging conditions. Drive carefully.";
			case "high":
				return "Significant weather hazards detected. Consider safe stops along the way.";
			case "extreme":
				return "Dangerous conditions ahead. Strongly recommend waiting or finding shelter.";
			default:
				return "Analyzing route conditions...";
		}
	};

	return (
		<View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
			<View style={styles.summaryHeader}>
				<Icon name="shield" size={20} color={getRiskColor(overallRisk)} />
				<Text style={[styles.summaryTitle, { color: colors.foreground }]}>
					AI Safety Analysis
				</Text>
			</View>
			<Text style={[styles.summaryMessage, { color: colors.foreground }]}>
				{getMessage()}
			</Text>

			{alerts.length > 0 && (
				<View style={styles.alertsSection}>
					{alerts.map((alert) => (
						<View
							key={alert.id}
							style={[styles.alertItem, { backgroundColor: colors.muted }]}
						>
							<Icon
								name="warning"
								size={14}
								color={getRiskColor(
									alert.severity === "minor"
										? "low"
										: alert.severity === "moderate"
											? "moderate"
											: "high",
								)}
							/>
							<Text style={[styles.alertText, { color: colors.foreground }]}>
								{alert.title}
							</Text>
						</View>
					))}
				</View>
			)}

			{suggestions.length > 0 && (
				<View style={styles.suggestionsSection}>
					<Text
						style={[styles.suggestionsTitle, { color: colors.mutedForeground }]}
					>
						Recommended Stops
					</Text>
					{suggestions.map((suggestion) => (
						<View
							key={suggestion.id}
							style={[styles.suggestionItem, { backgroundColor: colors.muted }]}
							onTouchEnd={() => onSuggestionPress?.(suggestion)}
						>
							<Icon name="pin" size={14} color={colors.primary} />
							<View style={styles.suggestionInfo}>
								<Text
									style={[styles.suggestionName, { color: colors.foreground }]}
								>
									{suggestion.name}
								</Text>
								<Text
									style={[
										styles.suggestionReason,
										{ color: colors.mutedForeground },
									]}
								>
									{suggestion.reason}
								</Text>
							</View>
						</View>
					))}
				</View>
			)}
		</View>
	);
}

// SafeStopCard Component
type SafeStopCardProps = {
	stop: SafeStopData;
	onAddToRoute?: () => void;
	onFindAlternatives?: () => void;
	onDismiss?: () => void;
};

export function SafeStopCard({
	stop,
	onAddToRoute,
	onFindAlternatives,
	onDismiss,
}: SafeStopCardProps) {
	const colors = useThemeColors();

	const getAmenityIcon = (amenity: string): IconName => {
		switch (amenity) {
			case "fuel":
				return "gas";
			case "restrooms":
				return "user";
			case "food":
				return "store";
			case "parking":
				return "parking";
			default:
				return "pin";
		}
	};

	return (
		<View style={[styles.stopCard, { backgroundColor: colors.card }]}>
			<View style={styles.stopHeader}>
				<View style={styles.stopInfo}>
					<Text style={[styles.stopName, { color: colors.foreground }]}>
						{stop.name}
					</Text>
					<Text
						style={[styles.stopDistance, { color: colors.mutedForeground }]}
					>
						km {stop.km} • {stop.distanceFromDanger} km before danger zone
					</Text>
				</View>
				{onDismiss && (
					<View onTouchEnd={onDismiss}>
						<Icon name="close" size={20} color={colors.mutedForeground} />
					</View>
				)}
			</View>

			{stop.aiMessage && (
				<View style={[styles.aiMessageBox, { backgroundColor: colors.muted }]}>
					<Icon name="star" size={16} color={colors.primary} />
					<Text style={[styles.aiMessageText, { color: colors.foreground }]}>
						{stop.aiMessage}
					</Text>
				</View>
			)}

			<View style={styles.amenitiesRow}>
				{stop.amenities.map((amenity) => (
					<View
						key={amenity}
						style={[styles.amenityBadge, { backgroundColor: colors.muted }]}
					>
						<Icon
							name={getAmenityIcon(amenity)}
							size={14}
							color={colors.foreground}
						/>
					</View>
				))}
			</View>

			<View style={styles.stopActions}>
				{onAddToRoute && (
					<View
						style={[styles.actionButton, { backgroundColor: colors.primary }]}
						onTouchEnd={onAddToRoute}
					>
						<Text style={styles.actionButtonText}>Add to Route</Text>
					</View>
				)}
				{onFindAlternatives && (
					<View
						style={[
							styles.actionButtonSecondary,
							{ borderColor: colors.border },
						]}
						onTouchEnd={onFindAlternatives}
					>
						<Text
							style={[
								styles.actionButtonSecondaryText,
								{ color: colors.foreground },
							]}
						>
							Find Alternatives
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	// Timeline styles
	timelineContainer: {
		paddingVertical: 16,
	},
	timelineHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	timelineTitle: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 16,
	},
	timelineDistance: {
		fontFamily: "Inter_400Regular",
		fontSize: 14,
	},
	segmentsContainer: {
		paddingHorizontal: 16,
		gap: 12,
	},
	segmentCard: {
		width: 100,
		padding: 12,
		borderRadius: 12,
		borderLeftWidth: 3,
		alignItems: "center",
		gap: 4,
	},
	segmentTemp: {
		fontFamily: "Inter_700Bold",
		fontSize: 18,
	},
	segmentKm: {
		fontFamily: "Inter_400Regular",
		fontSize: 11,
	},
	segmentDetail: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 4,
	},
	segmentDetailText: {
		fontFamily: "Inter_400Regular",
		fontSize: 10,
	},

	// Summary styles
	summaryContainer: {
		marginHorizontal: 16,
		padding: 16,
		borderRadius: 12,
	},
	summaryHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
	},
	summaryTitle: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 16,
	},
	summaryMessage: {
		fontFamily: "Inter_400Regular",
		fontSize: 14,
		lineHeight: 20,
	},
	alertsSection: {
		marginTop: 12,
		gap: 8,
	},
	alertItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		padding: 10,
		borderRadius: 8,
	},
	alertText: {
		fontFamily: "Inter_500Medium",
		fontSize: 13,
		flex: 1,
	},
	suggestionsSection: {
		marginTop: 16,
	},
	suggestionsTitle: {
		fontFamily: "Inter_500Medium",
		fontSize: 12,
		marginBottom: 8,
	},
	suggestionItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
	},
	suggestionInfo: {
		flex: 1,
	},
	suggestionName: {
		fontFamily: "Inter_500Medium",
		fontSize: 14,
	},
	suggestionReason: {
		fontFamily: "Inter_400Regular",
		fontSize: 12,
		marginTop: 2,
	},

	// Stop card styles
	stopCard: {
		marginHorizontal: 16,
		padding: 16,
		borderRadius: 12,
	},
	stopHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	stopInfo: {
		flex: 1,
	},
	stopName: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 16,
	},
	stopDistance: {
		fontFamily: "Inter_400Regular",
		fontSize: 13,
		marginTop: 4,
	},
	aiMessageBox: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		padding: 12,
		borderRadius: 8,
		marginTop: 12,
	},
	aiMessageText: {
		fontFamily: "Inter_400Regular",
		fontSize: 13,
		flex: 1,
		lineHeight: 18,
	},
	amenitiesRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 12,
	},
	amenityBadge: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	stopActions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 16,
	},
	actionButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	actionButtonText: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 14,
		color: "#fff",
	},
	actionButtonSecondary: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		borderWidth: 1,
	},
	actionButtonSecondaryText: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 14,
	},
});
