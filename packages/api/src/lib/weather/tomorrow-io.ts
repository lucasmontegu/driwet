import { env } from "@driwet/env/server";
import type {
	IWeatherProvider,
	ProviderConfig,
	RouteAnalysisResponse,
	WeatherData,
	WeatherEvent,
	WeatherTimelinesResponse,
} from "./types";
import {
	calculateOverallRisk,
	calculateRoadRisk,
	checkApiLimit,
	PRECIPITATION_MAP,
	trackApiUsage,
} from "./utils";

const TOMORROW_API_BASE = "https://api.tomorrow.io/v4";

// Tomorrow.io free tier: 500 calls/day
const DAILY_LIMIT = 500;

// Parse Tomorrow.io response to WeatherData
function parseTomorrowResponse(
	values: Record<string, number | undefined>,
): WeatherData {
	const weatherCode = values.weatherCode ?? 1000;
	const precipIntensity = values.precipitationIntensity ?? 0;
	const precipitationType =
		PRECIPITATION_MAP[weatherCode] || (precipIntensity > 0 ? "rain" : "none");

	const weatherData: WeatherData = {
		temperature: values.temperature ?? 0,
		humidity: values.humidity ?? 0,
		windSpeed: values.windSpeed ?? 0,
		windGust: values.windGust ?? 0,
		visibility: values.visibility ?? 10,
		precipitationIntensity: precipIntensity,
		precipitationType,
		weatherCode: values.weatherCode ?? 1000,
		uvIndex: values.uvIndex ?? 0,
		cloudCover: values.cloudCover ?? 0,
		roadRisk: "low",
	};

	weatherData.roadRisk = calculateRoadRisk(weatherData);
	return weatherData;
}

// Tomorrow.io provider implementation
class TomorrowIoProvider implements IWeatherProvider {
	readonly name = "tomorrow" as const;
	readonly config: ProviderConfig = {
		name: "tomorrow",
		dailyLimit: DAILY_LIMIT,
		priority: 1, // Primary provider
		supportedFeatures: {
			current: true,
			forecast: true,
			alerts: true, // Has events endpoint
			historical: false,
		},
	};

	async isAvailable(): Promise<boolean> {
		const { exceeded } = await checkApiLimit("tomorrow", DAILY_LIMIT);
		return !exceeded;
	}

	async getRemainingCalls(): Promise<number> {
		const { remaining } = await checkApiLimit("tomorrow", DAILY_LIMIT);
		return remaining;
	}

