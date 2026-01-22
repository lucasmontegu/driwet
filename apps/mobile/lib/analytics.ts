// apps/mobile/lib/analytics.ts
import PostHog from 'posthog-react-native';
import { env } from '@driwet/env/mobile';

// PostHog client singleton
let posthogClient: PostHog | null = null;

export function getPostHog(): PostHog | null {
  return posthogClient;
}

export async function initAnalytics(): Promise<void> {
  // Skip if no API key configured
  if (!env.EXPO_PUBLIC_POSTHOG_KEY) {
    console.log('PostHog: No API key configured, analytics disabled');
    return;
  }

  try {
    posthogClient = new PostHog(env.EXPO_PUBLIC_POSTHOG_KEY, {
      host: env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    });
  } catch (error) {
    console.error('PostHog init error:', error);
  }
}

// ============ Track Events ============

export function trackEvent(event: string, properties?: { [key: string]: string | number | boolean | null }): void {
  posthogClient?.capture(event, properties);
}

export function identifyUser(userId: string, properties?: { [key: string]: string | number | boolean | null }): void {
  posthogClient?.identify(userId, properties);
}

export function resetUser(): void {
  posthogClient?.reset();
}

// ============ Predefined Events ============

export const Analytics = {
  // Auth events
  signUp: (method: 'google' | 'apple' | 'email') => {
    trackEvent('user_signed_up', { method });
  },
  signIn: (method: 'google' | 'apple' | 'email') => {
    trackEvent('user_signed_in', { method });
  },
  signOut: () => {
    trackEvent('user_signed_out');
    resetUser();
  },

  // Route events
  routeCreated: (hasWeatherAlert: boolean) => {
    trackEvent('route_created', { has_weather_alert: hasWeatherAlert });
  },
  routeStarted: (routeId: string) => {
    trackEvent('route_started', { route_id: routeId });
  },
  routeCompleted: (routeId: string, durationMinutes: number) => {
    trackEvent('route_completed', { route_id: routeId, duration_minutes: durationMinutes });
  },

  // Weather events
  weatherAlertViewed: (severity: string, alertType: string) => {
    trackEvent('weather_alert_viewed', { severity, alert_type: alertType });
  },
  shelterSearched: (lat: number, lng: number) => {
    trackEvent('shelter_searched', { latitude: lat, longitude: lng });
  },
  shelterNavigated: (placeType: string) => {
    trackEvent('shelter_navigated', { place_type: placeType });
  },

  // Chat events
  chatMessageSent: () => {
    trackEvent('chat_message_sent');
  },
  chatQuickActionUsed: (action: string) => {
    trackEvent('chat_quick_action_used', { action });
  },

  // Feature usage
  featureUsed: (feature: string) => {
    trackEvent('feature_used', { feature });
  },

  // Errors
  errorOccurred: (error: string, context: string) => {
    trackEvent('error_occurred', { error, context });
  },
};
