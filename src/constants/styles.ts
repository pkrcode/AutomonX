import { StyleSheet } from 'react-native';
import { colors } from './colors'; // Using relative path here is fine

// Global styles
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 24,
  },
  // A standard card shadow style
  cardShadow: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  // Input field style
  input: {
    height: 50,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.textSecondary, // Light border
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
});
