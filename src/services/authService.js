import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail // Added this for resetPassword
} from 'firebase/auth';
import { app } from '../firebase/firebase'; 

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Registration
export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
export const signup = registerUser; // Fallback alias

// Login
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
export const login = loginUser; // Fallback alias

// Google Login
export const googleLogin = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
};

// Password Reset (THIS WAS MISSING AND CAUSED THE CRASH)
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
};
export const logout = logoutUser; // Fallback alias

// Auth State
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
export const observeAuthState = subscribeToAuthChanges; // Fallback alias