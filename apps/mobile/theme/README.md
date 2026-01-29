# Driwet Theme System

## Overview

Driwet uses **HeroUI Native** theme system with **oklch color space** for better perceptual uniformity and accessibility.

## Color System

### Primary Theme Colors

The app uses semantic color names that automatically adapt to light/dark mode:

```tsx
import { useThemeColors } from "@/hooks/use-theme-colors";

const colors = useThemeColors();

// Base colors
colors.background; // Main background
colors.foreground; // Main text color
colors.primary; // Brand color (#4F46E5 light, #818CF8 dark)
colors.primaryForeground; // Text on primary
colors.card; // Card background
colors.border; // Border color

// Semantic colors
colors.danger; // Destructive actions
colors.warning; // Warning states
colors.success; // Success states
colors.muted; // Muted/disabled

// Weather-specific
colors.safe; // Safe conditions (green)
colors.caution; // Caution (yellow)
colors.alertWarning; // Warning (orange)
colors.alertDanger; // Danger (red)
```

### Alert Severity Colors

Alert severity colors are consistent across themes:

```tsx
const colors = useThemeColors();

colors.alert.extreme; // #DC2626 - Extreme weather
colors.alert.severe; // #EA580C - Severe weather
colors.alert.moderate; // #F59E0B - Moderate weather
colors.alert.minor; // #22C55E - Minor weather
```

## Theme Switching

The app supports light, dark, and auto modes via `AppThemeContext`:

```tsx
import { useAppTheme } from "@/contexts/app-theme-context";

function MyComponent() {
	const { currentTheme, themeMode, setThemeMode, toggleTheme } = useAppTheme();

	// Check current theme
	if (currentTheme === "dark") {
		// Dark mode is active
	}

	// Change theme mode
	setThemeMode("light"); // or 'dark' or 'auto'

	// Toggle between light/dark
	toggleTheme();
}
```

## Color Space: oklch vs HSL/RGB

Driwet uses **oklch** color space (defined in `global.css`):

```css
/* oklch format: oklch(lightness% chroma hue) */
--primary: oklch(44.57% 0.2131 262.43);
```

### Benefits of oklch:

1. **Perceptual uniformity** - Colors with same lightness appear equally bright
2. **Better gradients** - Smooth transitions without muddy colors
3. **Wider gamut** - Access to more vibrant colors
4. **Accessibility** - Easier to maintain contrast ratios

### Conversion to React Native

Since React Native doesn't support CSS variables, we pre-calculate hex values in `heroui-colors.ts`:

```typescript
// Light mode primary
--primary: oklch(44.57% 0.2131 262.43) → #4F46E5

// Dark mode primary (brighter)
--primary: oklch(52.00% 0.2131 262.43) → #818CF8
```

## File Structure

```
theme/
├── README.md              # This file
├── heroui-colors.ts       # HeroUI color mappings (light/dark)
└── colors.ts              # Legacy colors (deprecated, kept for migration)
```

## Migration Guide

### From Legacy Colors

**Before:**

```tsx
import { colors } from "@/theme/colors";

const bgColor = isDark ? colors.dark.background : colors.light.background;
```

**After:**

```tsx
import { useThemeColors } from "@/hooks/use-theme-colors";

const colors = useThemeColors(); // Automatically switches based on theme
const bgColor = colors.background;
```

### Component Example

```tsx
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function MyCard() {
	const colors = useThemeColors();

	return (
		<View
			style={{
				backgroundColor: colors.card,
				borderColor: colors.border,
				borderWidth: 1,
				borderRadius: 12,
				padding: 16,
			}}
		>
			<Text style={{ color: colors.foreground }}>Card content</Text>
			<Text style={{ color: colors.mutedForeground }}>Secondary text</Text>
		</View>
	);
}
```

## Theme Customization

To customize colors, edit `apps/mobile/global.css`:

```css
:root {
	/* Change primary brand color */
	--primary: oklch(44.57% 0.2131 262.43);

	/* Adjust border radius */
	--radius: 0.75rem; /* Default: 0.5rem */
}
```

After changing oklch values, update corresponding hex values in `heroui-colors.ts`.

## Best Practices

1. **Always use `useThemeColors`** - Never hardcode colors
2. **Use semantic names** - `primary` not `blue`, `danger` not `red`
3. **Test in both modes** - Always verify light and dark themes
4. **Maintain contrast** - Ensure WCAG AA compliance (4.5:1 for text)
5. **Use theme-aware shadows** - Different shadow opacity for light/dark

## Resources

- [HeroUI Native Theming Docs](https://v3.heroui.com/docs/native/getting-started/theming)
- [oklch Color Picker](https://oklch.com/)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
