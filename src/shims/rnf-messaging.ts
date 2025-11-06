// Shim for @react-native-firebase/messaging to allow running in Expo Go
const messaging = () => ({
  requestPermission: async () => ({}),
  getToken: async () => 'mock-token',
  onMessage: (_handler: any) => () => {},
});
export default messaging as any;
