// apps/mobile/theme/heroui-colors.ts
// HeroUI Native theme color mappings
// Uses CSS variables defined in global.css (oklch color space)

import { StyleSheet } from "react-native";

/**
 * Get CSS variable color from HeroUI theme
 * In React Native, we need to map these to actual hex/rgb values
 * since CSS variables aren't supported in RN StyleSheets
 */

// Helper to convert oklch to approximate hex (for React Native compatibility)
// Note: This is a simplified conversion. For production, consider a proper color library
function oklchToHex(l: number, c: number, h: number): string {
	// Simplified conversion - in production use a proper color library
	// For now, we'll use pre-calculated hex values from the oklch definitions
	return "#000000"; // Placeholder
}

/**
 * HeroUI Theme Colors (Light Mode)
 * Pre-calculated from oklch values in global.css
 */
export const heroUIColorsLight = {
	// Base - True Blue Theme
	accent: "#0936d6", // oklch(54.8% 0.195 245) - Blue 600
	accentForeground: "#FFFFFF", // oklch(99.11% 0 0)
	background: "#FAFAFA", // oklch(97.02% 0.0000 245)
	border: "#E5E5E5", // oklch(90.00% 0.0000 245)
	danger: "#EF4444", // oklch(65.32% 0.2328 26.77)
	dangerForeground: "#FFFFFF",
	default: "#F5F5F5", // oklch(94.00% 0.0000 245)
	defaultForeground: "#171717", // oklch(21.03% 0.0059 245)
	fieldBackground: "#FFFFFF", // oklch(100.00% 0.0000 245)
	fieldForeground: "#171717",
	fieldPlaceholder: "#737373", // oklch(55.17% 0.0000 245)
	focus: "#0936d6", // Same as accent
	foreground: "#171717",
	muted: "#737373",
	overlay: "#FFFFFF",
	overlayForeground: "#171717",
	scrollbar: "#D4D4D4", // oklch(87.10% 0.0000 245)
	segment: "#FFFFFF",
	segmentForeground: "#171717",
	separator: "#E5E5E5", // oklch(92.00% 0.0000 245)
	success: "#10B981", // oklch(73.29% 0.1935 151.84)
	successForeground: "#171717",
	surface: "#FFFFFF",
	surfaceForeground: "#171717",
	warning: "#F59E0B", // oklch(78.19% 0.1585 73.36)
	warningForeground: "#171717",

	// Brand - True Blue (not purple)
	primary: "#0936d6", // Blue 600
	primaryForeground: "#FFFFFF",

	// Semantic - Weather
	safe: "#10B981",
	caution: "#F59E0B",
	alertWarning: "#F97316",
	alertDanger: "#EF4444",

	// Legacy aliases for backward compatibility
	card: "#FFFFFF",
	cardForeground: "#171717",
	mutedForeground: "#737373",
	input: "#E5E5E5",
	destructive: "#EF4444",
} as const;

/**
 * HeroUI Theme Colors (Dark Mode)
 * Pre-calculated from oklch values in global.css
 */
export const heroUIColorsDark = {
	// Base - Blue Theme (brighter for dark mode)
	accent: "#0936d6", // oklch(65% 0.18 245) - Blue 400
	accentForeground: "#FFFFFF",
	background: "#0A0A0A", // oklch(12.00% 0.0000 245) - Deep OLED black
	border: "#3F3F3F", // oklch(28.00% 0.0000 245)
	danger: "#F87171", // oklch(59.40% 0.1967 25.66)
	dangerForeground: "#FFFFFF",
	default: "#262626", // oklch(27.40% 0.0000 245)
	defaultForeground: "#FAFAFA",
	fieldBackground: "#171717", // oklch(21.03% 0.0000 245)
	fieldForeground: "#FAFAFA",
	fieldPlaceholder: "#A3A3A3", // oklch(70.50% 0.0000 245)
	focus: "#0936d6", // Same as accent
	foreground: "#FAFAFA",
	muted: "#A3A3A3",
	overlay: "#171717",
	overlayForeground: "#FAFAFA",
	scrollbar: "#A3A3A3",
	segment: "#525252", // oklch(39.64% 0.0000 245)
	segmentForeground: "#FAFAFA",
	separator: "#3F3F3F", // oklch(25.00% 0.0000 245)
	success: "#10B981",
	successForeground: "#171717",
	surface: "#171717",
	surfaceForeground: "#FAFAFA",
	warning: "#FBBF24", // oklch(82.03% 0.1388 77.37)
	warningForeground: "#171717",

	// Brand - Brighter blue for dark mode
	primary: "#0936d6", // Blue 400
	primaryForeground: "#FFFFFF",

	// Semantic - Brighter for dark mode
	safe: "#34D399",
	caution: "#FBBF24",
	alertWarning: "#FB923C",
	alertDanger: "#F87171",

	// Legacy aliases for backward compatibility
	card: "#171717",
	cardForeground: "#FAFAFA",
	mutedForeground: "#A3A3A3",
	input: "rgba(255,255,255,0.15)",
	destructive: "#F87171",
} as const;

/**
 * Alert severity colors (consistent across themes)
 */
export const alertSeverityColors = {
	extreme: "#DC2626",
	severe: "#EA580C",
	moderate: "#F59E0B",
	minor: "#22C55E",
} as const;

/**
 * Type exports
 */
export type HeroUIColors = typeof heroUIColorsLight;
export type AlertSeverityColors = typeof alertSeverityColors;

/**
 * Get theme colors based on current mode
 */
export function getHeroUIColors(
	isDark: boolean,
): typeof heroUIColorsLight | typeof heroUIColorsDark {
	return isDark ? heroUIColorsDark : heroUIColorsLight;
}
