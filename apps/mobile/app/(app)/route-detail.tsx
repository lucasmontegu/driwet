// apps/mobile/app/(app)/route-detail.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Icon } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';
import { useSavedRoute, useDeleteRoute, useRecordTrip } from '@/hooks/use-api';
import { useAnalyzeRouteWeather, RISK_COLORS, getRiskDescription } from '@/hooks/use-route-weather';
import { MapViewComponent } from '@/components/map-view';
import { RouteRiskBadge } from '@/components/route-risk-badge';

export default function RouteDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: route, isLoading: routeLoading } = useSavedRoute(id);
  const deleteRoute = useDeleteRoute();
  const recordTrip = useRecordTrip();
  const analyzeWeather = useAnalyzeRouteWeather();

  const [showNavigationOptions, setShowNavigationOptions] = useState(false);

  // Analyze weather when route loads
  useEffect(() => {
    if (route && !analyzeWeather.data && !analyzeWeather.isPending) {
      analyzeWeather.mutate({
        origin: {
          lat: parseFloat(route.originLatitude),
          lng: parseFloat(route.originLongitude),
        },
        destination: {
          lat: parseFloat(route.destinationLatitude),
          lng: parseFloat(route.destinationLongitude),
        },
        savedRouteId: route.id,
      });
    }
  }, [route, analyzeWeather]);

  const handleDelete = () => {
    Alert.alert(
      t('common.delete'),
      t('locations.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoute.mutateAsync(id);
              router.back();
            } catch {
              Alert.alert(t('common.error'), t('common.retry'));
            }
          },
        },
      ]
    );
  };

  const handleStartTrip = () => {
    setShowNavigationOptions(true);
  };

  const openNavigation = async (app: 'waze' | 'google' | 'apple') => {
    if (!route) return;

    const destLat = parseFloat(route.destinationLatitude);
    const destLng = parseFloat(route.destinationLongitude);

    let url = '';
    switch (app) {
      case 'waze':
        url = `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`;
        break;
      case 'google':
        url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
        break;
      case 'apple':
        url = `http://maps.apple.com/?daddr=${destLat},${destLng}&dirflg=d`;
        break;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      // Record the trip start
      recordTrip.mutate({
        savedRouteId: route.id,
        originName: route.originName,
        originLatitude: parseFloat(route.originLatitude),
        originLongitude: parseFloat(route.originLongitude),
        destinationName: route.destinationName,
        destinationLatitude: destLat,
        destinationLongitude: destLng,
        weatherCondition: analyzeWeather.data?.overallRisk === 'extreme' ? 'storm' : 'clear',
        outcome: 'completed',
      });

      Linking.openURL(url);
      setShowNavigationOptions(false);
    }
  };

  const handleRefreshWeather = () => {
    if (route) {
      analyzeWeather.mutate({
        origin: {
          lat: parseFloat(route.originLatitude),
          lng: parseFloat(route.originLongitude),
        },
        destination: {
          lat: parseFloat(route.destinationLatitude),
          lng: parseFloat(route.destinationLongitude),
        },
        savedRouteId: route.id,
      });
    }
  };

  const destination = useMemo(() => {
    if (!route) return undefined;
    return {
      latitude: parseFloat(route.destinationLatitude),
      longitude: parseFloat(route.destinationLongitude),
    };
  }, [route]);

  if (routeLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!route) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Icon name="route" size={48} color={colors.mutedForeground} />
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              fontSize: 16,
              color: colors.mutedForeground,
              marginTop: 16,
            }}
          >
            {t('routes.noResults')}
          </Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ fontFamily: 'NunitoSans_600SemiBold', color: colors.primary }}>
              {t('auth.back')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Icon name="arrowLeft" size={24} color={colors.foreground} />
        </Pressable>
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 20,
            color: colors.foreground,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {route.name}
        </Text>
        <Pressable onPress={handleDelete} style={{ padding: 4 }}>
          <Icon name="trash" size={20} color={colors.destructive} />
        </Pressable>
      </View>

      {/* Map with weather visualization */}
      <View style={{ height: 300 }}>
        <MapViewComponent
          routeSegments={analyzeWeather.data?.segments ?? []}
          showRouteIcons={true}
          destination={destination}
        />

        {/* Weather loading overlay */}
        {analyzeWeather.isPending && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#fff" />
            <Text
              style={{
                fontFamily: 'NunitoSans_400Regular',
                color: '#fff',
                marginTop: 12,
              }}
            >
              {t('routes.analyzing')}
            </Text>
          </View>
        )}

        {/* Risk badge */}
        {analyzeWeather.data && (
          <View style={{ position: 'absolute', top: 16, left: 16 }}>
            <RouteRiskBadge risk={analyzeWeather.data.overallRisk} />
          </View>
        )}
      </View>

      {/* Route info */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Origin → Destination */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.primary,
                marginRight: 12,
              }}
            />
            <Text
              style={{
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.foreground,
                flex: 1,
              }}
            >
              {route.originName}
            </Text>
          </View>
          <View
            style={{
              width: 2,
              height: 20,
              backgroundColor: colors.border,
              marginLeft: 5,
              marginBottom: 12,
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.destructive,
                marginRight: 12,
              }}
            />
            <Text
              style={{
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.foreground,
                flex: 1,
              }}
            >
              {route.destinationName}
            </Text>
          </View>
        </View>

        {/* Weather conditions */}
        {analyzeWeather.data && (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="weather" size={20} color={colors.foreground} />
              <Text
                style={{
                  fontFamily: 'NunitoSans_600SemiBold',
                  fontSize: 16,
                  color: colors.foreground,
                  marginLeft: 8,
                }}
              >
                {t('routes.weatherConditions')}
              </Text>
              <Pressable
                onPress={handleRefreshWeather}
                style={{ marginLeft: 'auto', padding: 4 }}
              >
                <Icon name="refresh" size={18} color={colors.primary} />
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                backgroundColor: `${RISK_COLORS[analyzeWeather.data.overallRisk]}20`,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: RISK_COLORS[analyzeWeather.data.overallRisk],
              }}
            >
              <Text
                style={{
                  fontFamily: 'NunitoSans_400Regular',
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                {getRiskDescription(analyzeWeather.data.overallRisk)}
              </Text>
            </View>

            {/* Alerts */}
            {analyzeWeather.data.alerts.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {analyzeWeather.data.alerts.map((alert) => (
                  <View
                    key={alert.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      paddingVertical: 8,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <Icon name="warning" size={18} color={colors.warning} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'NunitoSans_600SemiBold',
                          fontSize: 14,
                          color: colors.foreground,
                        }}
                      >
                        {alert.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'NunitoSans_400Regular',
                          fontSize: 13,
                          color: colors.mutedForeground,
                        }}
                      >
                        {alert.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Start trip button */}
        <Pressable
          onPress={handleStartTrip}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'NunitoSans_700Bold',
              fontSize: 16,
              color: '#fff',
            }}
          >
            {t('routes.startTrip')}
          </Text>
        </Pressable>

        {/* Navigation options modal */}
        {showNavigationOptions && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontFamily: 'NunitoSans_600SemiBold',
                fontSize: 14,
                color: colors.foreground,
                marginBottom: 12,
              }}
            >
              {t('routes.navigateWith')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => openNavigation('waze')}
                style={{
                  flex: 1,
                  backgroundColor: colors.muted,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'NunitoSans_600SemiBold', color: colors.foreground }}>
                  Waze
                </Text>
              </Pressable>
              <Pressable
                onPress={() => openNavigation('google')}
                style={{
                  flex: 1,
                  backgroundColor: colors.muted,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'NunitoSans_600SemiBold', color: colors.foreground }}>
                  Google Maps
                </Text>
              </Pressable>
              {Platform.OS === 'ios' && (
                <Pressable
                  onPress={() => openNavigation('apple')}
                  style={{
                    flex: 1,
                    backgroundColor: colors.muted,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'NunitoSans_600SemiBold', color: colors.foreground }}>
                    Apple Maps
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
