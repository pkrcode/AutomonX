import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { LoadingIndicator } from '../components/common/LoadingIndicator';

// Define the shape of the context data
interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
}

// Create the context with a default value
// Using '!' as a non-null assertion because we check for it in AuthProvider
const AuthContext = createContext<AuthContextType>(null!);

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * This provider component wraps your app and makes authentication state
 * available to any child component that calls `useAuth()`.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes
  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const subscriber = auth().onAuthStateChanged(
      (userState: FirebaseAuthTypes.User | null) => {
        setUser(userState);
        if (isLoading) {
          setIsLoading(false);
        }
      }
    );

    // Unsubscribe on unmount
    return subscriber;
  }, [isLoading]);

  // Show a loading indicator while Firebase initializes
  if (isLoading) {
    return <LoadingIndicator />;
  }

  const value = {
    user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
