module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@context': './src/context',
            '@constants': './src/constants',
            '@assets': './assets',
            // Shims to allow running in Expo Go without native Firebase modules
            '@react-native-firebase/app': './src/shims/rnf-app',
            '@react-native-firebase/auth': './src/shims/rnf-auth',
            '@react-native-firebase/firestore': './src/shims/rnf-firestore',
            '@react-native-firebase/messaging': './src/shims/rnf-messaging',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
