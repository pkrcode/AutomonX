import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
// We will also need an icon component later. For now, we'll placeholder it.
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SecurityStatusProps {
  isBreached: boolean;
}

const SecurityStatus: React.FC<SecurityStatusProps> = ({ isBreached }) => {
  const statusColor = isBreached ? colors.danger : colors.success;
  const statusText = isBreached ? 'Breach Detected!' : 'All Clear';
  // const iconName = isBreached ? 'alert-circle' : 'shield-check';

  return (
    <View style={[styles.container, { borderColor: statusColor }]}>
      {/* <Icon 
        name={iconName} 
        size={28} 
        color={statusColor} 
        style={styles.icon} 
      />
      */}
      <View style={[styles.iconPlaceholder, { backgroundColor: statusColor }]} />
      <View>
        <Text style={styles.title}>Security Status</Text>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 16,
    // The background color is set dynamically
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 22,
    fontWeight: '700',
  },
});

export default SecurityStatus;
