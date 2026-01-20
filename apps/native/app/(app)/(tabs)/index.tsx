// apps/native/app/(app)/(tabs)/index.tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useLocation } from '@/hooks/use-location';
import { useActiveAlerts } from '@/hooks/use-api';
import { MapViewComponent, type WeatherAlert } from '@/components/map-view';
import { ChatBottomSheet } from '@/components/chat-bottom-sheet';
import { AlertBanner } from '@/components/alert-banner';
import { AdBanner } from '@/components/ad-banner';
import { Icon } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';

export default function MapScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { location, isLoading: locationLoading } = useLocation();

  // Fetch alerts for current location
  const { data: alertsData } = useActiveAlerts(
    location?.latitude ?? 0,
    location?.longitude ?? 0,
    !locationLoading && location !== null
  );

  // Transform API alerts to map format
  const alerts: WeatherAlert[] = (alertsData?.alerts ?? []).map((alert) => ({
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    headline: alert.headline,
    polygon: alert.polygon,
  }));

  // Get the most severe alert for the banner
  const severityOrder = ['extreme', 'severe', 'moderate', 'minor'] as const;
  const mostSevereAlert = alerts.length > 0
    ? alerts.reduce((prev, curr) => {
        const prevIndex = severityOrder.indexOf(prev.severity);
        const currIndex = severityOrder.indexOf(curr.severity);
        return currIndex < prevIndex ? curr : prev;
      })
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              fontFamily: 'NunitoSans_700Bold',
              fontSize: 20,
              color: colors.foreground,
            }}
          >
            Advia
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="location" size={16} color={colors.mutedForeground} />
            <Text
              style={{
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.mutedForeground,
              }}
            >
              {t('map.myZone')}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Ad Banner - now below header */}
      <AdBanner />

      {/* Alert Banner (if there are active alerts) */}
      {mostSevereAlert && (
        <AlertBanner
          alert={{
            type: mostSevereAlert.type,
            severity: mostSevereAlert.severity,
          }}
        />
      )}

      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapViewComponent alerts={alerts} />
      </View>

      {/* Chat Bottom Sheet */}
      <ChatBottomSheet />
    </View>
  );
}
