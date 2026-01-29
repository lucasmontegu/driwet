// apps/mobile/app/(app)/(tabs)/profile.tsx

import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/icons";
import { StatCard } from "@/components/profile/stat-card";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useLanguage } from "@/contexts/language-context";
import { useUserProfile, useUserStats } from "@/hooks/use-api";
import { useIsPremium } from "@/hooks/use-subscription";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@/lib/i18n";
import { useTrialStore } from "@/stores/trial-store";
import type { ThemeMode } from "@/theme/colors";

type SettingItem = {
	icon: IconName;
	labelKey: string;
	route: Href | null;
	value?: string;
	onPress?: () => void;
};

type OptionItem = {
	value: string;
	labelKey: string;
};

const themeOptions: OptionItem[] = [
	{ value: "auto", labelKey: "profile.themeAuto" },
	{ value: "light", labelKey: "profile.themeLight" },
	{ value: "dark", labelKey: "profile.themeDark" },
];

const languageOptions: OptionItem[] = [
	{ value: "es", labelKey: "profile.languageSpanish" },
	{ value: "en", labelKey: "profile.languageEnglish" },
];

function SettingsModal({
	visible,
	onClose,
	title,
	options,
	currentValue,
	onSelect,
}: {
	visible: boolean;
	onClose: () => void;
	title: string;
	options: OptionItem[];
	currentValue: string;
	onSelect: (value: string) => void;
}) {
	const colors = useThemeColors();
	const { t } = useTranslation();

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<AnimatedPressable
				style={styles.modalOverlay}
				onPress={onClose}
				enableHaptics={false}
			>
				<AnimatedPressable
					style={[styles.modalContent, { backgroundColor: colors.card }]}
					onPress={(e) => e.stopPropagation()}
					enableHaptics={false}
				>
					<Text style={[styles.modalTitle, { color: colors.foreground }]}>
						{title}
					</Text>
					{options.map((option, index) => (
						<Animated.View
							key={option.value}
							entering={FadeInDown.delay(index * 50).springify()}
						>
							<AnimatedPressable
								onPress={() => {
									onSelect(option.value);
									onClose();
								}}
								style={[
									styles.modalOption,
									{
										backgroundColor:
											currentValue === option.value
												? colors.primary + "20"
												: "transparent",
									},
								]}
							>
								<Text
									style={[
										styles.modalOptionText,
										{
											color:
												currentValue === option.value
													? colors.primary
													: colors.foreground,
										},
									]}
								>
									{t(option.labelKey)}
								</Text>
								{currentValue === option.value && (
									<Icon name="check" size={20} color={colors.primary} />
								)}
							</AnimatedPressable>
						</Animated.View>
					))}
					<AnimatedPressable onPress={onClose} style={styles.modalCancel}>
						<Text
							style={[
								styles.modalCancelText,
								{ color: colors.mutedForeground },
							]}
						>
							{t("common.cancel")}
						</Text>
					</AnimatedPressable>
				</AnimatedPressable>
			</AnimatedPressable>
		</Modal>
	);
}

