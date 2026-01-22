// apps/native/app/(auth)/sign-in.tsx
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@/lib/i18n';
import { useTrialStore } from '@/stores/trial-store';
import { Analytics, identifyUser } from '@/lib/analytics';
import { useState } from 'react';

export default function SignInScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { startTrial, trialStartDate } = useTrialStore();
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | null>(null);

  // Start trial for new users after successful auth
  const onAuthSuccess = async (method: 'google' | 'apple' | 'email') => {
    const isNewUser = !trialStartDate;
    if (isNewUser) {
      startTrial();
      Analytics.signUp(method);
    } else {
      Analytics.signIn(method);
    }

    // Get session and identify user for analytics
    const session = await authClient.getSession();
    if (session.data?.user) {
      identifyUser(session.data.user.id, {
        email: session.data.user.email ?? null,
        name: session.data.user.name ?? null,
      });
    }

    router.replace('/(app)/(tabs)');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      await authClient.signIn.social({ provider: 'google' });
      await onAuthSuccess('google');
    } catch (error) {
      console.error('Google sign-in error:', error);
      Analytics.errorOccurred('google_sign_in_failed', String(error));
    } finally {
      setIsLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading('apple');
    try {
      await authClient.signIn.social({ provider: 'apple' });
      await onAuthSuccess('apple');
    } catch (error) {
      console.error('Apple sign-in error:', error);
      Analytics.errorOccurred('apple_sign_in_failed', String(error));
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = () => {
    router.push('/(auth)/email-input');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 28,
            color: colors.foreground,
            marginBottom: 8,
          }}
        >
          {t('auth.signInTitle')}
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 16,
            color: colors.mutedForeground,
            marginBottom: 32,
            lineHeight: 24,
          }}
        >
          {t('auth.signInSubtitle')}
        </Text>

        {/* Social buttons */}
        <View className="gap-3">
          <Button
            onPress={handleGoogleSignIn}
            variant="secondary"
            size="lg"
            isDisabled={isLoading !== null}
          >
            <Button.Label>
              {isLoading === 'google' ? t('auth.connecting') : t('auth.continueWithGoogle')}
            </Button.Label>
          </Button>

          <Button
            onPress={handleAppleSignIn}
            variant="secondary"
            size="lg"
            isDisabled={isLoading !== null}
          >
            <Button.Label>
              {isLoading === 'apple' ? t('auth.connecting') : t('auth.continueWithApple')}
            </Button.Label>
          </Button>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-6">
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

        {/* Email option */}
        <Button onPress={handleEmailSignIn} variant="ghost" size="lg">
          <Button.Label>{t('auth.continueWithEmail')}</Button.Label>
        </Button>
      </View>
    </SafeAreaView>
  );
}
