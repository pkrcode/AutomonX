const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add asset registry path resolution
config.transformer = {
  ...config.transformer,
  assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
};

module.exports = config;
