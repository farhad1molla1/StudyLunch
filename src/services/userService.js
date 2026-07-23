import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

// Get user profile data
export const getUserProfile = async (uid) => {
  if (!uid) throw new Error("No UID provided");
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { uid: userSnap.id, ...userSnap.data() };
  }
  return null;
};

// Aliasing the function for AuthContext compatibility
export const getUser = getUserProfile; 

// Create a new user profile document
export const createUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Update existing user profile
export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};