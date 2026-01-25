import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Icon } from "@/components/icons";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { AlertMessageCard, type AlertMessageData } from "./alert-message-card";
import { RouteMessageCard, type RouteMessageData } from "./route-message-card";
import { StopMessageCard, type StopMessageData } from "./stop-message-card";
import { TypingIndicator } from "./typing-indicator";

export type EmbeddedContent =
	| { type: "route"; data: RouteMessageData }
	| { type: "alert"; data: AlertMessageData }
	| { type: "stop"; data: StopMessageData };

export interface ChatMessageData {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	isStreaming?: boolean;
	timestamp?: Date;
	embedded?: EmbeddedContent;
}

interface ChatMessageProps {
	message: ChatMessageData;
	onCopy?: (content: string) => void;
	onSpeak?: (content: string) => void;
	isSpeaking?: boolean;
	// Route card actions
	onStartNavigation?: () => void;
	onEditRoute?: () => void;
	onSaveRoute?: () => void;
	// Alert card actions
	onAddSafeStop?: () => void;
	onIgnoreAlert?: () => void;
	onViewAlertDetails?: () => void;
	// Stop card actions
	onAddStopToRoute?: () => void;
	onShowStopOnMap?: () => void;
	onDismissStop?: () => void;
}

export function ChatMessage({
	message,
	onCopy,
	onSpeak,
	isSpeaking = false,
	// Route card actions
	onStartNavigation,
	onEditRoute,
	onSaveRoute,
	// Alert card actions
	onAddSafeStop,
	onIgnoreAlert,
	onViewAlertDetails,
	// Stop card actions
	onAddStopToRoute,
	onShowStopOnMap,
	onDismissStop,
}: ChatMessageProps) {
	const colors = useThemeColors();
	const isUser = message.role === "user";
	const isAssistant = message.role === "assistant";
	const isSystem = message.role === "system";
	const hasEmbedded = message.embedded !== undefined;

	if (isSystem) {
		return (
			<Animated.View
				entering={FadeInDown.duration(300)}
				style={[styles.systemContainer, { backgroundColor: colors.muted }]}
			>
				<Icon name="storm" size={14} color={colors.mutedForeground} />
				<Text style={[styles.systemText, { color: colors.mutedForeground }]}>
					{message.content}
				</Text>
			</Animated.View>
		);
	}

	// Show typing indicator while streaming and no content yet
	if (message.isStreaming && !message.content) {
		return (
			<Animated.View
				entering={FadeInUp.duration(200)}
				style={styles.assistantRow}
			>
				<View style={[styles.avatar, { backgroundColor: colors.primary }]}>
					<Icon name="storm" size={16} color={colors.primaryForeground} />
				</View>
				<TypingIndicator size="md" />
			</Animated.View>
		);
	}

	// Render embedded content card
	const renderEmbeddedContent = () => {
		if (!message.embedded) return null;

		switch (message.embedded.type) {
			case "route":
				return (
					<RouteMessageCard
						route={message.embedded.data}
						onStartNavigation={onStartNavigation}
						onEditRoute={onEditRoute}
						onSaveRoute={onSaveRoute}
					/>
				);
			case "alert":
				return (
					<AlertMessageCard
						alert={message.embedded.data}
						onAddStop={onAddSafeStop}
						onIgnore={onIgnoreAlert}
						onViewDetails={onViewAlertDetails}
					/>
				);
			case "stop":
				return (
					<StopMessageCard
						stop={message.embedded.data}
						onAddToRoute={onAddStopToRoute}
						onShowOnMap={onShowStopOnMap}
						onDismiss={onDismissStop}
					/>
				);
			default:
				return null;
		}
	};

	// Messages with embedded content have a different layout
	if (hasEmbedded && isAssistant) {
		return (
			<Animated.View
				entering={FadeInUp.duration(300).springify()}
				style={styles.embeddedMessageContainer}
			>
				{/* Avatar row with optional intro text */}
				<View style={styles.assistantRow}>
					<View style={[styles.avatar, { backgroundColor: colors.primary }]}>
						<Icon name="storm" size={16} color={colors.primaryForeground} />
					</View>
					{message.content ? (
						<View
							style={[
								styles.bubble,
								styles.assistantBubble,
								{ backgroundColor: colors.muted },
							]}
						>
							<Text style={[styles.messageText, { color: colors.foreground }]}>
								{message.content}
							</Text>
						</View>
					) : null}
				</View>

				{/* Embedded card - full width with left margin for avatar alignment */}
				<View style={styles.embeddedCardContainer}>
					{renderEmbeddedContent()}
				</View>
			</Animated.View>
		);
	}

	return (
		<Animated.View
			entering={FadeInUp.duration(300).springify()}
			style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}
		>
			{/* Avatar for assistant */}
			{isAssistant && (
				<View style={[styles.avatar, { backgroundColor: colors.primary }]}>
					<Icon name="storm" size={16} color={colors.primaryForeground} />
				</View>
			)}

			<View
				style={[
					styles.bubble,
					isUser ? styles.userBubble : styles.assistantBubble,
					{
						backgroundColor: isUser ? colors.primary : colors.muted,
					},
				]}
			>
				<Text
					style={[
						styles.messageText,
						{
							color: isUser ? colors.primaryForeground : colors.foreground,
						},
					]}
				>
					{message.content}
					{message.isStreaming && <Text style={styles.cursor}>|</Text>}
				</Text>

				{/* Actions for assistant messages */}
				{isAssistant && !message.isStreaming && message.content && (
					<View style={styles.actionsRow}>
						{onCopy && (
							<Pressable
								onPress={() => onCopy(message.content)}
								style={[
									styles.actionButton,
									{ backgroundColor: colors.background + "80" },
								]}
								hitSlop={8}
							>
								<Icon name="copy" size={14} color={colors.mutedForeground} />
							</Pressable>
						)}
						{onSpeak && (
							<Pressable
								onPress={() => onSpeak(message.content)}
								style={[
									styles.actionButton,
									{
										backgroundColor: isSpeaking
											? colors.primary + "20"
											: colors.background + "80",
									},
								]}
								hitSlop={8}
							>
								<Icon
									name="voice"
									size={14}
									color={isSpeaking ? colors.primary : colors.mutedForeground}
								/>
							</Pressable>
						)}
					</View>
				)}
			</View>

			{/* Spacer for user messages (to align right) */}
			{isUser && <View style={styles.avatar} />}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	messageRow: {
		flexDirection: "row",
		marginBottom: 12,
		paddingHorizontal: 4,
	},
	userRow: {
		justifyContent: "flex-end",
	},
	assistantRow: {
		flexDirection: "row",
		justifyContent: "flex-start",
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 8,
	},
	embeddedMessageContainer: {
		marginBottom: 12,
		paddingHorizontal: 4,
	},
	embeddedCardContainer: {
		marginLeft: 40, // Align with message text (avatar width + margin)
		marginTop: 8,
	},
	bubble: {
		maxWidth: "75%",
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 18,
	},
	userBubble: {
		borderBottomRightRadius: 4,
		marginRight: 8,
	},
	assistantBubble: {
		borderBottomLeftRadius: 4,
	},
	messageText: {
		fontFamily: "NunitoSans_400Regular",
		fontSize: 15,
		lineHeight: 22,
	},
	cursor: {
		opacity: 0.5,
	},
	actionsRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "rgba(255,255,255,0.1)",
	},
	actionButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
	},
	systemContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		alignSelf: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		marginVertical: 8,
	},
	systemText: {
		fontFamily: "NunitoSans_400Regular",
		fontSize: 12,
	},
});
