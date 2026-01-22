// apps/mobile/app/(app)/add-route.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Icon } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';
import { useLocation } from '@/hooks/use-location';
import { useCreateRoute } from '@/hooks/use-api';

type Place = {
  name: string;
  latitude: number;
  longitude: number;
};

export default function AddRouteScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { location } = useLocation();
  const createRoute = useCreateRoute();

  const [routeName, setRouteName] = useState('');
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');

  const handleUseCurrentLocation = useCallback(() => {
    if (location) {
      setOrigin({
        name: t('routes.useCurrentLocation'),
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setOriginSearch(t('routes.useCurrentLocation'));
    }
  }, [location, t]);

  const handleSave = async () => {
    if (!routeName.trim()) {
      Alert.alert(t('common.error'), t('routes.routeNamePlaceholder'));
      return;
    }
    if (!origin) {
      Alert.alert(t('common.error'), t('routes.originPlaceholder'));
      return;
    }
    if (!destination) {
      Alert.alert(t('common.error'), t('routes.destinationPlaceholder'));
      return;
    }

    try {
      await createRoute.mutateAsync({
        name: routeName.trim(),
        originName: origin.name,
        originLatitude: origin.latitude,
        originLongitude: origin.longitude,
        destinationName: destination.name,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
      });
      router.back();
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  };

  const canSave = routeName.trim() && origin && destination && !createRoute.isPending;

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
        >
          {t('routes.createRoute')}
        </Text>
        <Pressable onPress={handleSave} disabled={!canSave}>
          {createRoute.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              style={{
                fontFamily: 'NunitoSans_600SemiBold',
                fontSize: 16,
                color: canSave ? colors.primary : colors.mutedForeground,
              }}
            >
              {t('common.save')}
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Route name input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: 'NunitoSans_600SemiBold',
              fontSize: 14,
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            {t('routes.routeName')}
          </Text>
          <TextInput
            value={routeName}
            onChangeText={setRouteName}
            placeholder={t('routes.routeNamePlaceholder')}
            placeholderTextColor={colors.mutedForeground}
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontFamily: 'NunitoSans_400Regular',
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>

        {/* Origin input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: 'NunitoSans_600SemiBold',
              fontSize: 14,
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            {t('routes.origin')}
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: origin ? colors.primary : colors.border,
              borderRadius: 8,
              padding: 12,
            }}
          >
            <TextInput
              value={originSearch}
              onChangeText={(text) => {
                setOriginSearch(text);
                if (!text) setOrigin(null);
              }}
              placeholder={t('routes.originPlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              style={{
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 16,
                color: colors.foreground,
              }}
            />
          </View>
          {/* Use current location button */}
          <Pressable
            onPress={handleUseCurrentLocation}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
              padding: 8,
            }}
          >
            <Icon name="location" size={18} color={colors.primary} />
            <Text
              style={{
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.primary,
                marginLeft: 8,
              }}
            >
              {t('routes.useCurrentLocation')}
            </Text>
          </Pressable>
        </View>

        {/* Destination input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: 'NunitoSans_600SemiBold',
              fontSize: 14,
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            {t('routes.destination')}
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: destination ? colors.primary : colors.border,
              borderRadius: 8,
              padding: 12,
            }}
          >
            <TextInput
              value={destinationSearch}
              onChangeText={(text) => {
                setDestinationSearch(text);
                if (!text) setDestination(null);
              }}
              placeholder={t('routes.destinationPlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              style={{
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 16,
                color: colors.foreground,
              }}
            />
          </View>
        </View>

        {/* Info card - Place search coming soon */}
        <View
          style={{
            backgroundColor: colors.muted,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="info" size={20} color={colors.mutedForeground} />
            <Text
              style={{
                fontFamily: 'NunitoSans_600SemiBold',
                fontSize: 14,
                color: colors.foreground,
                marginLeft: 8,
              }}
            >
              {t('routes.searchPlaces')}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              fontSize: 13,
              color: colors.mutedForeground,
              lineHeight: 20,
            }}
          >
            La b&uacute;squeda de lugares estará disponible pronto. Por ahora,
            usa tu ubicaci&oacute;n actual como origen.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
