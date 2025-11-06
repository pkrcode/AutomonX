import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  View,
  Text,
} from 'react-native';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Import components and constants using path aliases
import Header from '@components/common/Header';
import EventListItem from '@components/events/EventListItem';
import LoadingIndicator from '@components/common/LoadingIndicator';
import { useThemeColors } from '../../constants/colors';
import { AuthContext } from '@context/AuthContext';

// Define the structure of an Event document in Firestore
export interface EventData {
  id: string; // Document ID
  type: 'Security' | 'Sensor' | 'Automation';
  title: string;
  description: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

// Note: This screen is currently unused in Expo Go builds.
// Keep props untyped to avoid coupling to drawer route names that may change.
const EventLogScreen: React.FC = () => {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user) return;

    // Assumes events are stored in a subcollection under the device's doc
    // e.g., devices/{deviceId}/events
    // We get the deviceId from the user's UID, same as the dashboard.
    const deviceId = auth.user.uid;

    const unsubscribe = firestore()
      .collection('devices')
      .doc(deviceId)
      .collection('events')
      // .orderBy('timestamp', 'desc') // Be careful with orderBy, it requires a matching Firestore index
      .limit(50) // Get the 50 most recent events
      .onSnapshot(
        querySnapshot => {
          const fetchedEvents: EventData[] = [];
          querySnapshot.forEach(doc => {
            fetchedEvents.push({
              id: doc.id,
              ...(doc.data() as Omit<EventData, 'id'>),
            });
          });

          // Since we can't reliably use orderBy without an index,
          // we'll sort the results in the app.
          fetchedEvents.sort(
            (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis(),
          );

          setEvents(fetchedEvents);
          setLoading(false);
        },
        err => {
          console.error('Error fetching event log: ', err);
          setError('Failed to load event log.');
          setLoading(false);
        },
      );

    // Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, [auth?.user]);

  const handleItemPress = (item: EventData) => {
    // Navigate to a detail screen (which we'll create next)
    // navigation.navigate('EventDetail', {
    //   eventId: item.id,
    //   eventTitle: item.title,
    // });
    console.log('Navigate to Event Detail: ', item.id);
  };

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Event Log"
        rightIcon="back"
        onRightPress={() => navigation.goBack()}
        onLogoPress={() => navigation.navigate('Dashboard' as never)}
      />
      {error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!loading && !error && events.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.noEventsText}>No events recorded yet.</Text>
        </View>
      )}
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <EventListItem
            item={item}
            onPress={() => handleItemPress(item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingVertical: 10,
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
  noEventsText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default EventLogScreen;
