import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

// 🛑 Internal Helper for mapping Firebase errors to User-Friendly messages
const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-not-found':
      return 'No account found.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Check your internet connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

export const signup = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Setting the user's name immediately after account creation
    await updateProfile(userCredential.user, { displayName: name });
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, message: getAuthErrorMessage(error) };
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user, message: 'Logged in successfully.' };
  } catch (error) {
    return { success: false, message: getAuthErrorMessage(error) };
  }
};

export const googleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { success: true, user: userCredential.user, message: 'Google login successful.' };
  } catch (error) {
    return { success: false, message: getAuthErrorMessage(error) };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, message: 'Logged out successfully.' };
  } catch (error) {
    return { success: false, message: getAuthErrorMessage(error) };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent.' };
  } catch (error) {
    return { success: false, message: getAuthErrorMessage(error) };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const updateUserProfile = async (displayName, photoURL) => {
  try {
    if (!auth.currentUser) {
      return { success: false, message: 'No user is currently logged in.' };
    }
    await updateProfile(auth.currentUser, { displayName, photoURL });
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    return { success: false, message: getAuthErrorMessage(error) };
  }
};