// Shim for @react-native-firebase/app to allow running in Expo Go without native modules
export default function app() {
  return {
    // no-op shim
  } as any;
}
