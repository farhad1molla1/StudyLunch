// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHhUrdoK0eMfnVkxyLJ6DsQLMgL18au28",
  authDomain: "studylunch-94407.firebaseapp.com",
  projectId: "studylunch-94407",
  storageBucket: "studylunch-94407.firebasestorage.app",
  messagingSenderId: "391549300553",
  appId: "1:391549300553:web:0765af21af2820e2f4f498",
  measurementId: "G-3FPL15D2LY"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export everything safely for the StudyLunch architecture
export { app, analytics, auth, db, storage };