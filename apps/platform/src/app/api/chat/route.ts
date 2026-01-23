import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { getAlertsByPoint } from "@/lib/weather";
import { findSafeStops } from "@/lib/places";

export const maxDuration = 30;

// Tool parameter schemas
const getWeatherAlertsSchema = z.object({
  latitude: z.number().describe("Latitud de la ubicación"),
  longitude: z.number().describe("Longitud de la ubicación"),
  locationName: z
    .string()
    .optional()
    .describe("Nombre de la ubicación para referencia"),
});

const showAlertOnMapSchema = z.object({
  alertId: z.string().describe("ID de la alerta a mostrar"),
  alertType: z.string().describe("Tipo de alerta"),
  severity: z.string().describe("Severidad de la alerta"),
  centerLat: z.number().describe("Latitud del centro de la alerta"),
  centerLon: z.number().describe("Longitud del centro de la alerta"),
  zoomLevel: z.number().optional().default(10).describe("Nivel de zoom del mapa"),
});

const analyzeRouteSchema = z.object({
  startLat: z.number().describe("Latitud del punto de inicio"),
  startLon: z.number().describe("Longitud del punto de inicio"),
  endLat: z.number().describe("Latitud del destino"),
  endLon: z.number().describe("Longitud del destino"),
  startName: z.string().optional().describe("Nombre del origen"),
  endName: z.string().optional().describe("Nombre del destino"),
});

const getUserLocationSchema = z.object({
  reason: z.string().describe("Razón por la cual necesitas la ubicación"),
});

const showRouteWeatherSchema = z.object({
  originLat: z.number().describe("Latitud del origen"),
  originLon: z.number().describe("Longitud del origen"),
  destLat: z.number().describe("Latitud del destino"),
  destLon: z.number().describe("Longitud del destino"),
  originName: z.string().optional().describe("Nombre del origen"),
  destName: z.string().optional().describe("Nombre del destino"),
});

const findSafePlacesSchema = z.object({
  latitude: z.number().describe("Latitud de la ubicación actual"),
  longitude: z.number().describe("Longitud de la ubicación actual"),
  radiusKm: z.number().optional().default(20).describe("Radio de búsqueda en km"),
  urgency: z.enum(["low", "medium", "high"]).optional().default("medium")
    .describe("Urgencia de la búsqueda - high para tormentas inminentes"),
});

