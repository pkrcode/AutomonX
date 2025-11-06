import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';

// Import components and constants using path aliases
import Header from '@components/common/Header';
import LoadingIndicator from '@components/common/LoadingIndicator';
import { useThemeColors } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';
import { AuthContext } from '@context/AuthContext';

// Import the types we defined in EventLogScreen
import { EventData } from './EventLogScreen';

// Define the navigation props. This assumes 'EventDetail' is part of a stack.
// We'll need to add this to our MainTabs.tsx or a new stack.
type MainStackParamList = {
  EventLog: undefined;
  EventDetail: { eventId: string; eventTitle: string };
};

type EventDetailScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'EventDetail'
>;

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  route,
}) => {
  const { eventId, eventTitle } = route.params;
  const auth = useContext(AuthContext);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user || !eventId) return;

    // Get the device ID (assumed to be user's UID)
    const deviceId = auth.user.uid;

    const getEventDetails = async () => {
      try {
        const eventDoc = await firestore()
          .collection('devices')
          .doc(deviceId)
          .collection('events')
          .doc(eventId)
          .get();

        if (eventDoc.exists) {
          setEvent({
            id: eventDoc.id,
            ...(eventDoc.data() as Omit<EventData, 'id'>),
          });
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error('Error fetching event detail: ', err);
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    getEventDetails();
  }, [auth?.user, eventId]);

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.container}>
      {/* We can use the eventTitle as a fallback header */}
      <Header title={event?.title || eventTitle} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {event && (
          <View style={styles.content}>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Event Type</Text>
              <Text style={styles.value}>{event.type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Timestamp</Text>
              <Text style={styles.value}>
                {event.timestamp.toDate().toLocaleString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{event.description}</Text>
            </View>
            {/* You could add more details here, like a map if it has GPS data */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 20,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 20,
    ...globalStyles.cardShadow,
  },
  detailItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
  },
});

export default EventDetailScreen;
