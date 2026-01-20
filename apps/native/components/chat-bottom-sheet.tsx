// apps/native/components/chat-bottom-sheet.tsx
import { useMemo, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useChat } from '@ai-sdk/react';

const QUICK_SUGGESTIONS = [
  'Mi ruta al trabajo',
  'Alertas cercanas',
  '¿Va a llover hoy?',
];

export function ChatBottomSheet() {
  const colors = useThemeColors();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '80%'], []);

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const handleSend = () => {
    if (input.trim()) {
      handleSubmit();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Chat messages */}
        {messages.length > 0 && (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: item.role === 'user' ? colors.primary : colors.muted,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  marginBottom: 8,
                  maxWidth: '80%',
                }}
              >
                <Text
                  style={{
                    color: item.role === 'user' ? colors.primaryForeground : colors.foreground,
                    fontFamily: 'NunitoSans_400Regular',
                  }}
                >
                  {item.content}
                </Text>
              </View>
            )}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}

        {/* Quick suggestions (solo si no hay mensajes) */}
        {messages.length === 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.mutedForeground,
                marginBottom: 8,
              }}
            >
              💬 ¿A donde vas hoy?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => handleSuggestion(suggestion)}
                  style={{
                    backgroundColor: colors.muted,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: colors.foreground,
                      fontFamily: 'NunitoSans_400Regular',
                      fontSize: 13,
                    }}
                  >
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1,
              backgroundColor: colors.muted,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 24,
              color: colors.foreground,
              fontFamily: 'NunitoSans_400Regular',
            }}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              backgroundColor: input.trim() ? colors.primary : colors.muted,
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>➤</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
