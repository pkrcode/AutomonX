import auth, {
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';

// --- Sign Up ---
export const signUp = async (
  email: string,
  pass: string,
): Promise<{ user?: FirebaseAuthTypes.User; error?: string }> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      pass,
    );
    // You could also set a display name here if you have it
    // await userCredential.user.updateProfile({ displayName: 'New User' });

    return { user: userCredential.user };
  } catch (e) {
    const error = e as Error;
    return { error: error.message || 'Failed to sign up.' };
  }
};

// --- Sign In ---
export const signIn = async (
  email: string,
  pass: string,
): Promise<{ user?: FirebaseAuthTypes.User; error?: string }> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      pass,
    );
    return { user: userCredential.user };
  } catch (e) {
    const error = e as Error;
    return { error: error.message || 'Failed to sign in.' };
  }
};

// --- Sign Out ---
export const signOut = async (): Promise<{ error?: string }> => {
  try {
    await auth().signOut();
    return {};
  } catch (e) {
    const error = e as Error;
    return { error: error.message || 'Failed to sign out.' };
  }
};

// We can export them as a single service object
export const AuthService = {
  signUp,
  signIn,
  signOut,
};
