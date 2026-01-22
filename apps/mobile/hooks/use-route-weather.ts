// apps/mobile/hooks/use-route-weather.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/query-client';

// ============ Route Weather Types ============

export type RoadRisk = 'low' | 'moderate' | 'high' | 'extreme';

export type RouteWeatherSegment = {
  km: number;
  lat: number;
  lng: number;
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windGust: number;
    visibility: number;
    precipitationIntensity: number;
    precipitationType: 'none' | 'rain' | 'snow' | 'hail';
    weatherCode: number;
    uvIndex: number;
    cloudCover: number;
    roadRisk: RoadRisk;
  };
};

export type RouteWeatherAnalysis = {
  id: string;
  segments: RouteWeatherSegment[];
  overallRisk: RoadRisk;
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    description: string;
  }>;
  validUntil: string;
  analyzedAt: string;
};

// ============ Route Weather Hooks ============

/**
 * Analyze weather conditions along a route between two points.
 * Returns segments with risk levels for visualization on the map.
 */
export function useAnalyzeRouteWeather() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
      polyline?: string;
      savedRouteId?: string;
    }) => {
      const result = await api.weather.analyzeRoute.call({
        polyline: input.polyline || '',
        origin: input.origin,
        destination: input.destination,
        savedRouteId: input.savedRouteId,
      });
      return result as RouteWeatherAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
    },
  });
}

/**
 * Get real-time weather updates during an active trip.
 * Returns current conditions, weather ahead, and alerts.
 */
export function useRouteWeatherUpdates(
  currentLat: number,
  currentLng: number,
  destinationLat: number,
  destinationLng: number,
  enabled = true
) {
  return useQuery({
    ...api.weather.getRouteUpdates.queryOptions({
      input: {
        currentLat,
        currentLng,
        destinationLat,
        destinationLng,
        hasActiveAlerts: false,
      },
    }),
    enabled: enabled && currentLat !== 0 && currentLng !== 0,
    refetchInterval: 1000 * 60 * 5, // 5 minutes default
  });
}

// ============ Risk Color Utils ============

export const RISK_COLORS: Record<RoadRisk, string> = {
  low: '#22c55e',      // green-500
  moderate: '#eab308', // yellow-500
  high: '#f97316',     // orange-500
  extreme: '#dc2626',  // red-600
};

export const RISK_COLORS_TRANSLUCENT: Record<RoadRisk, string> = {
  low: 'rgba(34, 197, 94, 0.6)',
  moderate: 'rgba(234, 179, 8, 0.6)',
  high: 'rgba(249, 115, 22, 0.6)',
  extreme: 'rgba(220, 38, 38, 0.6)',
};

/**
 * Get color for a road risk level
 */
export function getRiskColor(risk: RoadRisk, translucent = false): string {
  return translucent ? RISK_COLORS_TRANSLUCENT[risk] : RISK_COLORS[risk];
}

/**
 * Get human-readable description for a risk level
 */
export function getRiskDescription(risk: RoadRisk): string {
  const descriptions: Record<RoadRisk, string> = {
    low: 'Condiciones seguras',
    moderate: 'Precaución recomendada',
    high: 'Condiciones difíciles',
    extreme: 'Peligro - evitar si es posible',
  };
  return descriptions[risk];
}
