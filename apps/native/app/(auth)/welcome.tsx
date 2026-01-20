// apps/native/app/(auth)/welcome.tsx
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTrialStore } from '@/stores/trial-store';

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { startTrial } = useTrialStore();

  const handleStart = () => {
    startTrial();
    router.replace('/(app)/(tabs)');
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
            Advia
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
          Tu co-piloto climatico
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
          Evita tormentas. Llega seguro.
        </Text>

        {/* CTA */}
        <Button
          onPress={handleStart}
          className="w-full"
          size="lg"
        >
          <Button.Label>Comenzar gratis</Button.Label>
        </Button>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 14,
            color: colors.mutedForeground,
            marginTop: 16,
          }}
        >
          7 dias con todo incluido
        </Text>
      </View>
    </SafeAreaView>
  );
}
