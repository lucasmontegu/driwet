import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { ChatPanel } from "@/components/chat-panel";
import { MapViewComponent, type WeatherAlert } from "@/components/map-view";
import { useLocation } from "@/hooks/use-location";
import { env } from "@advia/env/native";

export default function Home() {
  const [mapAlerts, setMapAlerts] = useState<WeatherAlert[]>([]);
  const [inputText, setInputText] = useState("");
  const { location } = useLocation();

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: `${env.EXPO_PUBLIC_SERVER_URL}/api/chat`,
    }),
    onError: (error) => console.error("Chat error:", error),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage({ text });
      setInputText("");
    },
    [sendMessage]
  );

  // Convert AI SDK messages to our format
  const chatMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.parts
      ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("") || "",
  }));

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapViewComponent alerts={mapAlerts} />
      </View>

      <ChatPanel
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
});
