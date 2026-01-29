// apps/mobile/components/location-chips.tsx
// Clean, flat design location selector inspired by modern ride-sharing apps

import { env } from "@driwet/env/mobile";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Keyboard,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	Easing,
	FadeIn,
	SlideInDown,
	SlideOutDown,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icons";
import { durations, easings } from "@/hooks/use-animation-tokens";
import { useLocation } from "@/hooks/use-location";
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
	const modalOpacity = useSharedValue(0);
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const openModal = useCallback(
		(field: "origin" | "destination") => {
			if (isDisabled) return;

			setActiveField(field);
			setSearchQuery("");
			setSuggestions([]);
			setIsModalVisible(true);

			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			modalOpacity.value = withTiming(1, {
				duration: durations.normal,
				easing: easings.enter,
			});
		},
		[isDisabled],
	);

	const closeModal = useCallback(() => {
		Keyboard.dismiss();
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		modalOpacity.value = withTiming(0, {
			duration: durations.fast,
			easing: easings.exit,
		});

		setTimeout(() => {
			setIsModalVisible(false);
			setActiveField(null);
			setSearchQuery("");
			setSuggestions([]);
		}, durations.fast);
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
					"limit=6";

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
					setTimeout(() => openModal("destination"), 200);
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

	const handleSwapLocations = useCallback(() => {
		if (!origin && !destination) return;
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onRouteChange(destination, origin);
	}, [origin, destination, onRouteChange]);

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
						name: feature.place_name.split(",")[0] || t("locations.myLocation"),
						coordinates: userLocation,
					};

					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

					if (activeField === "origin") {
						onRouteChange(location, destination);
						if (!destination) {
							closeModal();
							setTimeout(() => openModal("destination"), 200);
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

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: modalOpacity.value,
	}));

	return (
		<View style={styles.container}>
			{/* Main card - white with subtle border */}
			<View
				style={[
					styles.card,
					{
						backgroundColor: colors.card,
						borderColor: colors.border,
					},
				]}
			>
				{/* Side-by-side From/To layout */}
				<View style={styles.locationsRow}>
					{/* From */}
					<Pressable
						style={[styles.locationBox, isDisabled && styles.locationDisabled]}
						onPress={() => openModal("origin")}
						disabled={isDisabled}
					>
						<Text style={[styles.locationLabel, { color: colors.mutedForeground }]}>
							From
						</Text>
						<Text
							style={[
								styles.locationName,
								{ color: colors.foreground },
								!origin && { color: colors.mutedForeground },
							]}
							numberOfLines={1}
						>
							{origin?.name || "Select origin"}
						</Text>
						{origin && (
							<Text
								style={[styles.locationSubtext, { color: colors.mutedForeground }]}
								numberOfLines={1}
							>
								Your location
							</Text>
						)}
					</Pressable>

					{/* Swap button */}
					<Pressable
						style={[styles.swapButton, { borderColor: colors.border }]}
						onPress={handleSwapLocations}
						disabled={!origin && !destination}
					>
						<Icon name="swap" size={16} color={colors.mutedForeground} />
					</Pressable>

					{/* To */}
					<Pressable
						style={[styles.locationBox, isDisabled && styles.locationDisabled]}
						onPress={() => openModal("destination")}
						disabled={isDisabled}
					>
						<Text style={[styles.locationLabel, { color: colors.mutedForeground }]}>
							To
						</Text>
						<Text
							style={[
								styles.locationName,
								{ color: colors.foreground },
								!destination && { color: colors.mutedForeground },
							]}
							numberOfLines={1}
						>
							{destination?.name || "Where to?"}
						</Text>
						{destination && (
							<Text
								style={[styles.locationSubtext, { color: colors.mutedForeground }]}
								numberOfLines={1}
							>
								Destination
							</Text>
						)}
					</Pressable>
				</View>
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
					<Pressable style={styles.modalBackdrop} onPress={closeModal} />
				</Animated.View>

				<Animated.View
					entering={SlideInDown.duration(250).easing(
						Easing.bezier(0.2, 0, 0, 1),
					)}
					exiting={SlideOutDown.duration(200).easing(
						Easing.bezier(0.4, 0, 1, 1),
					)}
					style={[
						styles.modalContent,
						{
							backgroundColor: colors.background,
							paddingBottom: insets.bottom + 16,
						},
					]}
				>
					{/* Modal Header */}
					<View style={styles.modalHeader}>
						<View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
						<Text style={[styles.modalTitle, { color: colors.foreground }]}>
							{activeField === "origin" ? "Pick up location" : "Destination"}
						</Text>
					</View>

					{/* Search Input */}
					<View
						style={[
							styles.searchContainer,
							{
								backgroundColor: colors.muted,
								borderColor: colors.border,
							},
						]}
					>
						<Icon name="search" size={18} color={colors.mutedForeground} />
						<TextInput
							style={[styles.searchInput, { color: colors.foreground }]}
							placeholder="Search address..."
							placeholderTextColor={colors.mutedForeground}
							value={searchQuery}
							onChangeText={handleSearchChange}
							autoFocus
							returnKeyType="search"
						/>
						{searchQuery.length > 0 && (
							<Pressable
								onPress={() => {
									setSearchQuery("");
									setSuggestions([]);
								}}
								hitSlop={8}
							>
								<Icon name="close" size={16} color={colors.mutedForeground} />
							</Pressable>
						)}
					</View>

					{/* Current Location Button */}
					{activeField === "origin" && userLocation && (
						<Pressable
							style={[
								styles.currentLocationBtn,
								{ backgroundColor: colors.muted },
							]}
							onPress={handleUseCurrentLocation}
						>
							<View
								style={[
									styles.currentLocationIcon,
									{ backgroundColor: colors.primary + "15" },
								]}
							>
								<Icon name="location" size={16} color={colors.primary} />
							</View>
							<View style={styles.currentLocationText}>
								<Text style={[styles.currentLocationTitle, { color: colors.foreground }]}>
									Use current location
								</Text>
								<Text style={[styles.currentLocationSubtitle, { color: colors.mutedForeground }]}>
									GPS location
								</Text>
							</View>
							<Icon name="arrowRight" size={14} color={colors.mutedForeground} />
						</Pressable>
					)}

					{/* Suggestions List */}
					<ScrollView
						style={styles.suggestionsList}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						{isSearching ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="small" color={colors.primary} />
								<Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
									Searching...
								</Text>
							</View>
						) : suggestions.length > 0 ? (
							<View style={styles.suggestionsContainer}>
								{suggestions.map((feature, index) => (
									<Animated.View
										key={feature.id}
										entering={FadeIn.delay(index * 30).duration(150)}
									>
										<Pressable
											style={[
												styles.suggestionItem,
												index !== suggestions.length - 1 && {
													borderBottomWidth: StyleSheet.hairlineWidth,
													borderBottomColor: colors.border,
												},
											]}
											onPress={() => handleSelectSuggestion(feature)}
										>
											<View
												style={[
													styles.suggestionIcon,
													{ backgroundColor: colors.muted },
												]}
											>
												<Icon name="location" size={14} color={colors.mutedForeground} />
											</View>
											<View style={styles.suggestionContent}>
												<Text
													style={[styles.suggestionTitle, { color: colors.foreground }]}
													numberOfLines={1}
												>
													{feature.place_name.split(",")[0]}
												</Text>
												<Text
													style={[styles.suggestionSubtitle, { color: colors.mutedForeground }]}
													numberOfLines={1}
												>
													{feature.place_name.split(",").slice(1).join(",").trim()}
												</Text>
											</View>
										</Pressable>
									</Animated.View>
								))}
							</View>
						) : searchQuery.length >= 2 ? (
							<View style={styles.emptyState}>
								<Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>
									No results found
								</Text>
							</View>
						) : (
							<View style={styles.emptyState}>
								<Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>
									Type to search for a location
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
	},
	card: {
		borderRadius: 16,
		borderWidth: 1,
		padding: 16,
	},
	locationsRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	locationBox: {
		flex: 1,
	},
	locationDisabled: {
		opacity: 0.5,
	},
	locationLabel: {
		fontSize: 12,
		fontWeight: "500",
		marginBottom: 4,
	},
	locationName: {
		fontSize: 16,
		fontWeight: "700",
	},
	locationSubtext: {
		fontSize: 12,
		marginTop: 2,
	},
	swapButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1,
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: 12,
	},
	// Modal styles
	modalOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.4)",
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
		alignItems: "center",
		paddingTop: 8,
		paddingBottom: 20,
	},
	modalHandle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		marginBottom: 16,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "700",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginBottom: 12,
		paddingHorizontal: 14,
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1,
		gap: 10,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		paddingVertical: 0,
	},
	currentLocationBtn: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		marginBottom: 12,
		padding: 14,
		borderRadius: 12,
		gap: 12,
	},
	currentLocationIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	currentLocationText: {
		flex: 1,
	},
	currentLocationTitle: {
		fontSize: 15,
		fontWeight: "600",
	},
	currentLocationSubtitle: {
		fontSize: 13,
		marginTop: 2,
	},
	suggestionsList: {
		flex: 1,
	},
	suggestionsContainer: {
		marginHorizontal: 16,
	},
	suggestionItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		gap: 12,
	},
	suggestionIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
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
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
		gap: 10,
	},
	loadingText: {
		fontSize: 14,
	},
	emptyState: {
		padding: 32,
		alignItems: "center",
	},
	emptyStateText: {
		fontSize: 14,
		textAlign: "center",
	},
});
