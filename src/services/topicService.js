import { db } from '../config/firebase'; 
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

const ALLOWED_STATUSES = ['open', 'matched', 'in_session', 'completed'];

export const createTopic = async (data) => {
  try {
    if (!data.title || data.title.trim() === '') throw new Error('Topic title cannot be empty.');
    if (!data.createdBy) throw new Error('Creator ID must be provided.');

    const topicsRef = collection(db, 'topics');
    const newTopic = {
      ...data,
      status: 'open',
      acceptedBy: null, // Explicitly set to null initially
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(topicsRef, newTopic);
    return { id: docRef.id, ...newTopic };
  } catch (error) {
    throw new Error(`Failed to create topic: ${error.message}`);
  }
};

export const getAllTopics = async () => {
  try {
    const topicsRef = collection(db, 'topics');
    const q = query(topicsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const topics = [];
    querySnapshot.forEach((doc) => {
      topics.push({ id: doc.id, ...doc.data() });
    });
    return topics;
  } catch (error) {
    throw new Error(`Failed to fetch topics: ${error.message}`);
  }
};

export const getTopicById = async (topicId) => {
  try {
    if (!topicId) throw new Error('Topic ID is required.');
    const docRef = doc(db, 'topics', topicId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to fetch topic: ${error.message}`);
  }
};

/**
 * 🤝 MENTOR ACCEPTANCE LOGIC (CORE BUSINESS RULES)
 */
export const acceptTopic = async (topicId, mentorId) => {
  try {
    if (!topicId || !mentorId) {
      throw new Error('Topic ID and Mentor ID are required.');
    }

    // RULE 3: Check if the mentor already has an active session
    const topicsRef = collection(db, 'topics');
    const q = query(topicsRef, where('acceptedBy', '==', mentorId));
    const mentorTopicsSnap = await getDocs(q);

    let hasActiveSession = false;
    mentorTopicsSnap.forEach((docSnap) => {
      const status = docSnap.data().status;
      if (status === 'matched' || status === 'in_session') {
        hasActiveSession = true;
      }
    });

    if (hasActiveSession) {
      throw new Error('You already have an active session. Please complete or cancel it before accepting a new one.');
    }

    // Fetch the target topic
    const docRef = doc(db, 'topics', topicId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('This topic does not exist or has been deleted.');
    }

    const topicData = docSnap.data();

    // RULE 1: Learner cannot mentor their own topic
    if (topicData.createdBy === mentorId) {
      throw new Error('You cannot mentor your own topic.');
    }

    // RULE 2: Topic must be open and have no existing mentor
    if (topicData.status !== 'open' || topicData.acceptedBy !== null) {
      throw new Error('This topic is no longer open for acceptance.');
    }

    // UPDATE: If all validations pass, assign the mentor
    const updateData = {
      status: 'matched',
      acceptedBy: mentorId,
      participants: [topicData.createdBy, mentorId],
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updateData);
    return { success: true, message: 'Successfully matched!' };

  } catch (error) {
    console.error(`Error accepting topic ${topicId}:`, error);
    // Return friendly message, avoiding raw Firebase internal error codes
    throw new Error(error.message || 'Failed to accept topic. Please try again.');
  }
};

export const updateTopicStatus = async (topicId, status) => {
  try {
    if (!topicId) throw new Error('Topic ID is required.');
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error(`Invalid status.`);
    }

    const docRef = doc(db, 'topics', topicId);
    await updateDoc(docRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to update topic status: ${error.message}`);
  }
};

export const updateTopicAfterSession = async (topicId, data) => {
  try {
    if (!topicId) throw new Error('Topic ID is required.');

    const { rating = 0, feedback = '', creditsEarned = 0 } = data;
    const docRef = doc(db, 'topics', topicId);
    
    const updateData = {
      status: 'completed',
      rating: Number(rating),
      feedback: String(feedback),
      creditsEarned: Number(creditsEarned),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    throw new Error(`Failed to finalize session: ${error.message}`);
  }
};