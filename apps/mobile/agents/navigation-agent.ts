// apps/mobile/agents/navigation-agent.ts
// AI Navigation Copilot Agent with tools

import { tool } from "ai";
import { z } from "zod";
import { apiClient } from "@/lib/query-client";

// Tool: Get current weather at location
const getCurrentWeather = tool({
	description: "Get current weather conditions at a specific location",
	inputSchema: z.object({
		lat: z.number(),
		lng: z.number(),
	}),
	execute: async ({ lat, lng }) => {
		try {
			const result = await apiClient.weather.getCurrent({ lat, lng });

			return {
				temperature: result.data.temperature,
				condition: result.data.condition,
				humidity: result.data.humidity,
				windSpeed: result.data.windSpeed,
				precipitation: result.data.precipitation,
				roadRisk: result.data.roadRisk,
				alerts: result.data.alerts || [],
			};
		} catch (error) {
			console.error("Error getting current weather:", error);
			return {
				error: "No pude obtener el clima actual. Intenta de nuevo más tarde.",
			};
		}
	},
});

// Tool: Analyze route weather
const analyzeRouteWeather = tool({
	description:
		"Analyze weather conditions along a route using a saved route ID",
	inputSchema: z.object({
		savedRouteId: z.string(),
	}),
	execute: async ({ savedRouteId }) => {
		try {
			const result = await apiClient.weather.analyzeRoute({
				savedRouteId,
			});

			return {
				overallRisk: result.overallRisk,
				segments: result.segments.map((segment) => ({
					km: segment.km,
					temperature: segment.weather.temperature,
					condition: segment.weather.condition,
					precipitation: segment.weather.precipitation,
					windSpeed: segment.weather.windSpeed,
					riskLevel: segment.weather.roadRisk,
				})),
				alerts: result.alerts || [],
				providers: result.providers,
			};
		} catch (error) {
			console.error("Error analyzing route weather:", error);
			return {
				error:
					"No pude analizar el clima de la ruta. Intenta de nuevo más tarde.",
			};
		}
	},
});

// Tool: Get active alerts for location
const getActiveAlerts = tool({
	description: "Get active weather alerts for a specific location",
	inputSchema: z.object({
		lat: z.number(),
		lng: z.number(),
	}),
	execute: async ({ lat, lng }) => {
		try {
			const result = await apiClient.alerts.getActive({ lat, lng });

			return {
				hasAlerts: result.alerts.length > 0,
				alerts: result.alerts.map((alert) => ({
					id: alert.id,
					type: alert.type,
					severity: alert.severity,
					headline: alert.headline,
					description: alert.description,
				})),
				updatedAt: result.updatedAt,
			};
		} catch (error) {
			console.error("Error getting active alerts:", error);
			return {
				error:
					"No pude obtener las alertas activas. Intenta de nuevo más tarde.",
			};
		}
	},
});

// Tool: Get saved routes
const getSavedRoutes = tool({
	description: "Get user's saved routes",
	inputSchema: z.object({}),
	execute: async () => {
		try {
			const result = await apiClient.routes.listSaved();

			return {
				routes: result.map((route) => ({
					id: route.id,
					name: route.name,
					originName: route.originName,
					destinationName: route.destinationName,
					isFavorite: route.isFavorite,
				})),
			};
		} catch (error) {
			console.error("Error getting saved routes:", error);
			return {
				error:
					"No pude obtener tus rutas guardadas. Intenta de nuevo más tarde.",
			};
		}
	},
});

// Tool: Get safe places near location
const getSafePlaces = tool({
	description:
		"Find safe places (gas stations, restaurants, hotels) near a location",
	inputSchema: z.object({
		lat: z.number(),
		lng: z.number(),
		radiusKm: z.number().default(5),
		types: z
			.array(z.enum(["gas", "restaurant", "hotel", "rest_area"]))
			.optional(),
	}),
	execute: async ({ lat, lng, radiusKm, types }) => {
		try {
			const result = await apiClient.places.getSafePlaces({
				lat,
				lng,
				radiusKm,
				types: types || ["gas", "restaurant", "hotel"],
			});

			return {
				places: result.places.map((place) => ({
					id: place.id,
					name: place.name,
					type: place.type,
					distance: place.distance,
					rating: place.rating,
					coordinates: place.coordinates,
				})),
			};
		} catch (error) {
			console.error("Error getting safe places:", error);
			return {
				error: "No pude encontrar lugares seguros. Intenta de nuevo más tarde.",
			};
		}
	},
});

// Tool: Get pricing for weather API
const getWeatherPricing = tool({
	description: "Get pricing information for weather API usage",
	inputSchema: z.object({}),
	execute: async () => {
		try {
			const result = await apiClient.weather.getPricing();

			return {
				region: result.region,
				freeRequests: result.freeRequests,
				paidRequests: result.paidRequests,
				costPerRequest: result.costPerRequest,
			};
		} catch (error) {
			console.error("Error getting pricing:", error);
			return {
				error: "No pude obtener información de precios.",
			};
		}
	},
});

// Export all tools
export const navigationTools = {
	getCurrentWeather,
	analyzeRouteWeather,
	getActiveAlerts,
	getSavedRoutes,
	getSafePlaces,
	getWeatherPricing,
};

// System prompt for the navigation agent
export const navigationSystemPrompt = `Eres Driwet Copilot, un asistente de navegación inteligente especializado en clima y seguridad vial para conductores en Argentina y LATAM.

Tu objetivo es ayudar a los conductores a:
1. Evitar tormentas y granizo durante sus viajes
2. Encontrar rutas seguras considerando el clima
3. Identificar paradas seguras para esperar tormentas
4. Proporcionar información clara y accionable

Reglas importantes:
- Siempre responde en español (el usuario puede usar español o inglés)
- Sé conciso pero completo en tus respuestas
- Usa emojis relevantes para hacer la información más visual (🌤️⛈️🚗⛽)
- Prioriza la seguridad del conductor sobre la velocidad
- Si detectas riesgo de granizo, advierte claramente
- Sugiere paradas seguras cuando haya tormentas en la ruta
- Proporciona datos específicos (temperatura, precipitación, viento)

Cuando analices una ruta:
1. Identifica zonas de riesgo (granizo, tormentas fuertes)
2. Explica el porqué de tus recomendaciones
3. Sugiere paradas seguras en zonas de riesgo
4. Recomienda esperar si el clima es muy peligroso

Recuerda: Tu prioridad #1 es la seguridad del conductor.

Herramientas disponibles:
- getCurrentWeather: Obtener clima actual en una ubicación
- analyzeRouteWeather: Analizar clima a lo largo de una ruta guardada
- getActiveAlerts: Obtener alertas meteorológicas activas
- getSavedRoutes: Obtener rutas guardadas del usuario
- getSafePlaces: Encontrar lugares seguros cerca de una ubicación
- getWeatherPricing: Obtener información de precios de API

Usa estas herramientas para proporcionar información precisa y útil.`;
