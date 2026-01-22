// apps/native/app/(auth)/welcome.tsx
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTrialStore } from '@/stores/trial-store';
import { useTranslation } from '@/lib/i18n';

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { startTrial } = useTrialStore();

  const handleStart = () => {
    startTrial();
    router.replace('/(app)/(tabs)');
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo */}
        <View className="mb-8">
          <Text
            style={{
              fontFamily: 'NunitoSans_700Bold',
              fontSize: 48,
              color: colors.primary,
            }}
          >
            Driwet
          </Text>
        </View>

        {/* Tagline */}
        <Text
          style={{
            fontFamily: 'NunitoSans_600SemiBold',
            fontSize: 24,
            color: colors.foreground,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {t('welcome.tagline')}
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 16,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          {t('welcome.subtitle')}
        </Text>

        {/* CTA */}
        <Button
          onPress={handleStart}
          className="w-full"
          size="lg"
        >
          <Button.Label>{t('welcome.startFree')}</Button.Label>
        </Button>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 14,
            color: colors.mutedForeground,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {t('welcome.trialInfo')}
        </Text>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 32,
            marginBottom: 24,
            width: '100%',
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text
            style={{
              marginHorizontal: 16,
              color: colors.mutedForeground,
              fontFamily: 'NunitoSans_400Regular',
            }}
          >
            {t('common.or')}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {/* Sign in link */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              color: colors.mutedForeground,
            }}
          >
            {t('welcome.haveAccount')}{' '}
          </Text>
          <Pressable onPress={handleSignIn}>
            <Text
              style={{
                fontFamily: 'NunitoSans_600SemiBold',
                color: colors.primary,
              }}
            >
              {t('welcome.signIn')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
