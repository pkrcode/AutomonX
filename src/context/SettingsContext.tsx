import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of your settings
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: {
    alerts: boolean;
    automations: boolean;
  };
}

// Define the shape of the context value
interface SettingsContextProps {
  settings: AppSettings;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleNotifications: (type: 'alerts' | 'automations') => void;
  isLoading: boolean;
}

// Create the context
const SettingsContext = createContext<SettingsContextProps | undefined>(
  undefined,
);

// Define the provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system', // Default to system theme
    notificationsEnabled: {
      alerts: true,
      automations: true,
    },
  });

  // Load settings from storage on app start
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('appSettings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Save settings to storage whenever they change
  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => {
      const newSettings = { ...prev, theme };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const toggleNotifications = (type: 'alerts' | 'automations') => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        notificationsEnabled: {
          ...prev.notificationsEnabled,
          [type]: !prev.notificationsEnabled[type],
        },
      };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  // Don't render children until settings are loaded
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <SettingsContext.Provider
      value={{ settings, setTheme, toggleNotifications, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