const navigateToShelterSchema = z.object({
  placeName: z.string().describe("Nombre del lugar de refugio"),
  latitude: z.number().describe("Latitud del refugio"),
  longitude: z.number().describe("Longitud del refugio"),
  placeType: z.string().describe("Tipo de lugar: gas_station, rest_area, town"),
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: `Eres Driwet, un asistente de alertas meteorológicas. Tu objetivo es mantener a los usuarios seguros informándoles sobre condiciones climáticas peligrosas.

Capacidades:
- Puedes obtener alertas meteorológicas para cualquier ubicación usando getWeatherAlerts
- Puedes mostrar alertas en el mapa usando showAlertOnMap
- Puedes analizar rutas para seguridad usando analyzeRoute
- Puedes mostrar el clima en una ruta con colores de riesgo usando showRouteWeather
- Puedes buscar refugios cercanos (estaciones de servicio, áreas de descanso, localidades) usando findSafePlaces
- Puedes iniciar navegación a un refugio usando navigateToShelter

Comportamiento:
- Responde siempre en español a menos que el usuario escriba en otro idioma
- Sé conciso pero informativo sobre las alertas
- Prioriza la seguridad del usuario
- Si hay alertas severas o extremas, enfatiza la urgencia y sugiere refugios
- Cuando analices una ruta, muestra automáticamente el clima en el mapa
- Si detectas peligro, ofrece buscar refugios cercanos

Formato:
- Usa emojis relacionados al clima para hacer los mensajes más visuales
- Para alertas extremas usa ⚠️ o 🚨
- Para información general usa 🌤️ o ℹ️
- Para refugios usa 🛡️ o ⛽
- Para rutas seguras usa ✅
- Para rutas con riesgo usa 🟠 o 🔴`,
    messages,
    tools: {
      getWeatherAlerts: tool({
        description:
          "Obtiene las alertas meteorológicas activas para una ubicación específica. Usa esta herramienta cuando el usuario pregunte sobre el clima o alertas en un lugar.",
        parameters: getWeatherAlertsSchema,
        execute: async (args) => {
          const { latitude, longitude, locationName } = args;
          try {
            const alerts = await getAlertsByPoint(latitude, longitude);

            if (alerts.length === 0) {
              return {
                success: true,
                location: locationName || `${latitude}, ${longitude}`,
                alertCount: 0,
                alerts: [],
                message: "No hay alertas activas para esta ubicación",
              };
            }

            return {
              success: true,
              location: locationName || `${latitude}, ${longitude}`,
              alertCount: alerts.length,
              alerts: alerts.map((alert) => ({
                id: alert.id,
                type: alert.alertType,
                severity: alert.severity,
                title: alert.title,
                description: alert.description,
                instructions: alert.instructions,
                expiresAt: alert.expiresAt?.toISOString(),
                hasPolygon: !!alert.polygon,
              })),
            };
          } catch {
            return {
              success: false,
              error: "No se pudieron obtener las alertas. Intenta de nuevo.",
            };
          }
        },
      }),

      showAlertOnMap: tool({
        description:
          "Muestra una alerta específica en el mapa del usuario. Usa esta herramienta después de obtener alertas para visualizarlas.",
        parameters: showAlertOnMapSchema,
        execute: async (args) => {
          const { alertId, alertType, severity, centerLat, centerLon, zoomLevel } = args;
          return {
            action: "showAlert",
            alertId,
            alertType,
            severity,
            center: { latitude: centerLat, longitude: centerLon },
            zoom: zoomLevel,
          };
        },
      }),

      analyzeRoute: tool({
        description:
          "Analiza una ruta para determinar si es segura considerando las alertas meteorológicas actuales. Usa esta herramienta cuando el usuario pregunte sobre viajar a algún lugar.",
        parameters: analyzeRouteSchema,
        execute: async (args) => {
          const { startLat, startLon, endLat, endLon, startName, endName } = args;
          const midLat = (startLat + endLat) / 2;
          const midLon = (startLon + endLon) / 2;

          const [startAlerts, midAlerts, endAlerts] = await Promise.all([
            getAlertsByPoint(startLat, startLon),
            getAlertsByPoint(midLat, midLon),
            getAlertsByPoint(endLat, endLon),
          ]);

          const allAlerts = [...startAlerts, ...midAlerts, ...endAlerts];
          const uniqueAlerts = allAlerts.filter(
            (alert, index, self) =>
              index === self.findIndex((a) => a.externalId === alert.externalId)
          );

          const severeAlerts = uniqueAlerts.filter(
            (a) => a.severity === "extreme" || a.severity === "severe"
          );

          const isSafe = severeAlerts.length === 0;

          return {
            route: {
              start: startName || `${startLat}, ${startLon}`,
              end: endName || `${endLat}, ${endLon}`,
            },
            isSafe,
            riskLevel:
              severeAlerts.length > 0
                ? "high"
                : uniqueAlerts.length > 0
                  ? "moderate"
                  : "low",
            totalAlerts: uniqueAlerts.length,
            severeAlerts: severeAlerts.length,
            alerts: uniqueAlerts.map((a) => ({
              type: a.alertType,
              severity: a.severity,
              title: a.title,
            })),
            recommendation: isSafe
              ? "La ruta parece segura. Mantente atento a las condiciones."
              : "Se recomienda posponer el viaje o buscar una ruta alternativa.",
          };
        },
      }),

      getUserLocation: tool({
        description:
          "Solicita la ubicación actual del usuario. Usa esto cuando necesites saber dónde está el usuario.",
        parameters: getUserLocationSchema,
        execute: async (args) => {
          return {
            action: "requestLocation",
            reason: args.reason,
          };
        },
      }),

      showRouteWeather: tool({
        description:
          "Muestra el clima a lo largo de una ruta en el mapa con colores de riesgo (verde=seguro, amarillo=precaución, naranja=riesgo, rojo=peligro). Usa esto después de analizar una ruta para visualizarla.",
        parameters: showRouteWeatherSchema,
        execute: async (args) => {
          const { originLat, originLon, destLat, destLon, originName, destName } = args;
          return {
            action: "showRouteWeather",
            origin: {
              lat: originLat,
              lng: originLon,
              name: originName,
            },
            destination: {
              lat: destLat,
              lng: destLon,
              name: destName,
            },
          };
        },
      }),

      findSafePlaces: tool({
        description:
          "Busca refugios cercanos como estaciones de servicio, áreas de descanso y localidades. Usa esto cuando el usuario necesite refugiarse de una tormenta.",
        parameters: findSafePlacesSchema,
        execute: async (args) => {
          const { latitude, longitude, radiusKm, urgency } = args;
          try {
            const stops = await findSafeStops(latitude, longitude, radiusKm, urgency);

            if (stops.length === 0) {
              return {
                success: true,
                action: "showSafeStops",
                stops: [],
                message: "No encontré refugios cercanos. Considera detenerte en un lugar seguro fuera de la carretera.",
              };
            }

            return {
              success: true,
              action: "showSafeStops",
              stops: stops.map((stop) => ({
                id: stop.id,
                name: stop.name,
                type: stop.type,
                lat: stop.latitude,
                lng: stop.longitude,
                distanceKm: stop.distanceKm,
                address: stop.address,
                reason: stop.reason,
              })),
              message: urgency === "high"
                ? `Encontré ${stops.length} refugios cercanos de emergencia`
                : `Encontré ${stops.length} lugares seguros en tu área`,
            };
          } catch (error) {
            console.error("Error finding safe places:", error);
            return {
              success: false,
              action: "showSafeStops",
              stops: [],
              message: "Error buscando refugios. Intenta detenerte en un lugar seguro.",
            };
          }
        },
      }),

      navigateToShelter: tool({
        description:
          "Inicia la navegación hacia un refugio usando Waze o Google Maps. Usa esto cuando el usuario elija un refugio.",
        parameters: navigateToShelterSchema,
        execute: async (args) => {
          const { placeName, latitude, longitude, placeType } = args;
          return {
            action: "navigateToShelter",
            shelter: {
              name: placeName,
              lat: latitude,
              lng: longitude,
              type: placeType,
            },
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
