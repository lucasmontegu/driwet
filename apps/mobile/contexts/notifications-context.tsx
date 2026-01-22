// apps/mobile/contexts/notifications-context.tsx
import React, { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import {
  useNotifications,
  useNotificationResponse,
  type NotificationData,
  type NotificationPermissionStatus,
  type WeatherAlertNotification,
  type ShelterNotification,
} from '@/hooks/use-notifications';

// ============ Types ============

interface NotificationsContextValue {
  // Token & permissions
  expoPushToken: string | null;
  permissionStatus: NotificationPermissionStatus;
  isLoading: boolean;

  // Permission actions
  requestPermissions: () => Promise<boolean>;
  hasPermission: boolean;
  needsPermission: boolean;

  // Notification state
  unreadCount: number;
  clearUnread: () => void;

  // Last notification that was tapped (for navigation)
  lastTappedNotification: NotificationData | null;
  clearLastTapped: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

// ============ Provider ============

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const router = useRouter();
  const {
    expoPushToken,
    permissionStatus,
    isLoading,
    requestPermissions: requestPerms,
  } = useNotifications();

  const [unreadCount, setUnreadCount] = useState(0);
  const [lastTappedNotification, setLastTappedNotification] = useState<NotificationData | null>(null);

  const hasPermission = permissionStatus === 'granted';
  const needsPermission = permissionStatus === 'undetermined';

  // Handle notification tap
  const handleNotificationResponse = useCallback(
    (data: NotificationData) => {
      setLastTappedNotification(data);
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Handle navigation based on notification type
      if ('type' in data) {
        switch (data.type) {
          case 'weather_alert':
            const alertData = data as WeatherAlertNotification;
            // Navigate to map centered on alert location
            if (alertData.latitude && alertData.longitude) {
              router.push({
                pathname: '/(app)/(tabs)/',
                params: {
                  lat: alertData.latitude.toString(),
                  lng: alertData.longitude.toString(),
                  alertId: alertData.alertId,
                },
              } as any);
            } else {
              router.push('/(app)/(tabs)' as any);
            }
            break;

          case 'shelter_suggestion':
            const shelterData = data as ShelterNotification;
            // Navigate to map with shelter highlighted
            router.push({
              pathname: '/(app)/(tabs)',
              params: {
                lat: shelterData.latitude.toString(),
                lng: shelterData.longitude.toString(),
                showShelters: 'true',
              },
            } as any);
            break;

          default:
            // Default: go to home
            router.push('/(app)/(tabs)' as any);
        }
      }
    },
    [router]
  );

  // Set up notification response listener
  useNotificationResponse(handleNotificationResponse);

  // Request permissions wrapper
  const requestPermissions = useCallback(async () => {
    return await requestPerms();
  }, [requestPerms]);

  // Clear unread count
  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Clear last tapped notification
  const clearLastTapped = useCallback(() => {
    setLastTappedNotification(null);
  }, []);

  // Track incoming notifications for unread count
  useEffect(() => {
    // Import dynamically to avoid circular deps
    import('expo-notifications').then((Notifications) => {
      const subscription = Notifications.addNotificationReceivedListener(() => {
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        subscription.remove();
      };
    });
  }, []);

  const value: NotificationsContextValue = {
    expoPushToken,
    permissionStatus,
    isLoading,
    requestPermissions,
    hasPermission,
    needsPermission,
    unreadCount,
    clearUnread,
    lastTappedNotification,
    clearLastTapped,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// ============ Hook ============

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
}

// Export for convenience
export { NotificationsContext };
