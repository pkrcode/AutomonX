import React, {
  createContext,
  useState,
  ReactNode,
} from 'react';

// Define the shape of your settings
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: {
    alerts: boolean;
    automations: boolean;
  };
  arduino: {
    enabled: boolean;
    websocketUrl: string;
  };
}

// Define the shape of the context value
interface SettingsContextProps {
  settings: AppSettings;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleNotifications: (type: 'alerts' | 'automations') => void;
  setArduinoEnabled: (enabled: boolean) => void;
  setArduinoUrl: (url: string) => void;
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
  const [isLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light', // Default to light theme
    notificationsEnabled: {
      alerts: true,
      automations: true,
    },
    arduino: {
      enabled: false,
      websocketUrl: 'ws://192.168.1.100:3001', // Default placeholder
    },
  });

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const toggleNotifications = (type: 'alerts' | 'automations') => {
    setSettings(prev => ({
      ...prev,
      notificationsEnabled: {
        ...prev.notificationsEnabled,
        [type]: !prev.notificationsEnabled[type],
      },
    }));
  };

  const setArduinoEnabled = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      arduino: { ...prev.arduino, enabled },
    }));
  };

  const setArduinoUrl = (url: string) => {
    setSettings(prev => ({
      ...prev,
      arduino: { ...prev.arduino, websocketUrl: url },
    }));
  };

  const value: SettingsContextProps = {
    settings,
    setTheme,
    toggleNotifications,
    setArduinoEnabled,
    setArduinoUrl,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext };
