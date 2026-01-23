// apps/mobile/hooks/use-voice-recording.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

type UseVoiceRecordingOptions = {
  onTranscription?: (text: string) => void;
  onError?: (error: Error) => void;
  maxDuration?: number; // in seconds
};

type UseVoiceRecordingReturn = {
  state: RecordingState;
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  transcript: string | null;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
  reset: () => void;
};

// Audio recording settings optimized for speech
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.MEDIUM,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

export function useVoiceRecording({
  onTranscription,
  onError,
  maxDuration = 60,
}: UseVoiceRecordingOptions = {}): UseVoiceRecordingReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        const permError = new Error('Permiso de micrófono denegado');
        setError(permError);
        onError?.(permError);
        return false;
      }
      return true;
    } catch (err) {
      const permError = err instanceof Error ? err : new Error('Error al solicitar permisos');
      setError(permError);
      onError?.(permError);
      return false;
    }
  }, [onError]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Reset state
      setError(null);
      setTranscript(null);
      setDuration(0);

      // Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setState('error');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();

      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setState('recording');

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // Auto-stop if max duration reached
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      const recordError = err instanceof Error ? err : new Error('Error al iniciar grabación');
      setError(recordError);
      setState('error');
      onError?.(recordError);
    }
  }, [requestPermissions, maxDuration, onError]);

  // Stop recording and get transcription
  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (!recordingRef.current) {
      return null;
    }

    try {
      setState('processing');

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (!uri) {
        throw new Error('No se pudo obtener el archivo de audio');
      }

      // TODO: Send to transcription service (Whisper API)
      // For now, return a placeholder
      // In production, this would call the backend API
      const transcribedText = await transcribeAudio(uri);

      setTranscript(transcribedText);
      setState('done');
      onTranscription?.(transcribedText);

      return transcribedText;
    } catch (err) {
      const stopError = err instanceof Error ? err : new Error('Error al procesar grabación');
      setError(stopError);
      setState('error');
      onError?.(stopError);
      return null;
    }
  }, [onTranscription, onError]);

  // Cancel recording without processing
  const cancelRecording = useCallback(async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // Ignore errors when canceling
      }
      recordingRef.current = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    setState('idle');
    setDuration(0);
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setState('idle');
    setDuration(0);
    setTranscript(null);
    setError(null);
  }, []);

  return {
    state,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
    duration,
    transcript,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}

// Transcription helper - calls backend API
async function transcribeAudio(uri: string): Promise<string> {
  // TODO: Implement actual transcription via backend
  // This would send the audio file to our API which calls Whisper

  // For development/demo, simulate transcription
  console.log('Audio file recorded at:', uri);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return placeholder - in production this calls the API
  // const formData = new FormData();
  // formData.append('audio', { uri, type: 'audio/m4a', name: 'recording.m4a' });
  // const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
  // const { text } = await response.json();
  // return text;

  return ''; // Will be replaced with actual transcription
}
