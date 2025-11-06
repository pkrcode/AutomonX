import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../constants/colors';

// We can use an icon placeholder for now
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface Event {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'automation' | 'Security' | 'Sensor' | 'Automation';
  title: string;
  timestamp: Date | any; // Or number, if using Firebase timestamp
  details?: string;
  description?: string;
}

interface EventListItemProps {
  item: Event;
  onPress: (item: Event) => void;
}

const EventListItem: React.FC<EventListItemProps> = ({ item, onPress }) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const getIconColor = () => {
    switch (item.type) {
      case 'alert':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'automation':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View
        style={[styles.iconPlaceholder, { backgroundColor: getIconColor() }]}
      />
      {/* Example of where an icon would go
      <Icon 
        name={getIconName(item.type)} 
        size={24} 
        color={getIconColor()}
        style={styles.icon}
      /> 
      */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleString()}
        </Text>
      </View>
      {/* You could add a chevron icon here to indicate it's tappable */}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default EventListItem;
