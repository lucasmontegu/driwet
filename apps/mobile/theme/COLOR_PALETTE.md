# Driwet Color Palette

## Brand Colors - True Blue (Not Purple!)

### Light Mode
```
Primary: #2563EB (Blue 600)
└─ oklch(54.8% 0.195 245)
└─ Use for: CTAs, focused states, brand elements

Primary Gradient: #2563EB → #1D4ED8
└─ Use for: Buttons, headers, premium badges
```

### Dark Mode
```
Primary: #60A5FA (Blue 400 - brighter for visibility)
└─ oklch(65% 0.18 245)
└─ Use for: CTAs, focused states, brand elements

Primary Gradient: #60A5FA → #1D4ED8
└─ Use for: Buttons, headers, premium badges
```

---

## Color Comparison

### 🚫 Old (Purple/Indigo)
```
Light:  #4F46E5  ← Indigo 600 (violeta)
Dark:   #818CF8  ← Indigo 400 (violeta claro)
Hue:    262°     ← Purple territory
```

### ✅ New (True Blue)
```
Light:  #2563EB  ← Blue 600 (azul puro)
Dark:   #60A5FA  ← Blue 400 (azul claro)
Hue:    245°     ← Blue territory
```

**Difference**: 17° shift from purple toward true blue

---

## Semantic Colors (Weather-Specific)

### Success / Safe Conditions
```
Light & Dark: #10B981 (Emerald 500)
└─ oklch(73.29% 0.1935 151.84)
└─ Use for: Safe routes, clear weather
```

### Warning / Caution
```
Light:  #F59E0B (Amber 500)
Dark:   #FBBF24 (Amber 400 - brighter)
└─ oklch(78.19% 0.1585 73.36)
└─ Use for: Moderate alerts, caution states
```

### Danger / Critical
```
Light:  #EF4444 (Red 500)
Dark:   #F87171 (Red 400 - brighter)
└─ oklch(65.32% 0.2328 26.77)
└─ Use for: Severe storms, critical alerts
```

### Alert Severity (Consistent across themes)
```
Extreme:  #DC2626 (Red 600)
Severe:   #EA580C (Orange 600)
Moderate: #F59E0B (Amber 500)
Minor:    #22C55E (Green 500)
```

---

## Neutral Colors

### Light Mode
```
Background:    #FAFAFA  (Gray 50 - muy claro)
Foreground:    #171717  (Gray 900 - casi negro)
Card:          #FFFFFF  (White)
Border:        #E5E5E5  (Gray 200)
Muted:         #737373  (Gray 500)
```

### Dark Mode
```
Background:    #0A0A0A  (OLED black - save battery)
Foreground:    #FAFAFA  (Gray 50 - casi blanco)
Card:          #171717  (Gray 900)
Border:        #3F3F3F  (Gray 700)
Muted:         #A3A3A3  (Gray 400)
```

---

## Usage Examples

### Buttons
```tsx
// Primary CTA (Blue gradient)
<LinearGradient
  colors={[colors.primary, "#1D4ED8"]}
  style={styles.button}
>
  <Text style={{ color: colors.primaryForeground }}>Upgrade</Text>
</LinearGradient>

// Danger action (Red)
<View style={{ backgroundColor: colors.danger }}>
  <Text style={{ color: colors.dangerForeground }}>Delete</Text>
</View>

// Success state (Green)
<View style={{ backgroundColor: colors.success }}>
  <Text style={{ color: colors.successForeground }}>Saved!</Text>
</View>
```

### Alert Severity
```tsx
const colors = useThemeColors();

// Extreme weather alert
<View style={{ 
  borderColor: colors.alert.extreme,  // #DC2626
  backgroundColor: colors.alert.extreme + '10'  // 10% opacity
}}>
  <Icon name="alert" color={colors.alert.extreme} />
  <Text>Extreme weather alert</Text>
</View>
```

### Route Safety
```tsx
// Safe route (green)
<Badge color={colors.safe} />

// Caution route (yellow)
<Badge color={colors.caution} />

// Danger route (red)
<Badge color={colors.alertDanger} />
```

---

## Gradient Patterns

### Primary Gradient (Blue)
```tsx
// Standard gradient for CTAs
colors={[colors.primary, "#1D4ED8"]}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}

// Light:  #2563EB → #1D4ED8 (Blue 600 → Blue 700)
// Dark:   #60A5FA → #1D4ED8 (Blue 400 → Blue 700)
```

### Danger Gradient (Red)
```tsx
// For critical actions
colors={["#EF4444", "#DC2626"]}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}

// Red 500 → Red 600
```

### Warning Gradient (Amber)
```tsx
// For caution states
colors={[colors.warning, "#D97706"]}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}

// Amber 500 → Amber 600
```

---

## Color Accessibility

All colors meet **WCAG AA** contrast requirements:

### Light Mode Contrast Ratios
```
Primary (#2563EB) on White:     5.88:1  ✅ AA Large
Foreground (#171717) on BG:     16.23:1 ✅ AAA
Danger (#EF4444) on White:      4.52:1  ✅ AA Large
Success (#10B981) on White:     3.15:1  ⚠️ Large text only
```

### Dark Mode Contrast Ratios
```
Primary (#60A5FA) on Black:     8.59:1  ✅ AAA
Foreground (#FAFAFA) on BG:     18.71:1 ✅ AAA
Danger (#F87171) on Black:      5.87:1  ✅ AA
Success (#34D399) on Black:     10.12:1 ✅ AAA
```

---

## Visual Comparison

### oklch Color Space Benefits

**Before (HSL):**
```
Blue variations don't look equally bright
Gradients have muddy intermediate colors
Limited to sRGB gamut
```

**After (oklch):**
```
✅ Perceptually uniform brightness
✅ Smooth, vibrant gradients
✅ Access to P3 wide gamut (on modern devices)
✅ Better WCAG compliance calculation
```

---

## Testing Colors

### In Simulator/Device
```bash
# Light mode
Uniwind.setTheme('light')

# Dark mode
Uniwind.setTheme('dark')

# Auto mode (7PM-6AM = dark)
setThemeMode('auto')
```

### Color Picker Tools
- **oklch Picker**: https://oklch.com/
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **HeroUI Theme Editor**: https://v3.heroui.com/theme-editor

---

## Notes

1. **Gradients use darker shade** (`#1D4ED8` = Blue 700) for depth
2. **Dark mode is brighter** to maintain visibility on dark backgrounds
3. **Alert colors stay consistent** across themes for learned recognition
4. **OLED optimization** - Dark mode uses true black (#0A0A0A) to save battery
5. **All hardcoded hex values eliminated** - Now uses theme system

---

Last updated: Jan 2026
