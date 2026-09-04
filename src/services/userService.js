import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

// Get user profile data
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { uid: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Aliasing the function for AuthContext compatibility returning unified shape
export const getUser = async (uid) => {
  if (!uid) return { success: false, data: null };
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = { uid: userSnap.id, ...userSnap.data() };
      return { success: true, data, ...data };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, data: null, error };
  }
};

// Create a new user profile document
export const createUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return { uid, ...data };
};

// Aliased createUser for LoginForm
export const createUser = async (uid, name, email, photoURL = '') => {
  return createUserProfile(uid, {
    name,
    email,
    photoURL,
    lastActive: serverTimestamp()
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

// Update last active timestamp
export const updateLastActive = async (uid) => {
  if (!uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastActive: serverTimestamp()
    });
  } catch (err) {
    // Ignore if document not created yet
  }
};