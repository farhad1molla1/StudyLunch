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
      meetingLink: '', // Added for online sessions
      scheduledTime: null,
      startedAt: null,
      endedAt: null,
      duration: 0,
      notes: '',
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
 * 5. Schedule a Session (Mentor Action)
 */
export const scheduleSession = async (sessionId, scheduleData) => {
  try {
    if (!sessionId) throw new Error('Session ID is required.');
    
    // Validate current session status
    const docRef = doc(db, 'sessions', sessionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Session not found.');
    }
    
    const session = docSnap.data();
    if (session.status !== 'scheduled') {
      throw new Error(`Cannot schedule a session that is currently '${session.status}'.`);
    }

    const { scheduledTime, duration, meetingType, meetingLocation, meetingLink } = scheduleData;

    // Build update object securely
    const updateData = {
      scheduledTime, // Expecting a valid Date object or ISO string
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
 * 6. Start a session
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
 * 7. End a session and calculate actual duration
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
      duration: actualDurationInMinutes, // Overwrites scheduled duration with actual duration
      updatedAt: serverTimestamp()
    });

    return { success: true, duration: actualDurationInMinutes };
  } catch (error) {
    throw new Error(`Failed to end session: ${error.message}`);
  }
};