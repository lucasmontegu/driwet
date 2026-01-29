// apps/mobile/components/location-chips.tsx
// Premium location selector with chips for origin and destination

import { env } from "@driwet/env/mobile";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Keyboard,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
	Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConnectorDots } from "@/components/home/connector-dots";
import { Icon } from "@/components/icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { springs } from "@/hooks/use-animation-tokens";
import { useLocation } from "@/hooks/use-location";
import { useReduceMotion } from "@/hooks/use-reduce-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useTranslation } from "@/lib/i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type RouteLocation = {
	name: string;
	coordinates: { latitude: number; longitude: number };
};

type MapboxFeature = {
	id: string;
	place_name: string;
	center: [number, number];
};

type LocationChipsProps = {
	origin: RouteLocation | null;
	destination: RouteLocation | null;
	onRouteChange: (
		origin: RouteLocation | null,
		destination: RouteLocation | null,
	) => void;
	isDisabled?: boolean;
	isCalculating?: boolean;
};

export function LocationChips({
	origin,
	destination,
	onRouteChange,
	isDisabled = false,
	isCalculating = false,
}: LocationChipsProps) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { location: userLocation } = useLocation();
	const { t } = useTranslation();
	const reduceMotion = useReduceMotion();

	// Modal state
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [activeField, setActiveField] = useState<
		"origin" | "destination" | null
	>(null);

	// Search state
	const [searchQuery, setSearchQuery] = useState("");
	const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Animation values
	const modalY = useSharedValue(SCREEN_HEIGHT);
	const backdropOpacity = useSharedValue(0);
	const destinationBreathing = useSharedValue(1);
	const placeholderOpacity = useSharedValue(0.5);

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Breathing animation for empty destination
	useEffect(() => {
		if (!destination && !reduceMotion) {
			destinationBreathing.value = withRepeat(
				withSequence(
					withTiming(1.02, {
						duration: 1000,
						easing: Easing.inOut(Easing.ease),
					}),
					withTiming(1, {
						duration: 1000,
						easing: Easing.inOut(Easing.ease),
					}),
				),
				-1,
			);
			placeholderOpacity.value = withRepeat(
				withSequence(
					withTiming(0.8, {
						duration: 1000,
						easing: Easing.inOut(Easing.ease),
					}),
					withTiming(0.5, {
						duration: 1000,
						easing: Easing.inOut(Easing.ease),
					}),
				),
				-1,
			);
		} else {
			destinationBreathing.value = 1;
			placeholderOpacity.value = 0.5;
		}
	}, [destination, reduceMotion]);

	const destinationStyle = useAnimatedStyle(() => ({
		transform: [{ scale: destinationBreathing.value }],
	}));

	const placeholderStyle = useAnimatedStyle(() => ({
		opacity: placeholderOpacity.value,
	}));

	// Modal animation styles
	const modalStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: modalY.value }],
	}));

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value,
	}));

	const openModal = useCallback(
		(field: "origin" | "destination") => {
			if (isDisabled) return;

			setActiveField(field);
			setSearchQuery("");
			setSuggestions([]);
			setIsModalVisible(true);

			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

			modalY.value = withSpring(0, springs.smooth);
			backdropOpacity.value = withTiming(1, { duration: 300 });
		},
		[isDisabled],
	);

	const closeModal = useCallback(() => {
		Keyboard.dismiss();
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		modalY.value = withSpring(SCREEN_HEIGHT, springs.snappy);
		backdropOpacity.value = withTiming(0, { duration: 250 });

		setTimeout(() => {
			setIsModalVisible(false);
			setActiveField(null);
			setSearchQuery("");
			setSuggestions([]);
		}, 300);
	}, []);

	const searchPlaces = useCallback(
		async (query: string) => {
			if (query.length < 2) {
				setSuggestions([]);
				return;
			}

			setIsSearching(true);
			try {
				let url =
					`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
					`access_token=${env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
					"types=place,locality,region,country,address&" +
					"language=es&" +
					"limit=8";

				if (userLocation) {
					url += `&proximity=${userLocation.longitude},${userLocation.latitude}`;
				}

				const response = await fetch(url);
				const data = await response.json();
				setSuggestions(data.features || []);
			} catch (error) {
				console.error("Geocoding error:", error);
				setSuggestions([]);
			} finally {
				setIsSearching(false);
			}
		},
		[userLocation],
	);

	const handleSearchChange = useCallback(
		(text: string) => {
			setSearchQuery(text);

			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}

			searchTimeoutRef.current = setTimeout(() => {
				searchPlaces(text);
			}, 300);
		},
		[searchPlaces],
	);

	const handleSelectSuggestion = useCallback(
		(feature: MapboxFeature) => {
			const location: RouteLocation = {
				name: feature.place_name.split(",")[0] || feature.place_name,
				coordinates: {
					latitude: feature.center[1],
					longitude: feature.center[0],
				},
			};

			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

			if (activeField === "origin") {
				onRouteChange(location, destination);
				if (!destination) {
					closeModal();
					setTimeout(() => openModal("destination"), 350);
				} else {
					closeModal();
				}
			} else {
				onRouteChange(origin, location);
				closeModal();
			}
		},
		[activeField, origin, destination, onRouteChange, closeModal, openModal],
	);

	const handleClearField = useCallback(
		(field: "origin" | "destination") => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			if (field === "origin") {
				onRouteChange(null, destination);
			} else {
				onRouteChange(origin, null);
			}
		},
		[origin, destination, onRouteChange],
	);

	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	const handleUseCurrentLocation = useCallback(async () => {
		if (userLocation && activeField) {
			try {
				const url =
					`https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation.longitude},${userLocation.latitude}.json?` +
					`access_token=${env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
					"types=place,address&" +
					"language=es&" +
					"limit=1";

				const response = await fetch(url);
				const data = await response.json();

				if (data.features?.[0]) {
					const feature = data.features[0];
					const location: RouteLocation = {
						name:
							feature.place_name.split(",")[0] || t("locations.myLocation"),
						coordinates: userLocation,
					};

					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

					if (activeField === "origin") {
						onRouteChange(location, destination);
						if (!destination) {
							closeModal();
							setTimeout(() => openModal("destination"), 350);
						} else {
							closeModal();
						}
					} else {
						onRouteChange(origin, location);
						closeModal();
					}
				}
			} catch (error) {
				console.error("Reverse geocoding error:", error);
				const location: RouteLocation = {
					name: t("locations.myLocation"),
					coordinates: userLocation,
				};

				if (activeField === "origin") {
					onRouteChange(location, destination);
				} else {
					onRouteChange(origin, location);
				}
				closeModal();
			}
		}
	}, [
		userLocation,
		activeField,
		origin,
		destination,
		onRouteChange,
		closeModal,
		openModal,
		t,
	]);

	const hasRoute = origin && destination;
	const connectorState = isCalculating ? "calculating" : hasRoute ? "ready" : "idle";

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.chipsContainer,
					{
						backgroundColor: colors.card,
						shadowColor: "#000000",
					},
				]}
			>
				{/* Origin Chip */}
				<AnimatedPressable
					style={[styles.chip, isDisabled && styles.chipDisabled]}
					onPress={() => openModal("origin")}
					disabled={isDisabled}
				>
					<View
						style={[styles.chipIcon, { backgroundColor: colors.primary + "20" }]}
					>
						<Icon name="location" size={14} color={colors.primary} />
					</View>
					<View style={styles.chipContent}>
						<Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>
							Desde
						</Text>
						<Text
							style={[styles.chipValue, { color: colors.foreground }]}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{origin ? origin.name : "Seleccionar origen"}
						</Text>
					</View>
					{origin && (
						<AnimatedPressable
							style={styles.clearButton}
							onPress={() => handleClearField("origin")}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Icon name="close" size={14} color={colors.mutedForeground} />
						</AnimatedPressable>
					)}
				</AnimatedPressable>

				{/* Connector Dots */}
				<ConnectorDots state={connectorState} />

				{/* Destination Chip */}
				<Animated.View style={!destination ? destinationStyle : undefined}>
					<AnimatedPressable
						style={[styles.chip, isDisabled && styles.chipDisabled]}
						onPress={() => openModal("destination")}
						disabled={isDisabled}
					>
						<View
							style={[styles.chipIcon, { backgroundColor: colors.safe + "20" }]}
						>
							<Icon name="flag" size={14} color={colors.safe} />
						</View>
						<View style={styles.chipContent}>
							<Text
								style={[styles.chipLabel, { color: colors.mutedForeground }]}
							>
								Hasta
							</Text>
							{destination ? (
								<Text
									style={[styles.chipValue, { color: colors.foreground }]}
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{destination.name}
								</Text>
							) : (
								<Animated.Text
									style={[
										styles.chipValue,
										{ color: colors.foreground },
										placeholderStyle,
									]}
								>
									¿A dónde vas?
								</Animated.Text>
							)}
						</View>
						{destination && (
							<AnimatedPressable
								style={styles.clearButton}
								onPress={() => handleClearField("destination")}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Icon name="close" size={14} color={colors.mutedForeground} />
							</AnimatedPressable>
						)}
					</AnimatedPressable>
				</Animated.View>
			</View>

			{/* Search Modal */}
			<Modal
				visible={isModalVisible}
				transparent
				animationType="none"
				onRequestClose={closeModal}
				statusBarTranslucent
			>
				<Animated.View style={[styles.modalOverlay, backdropStyle]}>
					<AnimatedPressable
						style={styles.modalBackdrop}
						onPress={closeModal}
						enableHaptics={false}
					/>
				</Animated.View>

				<Animated.View
					style={[
						styles.modalContent,
						{
							backgroundColor: colors.background,
							paddingBottom: insets.bottom,
						},
						modalStyle,
					]}
				>
					{/* Modal Header */}
					<View style={styles.modalHeader}>
						<AnimatedPressable style={styles.closeButton} onPress={closeModal}>
							<Icon name="close" size={24} color={colors.foreground} />
						</AnimatedPressable>
						<Text style={[styles.modalTitle, { color: colors.foreground }]}>
							{activeField === "origin" ? "Origen" : "Destino"}
						</Text>
						<View style={styles.closeButton} />
					</View>

					{/* Search Input */}
					<View
						style={[
							styles.searchContainer,
							{
								backgroundColor: colors.card,
								borderColor: colors.border,
							},
						]}
					>
						<Icon
							name="search"
							size={20}
							color={colors.mutedForeground}
							style={styles.searchIcon}
						/>
						<TextInput
							style={[styles.searchInput, { color: colors.foreground }]}
							placeholder={t("locations.searchAddress")}
							placeholderTextColor={colors.mutedForeground}
							value={searchQuery}
							onChangeText={handleSearchChange}
							autoFocus
							returnKeyType="search"
						/>
						{searchQuery.length > 0 && (
							<AnimatedPressable
								onPress={() => {
									setSearchQuery("");
									setSuggestions([]);
								}}
							>
								<Icon name="close" size={18} color={colors.mutedForeground} />
							</AnimatedPressable>
						)}
					</View>

					{/* Current Location Button */}
					{activeField === "origin" && userLocation && (
						<AnimatedPressable
							style={[
								styles.currentLocationButton,
								{ backgroundColor: colors.card },
							]}
							onPress={handleUseCurrentLocation}
						>
							<View
								style={[
									styles.currentLocationIcon,
									{ backgroundColor: colors.primary + "20" },
								]}
							>
								<Icon name="location" size={18} color={colors.primary} />
							</View>
							<Text
								style={[
									styles.currentLocationText,
									{ color: colors.foreground },
								]}
							>
								Usar mi ubicación actual
							</Text>
							<Icon
								name="arrowRight"
								size={16}
								color={colors.mutedForeground}
							/>
						</AnimatedPressable>
					)}

					{/* Suggestions List */}
					<ScrollView
						style={styles.suggestionsList}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						{isSearching ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={colors.primary} />
								<Text
									style={[
										styles.loadingText,
										{ color: colors.mutedForeground },
									]}
								>
									Buscando lugares...
								</Text>
							</View>
						) : suggestions.length > 0 ? (
							<View style={styles.suggestionsContainer}>
								{suggestions.map((feature, index) => (
									<Animated.View
										key={feature.id}
										entering={FadeInDown.delay(index * 50).springify()}
									>
										<AnimatedPressable
											style={[
												styles.suggestionItem,
												index !== suggestions.length - 1 && {
													borderBottomWidth: 1,
													borderBottomColor: colors.border,
												},
											]}
											onPress={() => handleSelectSuggestion(feature)}
										>
											<View
												style={[
													styles.suggestionIcon,
													{
														backgroundColor:
															activeField === "origin"
																? colors.primary + "20"
																: colors.safe + "20",
													},
												]}
											>
												<Icon
													name="location"
													size={16}
													color={
														activeField === "origin"
															? colors.primary
															: colors.safe
													}
												/>
											</View>
											<View style={styles.suggestionContent}>
												<Text
													style={[
														styles.suggestionTitle,
														{ color: colors.foreground },
													]}
													numberOfLines={1}
												>
													{feature.place_name.split(",")[0]}
												</Text>
												<Text
													style={[
														styles.suggestionSubtitle,
														{ color: colors.mutedForeground },
													]}
													numberOfLines={1}
												>
													{feature.place_name
														.split(",")
														.slice(1)
														.join(",")
														.trim()}
												</Text>
											</View>
											<Icon
												name="arrowRight"
												size={16}
												color={colors.mutedForeground}
											/>
										</AnimatedPressable>
									</Animated.View>
								))}
							</View>
						) : searchQuery.length >= 2 ? (
							<View style={styles.emptyState}>
								<Icon name="search" size={48} color={colors.mutedForeground} />
								<Text
									style={[styles.emptyStateTitle, { color: colors.foreground }]}
								>
									No se encontraron resultados
								</Text>
								<Text
									style={[
										styles.emptyStateSubtitle,
										{ color: colors.mutedForeground },
									]}
								>
									Intenta con otra búsqueda
								</Text>
							</View>
						) : (
							<View style={styles.emptyState}>
								<Icon
									name="location"
									size={48}
									color={colors.mutedForeground}
								/>
								<Text
									style={[styles.emptyStateTitle, { color: colors.foreground }]}
								>
									{activeField === "origin"
										? t("locations.whereFrom")
										: t("locations.whereTo")}
								</Text>
								<Text
									style={[
										styles.emptyStateSubtitle,
										{ color: colors.mutedForeground },
									]}
								>
									{t("locations.typeAddress")}
								</Text>
							</View>
						)}
					</ScrollView>
				</Animated.View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	chipsContainer: {
		borderRadius: 16,
		padding: 12,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
	},
	chipDisabled: {
		opacity: 0.5,
	},
	chipIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	chipContent: {
		flex: 1,
	},
	chipLabel: {
		fontSize: 11,
		fontWeight: "500",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 2,
	},
	chipValue: {
		fontSize: 15,
		fontWeight: "600",
	},
	clearButton: {
		padding: 4,
	},
	modalOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalBackdrop: {
		flex: 1,
	},
	modalContent: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: "80%",
		minHeight: "50%",
	},
	modalHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	modalTitle: {
		fontSize: 17,
		fontWeight: "600",
	},
	closeButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginTop: 16,
		marginBottom: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
		borderWidth: 1,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		paddingVertical: 4,
	},
	currentLocationButton: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginBottom: 12,
		padding: 12,
		borderRadius: 12,
	},
	currentLocationIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	currentLocationText: {
		flex: 1,
		fontSize: 15,
		fontWeight: "500",
	},
	suggestionsList: {
		flex: 1,
	},
	suggestionsContainer: {
		marginHorizontal: 16,
		marginBottom: 16,
		borderRadius: 12,
		overflow: "hidden",
	},
	suggestionItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		backgroundColor: "transparent",
	},
	suggestionIcon: {
		width: 36,
		height: 36,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	suggestionContent: {
		flex: 1,
	},
	suggestionTitle: {
		fontSize: 15,
		fontWeight: "600",
		marginBottom: 2,
	},
	suggestionSubtitle: {
		fontSize: 13,
	},
	loadingContainer: {
		padding: 40,
		alignItems: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 14,
	},
	emptyState: {
		padding: 40,
		alignItems: "center",
	},
	emptyStateTitle: {
		marginTop: 16,
		fontSize: 17,
		fontWeight: "600",
		textAlign: "center",
	},
	emptyStateSubtitle: {
		marginTop: 8,
		fontSize: 14,
		textAlign: "center",
	},
});
