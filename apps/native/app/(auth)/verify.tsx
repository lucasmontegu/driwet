// apps/native/app/(auth)/verify.tsx
import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import * as Linking from 'expo-linking';

export default function VerifyScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { email } = useLocalSearchParams<{ email: string }>();

  const handleOpenEmail = async () => {
    await Linking.openURL('mailto:');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 justify-center items-center px-8">
        {/* Icon */}
        <Text style={{ fontSize: 64, marginBottom: 24 }}>📧</Text>

        {/* Header */}
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 24,
            color: colors.foreground,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Revisa tu email
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 16,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 8,
            lineHeight: 24,
          }}
        >
          Enviamos un link de acceso a
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_600SemiBold',
            fontSize: 16,
            color: colors.foreground,
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          {email}
        </Text>

        <Button
          onPress={handleOpenEmail}
          variant="secondary"
          size="lg"
          className="w-full mb-4"
        >
          <Button.Label>Abrir app de email</Button.Label>
        </Button>

        <Pressable onPress={() => router.back()}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: 'NunitoSans_400Regular',
            }}
          >
            Usar otro email
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
