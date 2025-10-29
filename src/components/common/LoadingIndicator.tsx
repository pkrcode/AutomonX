import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors'; // Using path alias

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  fullScreen?: boolean; // Add prop to make it full screen
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  color = colors.primary,
  style,
  fullScreen = false, // Default to false
}) => {
  // Apply fullScreen styles only if fullScreen is true
  const containerStyle = fullScreen
    ? [styles.fullScreenContainer, style]
    : [styles.inlineContainer, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background, // Use background color for full screen
  },
  inlineContainer: {
    // Styles for when it's not full screen (e.g., inside a button)
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingIndicator;
