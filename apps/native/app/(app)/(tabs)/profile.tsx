// apps/native/app/(app)/(tabs)/profile.tsx
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTrialStore } from '@/stores/trial-store';
import { authClient } from '@/lib/auth-client';

const STATS = [
  { icon: '🌩️', label: '12 tormentas evitadas' },
  { icon: '💰', label: '~$2,400 ahorrados' },
  { icon: '🛣️', label: '847 km recorridos seguro' },
];

const SETTINGS = [
  { icon: '🔔', label: 'Notificaciones', route: '/notifications' },
  { icon: '📍', label: 'Ubicaciones guardadas', route: '/locations' },
  { icon: '🎨', label: 'Tema', route: null, value: 'Auto' },
  { icon: '🌐', label: 'Idioma', route: null, value: 'Español' },
  { icon: '❓', label: 'Ayuda y soporte', route: '/help' },
];

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { isPremium, getRemainingDays } = useTrialStore();
  const remainingDays = getRemainingDays();

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace('/(auth)/welcome');
  };

  const handleUpgrade = () => {
    router.push('/(app)/premium');
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
        >
          Perfil
        </Text>

        {/* User Card */}
        <Pressable
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'NunitoSans_600SemiBold',
                  color: colors.foreground,
                  fontSize: 16,
                }}
              >
                usuario@email.com
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    fontFamily: 'NunitoSans_400Regular',
                    color: isPremium ? colors.primary : colors.mutedForeground,
                    fontSize: 14,
                  }}
                >
                  {isPremium ? 'Plan: Premium' : `Trial: ${remainingDays} días restantes`}
                </Text>
              </View>
            </View>
            {!isPremium && (
              <Pressable onPress={handleUpgrade}>
                <Text style={{ color: colors.primary, fontFamily: 'NunitoSans_600SemiBold' }}>
                  Upgrade
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>

        {/* Stats */}
        <Text
          style={{
            fontFamily: 'NunitoSans_600SemiBold',
            fontSize: 16,
            color: colors.mutedForeground,
            marginBottom: 12,
          }}
        >
          📊 Estadisticas
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
            gap: 12,
          }}
        >
          {STATS.map((stat, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
              <Text
                style={{
                  fontFamily: 'NunitoSans_400Regular',
                  color: colors.foreground,
                }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text
          style={{
            fontFamily: 'NunitoSans_600SemiBold',
            fontSize: 16,
            color: colors.mutedForeground,
            marginBottom: 12,
          }}
        >
          ⚙️ Configuracion
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
          }}
        >
          {SETTINGS.map((setting, index) => (
            <Pressable
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: index < SETTINGS.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 12 }}>{setting.icon}</Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: 'NunitoSans_400Regular',
                  color: colors.foreground,
                }}
              >
                {setting.label}
              </Text>
              {setting.value && (
                <Text
                  style={{
                    fontFamily: 'NunitoSans_400Regular',
                    color: colors.mutedForeground,
                    marginRight: 8,
                  }}
                >
                  {setting.value}
                </Text>
              )}
              <Text style={{ color: colors.mutedForeground }}>→</Text>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 18 }}>🚪</Text>
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              color: colors.destructive,
            }}
          >
            Cerrar sesion
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
