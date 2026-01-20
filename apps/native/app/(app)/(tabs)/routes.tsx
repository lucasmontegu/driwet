// apps/native/app/(app)/(tabs)/routes.tsx
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';

// Datos de ejemplo
const SAVED_ROUTES = [
  {
    id: '1',
    name: 'Casa → Trabajo',
    from: '🏠',
    to: '🏢',
    distance: '12.4 km',
    status: 'clear' as const,
    statusText: 'Sin alertas',
  },
  {
    id: '2',
    name: 'Casa → Escuela',
    from: '🏠',
    to: '🏫',
    distance: '5.2 km',
    status: 'warning' as const,
    statusText: 'Lluvia 4pm',
  },
];

const HISTORY = [
  {
    id: '1',
    date: 'Ayer',
    event: 'Evitaste tormenta',
    savings: '~$150',
  },
  {
    id: '2',
    date: 'Lun 13',
    event: 'Ruta segura',
    savings: null,
  },
];

export default function RoutesScreen() {
  const colors = useThemeColors();
  const router = useRouter();

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
        >
          Mis Rutas
        </Text>

        {/* Saved Routes */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          {SAVED_ROUTES.map((route) => (
            <Pressable
              key={route.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20 }}>{route.from}</Text>
                <Text style={{ marginHorizontal: 8, color: colors.mutedForeground }}>→</Text>
                <Text style={{ fontSize: 20 }}>{route.to}</Text>
                <Text
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'NunitoSans_400Regular',
                    color: colors.mutedForeground,
                  }}
                >
                  {route.distance}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>
                    {route.status === 'clear' ? '✅' : '⚠️'}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'NunitoSans_400Regular',
                      color: route.status === 'clear' ? colors.safe : colors.alert.moderate,
                    }}
                  >
                    {route.statusText}
                  </Text>
                </View>
                <Text style={{ color: colors.mutedForeground }}>→</Text>
              </View>
            </Pressable>
          ))}

          {/* Add new route */}
          <Pressable
            style={{
              backgroundColor: colors.muted,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              borderStyle: 'dashed',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'NunitoSans_600SemiBold',
                color: colors.primary,
              }}
            >
              + Agregar nueva ruta
            </Text>
          </Pressable>
        </View>

        {/* History */}
        <Text
          style={{
            fontFamily: 'NunitoSans_600SemiBold',
            fontSize: 18,
            color: colors.foreground,
            marginBottom: 16,
          }}
        >
          Historial
        </Text>

        <View style={{ gap: 12 }}>
          {HISTORY.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 16 }}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'NunitoSans_400Regular',
                    color: colors.mutedForeground,
                    fontSize: 12,
                  }}
                >
                  {item.date}
                </Text>
                <Text
                  style={{
                    fontFamily: 'NunitoSans_600SemiBold',
                    color: colors.foreground,
                  }}
                >
                  {item.event}
                </Text>
                {item.savings && (
                  <Text
                    style={{
                      fontFamily: 'NunitoSans_400Regular',
                      color: colors.safe,
                      fontSize: 14,
                    }}
                  >
                    Ahorro estimado: {item.savings}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
