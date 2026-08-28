import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { createNotification } from './notificationService';

export const createSession = async ({ topicId, topicTitle, learnerId, mentorId }) => {
  if (!topicId || !learnerId || !mentorId) throw new Error("Missing required session IDs.");

  const docRef = await addDoc(collection(db, 'sessions'), {
    topicId,
    topicTitle: topicTitle || "Untitled Study Session",
    learnerId,
    mentorId,
    status: 'scheduled',
    notes: '',
    
    confirmation: { learner: false, mentor: false },
    confirmationTime: { learner: null, mentor: null },
    checkIn: { learner: false, mentor: false },
    checkInTime: { learner: null, mentor: null },
    
    endRequest: { requested: false, requestedBy: null, requestedAt: null },
    
    rating: { learnerRatedMentor: false, mentorRatedLearner: false },
    appreciation: { status: "pending", type: null, amount: 0 },
    
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return docRef.id;
};

export const subscribeToUserSessions = (uid, callback) => {
  if (!uid) return () => {};
  let learnerSessions = [];
  let mentorSessions = [];
  let calls = 0;

  const emit = () => {
    if (calls < 2) return;
    const merged = [...learnerSessions, ...mentorSessions];
    // Remove duplicates safely by ID mapping
    const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
    callback(unique);
  };

  const qLearner = query(collection(db, 'sessions'), where('learnerId', '==', uid));
  const unsubLearner = onSnapshot(qLearner, (snap) => {
    learnerSessions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (calls < 2) calls++;
    emit();
  });

  const qMentor = query(collection(db, 'sessions'), where('mentorId', '==', uid));
  const unsubMentor = onSnapshot(qMentor, (snap) => {
    mentorSessions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (calls < 2) calls++;
    emit();
  });

  return () => { unsubLearner(); unsubMentor(); };
};

export const getUserSessions = async (uid) => {
  return new Promise((resolve) => {
    const unsub = subscribeToUserSessions(uid, (data) => {
      resolve(data);
      unsub();
    });
  });
};

export const getSession = async (sessionId) => {
  if (!sessionId) throw new Error("Session ID required");
  const snap = await getDoc(doc(db, 'sessions', sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const subscribeToSession = (sessionId, callback) => {
  if (!sessionId) return () => {};
  return onSnapshot(doc(db, 'sessions', sessionId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    else callback(null);
  }, (err) => {
    console.error("Session listener error:", err);
    callback(null);
  });
};

export const updateSessionStatus = async (sessionId, status) => {
  if (!sessionId) return;
  await updateDoc(doc(db, 'sessions', sessionId), { status, updatedAt: serverTimestamp() });
};

export const saveSessionNotes = async (sessionId, notes) => {
  if (!sessionId) return;
  await updateDoc(doc(db, 'sessions', sessionId), { notes, updatedAt: serverTimestamp() });
};

export const requestEndSession = async (sessionId, userId) => {
  if (!sessionId) return;
  await updateDoc(doc(db, 'sessions', sessionId), {
    status: 'waiting_end_confirmation',
    endRequest: { requested: true, requestedBy: userId, requestedAt: serverTimestamp() },
    updatedAt: serverTimestamp()
  });
};

export const confirmEndSession = async (sessionId, topicId = null) => {
  if (!sessionId) return;
  await updateDoc(doc(db, 'sessions', sessionId), {
    status: 'completed',
    endedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  if (topicId) {
    try {
      await updateDoc(doc(db, 'topics', topicId), {
        status: 'completed',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Non-fatal: Failed to complete parent topic", err);
    }
  }
};

export const completeSession = confirmEndSession;

export const updateSessionSchedule = async (sessionId, scheduleData) => {
  if (!sessionId) return;
  
  await updateDoc(doc(db, 'sessions', sessionId), {
    scheduledTime: scheduleData.scheduledTime,
    duration: scheduleData.duration,
    meetingType: scheduleData.meetingType,
    meetingLocation: scheduleData.meetingLocation || "",
    meetingLink: scheduleData.meetingLink || "",
    scheduledBy: scheduleData.scheduledBy,
    updatedAt: serverTimestamp()
  });
  
  try {
    const session = await getSession(sessionId);
    const recipientId = session.learnerId === scheduleData.scheduledBy ? session.mentorId : session.learnerId;
    if (recipientId) {
      await createNotification({
        recipientId,
        senderId: scheduleData.scheduledBy,
        type: "session_scheduled",
        title: "Session schedule updated",
        message: `The schedule for "${session.topicTitle}" has been set.`,
        relatedId: sessionId
      });
    }
  } catch (err) {
    console.error("Non-fatal: Notification failed", err);
  }
};

export const confirmSession = async (sessionId, userId) => {
  if (!sessionId || !userId) return;
  
  const sessionRef = doc(db, 'sessions', sessionId);
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) throw new Error("Session not found");
  
  const data = snap.data();
  const isLearner = data.learnerId === userId;
  const isMentor = data.mentorId === userId;
  
  if (!isLearner && !isMentor) throw new Error("Unauthorized to confirm this session.");
  
  const role = isLearner ? 'learner' : 'mentor';
  
  const currentConfirmation = data.confirmation || { learner: false, mentor: false };
  const learnerConfirmed = role === 'learner' ? true : currentConfirmation.learner;
  const mentorConfirmed = role === 'mentor' ? true : currentConfirmation.mentor;
  
  const updates = {
    [`confirmation.${role}`]: true,
    [`confirmationTime.${role}`]: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  if (learnerConfirmed && mentorConfirmed && data.status === 'scheduled') {
    updates.status = 'ready';
  }
  
  await updateDoc(sessionRef, updates);

  try {
    const recipientId = isLearner ? data.mentorId : data.learnerId;
    if (updates.status === 'ready') {
      await createNotification({ recipientId, senderId: userId, type: "session_ready", title: "Session is ready", message: "Both participants confirmed. You can now check in.", relatedId: sessionId });
      await createNotification({ recipientId: userId, senderId: recipientId, type: "session_ready", title: "Session is ready", message: "Both participants confirmed. You can now check in.", relatedId: sessionId });
    } else {
      await createNotification({ recipientId, senderId: userId, type: "session_confirmed", title: "Session confirmed", message: "Your study partner confirmed the session attendance.", relatedId: sessionId });
    }
  } catch (err) {
    console.error("Non-fatal: Notification failed", err);
  }
  
  return { ...data, ...updates, confirmation: { learner: learnerConfirmed, mentor: mentorConfirmed } };
};

export const checkInSession = async (sessionId, userId) => {
  if (!sessionId || !userId) return;
  
  const sessionRef = doc(db, 'sessions', sessionId);
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) throw new Error("Session not found");
  
  const data = snap.data();
  const isLearner = data.learnerId === userId;
  const isMentor = data.mentorId === userId;
  
  if (!isLearner && !isMentor) throw new Error("Unauthorized to check-in to this session.");
  if (data.status === 'scheduled') throw new Error("Both participants must confirm before check-in.");
  if (['completed', 'cancelled'].includes(data.status)) throw new Error("This session is already closed.");
  
  const role = isLearner ? 'learner' : 'mentor';
  const currentCheckIn = data.checkIn || { learner: false, mentor: false };
  
  const learnerCheckedIn = role === 'learner' ? true : currentCheckIn.learner;
  const mentorCheckedIn = role === 'mentor' ? true : currentCheckIn.mentor;
  
  const updates = {
    [`checkIn.${role}`]: true,
    [`checkInTime.${role}`]: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  if (learnerCheckedIn && mentorCheckedIn && data.status === 'ready') {
    updates.status = 'in_progress';
    updates.startedAt = serverTimestamp();
  }
  
  await updateDoc(sessionRef, updates);
  
  try {
    const recipientId = isLearner ? data.mentorId : data.learnerId;
    if (updates.status === 'in_progress') {
      await createNotification({ recipientId, senderId: userId, type: "session_started", title: "Session started", message: "Both participants checked in. Your session is now in progress.", relatedId: sessionId });
      await createNotification({ recipientId: userId, senderId: recipientId, type: "session_started", title: "Session started", message: "Both participants checked in. Your session is now in progress.", relatedId: sessionId });
    } else {
      await createNotification({ recipientId, senderId: userId, type: "session_check_in", title: "Your study partner checked in", message: "Your StudyLunch partner has checked in.", relatedId: sessionId });
    }
  } catch (err) {
    console.error("Non-fatal: Notification failed", err);
  }
  
  return { ...data, ...updates, checkIn: { learner: learnerCheckedIn, mentor: mentorCheckedIn } };
};