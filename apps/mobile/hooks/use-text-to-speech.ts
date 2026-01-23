// apps/mobile/hooks/use-text-to-speech.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TTSState = 'idle' | 'speaking' | 'paused';

type UseTTSOptions = {
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  defaultEnabled?: boolean;
};

type UseTTSReturn = {
  state: TTSState;
  isSpeaking: boolean;
  isEnabled: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  rate: number;
  volume: number;
};

const TTS_ENABLED_KEY = '@driwet/tts-enabled';
const TTS_RATE_KEY = '@driwet/tts-rate';
const TTS_VOLUME_KEY = '@driwet/tts-volume';

export function useTextToSpeech({
  language = 'es-ES',
  pitch = 1.0,
  rate: defaultRate = 1.0,
  volume: defaultVolume = 1.0,
  defaultEnabled = true,
}: UseTTSOptions = {}): UseTTSReturn {
  const [state, setState] = useState<TTSState>('idle');
  const [isEnabled, setIsEnabledState] = useState(defaultEnabled);
  const [rate, setRateState] = useState(defaultRate);
  const [volume, setVolumeState] = useState(defaultVolume);
  const [isInitialized, setIsInitialized] = useState(false);

  const currentTextRef = useRef<string>('');

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [enabledValue, rateValue, volumeValue] = await Promise.all([
          AsyncStorage.getItem(TTS_ENABLED_KEY),
          AsyncStorage.getItem(TTS_RATE_KEY),
          AsyncStorage.getItem(TTS_VOLUME_KEY),
        ]);

        if (enabledValue !== null) {
          setIsEnabledState(enabledValue === 'true');
        }
        if (rateValue !== null) {
          setRateState(parseFloat(rateValue));
        }
        if (volumeValue !== null) {
          setVolumeState(parseFloat(volumeValue));
        }
      } catch (error) {
        console.error('Error loading TTS preferences:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadPreferences();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Speak text
  const speak = useCallback(async (text: string) => {
    if (!isEnabled || !text.trim()) {
      return;
    }

    // Stop any current speech
    await Speech.stop();
    currentTextRef.current = text;

    return new Promise<void>((resolve) => {
      setState('speaking');

      Speech.speak(text, {
        language,
        pitch,
        rate,
        volume,
        onStart: () => {
          setState('speaking');
        },
        onDone: () => {
          setState('idle');
          currentTextRef.current = '';
          resolve();
        },
        onStopped: () => {
          setState('idle');
          currentTextRef.current = '';
          resolve();
        },
        onError: (error) => {
          console.error('TTS Error:', error);
          setState('idle');
          currentTextRef.current = '';
          resolve();
        },
      });
    });
  }, [isEnabled, language, pitch, rate, volume]);

  // Stop speaking
  const stop = useCallback(async () => {
    await Speech.stop();
    setState('idle');
    currentTextRef.current = '';
  }, []);

  // Pause speaking (iOS only)
  const pause = useCallback(async () => {
    await Speech.pause();
    setState('paused');
  }, []);

  // Resume speaking (iOS only)
  const resume = useCallback(async () => {
    await Speech.resume();
    setState('speaking');
  }, []);

  // Toggle enabled state
  const setEnabled = useCallback(async (enabled: boolean) => {
    setIsEnabledState(enabled);
    await AsyncStorage.setItem(TTS_ENABLED_KEY, enabled.toString());

    if (!enabled) {
      await Speech.stop();
      setState('idle');
    }
  }, []);

  // Set speech rate
  const setRate = useCallback((newRate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2.0, newRate));
    setRateState(clampedRate);
    AsyncStorage.setItem(TTS_RATE_KEY, clampedRate.toString()).catch(console.error);
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    AsyncStorage.setItem(TTS_VOLUME_KEY, clampedVolume.toString()).catch(console.error);
  }, []);

  return {
    state,
    isSpeaking: state === 'speaking',
    isEnabled,
    speak,
    stop,
    pause,
    resume,
    setEnabled,
    setRate,
    setVolume,
    rate,
    volume,
  };
}

// Helper to speak agent responses automatically
export function speakAgentResponse(
  tts: UseTTSReturn,
  response: string,
  options?: { skipIfShort?: boolean; minLength?: number }
): void {
  const { skipIfShort = false, minLength = 10 } = options ?? {};

  // Skip very short responses if option enabled
  if (skipIfShort && response.length < minLength) {
    return;
  }

  // Clean up response for speech (remove markdown, emojis, etc.)
  const cleanedText = cleanTextForSpeech(response);

  if (cleanedText) {
    tts.speak(cleanedText);
  }
}

// Clean text for speech synthesis
function cleanTextForSpeech(text: string): string {
  return text
    // Remove markdown formatting
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/`(.+?)`/g, '$1') // inline code
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/^#+\s*/gm, '') // headers
    .replace(/^[-*]\s*/gm, '') // list items
    // Remove emojis (basic)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // symbols
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // transport
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // dingbats
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