export default function ProfileScreen() {
	const colors = useThemeColors();
	const router = useRouter();
	const { t } = useTranslation();
	const { isPremium, isSubscribed, plan } = useIsPremium();
	const { getRemainingDays } = useTrialStore();
	const remainingDays = getRemainingDays();

	const { themeMode, setThemeMode } = useAppTheme();
	const { language, setLanguage } = useLanguage();

	const [showThemeModal, setShowThemeModal] = useState(false);
	const [showLanguageModal, setShowLanguageModal] = useState(false);

	const { data: profile, isLoading: profileLoading } = useUserProfile();
	const { data: stats, isLoading: statsLoading } = useUserStats();

	const getThemeLabel = () => {
		switch (themeMode) {
			case "light":
				return t("profile.themeLight");
			case "dark":
				return t("profile.themeDark");
			default:
				return t("profile.themeAuto");
		}
	};

	const getLanguageLabel = () => {
		return language === "es"
			? t("profile.languageSpanish")
			: t("profile.languageEnglish");
	};

	const settings: SettingItem[] = [
		{
			icon: "notification",
			labelKey: "profile.notifications",
			route: "/notifications",
		},
		{
			icon: "location",
			labelKey: "profile.savedLocations",
			route: "/locations",
		},
		{
			icon: "theme",
			labelKey: "profile.theme",
			route: null,
			value: getThemeLabel(),
			onPress: () => setShowThemeModal(true),
		},
		{
			icon: "language",
			labelKey: "profile.language",
			route: null,
			value: getLanguageLabel(),
			onPress: () => setShowLanguageModal(true),
		},
		{ icon: "help", labelKey: "profile.help", route: null },
	];

	const handleLogout = async () => {
		await authClient.signOut();
		router.replace("/(auth)/welcome");
	};

	const handleUpgrade = () => {
		router.push("/(app)/premium");
	};

	const handleSettingPress = (setting: SettingItem) => {
		if (setting.onPress) {
			setting.onPress();
		} else if (setting.route) {
			router.push(setting.route);
		}
	};

	const formattedStats = [
		{
			icon: "storm" as IconName,
			label: t("profile.stormsAvoided"),
			value: stats?.stormsAvoided ?? 0,
		},
		{
			icon: "money" as IconName,
			label: t("profile.moneySavedShort"),
			value: `$${stats?.moneySaved?.toLocaleString() ?? "0"}`,
		},
		{
			icon: "road" as IconName,
			label: t("profile.kmTraveledShort"),
			value: stats?.kmTraveled ?? 0,
		},
	];

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Header */}
				<Animated.Text
					entering={FadeInDown.delay(0).springify()}
					style={[styles.title, { color: colors.foreground }]}
				>
					{t("profile.title")}
				</Animated.Text>

				{/* User Card */}
				<Animated.View entering={FadeInDown.delay(100).springify()}>
					<AnimatedPressable
						style={[
							styles.userCard,
							{
								backgroundColor: colors.card,
								borderColor: colors.border,
							},
						]}
					>
						<View style={styles.userCardContent}>
							<View
								style={[styles.avatar, { backgroundColor: colors.primary }]}
							>
								<Icon name="user" size={24} color={colors.primaryForeground} />
							</View>
							<View style={styles.userInfo}>
								{profileLoading ? (
									<ActivityIndicator
										size="small"
										color={colors.mutedForeground}
									/>
								) : (
									<>
										<Text
											style={[styles.userEmail, { color: colors.foreground }]}
										>
											{profile?.email ?? t("common.loading")}
										</Text>
										<Text
											style={[
												styles.userPlan,
												{
													color: isSubscribed
														? colors.primary
														: colors.mutedForeground,
												},
											]}
										>
											{isSubscribed
												? t("profile.planPremium")
												: t("profile.trialRemaining", { days: remainingDays })}
										</Text>
									</>
								)}
							</View>
							{!isSubscribed && (
								<AnimatedPressable onPress={handleUpgrade}>
									<Text style={[styles.upgradeText, { color: colors.primary }]}>
										{t("profile.upgrade")}
									</Text>
								</AnimatedPressable>
							)}
						</View>
					</AnimatedPressable>
				</Animated.View>

				{/* Stats Section */}
				<Animated.View
					entering={FadeInDown.delay(200).springify()}
					style={styles.sectionHeader}
				>
					<Icon name="stats" size={18} color={colors.mutedForeground} />
					<Text
						style={[styles.sectionTitle, { color: colors.mutedForeground }]}
					>
						{t("profile.stats")}
					</Text>
				</Animated.View>

				{statsLoading ? (
					<View style={styles.statsLoading}>
						<ActivityIndicator size="small" color={colors.mutedForeground} />
					</View>
				) : (
					<View style={styles.statsGrid}>
						{formattedStats.map((stat, index) => (
							<StatCard
								key={stat.icon}
								icon={stat.icon}
								value={stat.value}
								label={stat.label}
								index={index}
							/>
						))}
					</View>
				)}

				{/* Settings Section */}
				<Animated.View
					entering={FadeInDown.delay(400).springify()}
					style={styles.sectionHeader}
				>
					<Icon name="settings" size={18} color={colors.mutedForeground} />
					<Text
						style={[styles.sectionTitle, { color: colors.mutedForeground }]}
					>
						{t("profile.settings")}
					</Text>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.delay(500).springify()}
					style={[
						styles.settingsCard,
						{
							backgroundColor: colors.card,
							borderColor: colors.border,
						},
					]}
				>
					{settings.map((setting, index) => (
						<AnimatedPressable
							key={setting.labelKey}
							onPress={() => handleSettingPress(setting)}
							style={StyleSheet.flatten([
								styles.settingRow,
								index < settings.length - 1
									? { borderBottomWidth: 1, borderBottomColor: colors.border }
									: {},
							])}
						>
							<Icon name={setting.icon} size={20} color={colors.foreground} />
							<Text style={[styles.settingLabel, { color: colors.foreground }]}>
								{t(setting.labelKey)}
							</Text>
							{setting.value && (
								<Text
									style={[
										styles.settingValue,
										{ color: colors.mutedForeground },
									]}
								>
									{setting.value}
								</Text>
							)}
							<Icon
								name="arrowRight"
								size={16}
								color={colors.mutedForeground}
							/>
						</AnimatedPressable>
					))}
				</Animated.View>

				{/* Logout */}
				<Animated.View entering={FadeInUp.delay(600).springify()}>
					<AnimatedPressable onPress={handleLogout} style={styles.logoutButton}>
						<Icon name="logout" size={20} color={colors.destructive} />
						<Text style={[styles.logoutText, { color: colors.destructive }]}>
							{t("profile.logout")}
						</Text>
					</AnimatedPressable>
				</Animated.View>
			</ScrollView>

			{/* Theme Selection Modal */}
			<SettingsModal
				visible={showThemeModal}
				onClose={() => setShowThemeModal(false)}
				title={t("profile.selectTheme")}
				options={themeOptions}
				currentValue={themeMode}
				onSelect={(value) => setThemeMode(value as ThemeMode)}
			/>

			{/* Language Selection Modal */}
			<SettingsModal
				visible={showLanguageModal}
				onClose={() => setShowLanguageModal(false)}
				title={t("profile.selectLanguage")}
				options={languageOptions}
				currentValue={language}
				onSelect={(value) => setLanguage(value as "en" | "es")}
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
		padding: 16,
	},
	title: {
		fontFamily: "NunitoSans_700Bold",
		fontSize: 28,
		marginBottom: 24,
	},
	userCard: {
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		marginBottom: 24,
	},
	userCardContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
	},
	userInfo: {
		flex: 1,
	},
	userEmail: {
		fontFamily: "NunitoSans_600SemiBold",
		fontSize: 16,
	},
	userPlan: {
		fontFamily: "NunitoSans_400Regular",
		fontSize: 14,
	},
	upgradeText: {
		fontFamily: "NunitoSans_600SemiBold",
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	sectionTitle: {
		fontFamily: "NunitoSans_600SemiBold",
		fontSize: 16,
	},
	statsLoading: {
		padding: 40,
		alignItems: "center",
	},
	statsGrid: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 24,
	},
	settingsCard: {
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 24,
	},
	settingRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
	},
	settingLabel: {
		flex: 1,
		marginLeft: 12,
		fontFamily: "NunitoSans_400Regular",
	},
	settingValue: {
		fontFamily: "NunitoSans_400Regular",
		marginRight: 8,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 16,
	},
	logoutText: {
		fontFamily: "NunitoSans_400Regular",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		borderRadius: 16,
		padding: 20,
		width: "80%",
		maxWidth: 320,
	},
	modalTitle: {
		fontFamily: "NunitoSans_600SemiBold",
		fontSize: 18,
		marginBottom: 16,
		textAlign: "center",
	},
	modalOption: {
		flexDirection: "row",
		alignItems: "center",
		padding: 14,
		borderRadius: 10,
		marginBottom: 8,
	},
	modalOptionText: {
		flex: 1,
		fontFamily: "NunitoSans_400Regular",
		fontSize: 16,
	},
	modalCancel: {
		marginTop: 8,
		padding: 12,
		alignItems: "center",
	},
	modalCancelText: {
		fontFamily: "NunitoSans_400Regular",
	},
});
