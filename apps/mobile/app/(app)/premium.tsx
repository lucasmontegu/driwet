// apps/native/app/(app)/premium.tsx
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/lib/i18n';
import { useSubscriptionCheckout, useIsPremium } from '@/hooks/use-subscription';
import { Icon } from '@/components/icons';

export default function PremiumScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { checkout, portal } = useSubscriptionCheckout();
  const { isSubscribed, plan } = useIsPremium();
  const [isLoading, setIsLoading] = useState<'monthly' | 'yearly' | 'portal' | null>(null);

  const features = [
    t('premium.features.unlimitedRoutes'),
    t('premium.features.realTimeAlerts'),
    t('premium.features.noAds'),
    t('premium.features.refugeLocations'),
    t('premium.features.fullHistory'),
    t('premium.features.multipleLocations'),
  ];

  const handleSubscribe = async (selectedPlan: 'monthly' | 'yearly') => {
    setIsLoading(selectedPlan);
    try {
      await checkout(selectedPlan);
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        t('common.error'),
        t('subscription.checkoutError'),
        [{ text: t('common.retry'), onPress: () => handleSubscribe(selectedPlan) }]
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading('portal');
    try {
      await portal();
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, alignItems: 'center' }}
      >
        {/* Close button */}
        <Pressable
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-end', padding: 8 }}
        >
          <Icon name="close" size={24} color={colors.mutedForeground} />
        </Pressable>

        {/* Header */}
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⭐</Text>
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 28,
            color: colors.foreground,
            marginBottom: 8,
          }}
        >
          {t('premium.title')}
        </Text>

        {/* Current plan badge */}
        {isSubscribed && (
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontFamily: 'NunitoSans_600SemiBold',
                fontSize: 14,
                color: colors.primaryForeground,
              }}
            >
              {plan === 'yearly' ? t('subscription.planYearly') : t('subscription.planMonthly')}
            </Text>
          </View>
        )}

        {!isSubscribed && <View style={{ height: 24 }} />}

        {/* Features */}
        <View style={{ width: '100%', marginBottom: 32 }}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <Icon name="check" size={18} color={colors.safe} />
              <Text
                style={{
                  fontFamily: 'NunitoSans_400Regular',
                  fontSize: 16,
                  color: colors.foreground,
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing or Manage */}
        {isSubscribed ? (
          <View style={{ width: '100%', gap: 12 }}>
            <Button
              onPress={handleManageSubscription}
              size="lg"
              className="w-full"
              isDisabled={isLoading !== null}
            >
              <Button.Label>
                {isLoading === 'portal' ? t('common.loading') : t('subscription.manageSubscription')}
              </Button.Label>
            </Button>
          </View>
        ) : (
          <View style={{ width: '100%', gap: 12 }}>
            <Button
              onPress={() => handleSubscribe('monthly')}
              size="lg"
              className="w-full"
              isDisabled={isLoading !== null}
            >
              <Button.Label>
                {isLoading === 'monthly' ? t('common.loading') : t('premium.monthly')}
              </Button.Label>
            </Button>

            <Button
              onPress={() => handleSubscribe('yearly')}
              variant="secondary"
              size="lg"
              className="w-full"
              isDisabled={isLoading !== null}
            >
              <Button.Label>
                {isLoading === 'yearly' ? t('common.loading') : t('premium.yearly')}
              </Button.Label>
            </Button>
          </View>
        )}

        {/* Footer */}
        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 12,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          {t('premium.cancelAnytime')}{'\n'}
          {t('premium.processedBy')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
