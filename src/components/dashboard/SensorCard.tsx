import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
// We will also need an icon component later. For now, we'll placeholder it.
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SensorCardProps {
  // We'll pass an icon name as a string later
  // iconName: string; 
  title: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  onPress?: () => void;
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  status = 'normal',
  onPress,
}) => {
  // Get the appropriate color based on the sensor's status
  const getStatusColor = () => {
    switch (status) {
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'normal':
      default:
        return colors.textSecondary;
    }
  };

  const statusColor = getStatusColor();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      disabled={!onPress}
    >
      <View style={styles.header}>
        {/* Placeholder for the icon. We can add a real icon component here 
          once we install a library like react-native-vector-icons or use SVGs.
        */}
        <View style={[styles.iconPlaceholder, { backgroundColor: statusColor }]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.body}>
        <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    margin: 8,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    minWidth: 160, // Ensure cards have a good minimum width
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    // The background color is set dynamically
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'baseline', // Aligns the value and unit nicely
    marginTop: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
  },
  unit: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 4,
  },
});

export default SensorCard;
