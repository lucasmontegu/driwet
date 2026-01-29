import { Button } from "heroui-native";
import { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { useNavigationChat } from "@/hooks/use-navigation-chat";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Analytics } from "@/lib/analytics";
import { useTranslation } from "@/lib/i18n";

type ChatPanelProps = {
	origin?: {
		name: string;
		coordinates: { latitude: number; longitude: number };
	} | null;
	destination?: {
		name: string;
		coordinates: { latitude: number; longitude: number };
	} | null;
	onClose?: () => void;
};

export function ChatPanel({ origin, destination, onClose }: ChatPanelProps) {
	const [input, setInput] = useState("");
	const insets = useSafeAreaInsets();
	const colors = useThemeColors();
	const { t } = useTranslation();
	const { messages, isLoading, sendMessage, clearMessages } =
		useNavigationChat();

	const handleSend = async () => {
		if (input.trim()) {
			await sendMessage({
				message: input.trim(),
				origin,
				destination,
			});
			setInput("");
			Analytics.chatMessageSent();
		}
	};

	// Default welcome message if no messages
	const displayMessages =
		messages.length > 0
			? messages
			: [
					{
						id: "welcome",
						role: "assistant" as const,
						content: t("chat.welcomeMessage"),
						timestamp: new Date(),
					},
				];

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<View
				style={[
					styles.inner,
					{
						paddingBottom: insets.bottom + 8,
						backgroundColor: colors.card,
					},
				]}
			>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerInfo}>
						<Text style={[styles.headerTitle, { color: colors.foreground }]}>
							{t("chat.title")}
						</Text>
						{(origin || destination) && (
							<Text
								style={[
									styles.headerSubtitle,
									{ color: colors.mutedForeground },
								]}
							>
								{origin?.name || t("chat.myLocation")} →{" "}
								{destination?.name || t("chat.destination")}
							</Text>
						)}
					</View>
					<View style={styles.headerActions}>
						<TouchableOpacity
							onPress={clearMessages}
							style={styles.headerButton}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Icon name="refresh" size={18} color={colors.mutedForeground} />
						</TouchableOpacity>
						{onClose && (
							<TouchableOpacity
								onPress={onClose}
								style={styles.headerButton}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Icon name="close" size={20} color={colors.mutedForeground} />
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Messages area */}
				<ScrollView
					style={styles.messagesContainer}
					contentContainerStyle={styles.messagesContent}
					showsVerticalScrollIndicator={false}
				>
					{displayMessages.map((message, index) => (
						<Animated.View
							key={message.id}
							entering={FadeInUp.delay(index * 100).duration(300)}
							style={[
								styles.messageBubble,
								message.role === "user"
									? [styles.userMessage, { backgroundColor: colors.primary }]
									: [
											styles.assistantMessage,
											{ backgroundColor: colors.muted },
										],
							]}
						>
							<Text
								style={[
									styles.messageText,
									message.role === "user"
										? { color: colors.primaryForeground }
										: { color: colors.foreground },
								]}
							>
								{message.content}
							</Text>
							<Text
								style={[styles.messageTime, { color: colors.mutedForeground }]}
							>
								{message.timestamp.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
						</Animated.View>
					))}

					{isLoading && (
						<View
							style={[
								styles.messageBubble,
								styles.assistantMessage,
								{ backgroundColor: colors.muted },
							]}
						>
							<View style={styles.typingIndicator}>
								<View
									style={[
										styles.typingDot,
										{ backgroundColor: colors.primary },
									]}
								/>
								<View
									style={[
										styles.typingDot,
										{ backgroundColor: colors.primary },
									]}
								/>
								<View
									style={[
										styles.typingDot,
										{ backgroundColor: colors.primary },
									]}
								/>
							</View>
						</View>
					)}
				</ScrollView>

				{/* Input area */}
				<View style={styles.inputContainer}>
					<TextInput
						style={[
							styles.input,
							{
								backgroundColor: colors.muted,
								color: colors.foreground,
							},
						]}
						placeholder={t("chat.inputPlaceholder")}
						placeholderTextColor={colors.mutedForeground}
						value={input}
						onChangeText={setInput}
						onSubmitEditing={handleSend}
						returnKeyType="send"
						multiline
						maxLength={500}
					/>
					<Button
						onPress={handleSend}
						isDisabled={!input.trim() || isLoading}
						size="lg"
						className="rounded-full"
					>
						<Icon name="send" size={20} color="white" />
					</Button>
				</View>

				{/* Quick Actions */}
				<View style={styles.quickActions}>
					<TouchableOpacity
						onPress={() => setInput(t("chat.askRouteWeather"))}
						style={[styles.quickAction, { backgroundColor: colors.muted }]}
					>
						<Text
							style={[styles.quickActionText, { color: colors.foreground }]}
						>
							🌤️ {t("chat.quickRouteWeather")}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setInput(t("chat.askHailAlerts"))}
						style={[styles.quickAction, { backgroundColor: colors.muted }]}
					>
						<Text
							style={[styles.quickActionText, { color: colors.foreground }]}
						>
							⚠️ {t("chat.quickAlerts")}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setInput(t("chat.askStops"))}
						style={[styles.quickAction, { backgroundColor: colors.muted }]}
					>
						<Text
							style={[styles.quickActionText, { color: colors.foreground }]}
						>
							⛽ {t("chat.quickStops")}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		maxHeight: "50%",
		minHeight: 200,
	},
	inner: {
		flex: 1,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 16,
		paddingTop: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 8,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 8,
		paddingHorizontal: 4,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
		marginBottom: 8,
	},
	headerInfo: {
		flex: 1,
	},
	headerTitle: {
		fontFamily: "Inter_700Bold",
		fontSize: 18,
	},
	headerSubtitle: {
		fontFamily: "Inter_400Regular",
		fontSize: 13,
		marginTop: 2,
	},
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	headerButton: {
		padding: 4,
	},
	messagesContainer: {
		flex: 1,
		marginBottom: 8,
	},
	messagesContent: {
		paddingVertical: 8,
	},
	messageBubble: {
		maxWidth: "85%",
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 18,
		marginVertical: 4,
	},
	userMessage: {
		alignSelf: "flex-end",
		borderBottomRightRadius: 4,
	},
	assistantMessage: {
		alignSelf: "flex-start",
		borderBottomLeftRadius: 4,
	},
	messageText: {
		fontSize: 15,
		lineHeight: 20,
	},
	messageTime: {
		fontSize: 10,
		marginTop: 4,
		opacity: 0.7,
	},
	typingIndicator: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 4,
		paddingVertical: 8,
	},
	typingDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		opacity: 0.6,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: 8,
		paddingVertical: 8,
	},
	input: {
		flex: 1,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 15,
		maxHeight: 100,
	},
	quickActions: {
		flexDirection: "row",
		gap: 8,
		paddingVertical: 8,
		paddingBottom: 4,
	},
	quickAction: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	quickActionText: {
		fontFamily: "Inter_500Medium",
		fontSize: 13,
	},
});
