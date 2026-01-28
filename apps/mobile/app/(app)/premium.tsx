// apps/mobile/app/(app)/premium.tsx
// Premium benefits screen - Informational only
// Uses RevenueCat native paywall for actual purchase flow

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useEffect, useState } from "react";
import {
	Dimensions,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { PaywallModal } from "@/components/subscription/paywall-modal";
import {
	useIsPremium,
	useSubscriptionManagement,
} from "@/hooks/use-subscription";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";

const { width } = Dimensions.get("window");

export default function PremiumScreen() {
	const colors = useThemeColors();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const { isSubscribed, isPremium } = useIsPremium();
	const { restore, isLoading: isManagementLoading } =
		useSubscriptionManagement();

	// State for paywall modal
	const [showPaywall, setShowPaywall] = useState(false);
	const [isRestoring, setIsRestoring] = useState(false);

	// Animation values
	const headerScale = useSharedValue(0.9);
	const ctaScale = useSharedValue(1);
	const glowOpacity = useSharedValue(0.3);

	useEffect(() => {
		headerScale.value = withSpring(1, { damping: 12 });

		// CTA pulse animation
		ctaScale.value = withDelay(
			1000,
			withRepeat(
				withSequence(
					withTiming(1.02, { duration: 600 }),
					withTiming(1, { duration: 600 }),
				),
				-1,
			),
		);

		// Glow animation
		glowOpacity.value = withRepeat(
			withSequence(
				withTiming(0.6, { duration: 1500 }),
				withTiming(0.3, { duration: 1500 }),
			),
			-1,
		);
	}, []);

	const headerStyle = useAnimatedStyle(() => ({
		transform: [{ scale: headerScale.value }],
	}));

	const ctaStyle = useAnimatedStyle(() => ({
		transform: [{ scale: ctaScale.value }],
	}));

	const glowStyle = useAnimatedStyle(() => ({
		opacity: glowOpacity.value,
	}));

	const features = [
		{
			icon: "route" as const,
			text: "Unlimited route weather checks",
			highlight: true,
		},
		{
			icon: "notification" as const,
			text: "Real-time storm alerts",
			highlight: true,
		},
		{ icon: "voice" as const, text: "AI voice co-pilot", highlight: false },
		{
			icon: "location" as const,
			text: "Safe stop recommendations",
			highlight: false,
		},
		{ icon: "map" as const, text: "Refuge location finder", highlight: false },
		{
			icon: "history" as const,
			text: "Full trip history & stats",
			highlight: false,
		},
	];

	const handleUpgrade = () => {
		setShowPaywall(true);
	};

	const handleManageSubscription = async () => {
		// For subscribed users, show customer center
		// For non-subscribed, this shouldn't be called
	};

	const handleRestorePurchases = async () => {
		setIsRestoring(true);
		try {
			await restore();
		} finally {
			setIsRestoring(false);
		}
	};

	const isLoading = isManagementLoading || isRestoring;

	// If already subscribed, show management view
	if (isSubscribed) {
		return (
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}
			>
				<ScrollView contentContainerStyle={styles.subscribedContent}>
					<Pressable onPress={() => router.back()} style={styles.closeButton}>
						<Icon name="close" size={24} color={colors.mutedForeground} />
					</Pressable>

					<Animated.View
						entering={FadeInDown.duration(500)}
						style={styles.subscribedHeader}
					>
						<LinearGradient
							colors={[colors.primary, "#4F46E5"]}
							style={styles.subscribedBadge}
						>
							<Icon name="storm" size={32} color="#FFFFFF" />
						</LinearGradient>
						<Text
							style={[styles.subscribedTitle, { color: colors.foreground }]}
						>
							Driwet Pro
						</Text>
						<Text
							style={[
								styles.subscribedSubtitle,
								{ color: colors.mutedForeground },
							]}
						>
							You have full access to all features
						</Text>
					</Animated.View>

					<View style={styles.subscribedFeatures}>
						{features.map((feature, index) => (
							<Animated.View
								key={feature.text}
								entering={FadeInUp.delay(100 + index * 50).duration(400)}
								style={styles.featureRow}
							>
								<View
									style={[
										styles.featureIconBg,
										{ backgroundColor: colors.primary + "15" },
									]}
								>
									<Icon name={feature.icon} size={18} color={colors.primary} />
								</View>
								<Text
									style={[styles.featureText, { color: colors.foreground }]}
								>
									{feature.text}
								</Text>
								<Icon name="check" size={18} color={colors.safe} />
							</Animated.View>
						))}
					</View>

					<View style={styles.subscribedActions}>
						<Button
							onPress={handleManageSubscription}
							size="lg"
							variant="secondary"
							className="w-full"
							isDisabled={isLoading}
						>
							<Button.Label>
								{isManagementLoading ? "Loading..." : "Manage Subscription"}
							</Button.Label>
						</Button>
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
			edges={["top"]}
		>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: insets.bottom + 24 },
				]}
				showsVerticalScrollIndicator={false}
			>
				{/* Close button */}
				<Pressable onPress={() => router.back()} style={styles.closeButton}>
					<Icon name="close" size={24} color={colors.mutedForeground} />
				</Pressable>

				{/* Header with gradient glow */}
				<Animated.View style={[styles.header, headerStyle]}>
					<Animated.View
						style={[
							styles.headerGlow,
							{ backgroundColor: colors.primary },
							glowStyle,
						]}
					/>
					<LinearGradient
						colors={[colors.primary, "#4F46E5"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.iconContainer}
					>
						<Icon name="storm" size={36} color="#FFFFFF" />
					</LinearGradient>
					<Text style={[styles.title, { color: colors.foreground }]}>
						Upgrade to Pro
					</Text>
					<Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
						Drive safer with advanced weather intelligence
					</Text>
				</Animated.View>

				{/* Social proof */}
				<Animated.View
					entering={FadeInUp.delay(200).duration(400)}
					style={[styles.socialProof, { backgroundColor: colors.card }]}
				>
					<View style={styles.socialProofAvatars}>
						{["👨", "👩", "🧑", "👨‍🦱"].map((emoji, i) => (
							<View
								key={emoji}
								style={[
									styles.avatar,
									{
										backgroundColor: [
											"#6366F1",
											"#8B5CF6",
											"#EC4899",
											"#F59E0B",
										][i],
										marginLeft: i > 0 ? -8 : 0,
									},
								]}
							>
								<Text style={styles.avatarEmoji}>{emoji}</Text>
							</View>
						))}
					</View>
					<Text style={[styles.socialProofText, { color: colors.foreground }]}>
						<Text style={{ fontFamily: "Inter_600SemiBold" }}>
							12,847+ drivers
						</Text>{" "}
						chose Pro this month
					</Text>
				</Animated.View>

				{/* Features list */}
				<Animated.View
					entering={FadeInUp.delay(300).duration(500)}
					style={styles.featuresContainer}
				>
					<Text style={[styles.featuresTitle, { color: colors.foreground }]}>
						Everything you get:
					</Text>
					{features.map((feature) => (
						<View key={feature.text} style={styles.featureRow}>
							<View
								style={[
									styles.featureIconBg,
									{
										backgroundColor: feature.highlight
											? colors.primary + "15"
											: colors.muted,
									},
								]}
							>
								<Icon
									name={feature.icon}
									size={16}
									color={
										feature.highlight ? colors.primary : colors.mutedForeground
									}
								/>
							</View>
							<Text style={[styles.featureText, { color: colors.foreground }]}>
								{feature.text}
							</Text>
						</View>
					))}
				</Animated.View>

				{/* CTA Section */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(400)}
					style={styles.ctaContainer}
				>
					<Animated.View style={ctaStyle}>
						<Button
							onPress={handleUpgrade}
							size="lg"
							className="w-full"
							isDisabled={isLoading}
						>
							<Button.Label>
								{isLoading ? "Loading..." : "Start Free Trial"}
							</Button.Label>
						</Button>
					</Animated.View>

					{/* 7-day trial reminder */}
					<View
						style={[
							styles.trialReminder,
							{ backgroundColor: colors.safe + "10" },
						]}
					>
						<Icon name="check" size={16} color={colors.safe} />
						<Text style={[styles.trialText, { color: colors.foreground }]}>
							7-day free trial included
						</Text>
					</View>

					{/* Restore purchases */}
					<Pressable
						onPress={handleRestorePurchases}
						style={styles.restoreButton}
					>
						<Text
							style={[styles.restoreText, { color: colors.mutedForeground }]}
						>
							{isRestoring ? "Restoring..." : "Restore Purchases"}
						</Text>
					</Pressable>
				</Animated.View>

				{/* Trust badges */}
				<Animated.View
					entering={FadeInUp.delay(500).duration(400)}
					style={styles.trustBadges}
				>
					<View style={styles.trustBadge}>
						<Icon name="lock" size={14} color={colors.mutedForeground} />
						<Text style={[styles.trustText, { color: colors.mutedForeground }]}>
							Secure payment
						</Text>
					</View>
					<View style={styles.trustBadge}>
						<Icon name="refresh" size={14} color={colors.mutedForeground} />
						<Text style={[styles.trustText, { color: colors.mutedForeground }]}>
							Cancel anytime
						</Text>
					</View>
				</Animated.View>
			</ScrollView>

			{/* RevenueCat Native Paywall Modal */}
			<PaywallModal
				visible={showPaywall}
				onDismiss={() => setShowPaywall(false)}
				allowDismiss={true}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
	},
	closeButton: {
		alignSelf: "flex-end",
		padding: 8,
		marginBottom: 8,
	},
	header: {
		alignItems: "center",
		marginBottom: 20,
	},
	headerGlow: {
		position: "absolute",
		width: 100,
		height: 100,
		borderRadius: 50,
		top: -10,
	},
	iconContainer: {
		width: 72,
		height: 72,
		borderRadius: 36,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	title: {
		fontFamily: "Inter_700Bold",
		fontSize: 28,
		marginBottom: 8,
	},
	subtitle: {
		fontFamily: "Inter_400Regular",
		fontSize: 15,
		textAlign: "center",
	},
	socialProof: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 12,
		marginBottom: 20,
		gap: 12,
	},
	socialProofAvatars: {
		flexDirection: "row",
	},
	avatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "#FFFFFF",
	},
	avatarEmoji: {
		fontSize: 14,
	},
	socialProofText: {
		fontFamily: "Inter_400Regular",
		fontSize: 13,
		flex: 1,
	},
	featuresContainer: {
		marginBottom: 24,
	},
	featuresTitle: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 16,
		marginBottom: 16,
	},
	featureRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 12,
	},
	featureIconBg: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	featureText: {
		fontFamily: "Inter_400Regular",
		fontSize: 14,
		flex: 1,
	},
	ctaContainer: {
		marginBottom: 16,
	},
	trialReminder: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 12,
		marginTop: 12,
		borderRadius: 10,
	},
	trialText: {
		fontFamily: "Inter_500Medium",
		fontSize: 14,
	},
	restoreButton: {
		alignItems: "center",
		paddingVertical: 12,
		marginTop: 8,
	},
	restoreText: {
		fontFamily: "Inter_400Regular",
		fontSize: 14,
	},
	trustBadges: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 24,
		marginTop: 8,
	},
	trustBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	trustText: {
		fontFamily: "Inter_400Regular",
		fontSize: 12,
	},
	// Subscribed state styles
	subscribedContent: {
		padding: 24,
		alignItems: "center",
	},
	subscribedHeader: {
		alignItems: "center",
		marginBottom: 32,
	},
	subscribedBadge: {
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	subscribedTitle: {
		fontFamily: "Inter_700Bold",
		fontSize: 28,
		marginBottom: 8,
	},
	subscribedSubtitle: {
		fontFamily: "Inter_400Regular",
		fontSize: 15,
		textAlign: "center",
		marginBottom: 16,
	},
	subscribedFeatures: {
		width: "100%",
		marginBottom: 32,
	},
	subscribedActions: {
		width: "100%",
	},
});
