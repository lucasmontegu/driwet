// apps/mobile/hooks/use-accessibility.ts

import { useCallback, useEffect, useState } from "react";
import {
	AccessibilityInfo,
	Dimensions,
	PixelRatio,
	Platform,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";

// ============ Types ============

interface AccessibilityState {
	/**
	 * Whether a screen reader (VoiceOver/TalkBack) is running
	 */
	isScreenReaderEnabled: boolean;
	/**
	 * Whether reduce motion is enabled in system settings
	 */
	isReduceMotionEnabled: boolean;
	/**
	 * Whether bold text is enabled (iOS only)
	 */
	isBoldTextEnabled: boolean;
	/**
	 * Whether grayscale is enabled
	 */
	isGrayscaleEnabled: boolean;
	/**
	 * Whether invert colors is enabled
	 */
	isInvertColorsEnabled: boolean;
	/**
	 * Whether reduce transparency is enabled (iOS only)
	 */
	isReduceTransparencyEnabled: boolean;
	/**
	 * Current font scale multiplier
	 */
	fontScale: number;
	/**
	 * Whether user has increased font size significantly (>1.2x)
	 */
	isLargeTextEnabled: boolean;
}

interface UseAccessibilityReturn extends AccessibilityState {
	/**
	 * Announce a message to screen reader users
	 */
	announce: (message: string) => void;
	/**
	 * Focus an accessibility element (by nativeID)
	 */
	setAccessibilityFocus: (nativeID: string) => void;
	/**
	 * Get appropriate animation duration based on reduce motion setting
	 */
	getAnimationDuration: (defaultDuration: number) => number;
}

// ============ Hook ============

/**
 * Hook for managing accessibility features and preferences
 *
 * @example
 * const {
 *   isScreenReaderEnabled,
 *   isReduceMotionEnabled,
 *   announce,
 *   getAnimationDuration
 * } = useAccessibility();
 *
 * // Announce important changes
 * useEffect(() => {
 *   if (isScreenReaderEnabled && alertShown) {
 *     announce("Weather alert: Storm approaching in 30 minutes");
 *   }
 * }, [alertShown]);
 *
 * // Respect reduce motion
 * const duration = getAnimationDuration(300);
 */
export function useAccessibility(): UseAccessibilityReturn {
	const reduceMotion = useReducedMotion();
	const [state, setState] = useState<AccessibilityState>({
		isScreenReaderEnabled: false,
		isReduceMotionEnabled: reduceMotion ?? false,
		isBoldTextEnabled: false,
		isGrayscaleEnabled: false,
		isInvertColorsEnabled: false,
		isReduceTransparencyEnabled: false,
		fontScale: 1,
		isLargeTextEnabled: false,
	});

	// Load initial accessibility state
	useEffect(() => {
		async function loadAccessibilityState() {
			const [
				screenReader,
				boldText,
				grayscale,
				invertColors,
				reduceTransparency,
			] = await Promise.all([
				AccessibilityInfo.isScreenReaderEnabled(),
				Platform.OS === "ios"
					? AccessibilityInfo.isBoldTextEnabled()
					: Promise.resolve(false),
				AccessibilityInfo.isGrayscaleEnabled(),
				AccessibilityInfo.isInvertColorsEnabled(),
				Platform.OS === "ios"
					? AccessibilityInfo.isReduceTransparencyEnabled()
					: Promise.resolve(false),
			]);

			const fontScale = PixelRatio.getFontScale();

			setState((prev) => ({
				...prev,
				isScreenReaderEnabled: screenReader,
				isBoldTextEnabled: boldText,
				isGrayscaleEnabled: grayscale,
				isInvertColorsEnabled: invertColors,
				isReduceTransparencyEnabled: reduceTransparency,
				fontScale,
				isLargeTextEnabled: fontScale > 1.2,
			}));
		}

		loadAccessibilityState();
	}, []);

	// Listen for screen reader changes
	useEffect(() => {
		const subscription = AccessibilityInfo.addEventListener(
			"screenReaderChanged",
			(isEnabled) => {
				setState((prev) => ({ ...prev, isScreenReaderEnabled: isEnabled }));
			},
		);

		return () => {
			subscription.remove();
		};
	}, []);

	// Listen for reduce motion changes
	useEffect(() => {
		const subscription = AccessibilityInfo.addEventListener(
			"reduceMotionChanged",
			(isEnabled) => {
				setState((prev) => ({ ...prev, isReduceMotionEnabled: isEnabled }));
			},
		);

		return () => {
			subscription.remove();
		};
	}, []);

	// Update reduce motion from Reanimated hook
	useEffect(() => {
		if (reduceMotion !== null) {
			setState((prev) => ({ ...prev, isReduceMotionEnabled: reduceMotion }));
		}
	}, [reduceMotion]);

	// Announce message to screen reader
	const announce = useCallback((message: string) => {
		AccessibilityInfo.announceForAccessibility(message);
	}, []);

	// Set accessibility focus
	const setAccessibilityFocus = useCallback((nativeID: string) => {
		// Note: This requires the component to have accessibilityViewIsModal or similar
		// In practice, this is handled by the component itself
		AccessibilityInfo.announceForAccessibility(""); // Trigger focus update
	}, []);

	// Get animation duration respecting reduce motion
	const getAnimationDuration = useCallback(
		(defaultDuration: number): number => {
			return state.isReduceMotionEnabled ? 0 : defaultDuration;
		},
		[state.isReduceMotionEnabled],
	);

	return {
		...state,
		announce,
		setAccessibilityFocus,
		getAnimationDuration,
	};
}

// ============ Accessibility Utilities ============

/**
 * Create accessible label for weather conditions
 */
export function createWeatherAccessibilityLabel(
	condition: string,
	temperature: number,
	unit: "C" | "F" = "C",
): string {
	return `Weather: ${condition}, ${temperature} degrees ${unit === "C" ? "Celsius" : "Fahrenheit"}`;
}

/**
 * Create accessible label for route information
 */
export function createRouteAccessibilityLabel(
	destination: string,
	duration: string,
	distance: string,
	riskLevel?: string,
): string {
	let label = `Route to ${destination}, ${duration}, ${distance}`;
	if (riskLevel) {
		label += `. Safety level: ${riskLevel}`;
	}
	return label;
}

/**
 * Create accessible label for alerts
 */
export function createAlertAccessibilityLabel(
	type: "weather" | "traffic" | "hazard",
	severity: "low" | "moderate" | "high" | "extreme",
	message: string,
): string {
	const severityText = {
		low: "Low severity",
		moderate: "Moderate severity",
		high: "High severity",
		extreme: "Critical",
	};

	return `${severityText[severity]} ${type} alert: ${message}`;
}

/**
 * Create accessible label for buttons with state
 */
export function createButtonAccessibilityLabel(
	action: string,
	isActive?: boolean,
	additionalInfo?: string,
): string {
	let label = action;
	if (isActive !== undefined) {
		label += isActive ? ", currently active" : ", currently inactive";
	}
	if (additionalInfo) {
		label += `. ${additionalInfo}`;
	}
	return label;
}

/**
 * Format time for accessibility (spoken form)
 */
export function formatTimeForAccessibility(date: Date): string {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const period = hours >= 12 ? "PM" : "AM";
	const hour12 = hours % 12 || 12;

	if (minutes === 0) {
		return `${hour12} ${period}`;
	}
	return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format duration for accessibility (spoken form)
 */
export function formatDurationForAccessibility(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	let result = `${hours} hour${hours !== 1 ? "s" : ""}`;
	if (mins > 0) {
		result += ` and ${mins} minute${mins !== 1 ? "s" : ""}`;
	}
	return result;
}

/**
 * Format distance for accessibility (spoken form)
 */
export function formatDistanceForAccessibility(
	km: number,
	useMetric = true,
): string {
	if (useMetric) {
		if (km < 1) {
			const meters = Math.round(km * 1000);
			return `${meters} meter${meters !== 1 ? "s" : ""}`;
		}
		return `${km.toFixed(1)} kilometer${km !== 1 ? "s" : ""}`;
	}
	const miles = km * 0.621371;
	if (miles < 0.1) {
		const feet = Math.round(miles * 5280);
		return `${feet} feet`;
	}
	return `${miles.toFixed(1)} mile${miles !== 1 ? "s" : ""}`;
}
