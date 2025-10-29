import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import LoadingIndicator from '@components/common/LoadingIndicator';
import { colors } from '../constants/colors';
import { View, StyleSheet } from 'react-native';

interface AuthContextProps {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const subscriber = auth().onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
      if (isAuthLoading) {
        setIsAuthLoading(false);
      }
    });

    // Unsubscribe on unmount
    return subscriber;
  }, [isAuthLoading]);

  // Show a full-screen loader while Firebase auth is initializing
  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading: isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

