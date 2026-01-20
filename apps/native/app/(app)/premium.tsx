// apps/native/app/(app)/premium.tsx
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

const FEATURES = [
  'Rutas ilimitadas',
  'Alertas en tiempo real',
  'Sin anuncios',
  'Lugares de refugio',
  'Historial completo',
  'Multiples ubicaciones',
];

export default function PremiumScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    // TODO: Integrar con Polar
    console.log('Subscribe to:', plan);
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
          <Text style={{ fontSize: 24, color: colors.mutedForeground }}>✕</Text>
        </Pressable>

        {/* Header */}
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⭐</Text>
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 28,
            color: colors.foreground,
            marginBottom: 24,
          }}
        >
          Advia Premium
        </Text>

        {/* Features */}
        <View style={{ width: '100%', marginBottom: 32 }}>
          {FEATURES.map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.safe, fontSize: 18 }}>✓</Text>
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

        {/* Pricing */}
        <View style={{ width: '100%', gap: 12 }}>
          <Button
            onPress={() => handleSubscribe('monthly')}
            size="lg"
            className="w-full"
          >
            <Button.Label>$4.99/mes</Button.Label>
          </Button>

          <Button
            onPress={() => handleSubscribe('yearly')}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <Button.Label>$39.99/año (ahorra 33%)</Button.Label>
          </Button>
        </View>

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
          Cancela cuando quieras{'\n'}
          Pago procesado por Polar
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
