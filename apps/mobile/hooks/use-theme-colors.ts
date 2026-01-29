// apps/mobile/hooks/use-theme-colors.ts
// Hook to access HeroUI Native theme colors
import { useMemo } from "react";
import { useAppTheme } from "@/contexts/app-theme-context";
import {
	alertSeverityColors,
	getHeroUIColors,
	type HeroUIColors,
} from "@/theme/heroui-colors";

/**
 * Returns current theme colors from HeroUI Native
 * Automatically switches between light and dark mode based on app theme
 */
export function useThemeColors() {
	const { isDark } = useAppTheme();

	return useMemo(() => {
		const themeColors = getHeroUIColors(isDark);

		return {
			// Base HeroUI colors
			...themeColors,

			// Alert severity colors (consistent across themes)
			alert: alertSeverityColors,

			// Deprecated: Legacy color names for backward compatibility
			// TODO: Gradually migrate these to new names
			safe: themeColors.safe,
			warning: themeColors.warning,
			danger: themeColors.danger,
			caution: themeColors.caution,
		};
	}, [isDark]);
}

// Export types
export type ThemeColors = ReturnType<typeof useThemeColors>;
export type { HeroUIColors };
