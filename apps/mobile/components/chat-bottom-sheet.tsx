// apps/native/components/chat-bottom-sheet.tsx
import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/lib/i18n';
import { useLocation } from '@/hooks/use-location';
import { useSendChatMessage } from '@/hooks/use-api';
import { useTextToSpeech, speakAgentResponse } from '@/hooks/use-text-to-speech';
import { Icon } from '@/components/icons';
import { Analytics } from '@/lib/analytics';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBottomSheet() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { location } = useLocation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<FlatList>(null);
  // Snap points: collapsed shows prompt, mid shows chat, full shows expanded chat
  const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');

  const sendMessage = useSendChatMessage();
  const tts = useTextToSpeech({ language: 'es-ES' });

  const quickSuggestions = [
    t('map.suggestions.workRoute') || '¿Cómo está el clima en mi ruta?',
    t('map.suggestions.nearbyAlerts') || '¿Hay alertas cerca?',
    t('map.suggestions.willItRain') || '¿Va a llover hoy?',
  ];

  // Stop TTS when user starts typing
  useEffect(() => {
    if (input.length > 0 && tts.isSpeaking) {
      tts.stop();
    }
  }, [input, tts]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      tts.stop();
    };
  }, [tts]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || sendMessage.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setStreamingContent('');
    Analytics.chatMessageSent();

    // Expand bottom sheet when sending
    bottomSheetRef.current?.snapToIndex(1);

    try {
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendMessage.mutateAsync({
        message: trimmedInput,
        history,
        location: location ? { latitude: location.latitude, longitude: location.longitude } : undefined,
        onChunk: (chunk) => {
          setStreamingContent(chunk);
        },
      });

      // Replace streaming content with final message
      setStreamingContent('');
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Speak the response using TTS
      speakAgentResponse(tts, response, { skipIfShort: true, minLength: 15 });
    } catch (error) {
      console.error('Chat error:', error);
      setStreamingContent('');
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.comingSoon'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [input, messages, location, sendMessage, t]);

  const handleSuggestion = useCallback((suggestion: string) => {
    setInput(suggestion);
    Analytics.chatQuickActionUsed(suggestion);
  }, []);

  // Combine messages with streaming content for display
  const displayMessages = useMemo(() => {
    if (streamingContent && sendMessage.isPending) {
      return [
        ...messages,
        {
          id: 'streaming',
          role: 'assistant' as const,
          content: streamingContent,
        },
      ];
    }
    return messages;
  }, [messages, streamingContent, sendMessage.isPending]);

  // Get last 3 messages for collapsed state preview
  const lastMessages = useMemo(() => {
    return displayMessages.slice(-3);
  }, [displayMessages]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage & { id: string } }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
          { backgroundColor: isUser ? colors.primary : colors.muted },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isUser ? colors.primaryForeground : colors.foreground },
          ]}
        >
          {item.content}
          {item.id === 'streaming' && (
            <Text style={{ opacity: 0.5 }}> {t('chat.thinking') || '...'}</Text>
          )}
        </Text>
      </View>
    );
  }, [colors, t]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
      enablePanDownToClose={false}
    >
      <BottomSheetView style={styles.container}>
        {/* Collapsed state - show prompt and last 3 messages */}
        {displayMessages.length === 0 ? (
          <View style={styles.collapsedContent}>
            <View style={styles.collapsedHeader}>
              <Icon name="storm" size={24} color={colors.primary} />
              <Text style={[styles.collapsedTitle, { color: colors.foreground }]}>
                {t('map.chatPrompt') || 'Pregunta sobre el clima'}
              </Text>
              <Pressable
                onPress={() => tts.setEnabled(!tts.isEnabled)}
                style={[styles.ttsToggle, { backgroundColor: tts.isEnabled ? colors.primary + '20' : colors.muted }]}
              >
                <Icon
                  name="voice"
                  size={18}
                  color={tts.isEnabled ? colors.primary : colors.mutedForeground}
                />
              </Pressable>
            </View>
            <View style={styles.suggestionsContainer}>
              {quickSuggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => {
                    handleSuggestion(suggestion);
                    bottomSheetRef.current?.snapToIndex(1);
                  }}
                  style={[styles.suggestionChip, { backgroundColor: colors.muted }]}
                >
                  <Text style={[styles.suggestionText, { color: colors.foreground }]}>
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Expanded state - show full chat */}
            <FlatList
              ref={flatListRef}
              data={displayMessages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              style={{ flex: 1 }}
            />
          </>
        )}

        {/* Input - always visible */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('chat.placeholder') || 'Pregunta sobre el clima...'}
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.muted,
                color: colors.foreground,
              },
            ]}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!sendMessage.isPending}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            style={[
              styles.sendButton,
              {
                backgroundColor: input.trim() && !sendMessage.isPending ? colors.primary : colors.muted,
              },
            ]}
          >
            {sendMessage.isPending ? (
              <ActivityIndicator size="small" color={colors.mutedForeground} />
            ) : (
              <Icon
                name="send"
                size={20}
                color={input.trim() ? colors.primaryForeground : colors.mutedForeground}
              />
            )}
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  collapsedContent: {
    paddingVertical: 12,
  },
  collapsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ttsToggle: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedTitle: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 16,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  suggestionText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
  },
  messagesList: {
    paddingVertical: 12,
    paddingBottom: 8,
  },
  recentHeader: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  recentHeaderText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