	async getTimelines(
		lat: number,
		lng: number,
		options: { hours?: number } = {},
	): Promise<WeatherTimelinesResponse> {
		const { exceeded } = await checkApiLimit("tomorrow", DAILY_LIMIT);
		if (exceeded) {
			throw new Error("Tomorrow.io daily API limit exceeded");
		}

		const hours = options.hours ?? 12;
		const fields = [
			"temperature",
			"humidity",
			"windSpeed",
			"windGust",
			"visibility",
			"precipitationIntensity",
			"weatherCode",
			"uvIndex",
			"cloudCover",
		];

		const response = await fetch(`${TOMORROW_API_BASE}/timelines`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				apikey: env.TOMORROW_IO_API_KEY,
			},
			body: JSON.stringify({
				location: [lat, lng],
				fields,
				timesteps: ["current", "1h"],
				endTime: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
				units: "metric",
			}),
		});

		await trackApiUsage("tomorrow", "timelines");

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Tomorrow.io API error: ${error}`);
		}

		const data = (await response.json()) as {
			data?: { timelines?: unknown[] };
		};
		const timelines = (data.data?.timelines || []) as Array<{
			timestep: string;
			intervals?: Array<{
				startTime: string;
				values: Record<string, number | undefined>;
			}>;
		}>;

		// Parse current weather
		const currentTimeline = timelines.find((t) => t.timestep === "current");
		const currentValues = currentTimeline?.intervals?.[0]?.values || {};
		const current = parseTomorrowResponse(currentValues);

		// Parse hourly forecast
		const hourlyTimeline = timelines.find((t) => t.timestep === "1h");
		const hourly = (hourlyTimeline?.intervals || []).map((interval) => ({
			time: interval.startTime,
			weather: parseTomorrowResponse(interval.values),
		}));

		return { current, hourly };
	}

	async getEvents(
		lat: number,
		lng: number,
		_radiusKm = 50,
	): Promise<WeatherEvent[]> {
		const { exceeded } = await checkApiLimit("tomorrow", DAILY_LIMIT);
		if (exceeded) {
			throw new Error("Tomorrow.io daily API limit exceeded");
		}

		// Get forecast data and derive alerts from severe conditions
		// This is more efficient than the Events API which requires pre-configured insights
		try {
			const { hourly } = await this.getTimelines(lat, lng, { hours: 24 });
			return this.deriveEventsFromForecast(hourly);
		} catch (error) {
			console.error("Failed to derive events from forecast:", error);
			return [];
		}
	}

	// Derive weather events/alerts from forecast data
	private deriveEventsFromForecast(
		hourly: Array<{ time: string; weather: WeatherData }>,
	): WeatherEvent[] {
		const events: WeatherEvent[] = [];

		// Group consecutive hours with severe conditions
		let currentEvent: {
			type: string;
			severity: string;
			title: string;
			description: string;
			startTime: string;
			endTime: string;
		} | null = null;

		for (const { time, weather } of hourly) {
			const severeCondition = this.detectSevereCondition(weather);

			if (severeCondition) {
				if (currentEvent && currentEvent.type === severeCondition.type) {
					// Extend current event
					currentEvent.endTime = time;
				} else {
					// Save previous event if exists
					if (currentEvent) {
						events.push({
							id: `${currentEvent.type}-${currentEvent.startTime}`,
							...currentEvent,
						});
					}
					// Start new event
					currentEvent = {
						type: severeCondition.type,
						severity: severeCondition.severity,
						title: severeCondition.title,
						description: severeCondition.description,
						startTime: time,
						endTime: time,
					};
				}
			} else if (currentEvent) {
				// End of severe condition period
				events.push({
					id: `${currentEvent.type}-${currentEvent.startTime}`,
					...currentEvent,
				});
				currentEvent = null;
			}
		}

		// Don't forget last event
		if (currentEvent) {
			events.push({
				id: `${currentEvent.type}-${currentEvent.startTime}`,
				...currentEvent,
			});
		}

		return events;
	}

	private detectSevereCondition(weather: WeatherData): {
		type: string;
		severity: string;
		title: string;
		description: string;
	} | null {
		const code = weather.weatherCode ?? 1000;

		// Thunderstorm with hail (8xxx codes)
		if (code >= 8000) {
			return {
				type: "thunderstorm",
				severity: code >= 8001 ? "severe" : "moderate",
				title: "Thunderstorm Alert",
				description:
					"Thunderstorm conditions expected. Seek shelter if driving.",
			};
		}

		// Heavy precipitation (4xxx codes for rain, 5xxx for snow)
		if (weather.precipitationIntensity > 10) {
			return {
				type: "heavy_precipitation",
				severity: weather.precipitationIntensity > 20 ? "severe" : "moderate",
				title:
					weather.precipitationType === "snow"
						? "Heavy Snow Alert"
						: "Heavy Rain Alert",
				description: `Heavy ${weather.precipitationType} expected. Reduced visibility and road hazards likely.`,
			};
		}

		// High winds
		if ((weather.windGust ?? 0) > 80 || weather.windSpeed > 60) {
			const gust = weather.windGust ?? weather.windSpeed;
			return {
				type: "wind",
				severity: gust > 100 ? "severe" : "moderate",
				title: "High Wind Alert",
				description: `Wind gusts up to ${Math.round(gust)} km/h expected. Exercise caution.`,
			};
		}

		// Poor visibility
		if (weather.visibility < 1) {
			return {
				type: "visibility",
				severity: weather.visibility < 0.5 ? "severe" : "moderate",
				title: "Low Visibility Alert",
				description: `Visibility reduced to ${weather.visibility} km. Drive with caution.`,
			};
		}

		// Freezing conditions with precipitation
		if (weather.temperature < 0 && weather.precipitationIntensity > 0) {
			return {
				type: "ice",
				severity: "moderate",
				title: "Freezing Conditions Alert",
				description:
					"Freezing precipitation possible. Watch for icy road surfaces.",
			};
		}

		return null;
	}

	async analyzeRoute(
		points: Array<{ lat: number; lng: number; km: number }>,
	): Promise<RouteAnalysisResponse> {
		const { exceeded, remaining } = await checkApiLimit(
			"tomorrow",
			DAILY_LIMIT,
		);
		if (exceeded) {
			throw new Error("Tomorrow.io daily API limit exceeded");
		}

		// Limit points to avoid excessive API usage
		const maxPoints = Math.min(points.length, remaining, 10);
		const step = Math.ceil(points.length / maxPoints);
		const sampledPoints = points.filter((_, i) => i % step === 0);

		const segments: Array<{
			km: number;
			lat: number;
			lng: number;
			weather: WeatherData;
		}> = [];

		// Fetch weather for each sampled point
		for (const point of sampledPoints) {
			try {
				const { current } = await this.getTimelines(point.lat, point.lng, {
					hours: 1,
				});
				segments.push({
					km: point.km,
					lat: point.lat,
					lng: point.lng,
					weather: current,
				});
			} catch (error) {
				console.error(
					`Tomorrow.io: Failed to get weather for point ${point.km}km:`,
					error,
				);
			}
		}

		const overallRisk = calculateOverallRisk(segments);
		return { segments, overallRisk };
	}
}

// Export singleton instance
export const tomorrowIoProvider = new TomorrowIoProvider();

// Export for testing and backwards compatibility
export { TomorrowIoProvider, parseTomorrowResponse };

// Legacy exports for backwards compatibility
export {
	calculateRoadRisk,
	checkApiLimit as checkTomorrowApiLimit,
	getCacheTTL,
} from "./utils";
export const tomorrowClient = {
	getTimelines: (lat: number, lng: number, options?: { hours?: number }) =>
		tomorrowIoProvider.getTimelines(lat, lng, options),
	getEvents: (lat: number, lng: number, radiusKm?: number) =>
		tomorrowIoProvider.getEvents(lat, lng, radiusKm),
	analyzeRoute: (points: Array<{ lat: number; lng: number; km: number }>) =>
		tomorrowIoProvider.analyzeRoute(points),
};
