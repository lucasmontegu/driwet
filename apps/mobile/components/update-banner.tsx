// apps/mobile/components/update-banner.tsx
// Banner to show OTA update status and prompt user to update

import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { Icon } from "@/components/icons";
import { useOTAUpdates } from "@/hooks/use-ota-updates";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function UpdateBanner() {
	const colors = useThemeColors();
	const {
		status,
		isUpdateAvailable,
		isUpdatePending,
		isChecking,
		isDownloading,
		updateId,
		downloadUpdate,
		applyUpdate,
	} = useOTAUpdates();

	// Don't show in development
	if (__DEV__) return null;

	// Show checking state briefly
	if (isChecking) {
		return (
			<Animated.View
				entering={FadeInDown.duration(300)}
				exiting={FadeOutUp.duration(200)}
				style={[styles.container, { backgroundColor: colors.muted }]}
			>
				<View style={styles.content}>
					<Icon name="refresh" size={16} color={colors.mutedForeground} />
					<Text style={[styles.text, { color: colors.mutedForeground }]}>
						Buscando actualizaciones...
					</Text>
				</View>
			</Animated.View>
		);
	}

	// Show download button when update is available
	if (isUpdateAvailable) {
		return (
			<Animated.View
				entering={FadeInDown.duration(300)}
				exiting={FadeOutUp.duration(200)}
				style={styles.container}
			>
				<Pressable onPress={downloadUpdate} style={styles.pressable}>
					<LinearGradient
						colors={[colors.primary, "#1D4ED8"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.gradient}
					>
						<View style={styles.content}>
							<Icon name="arrowRight" size={18} color="#FFFFFF" />
							<Text style={[styles.text, styles.textWhite]}>
								Nueva versión disponible
							</Text>
							<Text style={[styles.subtext, styles.textWhite]}>
								Toque para descargar
							</Text>
						</View>
						<Icon name="arrowRight" size={20} color="#FFFFFF" />
					</LinearGradient>
				</Pressable>
			</Animated.View>
		);
	}

	// Show downloading state
	if (isDownloading) {
		return (
			<Animated.View
				entering={FadeInDown.duration(300)}
				exiting={FadeOutUp.duration(200)}
				style={[styles.container, { backgroundColor: colors.primary }]}
			>
				<View style={styles.gradient}>
					<View style={styles.content}>
						<Icon name="refresh" size={18} color="#FFFFFF" />
						<Text style={[styles.text, styles.textWhite]}>
							Descargando actualización...
						</Text>
					</View>
				</View>
			</Animated.View>
		);
	}

	// Show apply button when update is ready
	if (isUpdatePending) {
		return (
			<Animated.View
				entering={FadeInDown.duration(300)}
				exiting={FadeOutUp.duration(200)}
				style={styles.container}
			>
				<Pressable onPress={applyUpdate} style={styles.pressable}>
					<LinearGradient
						colors={[colors.success, "#059669"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.gradient}
					>
						<View style={styles.content}>
							<Icon name="checkCircle" size={18} color="#FFFFFF" />
							<View>
								<Text style={[styles.text, styles.textWhite]}>
									Actualización lista
								</Text>
								<Text style={[styles.subtext, styles.textWhite]}>
									Toque para aplicar ahora
								</Text>
							</View>
						</View>
						<Icon name="refresh" size={20} color="#FFFFFF" />
					</LinearGradient>
				</Pressable>
			</Animated.View>
		);
	}

	return null;
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 100,
		marginHorizontal: 16,
		marginTop: 60, // Below status bar
		borderRadius: 12,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
	},
	pressable: {
		width: "100%",
	},
	gradient: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	text: {
		fontFamily: "Inter_600SemiBold",
		fontSize: 14,
	},
	textWhite: {
		color: "#FFFFFF",
	},
	subtext: {
		fontFamily: "Inter_400Regular",
		fontSize: 12,
		opacity: 0.9,
	},
});
