# Theme Migration Guide

## What Changed

Driwet has migrated from a custom theme system to **HeroUI Native** theme with **oklch color space**.

## Benefits

1. **Better color accuracy** - oklch provides perceptual uniformity
2. **Automatic dark mode** - Theme switches automatically
3. **Consistent with HeroUI** - Uses official HeroUI Native design tokens
4. **Better gradients** - Smoother color transitions
5. **Wider color gamut** - More vibrant colors available

## Breaking Changes

### 1. Import Changes

**Before:**

```tsx
import { colors } from "@/theme/colors";

const bgColor = isDark ? colors.dark.background : colors.light.background;
```

**After:**

```tsx
import { useThemeColors } from "@/hooks/use-theme-colors";

const colors = useThemeColors();
const bgColor = colors.background; // Automatically switches
```

### 2. Color Names

Some color names have changed:

| Old                | New                       |
| ------------------ | ------------------------- |
| `card`             | `card` (same)             |
| `cardForeground`   | `cardForeground` (same)   |
| `surface`          | `surface` (same)          |
| `surfaceElevated`  | `segment` (HeroUI native) |
| `destructive`      | `danger`                  |
| `mutedForeground`  | `mutedForeground` (same)  |
| `colors.alert.xxx` | `colors.alert.xxx` (same) |

### 3. Theme Context

`useAppTheme()` now returns HeroUI-compatible theme:

```tsx
const { currentTheme, isDark, isLight, toggleTheme } = useAppTheme();

// currentTheme is now 'light' | 'dark' (from Uniwind)
```

## Migration Checklist

### Step 1: Update Imports

Find all usages of old colors import:

```bash
# Search for old imports
grep -r "from '@/theme/colors'" apps/mobile/
```

Replace with:

```tsx
import { useThemeColors } from "@/hooks/use-theme-colors";
```

### Step 2: Replace Color Access

**Pattern 1: Conditional theme colors**

```tsx
// OLD
import { colors } from "@/theme/colors";
const bgColor = isDark ? colors.dark.background : colors.light.background;

// NEW
const colors = useThemeColors();
const bgColor = colors.background;
```

**Pattern 2: Alert colors**

```tsx
// OLD
import { colors } from "@/theme/colors";
const severityColor = colors.alert.extreme;

// NEW
const colors = useThemeColors();
const severityColor = colors.alert.extreme; // Same API
```

**Pattern 3: Safety status colors**

```tsx
// OLD
import { colors } from "@/theme/colors";
const safetyColor = colors.safety.safe.bg;

// NEW - Use semantic names
const colors = useThemeColors();
const safetyBg = colors.safe; // Automatically adapts to theme
```

### Step 3: Update StyleSheets

**Before:**

```tsx
const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.light.background, // Hardcoded
	},
});
```

**After:**

```tsx
function MyComponent() {
	const colors = useThemeColors();

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					backgroundColor: colors.background, // Dynamic
				},
			}),
		[colors],
	);
}
```

Or use inline styles:

```tsx
function MyComponent() {
	const colors = useThemeColors();

	return (
		<View
			style={{
				backgroundColor: colors.background,
				borderColor: colors.border,
			}}
		>
			{/* content */}
		</View>
	);
}
```

### Step 4: Test Both Themes

Always test components in both light and dark mode:

```tsx
// In dev tools or test
import { Uniwind } from "uniwind";

Uniwind.setTheme("dark");
// Verify component appearance

Uniwind.setTheme("light");
// Verify component appearance
```

## Compatibility Layer

The `useThemeColors` hook includes backward-compatible aliases:

```tsx
const colors = useThemeColors();

// These still work (deprecated):
colors.safe; // → colors.safe (semantic color)
colors.warning; // → colors.warning
colors.danger; // → colors.danger
colors.caution; // → colors.caution

// Preferred (new names):
colors.safe; // Semantic safe color
colors.alertWarning; // Weather warning
colors.alertDanger; // Weather danger
```

## Examples

### Example 1: Card Component

**Before:**

```tsx
import { colors } from "@/theme/colors";
import { useAppTheme } from "@/contexts/app-theme-context";

function Card() {
	const { isDark } = useAppTheme();
	const themeColors = isDark ? colors.dark : colors.light;

	return (
		<View
			style={{
				backgroundColor: themeColors.card,
				borderColor: themeColors.border,
			}}
		>
			<Text style={{ color: themeColors.foreground }}>Title</Text>
		</View>
	);
}
```

**After:**

```tsx
import { useThemeColors } from "@/hooks/use-theme-colors";

function Card() {
	const colors = useThemeColors();

	return (
		<View style={{ backgroundColor: colors.card, borderColor: colors.border }}>
			<Text style={{ color: colors.foreground }}>Title</Text>
		</View>
	);
}
```

### Example 2: Alert Severity

**Before:**

```tsx
import { colors } from "@/theme/colors";

const severityColors = {
	extreme: colors.alert.extreme,
	severe: colors.alert.severe,
};
```

**After:**

```tsx
import { useThemeColors } from "@/hooks/use-theme-colors";

function AlertCard() {
	const colors = useThemeColors();

	const severityColors = {
		extreme: colors.alert.extreme,
		severe: colors.alert.severe,
	};

	return <View>{/* use severityColors */}</View>;
}
```

## Troubleshooting

### Colors not updating on theme change

Make sure you're using `useThemeColors()` inside a component:

```tsx
// ❌ WRONG - Called outside component
const colors = useThemeColors();
function MyComponent() {
	return <View style={{ backgroundColor: colors.background }} />;
}

// ✅ CORRECT - Called inside component
function MyComponent() {
	const colors = useThemeColors();
	return <View style={{ backgroundColor: colors.background }} />;
}
```

### Type errors with color names

Update to new color names or use type assertions:

```tsx
// If migrating gradually
const colors = useThemeColors();
const legacyColor = (colors as any).oldColorName;

// Better: Update to new name
const newColor = colors.newColorName;
```

## Need Help?

Check `theme/README.md` for full documentation or ask in #dev-mobile channel.
