// apps/native/hooks/use-theme-colors.ts
import { useMemo } from 'react';
import { useAppTheme } from '@/contexts/app-theme-context';
import { colors, type ThemeColors } from '@/theme/colors';

type UseThemeColorsReturn = ThemeColors & { alert: typeof colors.alert; safe: string; warning: string };

export function useThemeColors(): UseThemeColorsReturn {
  const { isDark } = useAppTheme();

  return useMemo(() => ({
    ...(isDark ? colors.dark : colors.light),
    alert: colors.alert,
    safe: colors.safe,
    warning: colors.warning,
  }) as UseThemeColorsReturn, [isDark]);
}
