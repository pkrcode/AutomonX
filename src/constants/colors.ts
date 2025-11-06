/**
 * A central object to define all colors used in the application.
 * Organized by category: semantic colors, text colors, utilities, and dark-mode support.
 */
export const colors = {
  // --- Semantic Colors ---
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7',
  card: '#FFFFFF',

  // --- Text Colors ---
  textPrimary: '#1C1C1E', // Near-black for primary text (light mode)
  textSecondary: '#6E6E73', // Gray for secondary text (light mode)
  textLight: '#FFFFFF', // White for text on dark backgrounds (dark mode)
  textSecondaryDark: '#B0B0B5', // Gray for secondary text (dark mode)

  // --- Border and Shadow ---
  border: '#C6C6C8',
  borderDark: '#5A5A5C',
  shadow: '#000000',

  // --- Utility Colors ---
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#E5E5EA',
  darkGray: '#3A3A3C',
  charcoal: '#1C1C1E', // Darker background option

  // --- Transparent ---
  transparent: 'transparent',

  // --- Dark Mode Helpers (for backwards compatibility & convenience) ---
  /**
   * Light mode text color (alias for textPrimary)
   * @deprecated Prefer using useColorScheme to toggle between textPrimary and textLight
   */
  darkText: '#1C1C1E',

  /**
   * Dark mode text color (alias for textLight)
   * @deprecated Prefer using useColorScheme to toggle between textPrimary and textLight
   */
  lightText: '#FFFFFF',
} as const;

// Type helper for theme-aware color selection
export type ColorKey = keyof typeof colors;
export type ThemeMode = 'light' | 'dark';

/**
 * Helper function to get colors based on the current theme
 * @param isDarkMode - whether dark mode is active
 * @returns an object with theme-appropriate colors
 */
export const getThemeColors = (isDarkMode: boolean) => ({
  text: isDarkMode ? colors.textLight : colors.textPrimary,
  textSecondary: isDarkMode ? colors.textSecondaryDark : colors.textSecondary,
  background: isDarkMode ? colors.darkGray : colors.background,
  card: isDarkMode ? colors.charcoal : colors.card,
  border: isDarkMode ? colors.borderDark : colors.border,
});

// Lightweight hook to consume theme-aware colors from SettingsContext
// Avoids pulling a heavy theming library; works with SettingsContext_Simple
import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext_Simple';

export const useThemeColors = () => {
  const ctx = useContext(SettingsContext);
  const mode = ctx?.settings.theme === 'dark' ? 'dark' : 'light';
  const dynamic = getThemeColors(mode === 'dark');
  // Merge base palette with dynamic overrides and ergonomic keys
  return {
    ...colors,
    background: dynamic.background,
    card: dynamic.card,
    border: dynamic.border,
    textPrimary: dynamic.text,
    textSecondary: dynamic.textSecondary,
    text: dynamic.text, // alias
  } as typeof colors & ReturnType<typeof getThemeColors> & { text: string };
};