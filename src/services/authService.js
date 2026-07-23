import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { app } from '../firebase/firebase'; 

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
export const signup = registerUser; 

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
export const login = loginUser; 

export const googleLogin = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
  await signOut(auth);
};
export const logout = logoutUser; 

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
export const observeAuthState = subscribeToAuthChanges;