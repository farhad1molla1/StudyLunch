import { db } from '../config/firebase'; 
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
import { getTopicById } from './topicService';

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
      confirmation: {
        learner: false,
        mentor: false
      },
      confirmationTime: {
        learner: null,
        mentor: null
      },
      // NEW: Check-in System schema
      checkIn: {
        learner: false,
        mentor: false
      },
      checkInTime: {
        learner: null,
        mentor: null
      },
      attendance: {
        learner: false,
        mentor: false
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
    if (session.status !== 'scheduled') {
      throw new Error(`Cannot schedule a session that is currently '${session.status}'.`);
    }

    const { scheduledTime, duration, meetingType, meetingLocation, meetingLink } = scheduleData;

    const updateData = {
      scheduledTime, 
      duration: Number(duration),
      meetingType,
      updatedAt: serverTimestamp()
    };

    if (meetingType === 'offline') {
      updateData.meetingLocation = meetingLocation;
      updateData.meetingLink = '';
    } else if (meetingType === 'online') {
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

    if (session.status !== 'scheduled') {
      throw new Error(`Cannot confirm a session that is '${session.status}'.`);
    }

    let role = null;
    if (session.learnerId === userId) role = 'learner';
    else if (session.mentorId === userId) role = 'mentor';
    else throw new Error('Unauthorized. Only assigned participants can confirm.');

    if (session.confirmation[role]) {
      throw new Error('You have already confirmed this session.');
    }

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

export const getConfirmationStatus = async (sessionId) => {
  try {
    const session = await getSession(sessionId);
    if (!session) throw new Error('Session not found.');
    return session.confirmation;
  } catch (error) {
    throw new Error(`Failed to fetch confirmation status: ${error.message}`);
  }
};

/**
 * 7. ⭐ Check-in System (New)
 */
export const checkIn = async (sessionId, userId) => {
  try {
    if (!sessionId || !userId) throw new Error('Session ID and User ID are required.');

    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Session not found.');

    const session = docSnap.data();

    // Validations
    if (session.status !== 'ready') {
      throw new Error(`Cannot check in. Session status must be 'ready', currently is '${session.status}'.`);
    }

    let role = null;
    if (session.learnerId === userId) role = 'learner';
    else if (session.mentorId === userId) role = 'mentor';
    else throw new Error('Unauthorized. Only assigned participants can check in.');

    if (session.checkIn[role]) {
      throw new Error('You have already checked in for this session.');
    }

    // Update Check-in Data
    const updatedCheckIn = { ...session.checkIn, [role]: true };
    const updatedCheckInTime = { ...session.checkInTime, [role]: serverTimestamp() };
    
    const updatePayload = {
      checkIn: updatedCheckIn,
      checkInTime: updatedCheckInTime,
      updatedAt: serverTimestamp()
    };

    let newStatus = session.status;
    
    // ⭐ Business Rule 6: Both Checked In -> Auto-start
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

export const getCheckInStatus = async (sessionId) => {
  try {
    const session = await getSession(sessionId);
    if (!session) throw new Error('Session not found.');
    return session.checkIn;
  } catch (error) {
    throw new Error(`Failed to fetch check-in status: ${error.message}`);
  }
};

/**
 * 8. Manual Start (Legacy / Override)
 */
export const startSession = async (sessionId) => {
  try {
    if (!sessionId) throw new Error('Session ID is required.');
    const docRef = doc(db, 'sessions', sessionId);
    await updateDoc(docRef, {
      status: 'in_progress',
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to start session: ${error.message}`);
  }
};

/**
 * 9. End a session and calculate actual duration
 */
export const endSession = async (sessionId) => {
  try {
    if (!sessionId) throw new Error('Session ID is required.');

    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Session not found.');

    const sessionData = docSnap.data();
    let actualDurationInMinutes = 0;

    if (sessionData.startedAt) {
      const startTime = sessionData.startedAt.toDate();
      const endTime = new Date();
      actualDurationInMinutes = Math.round((endTime - startTime) / 60000);
    }

    await updateDoc(docRef, {
      status: 'completed',
      endedAt: serverTimestamp(),
      duration: actualDurationInMinutes,
      updatedAt: serverTimestamp()
    });

    return { success: true, duration: actualDurationInMinutes };
  } catch (error) {
    throw new Error(`Failed to end session: ${error.message}`);
  }
};