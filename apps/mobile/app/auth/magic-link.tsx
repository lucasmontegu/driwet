// apps/native/app/auth/magic-link.tsx
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@/lib/i18n';
import { Icon } from '@/components/icons';
import { Button } from 'heroui-native';

export default function MagicLinkScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verifyMagicLink() {
      if (!token) {
        setStatus('error');
        setErrorMessage(t('auth.invalidLink'));
        return;
      }

      try {
        // Verify the magic link token
        const result = await authClient.magicLink.verify({
          token,
        });

        if (result.error) {
          setStatus('error');
          setErrorMessage(result.error.message || t('auth.verifyError'));
          return;
        }

        setStatus('success');

        // Redirect to main app after a short delay
        setTimeout(() => {
          router.replace('/(app)/(tabs)');
        }, 1500);
      } catch (error) {
        console.error('Magic link verification error:', error);
        setStatus('error');
        setErrorMessage(t('auth.verifyError'));
      }
    }

    verifyMagicLink();
  }, [token]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={{
                marginTop: 24,
                fontFamily: 'NunitoSans_600SemiBold',
                fontSize: 18,
                color: colors.foreground,
                textAlign: 'center',
              }}
            >
              {t('auth.verifying')}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: 'center',
              }}
            >
              {t('auth.pleaseWait')}
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.safe,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Icon name="checkCircle" size={40} color="#FFFFFF" />
            </View>
            <Text
              style={{
                fontFamily: 'NunitoSans_700Bold',
                fontSize: 24,
                color: colors.foreground,
                textAlign: 'center',
              }}
            >
              {t('auth.loginSuccess')}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: 'center',
              }}
            >
              {t('auth.redirecting')}
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.destructive,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Icon name="close" size={40} color="#FFFFFF" />
            </View>
            <Text
              style={{
                fontFamily: 'NunitoSans_700Bold',
                fontSize: 24,
                color: colors.foreground,
                textAlign: 'center',
              }}
            >
              {t('auth.loginFailed')}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: 'center',
                paddingHorizontal: 16,
              }}
            >
              {errorMessage || t('auth.tryAgain')}
            </Text>
            <Button
              onPress={() => router.replace('/(auth)/sign-in')}
              variant="secondary"
              size="lg"
              style={{ marginTop: 24 }}
            >
              <Button.Label>{t('auth.backToSignIn')}</Button.Label>
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
