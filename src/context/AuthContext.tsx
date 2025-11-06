import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';

// Mock user type for Expo Go compatibility
interface MockUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextProps {
  user: MockUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // EXPO GO COMPATIBILITY: Always use mock user for testing
    // In production build, replace this with real Firebase auth
    
    console.log('🔧 Using mock authentication (Expo Go mode)');
    
    // Simulate auth initialization delay
    const timer = setTimeout(() => {
      console.log('✅ Mock user logged in: test@automonx.com');
      setUser({
        uid: 'test-user-123',
        email: 'test@automonx.com',
        displayName: 'Test User',
      });
      setIsAuthLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const logout = async () => {
    console.log('🔓 Logging out mock user');
    setUser(null);
    // In production, add: await firebaseAuth().signOut();
  };

  console.log('AuthProvider state:', { user: user?.email, isLoading: isAuthLoading });

  // Removed loading screen - directly render children
  return (
    <AuthContext.Provider value={{ user, isLoading: isAuthLoading, logout }}>
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

export { AuthContext };

