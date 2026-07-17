import { db } from '../firebase/firebase'; 
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { getTopicById, updateTopicStatus } from './topicService';

/**
 * 1. Create a new Session
 */
export const createSession = async (topicId) => {
  try {
    if (!topicId) throw new Error('Topic ID is required to create a session.');

    const topic = await getTopicById(topicId);
    if (!topic) throw new Error('Topic not found.');
    if (topic.status !== 'matched') throw new Error('A session can only be created for a "matched" topic.');
    if (!topic.acceptedBy) throw new Error('Topic must have a mentor assigned before creating a session.');

    const sessionsRef = collection(db, 'sessions');
    
    const newSession = {
      topicId: topic.id,
      mentorId: topic.acceptedBy,
      learnerId: topic.createdBy,
      status: 'scheduled', 
      meetingType: 'offline', 
      meetingLocation: '',
      meetingLink: '', 
      scheduledTime: null,
      startedAt: null,
      endedAt: null,
      duration: 0,
      notes: '',
      confirmation: { learner: false, mentor: false },
      confirmationTime: { learner: null, mentor: null },
      checkIn: { learner: false, mentor: false },
      checkInTime: { learner: null, mentor: null },
      attendance: { learner: false, mentor: false },
      // NEW: End Session Schema
      endRequest: {
        requested: false,
        requestedBy: null,
        requestedAt: null
      },
      endConfirmation: {
        learner: false
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(sessionsRef, newSession);
    return { id: docRef.id, ...newSession };
  } catch (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }
};

/**
 * 2. Get single Session by ID
 */
export const getSession = async (sessionId) => {
  try {
    if (!sessionId) throw new Error('Session ID is required.');
    
    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to fetch session: ${error.message}`);
  }
};

/**
 * 3. Get all sessions related to a specific Topic
 */
export const getSessionByTopic = async (topicId) => {
  try {
    if (!topicId) throw new Error('Topic ID is required.');

    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('topicId', '==', topicId));
    const querySnapshot = await getDocs(q);

    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    
    return sessions;
  } catch (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }
};

/**
 * 4. Update general session details
 */
export const updateSession = async (sessionId, data) => {
  try {
    if (!sessionId) throw new Error('Session ID is required.');

    const docRef = doc(db, 'sessions', sessionId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to update session: ${error.message}`);
  }
};

/**
 * 5. Schedule a Session
 */
export const scheduleSession = async (sessionId, scheduleData) => {
  try {
    if (!sessionId) throw new Error('Session ID is required.');
    
    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Session not found.');
    
    const session = docSnap.data();
    if (session.status !== 'scheduled') throw new Error(`Cannot schedule a session that is currently '${session.status}'.`);

    const { scheduledTime, duration, meetingType, meetingLocation, meetingLink } = scheduleData;
    const updateData = { scheduledTime, duration: Number(duration), meetingType, updatedAt: serverTimestamp() };

    if (meetingType === 'offline') {
      updateData.meetingLocation = meetingLocation;
      updateData.meetingLink = '';
    } else {
      updateData.meetingLink = meetingLink;
      updateData.meetingLocation = '';
    }

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    throw new Error(`Failed to schedule session: ${error.message}`);
  }
};

/**
 * 6. Confirm Session
 */
export const confirmSession = async (sessionId, userId) => {
  try {
    if (!sessionId || !userId) throw new Error('Session ID and User ID are required.');

    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Session not found.');

    const session = docSnap.data();
    if (session.status !== 'scheduled') throw new Error(`Cannot confirm a session that is '${session.status}'.`);

    let role = null;
    if (session.learnerId === userId) role = 'learner';
    else if (session.mentorId === userId) role = 'mentor';
    else throw new Error('Unauthorized.');

    if (session.confirmation[role]) throw new Error('You have already confirmed this session.');

    const updatedConfirmation = { ...session.confirmation, [role]: true };
    const updatedConfirmationTime = { ...session.confirmationTime, [role]: serverTimestamp() };

    let newStatus = session.status;
    if (updatedConfirmation.learner && updatedConfirmation.mentor) {
      newStatus = 'ready';
    }

    await updateDoc(docRef, {
      confirmation: updatedConfirmation,
      confirmationTime: updatedConfirmationTime,
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    return { success: true, status: newStatus };
  } catch (error) {
    throw new Error(`Failed to confirm session: ${error.message}`);
  }
};

/**
 * 7. Check-in System
 */
export const checkIn = async (sessionId, userId) => {
  try {
    if (!sessionId || !userId) throw new Error('Session ID and User ID are required.');

    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Session not found.');

    const session = docSnap.data();
    if (session.status !== 'ready') throw new Error(`Cannot check in. Session is '${session.status}'.`);

    let role = null;
    if (session.learnerId === userId) role = 'learner';
    else if (session.mentorId === userId) role = 'mentor';
    else throw new Error('Unauthorized.');

    if (session.checkIn[role]) throw new Error('You have already checked in.');

    const updatedCheckIn = { ...session.checkIn, [role]: true };
    const updatedCheckInTime = { ...session.checkInTime, [role]: serverTimestamp() };
    
    const updatePayload = { checkIn: updatedCheckIn, checkInTime: updatedCheckInTime, updatedAt: serverTimestamp() };

    let newStatus = session.status;
    if (updatedCheckIn.learner && updatedCheckIn.mentor) {
      newStatus = 'in_progress';
      updatePayload.status = newStatus;
      updatePayload.startedAt = serverTimestamp();
    }

    await updateDoc(docRef, updatePayload);
    return { success: true, status: newStatus };
  } catch (error) {
    throw new Error(`Failed to check in: ${error.message}`);
  }
};

/**
 * 8. ⭐ Request to End Session (Mentor Action)
 */
export const requestEndSession = async (sessionId, mentorId) => {
  try {
    if (!sessionId || !mentorId) throw new Error('Session ID and Mentor ID are required.');

    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Session not found.');

    const session = docSnap.data();
    if (session.mentorId !== mentorId) throw new Error('Unauthorized. Only the mentor can request to end the session.');
    if (session.status !== 'in_progress') throw new Error('Session is not currently in progress.');
    if (session.endRequest.requested) throw new Error('End session request already sent.');

    await updateDoc(docRef, {
      endRequest: {
        requested: true,
        requestedBy: mentorId,
        requestedAt: serverTimestamp()
      },
      status: 'waiting_end_confirmation',
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to request end session: ${error.message}`);
  }
};

/**
 * 9. ⭐ Confirm End Session (Learner Action)
 */
export const confirmEndSession = async (sessionId, learnerId) => {
  try {
    if (!sessionId || !learnerId) throw new Error('Session ID and Learner ID are required.');

    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Session not found.');

    const sessionData = docSnap.data();
    if (sessionData.learnerId !== learnerId) throw new Error('Unauthorized. Only the learner can confirm the session end.');
    if (sessionData.status !== 'waiting_end_confirmation') throw new Error('Invalid session status for end confirmation.');
    if (sessionData.endConfirmation.learner) throw new Error('You have already confirmed the end of this session.');

    // Calculate Final Duration
    let actualDurationInMinutes = 0;
    if (sessionData.startedAt) {
      const startTime = sessionData.startedAt.toDate();
      const endTime = new Date();
      actualDurationInMinutes = Math.round((endTime - startTime) / 60000);
    }

    // Update Session
    await updateDoc(docRef, {
      endConfirmation: { learner: true },
      status: 'completed',
      endedAt: serverTimestamp(),
      duration: actualDurationInMinutes,
      updatedAt: serverTimestamp()
    });

    // Automatically update Topic status to completed
    try {
       await updateTopicStatus(sessionData.topicId, 'completed');
    } catch (err) {
       console.error("Failed to update topic status to completed:", err);
       // We don't fail the session confirmation if topic update fails, but we log it.
    }

    return { success: true, duration: actualDurationInMinutes };
  } catch (error) {
    throw new Error(`Failed to confirm end session: ${error.message}`);
  }
};