// apps/native/hooks/use-api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/query-client';

// ============ User Hooks ============

export function useUserProfile() {
  return useQuery(api.user.getProfile.queryOptions());
}

export function useUserStats() {
  return useQuery(api.user.getStats.queryOptions());
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { theme?: 'light' | 'dark' | 'auto'; language?: 'en' | 'es'; notificationsEnabled?: boolean }) =>
      api.user.updateSettings.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// ============ Alerts Hooks ============

export function useActiveAlerts(latitude: number, longitude: number, enabled = true) {
  return useQuery({
    ...api.alerts.getActive.queryOptions({ input: { latitude, longitude } }),
    enabled: enabled && latitude !== 0 && longitude !== 0,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useAlertHistory() {
  return useQuery(api.alerts.getHistory.queryOptions());
}

// ============ Weather Hooks ============

export function useCurrentWeather(latitude: number, longitude: number, enabled = true) {
  return useQuery({
    ...api.weather.getCurrent.queryOptions({ input: { lat: latitude, lng: longitude } }),
    enabled: enabled && latitude !== 0 && longitude !== 0,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

// ============ Locations Hooks ============

export function useLocations() {
  return useQuery(api.locations.list.queryOptions());
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; latitude: number; longitude: number; isPrimary?: boolean; notifyAlerts?: boolean }) =>
      api.locations.create.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; name?: string; latitude?: number; longitude?: number; notifyAlerts?: boolean }) =>
      api.locations.update.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.locations.delete.call({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useSetPrimaryLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.locations.setPrimary.call({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

// ============ Chat Hooks ============

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatLocation = {
  latitude: number;
  longitude: number;
};

// ============ Routes Hooks ============

export function useSavedRoutes() {
  return useQuery(api.routes.listSaved.queryOptions());
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      name: string;
      originName: string;
      originLatitude: number;
      originLongitude: number;
      destinationName: string;
      destinationLatitude: number;
      destinationLongitude: number;
      isFavorite?: boolean;
    }) => api.routes.createSaved.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.routes.deleteSaved.call({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useToggleRouteFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.routes.toggleFavorite.call({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useTripHistory(limit = 20, offset = 0) {
  return useQuery(api.routes.listHistory.queryOptions({ limit, offset }));
}

export function useRecordTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      savedRouteId?: string;
      originName: string;
      originLatitude: number;
      originLongitude: number;
      destinationName: string;
      destinationLatitude: number;
      destinationLongitude: number;
      distanceKm?: number;
      durationMinutes?: number;
      weatherCondition?: 'clear' | 'rain' | 'storm' | 'snow' | 'fog';
      outcome?: 'completed' | 'avoided_storm' | 'encountered_weather' | 'cancelled';
      alertsAvoidedCount?: number;
      estimatedSavings?: number;
    }) => api.routes.recordTrip.call(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useRouteStats() {
  return useQuery(api.routes.getStats.queryOptions());
}

// ============ Chat Hooks ============

export function useSendChatMessage() {
  return useMutation({
    mutationFn: async (params: {
      message: string;
      history?: ChatMessage[];
      location?: ChatLocation;
      onChunk?: (chunk: string) => void;
    }) => {
      // Use the raw oRPC client for streaming (not TanStack Query utils)
      const { apiClient } = await import('@/lib/query-client');
      
      const iterator = await apiClient.chat.sendMessage({
        message: params.message,
        history: params.history,
        location: params.location,
      });

      let fullContent = '';

      // Consume the event iterator from streamToEventIterator
      for await (const chunk of iterator) {
        // Each chunk is a text part from the AI stream
        if (typeof chunk === 'string') {
          fullContent += chunk;
          params.onChunk?.(fullContent);
        }
      }

      return fullContent;
    },
  });
}
