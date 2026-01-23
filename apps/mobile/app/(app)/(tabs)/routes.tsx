// apps/native/app/(app)/(tabs)/routes.tsx
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/lib/i18n';
import { useSavedRoutes, useTripHistory, useDeleteRoute, useToggleRouteFavorite } from '@/hooks/use-api';
import { Icon } from '@/components/icons';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function RoutesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { requireAuth } = useRequireAuth();

  const { data: savedRoutes, isLoading: routesLoading } = useSavedRoutes();
  const { data: tripHistory, isLoading: historyLoading } = useTripHistory(10);
  const deleteRoute = useDeleteRoute();
  const toggleFavorite = useToggleRouteFavorite();

  const handleAddRoute = () => {
    requireAuth(() => {
      router.push('/add-route');
    });
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
  };

  const getOutcomeText = (outcome: string) => {
    switch (outcome) {
      case 'avoided_storm':
        return t('routes.avoidedStorm');
      case 'completed':
        return t('routes.safeRoute');
      default:
        return outcome;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 28,
            color: colors.foreground,
            marginBottom: 24,
          }}
          accessibilityRole="header"
        >
          {t('routes.title')}
        </Text>

        {/* Saved Routes */}
        {routesLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
        ) : (
          <View style={{ gap: 12, marginBottom: 24 }}>
            {savedRoutes?.map((route) => (
              <Pressable
                key={route.id}
                onPress={() => router.push(`/route-detail?id=${route.id}`)}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: route.isFavorite ? colors.primary : colors.border,
                }}
                accessibilityRole="button"
                accessibilityLabel={`${route.name}: ${route.originName} ${t('common.to')} ${route.destinationName}`}
                accessibilityHint={t('routes.tapToViewDetails')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="location" size={18} color={colors.foreground} />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontFamily: 'NunitoSans_600SemiBold',
                      color: colors.foreground,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {route.name}
                  </Text>
                  <Pressable
                    onPress={() => toggleFavorite.mutate(route.id)}
                    style={{ padding: 4 }}
                    accessibilityRole="button"
                    accessibilityLabel={route.isFavorite ? t('routes.removeFavorite') : t('routes.addFavorite')}
                  >
                    <Icon
                      name="star"
                      size={18}
                      color={route.isFavorite ? colors.primary : colors.mutedForeground}
                    />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: 'NunitoSans_400Regular',
                      fontSize: 13,
                      color: colors.mutedForeground,
                    }}
                    numberOfLines={1}
                  >
                    {route.originName} → {route.destinationName}
                  </Text>
                  <Icon name="arrowRight" size={16} color={colors.mutedForeground} />
                </View>
              </Pressable>
            ))}

            {/* Add new route */}
            <Pressable
              onPress={handleAddRoute}
              style={{
                backgroundColor: colors.muted,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: 'dashed',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
              accessibilityRole="button"
              accessibilityLabel={t('routes.addNew')}
              accessibilityHint={t('routes.addNewHint')}
            >
              <Icon name="route" size={18} color={colors.primary} />
              <Text
                style={{
                  fontFamily: 'NunitoSans_600SemiBold',
                  color: colors.primary,
                }}
              >
                {t('routes.addNew')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* History */}
        <Text
          style={{
            fontFamily: 'NunitoSans_600SemiBold',
            fontSize: 18,
            color: colors.foreground,
            marginBottom: 16,
          }}
          accessibilityRole="header"
        >
          {t('routes.history')}
        </Text>

        {historyLoading ? (
          <ActivityIndicator size="small" color={colors.mutedForeground} />
        ) : tripHistory && tripHistory.length > 0 ? (
          <View style={{ gap: 12 }}>
            {tripHistory.map((trip) => (
              <View
                key={trip.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={`${formatDate(trip.startedAt)}: ${getOutcomeText(trip.outcome)}, ${trip.originName} ${t('common.to')} ${trip.destinationName}`}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: trip.outcome === 'avoided_storm' ? colors.safe : colors.muted,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    name={trip.outcome === 'avoided_storm' ? 'storm' : 'checkCircle'}
                    size={16}
                    color={trip.outcome === 'avoided_storm' ? '#FFFFFF' : colors.mutedForeground}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'NunitoSans_400Regular',
                      color: colors.mutedForeground,
                      fontSize: 12,
                    }}
                  >
                    {formatDate(trip.startedAt)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'NunitoSans_600SemiBold',
                      color: colors.foreground,
                    }}
                  >
                    {getOutcomeText(trip.outcome)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'NunitoSans_400Regular',
                      color: colors.mutedForeground,
                      fontSize: 13,
                    }}
                    numberOfLines={1}
                  >
                    {trip.originName} → {trip.destinationName}
                  </Text>
                  {trip.estimatedSavings && Number(trip.estimatedSavings) > 0 && (
                    <Text
                      style={{
                        fontFamily: 'NunitoSans_400Regular',
                        color: colors.safe,
                        fontSize: 14,
                        marginTop: 2,
                      }}
                    >
                      {t('routes.estimatedSavings', { amount: `$${Number(trip.estimatedSavings).toLocaleString()}` })}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              color: colors.mutedForeground,
              textAlign: 'center',
              paddingVertical: 20,
            }}
          >
            {t('routes.noAlerts')}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
