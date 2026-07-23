import { collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const createSession = async (topicId, learnerId, mentorId) => {
  const sessionRef = collection(db, 'sessions');
  const newSession = await addDoc(sessionRef, {
    topicId,
    learnerId,
    mentorId,
    status: 'scheduled', 
    notes: '',
    confirmation: { learner: false, mentor: false },
    checkIn: { learner: false, mentor: false },
    endRequest: { requested: false, requestedBy: null, requestedAt: null },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return newSession.id;
};

export const getSessionById = async (sessionId) => {
  const docRef = doc(db, 'sessions', sessionId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Session not found");
  return { id: docSnap.id, ...docSnap.data() };
};

export const getSessionByTopic = async (topicId) => {
  const q = query(collection(db, 'sessions'), where("topicId", "==", topicId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getSessionsByUser = async (userId) => {
  const sessionsRef = collection(db, 'sessions');
  const learnerQuery = query(sessionsRef, where("learnerId", "==", userId));
  const mentorQuery = query(sessionsRef, where("mentorId", "==", userId));
  
  const [learnerSnap, mentorSnap] = await Promise.all([getDocs(learnerQuery), getDocs(mentorQuery)]);
  
  const sessions = [];
  learnerSnap.forEach(doc => sessions.push({ id: doc.id, ...doc.data() }));
  mentorSnap.forEach(doc => {
    if (!sessions.find(s => s.id === doc.id)) sessions.push({ id: doc.id, ...doc.data() });
  });
  
  return sessions;
};

export const updateSessionStatus = async (sessionId, status) => {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, { status, updatedAt: serverTimestamp() });
};

export const requestEndSession = async (sessionId, requestedByUid) => {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, { 
    status: 'end_requested',
    endRequest: { requested: true, requestedBy: requestedByUid, requestedAt: serverTimestamp() },
    updatedAt: serverTimestamp() 
  });
};

export const confirmEndSession = async (sessionId) => {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, { 
    status: 'completed', 
    updatedAt: serverTimestamp() 
  });
};

export const saveSessionNotes = async (sessionId, notes) => {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, { notes, updatedAt: serverTimestamp() });
};