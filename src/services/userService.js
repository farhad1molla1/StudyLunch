import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

// 1. Get user profile data
export const getUserProfile = async (uid) => {
  if (!uid) throw new Error("No UID provided");
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { uid: userSnap.id, ...userSnap.data() };
  }
  return null;
};

// Alias for AuthContext compatibility
export const getUser = getUserProfile; 

// 2. Create a new user profile document
export const createUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// 3. Update existing user profile
export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// 4. Update user's last active timestamp safely (THE MISSING FIX)
export const updateLastActive = async (uid) => {
  if (!uid) return;
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    // Fails silently in the UI so the app/auth flow does not crash
    console.error("Failed to update last active:", error);
  }
};