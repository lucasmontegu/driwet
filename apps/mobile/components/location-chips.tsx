// apps/mobile/components/location-chips.tsx
// Premium location selector with chips for origin and destination

import { env } from "@driwet/env/mobile";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	Easing,
	Keyboard,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { useLocation } from "@/hooks/use-location";
import { useThemeColors } from "@/hooks/use-theme-colors";

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
};

export function LocationChips({
	origin,
	destination,
	onRouteChange,
	isDisabled = false,
}: LocationChipsProps) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const { location: userLocation } = useLocation();

	// Modal state
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [activeField, setActiveField] = useState<
		"origin" | "destination" | null
	>(null);

	// Search state
	const [searchQuery, setSearchQuery] = useState("");
	const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Animation
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Open modal for specific field
	const openModal = useCallback(
		(field: "origin" | "destination") => {
			if (isDisabled) return;

			setActiveField(field);
			setSearchQuery("");
			setSuggestions([]);
			setIsModalVisible(true);

			// Haptic feedback
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

			// Animate in with spring
			Animated.parallel([
				Animated.spring(slideAnim, {
					toValue: 0,
					damping: 18,
					stiffness: 120,
					mass: 0.9,
					useNativeDriver: true,
				}),
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}),
			]).start();
		},
		[isDisabled, slideAnim, fadeAnim],
	);

	// Close modal
	const closeModal = useCallback(() => {
		Keyboard.dismiss();
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		Animated.parallel([
			Animated.spring(slideAnim, {
				toValue: SCREEN_HEIGHT,
				damping: 20,
				stiffness: 180,
				mass: 0.9,
				useNativeDriver: true,
			}),
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 250,
				easing: Easing.in(Easing.ease),
				useNativeDriver: true,
			}),
		]).start(() => {
			setIsModalVisible(false);
			setActiveField(null);
			setSearchQuery("");
			setSuggestions([]);
		});
	}, [slideAnim, fadeAnim]);

	// Search places using Mapbox
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

	// Handle search query change
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

	// Select a suggestion
	const handleSelectSuggestion = useCallback(
		(feature: MapboxFeature) => {
			const location: RouteLocation = {
				name: feature.place_name.split(",")[0] || feature.place_name,
				coordinates: {
					latitude: feature.center[1],
					longitude: feature.center[0],
				},
			};

			if (activeField === "origin") {
				onRouteChange(location, destination);
				// If destination is not set, open destination modal
				if (!destination) {
					closeModal();
					setTimeout(() => openModal("destination"), 300);
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

	// Clear specific field
	const handleClearField = useCallback(
		(field: "origin" | "destination") => {
			if (field === "origin") {
				onRouteChange(null, destination);
			} else {
				onRouteChange(origin, null);
			}
		},
		[origin, destination, onRouteChange],
	);

	// Cleanup
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	// Get current location
	const handleUseCurrentLocation = useCallback(async () => {
		if (userLocation && activeField) {
			// Reverse geocode to get location name
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
						name: feature.place_name.split(",")[0] || "Mi ubicación",
						coordinates: userLocation,
					};

					if (activeField === "origin") {
						onRouteChange(location, destination);
						if (!destination) {
							closeModal();
							setTimeout(() => openModal("destination"), 300);
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
				// Fallback to generic name
				const location: RouteLocation = {
					name: "Mi ubicación",
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
	]);

	const hasRoute = origin && destination;

	return (
		<View style={styles.container}>
			{/* Main Chips Container */}
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
				<TouchableOpacity
					style={[
						styles.chip,
						!origin && styles.chipEmpty,
						isDisabled && styles.chipDisabled,
					]}
					onPress={() => openModal("origin")}
					activeOpacity={0.7}
					disabled={isDisabled}
				>
					<View
						style={[
							styles.chipIcon,
							{ backgroundColor: colors.primary + "20" },
						]}
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
						<TouchableOpacity
							style={styles.clearButton}
							onPress={() => handleClearField("origin")}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Icon name="close" size={14} color={colors.mutedForeground} />
						</TouchableOpacity>
					)}
				</TouchableOpacity>

				{/* Divider */}
				<View style={[styles.divider, { backgroundColor: colors.border }]} />

				{/* Destination Chip */}
				<TouchableOpacity
					style={[
						styles.chip,
						!destination && styles.chipEmpty,
						isDisabled && styles.chipDisabled,
					]}
					onPress={() => openModal("destination")}
					activeOpacity={0.7}
					disabled={isDisabled}
				>
					<View
						style={[styles.chipIcon, { backgroundColor: colors.safe + "20" }]}
					>
						<Icon name="flag" size={14} color={colors.safe} />
					</View>
					<View style={styles.chipContent}>
						<Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>
							Hasta
						</Text>
						<Text
							style={[styles.chipValue, { color: colors.foreground }]}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{destination ? destination.name : "Seleccionar destino"}
						</Text>
					</View>
					{destination && (
						<TouchableOpacity
							style={styles.clearButton}
							onPress={() => handleClearField("destination")}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Icon name="close" size={14} color={colors.mutedForeground} />
						</TouchableOpacity>
					)}
				</TouchableOpacity>
			</View>

			{/* Search Modal */}
			<Modal
				visible={isModalVisible}
				transparent
				animationType="none"
				onRequestClose={closeModal}
				statusBarTranslucent
			>
				<Animated.View
					style={[
						styles.modalOverlay,
						{
							backgroundColor: "rgba(0,0,0,0.5)",
							opacity: fadeAnim,
						},
					]}
				>
					<Pressable style={styles.modalBackdrop} onPress={closeModal} />
				</Animated.View>

				<Animated.View
					style={[
						styles.modalContent,
						{
							backgroundColor: colors.background,
							paddingBottom: insets.bottom,
							transform: [{ translateY: slideAnim }],
						},
					]}
				>
					{/* Modal Header */}
					<View style={styles.modalHeader}>
						<TouchableOpacity style={styles.closeButton} onPress={closeModal}>
							<Icon name="close" size={24} color={colors.foreground} />
						</TouchableOpacity>
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
							placeholder="Buscar dirección..."
							placeholderTextColor={colors.mutedForeground}
							value={searchQuery}
							onChangeText={handleSearchChange}
							autoFocus
							returnKeyType="search"
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity
								onPress={() => {
									setSearchQuery("");
									setSuggestions([]);
								}}
							>
								<Icon name="close" size={18} color={colors.mutedForeground} />
							</TouchableOpacity>
						)}
					</View>

					{/* Current Location Button */}
					{activeField === "origin" && userLocation && (
						<TouchableOpacity
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
						</TouchableOpacity>
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
									<TouchableOpacity
										key={feature.id}
										style={[
											styles.suggestionItem,
											index !== suggestions.length - 1 && {
												borderBottomWidth: 1,
												borderBottomColor: colors.border,
											},
										]}
										onPress={() => handleSelectSuggestion(feature)}
										activeOpacity={0.7}
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
									</TouchableOpacity>
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
										? "¿Desde dónde sales?"
										: "¿A dónde vas?"}
								</Text>
								<Text
									style={[
										styles.emptyStateSubtitle,
										{ color: colors.mutedForeground },
									]}
								>
									Escribe una dirección o lugar
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
	chipEmpty: {
		opacity: 0.7,
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
	divider: {
		height: 1,
		marginVertical: 4,
	},
	// Modal styles
	modalOverlay: {
		...StyleSheet.absoluteFillObject,
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
