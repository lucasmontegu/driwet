// apps/mobile/hooks/use-navigation-chat.ts
// Hook for AI navigation copilot chat

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/query-client";

export type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	tools?: string[];
};

export type RouteLocation = {
	name: string;
	coordinates: { latitude: number; longitude: number };
};

export function useNavigationChat() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const sendMessage = useCallback(
		async ({
			message,
			origin,
			destination,
		}: {
			message: string;
			origin?: RouteLocation | null;
			destination?: RouteLocation | null;
		}) => {
			setIsLoading(true);

			// Add user message
			const userMessage: ChatMessage = {
				id: Date.now().toString(),
				role: "user",
				content: message,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, userMessage]);

			try {
				// Get current weather if we have location
				let weatherData = null;
				let alertsData = null;

				if (origin?.coordinates) {
					try {
						// Weather API uses lat/lng
						weatherData = await apiClient.weather.getCurrent({
							lat: origin.coordinates.latitude,
							lng: origin.coordinates.longitude,
						});
					} catch (e) {
						console.error("Error fetching weather:", e);
					}

					try {
						// Alerts API uses latitude/longitude
						alertsData = await apiClient.alerts.getActive({
							latitude: origin.coordinates.latitude,
							longitude: origin.coordinates.longitude,
						});
					} catch (e) {
						console.error("Error fetching alerts:", e);
					}
				}

				// Call chat API with context
				const response = await apiClient.chat.sendMessage({
					message,
					history: messages.map((m) => ({
						role: m.role,
						content: m.content,
					})),
					location: origin?.coordinates
						? {
								latitude: origin.coordinates.latitude,
								longitude: origin.coordinates.longitude,
							}
						: undefined,
				});

				// Collect streaming response - handle both iterator and direct response
				let responseText = "";
				if (
					response &&
					typeof response === "object" &&
					Symbol.asyncIterator in response
				) {
					// It's an async iterator (streaming)
					for await (const chunk of response) {
						if (typeof chunk === "string") {
							responseText += chunk;
						} else if (chunk && typeof chunk === "object" && "data" in chunk) {
							// SSE event format
							responseText += String(chunk.data);
						}
					}
				} else if (typeof response === "string") {
					// Direct string response
					responseText = response;
				} else {
					// Fallback - try to extract text
					responseText = String(response ?? "");
				}

				// Add assistant message
				const assistantMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: responseText,
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, assistantMessage]);
			} catch (error) {
				console.error("Error in chat:", error);

				// Add error message
				const errorMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content:
						"Lo siento, tuve un problema procesando tu mensaje. Intenta de nuevo.",
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, errorMessage]);
			} finally {
				setIsLoading(false);
			}
		},
		[messages],
	);

	const clearMessages = useCallback(() => {
		setMessages([]);
	}, []);

	return {
		messages,
		isLoading,
		sendMessage,
		clearMessages,
	};
}
