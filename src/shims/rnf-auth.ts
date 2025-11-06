// Shim for @react-native-firebase/auth to allow running in Expo Go
export type FirebaseAuthTypes = {
  User: { uid: string; email?: string | null };
};

const auth = () => ({
  onAuthStateChanged: (cb: (user: any) => void) => {
    // Immediately report no user
    const t = setTimeout(() => cb(null), 0);
    return () => clearTimeout(t);
  },
  signInWithEmailAndPassword: async (_email: string, _pass: string) => ({
    user: { uid: 'dev', email: _email },
  }),
  createUserWithEmailAndPassword: async (_email: string, _pass: string) => ({
    user: { uid: 'dev', email: _email },
  }),
  signOut: async () => {},
});

export default auth as any;
