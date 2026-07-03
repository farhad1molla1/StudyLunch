import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// 🛑 Internal Helper for mapping Firestore raw errors to User-Friendly messages
const getFirestoreErrorMessage = (error) => {
  switch (error.code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'not-found':
      return 'User profile data could not be found.';
    case 'unavailable':
      return 'Database service is temporarily unavailable. Check your internet connection.';
    default:
      return 'Something went wrong while syncing data. Please try again.';
  }
};

export const createUser = async (uid, name, email, photoURL) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Strict Database Schema & Initial Values Configuration
    const userData = {
      uid,
      name,
      email,
      photoURL: photoURL || "",
      university: "",
      department: "",
      academicYear: "",
      bio: "",
      skills: [],
      learningGoals: [],
      trustScore: 100,
      responsibilityScore: 100,
      contributionScore: 0,
      ratingAverage: 0,
      totalRatings: 0,
      sessionsLearned: 0,
      sessionsMentored: 0,
      topicsCreated: 0,
      appreciationGiven: 0,
      appreciationReceived: 0,
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      isVerified: false,
      role: "student",
      status: "active"
    };

    await setDoc(userRef, userData);
    return { success: true, message: 'User profile initialized successfully.', user: userData };
  } catch (error) {
    return { success: false, message: getFirestoreErrorMessage(error) };
  }
};

export const getUser = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, message: 'No profile document found for this user.' };
    }
  } catch (error) {
    return { success: false, message: getFirestoreErrorMessage(error) };
  }
};

export const updateUser = async (uid, updates) => {
  try {
    // Whitelist of strictly allowed fields to prevent arbitrary schema modifications
    const allowedUpdates = [
      'university',
      'department',
      'academicYear',
      'bio',
      'skills',
      'learningGoals',
      'photoURL'
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return { success: false, message: 'No valid modifiable fields were provided.' };
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, filteredUpdates);
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    return { success: false, message: getFirestoreErrorMessage(error) };
  }
};

export const updateLastActive = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { lastActive: serverTimestamp() });
    return { success: true, message: 'Activity timestamp synced.' };
  } catch (error) {
    return { success: false, message: getFirestoreErrorMessage(error) };
  }
};

export const deleteUser = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    return { success: true, message: 'User profile document dropped successfully.' };
  } catch (error) {
    return { success: false, message: getFirestoreErrorMessage(error) };
  }
};