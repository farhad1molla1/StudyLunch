import { db } from '../config/firebase'; // Ensure your firebase config path is correct
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// Allowed statuses enum for strict validation
const ALLOWED_STATUSES = ['open', 'matched', 'in_session', 'completed'];

/**
 * 1. Create a new topic
 */
export const createTopic = async (data) => {
  try {
    // Validation Rules
    if (!data.title || data.title.trim() === '') {
      throw new Error('Topic title cannot be empty.');
    }
    if (!data.createdBy) {
      throw new Error('Creator ID (createdBy) must be provided.');
    }

    const topicsRef = collection(db, 'topics');
    
    // Enforcing System Rules
    const newTopic = {
      ...data,
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(topicsRef, newTopic);
    return { id: docRef.id, ...newTopic };
  } catch (error) {
    console.error('Error creating topic:', error);
    throw new Error(`Failed to create topic: ${error.message}`);
  }
};

/**
 * 2. Fetch all topics (Sorted by newest first)
 */
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
    console.error('Error fetching all topics:', error);
    throw new Error(`Failed to fetch topics: ${error.message}`);
  }
};

/**
 * 3. Fetch a single topic by ID
 */
export const getTopicById = async (topicId) => {
  try {
    if (!topicId) throw new Error('Topic ID is required.');

    const docRef = doc(db, 'topics', topicId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null; // Return null if not found, as per requirement
    }
  } catch (error) {
    console.error(`Error fetching topic ${topicId}:`, error);
    throw new Error(`Failed to fetch topic: ${error.message}`);
  }
};

/**
 * 4. Accept a topic (Mentor matching logic)
 */
export const acceptTopic = async (topicId, mentorId) => {
  try {
    if (!topicId || !mentorId) {
      throw new Error('Topic ID and Mentor ID are required.');
    }

    const docRef = doc(db, 'topics', topicId);
    
    // Fetch first to get creatorId and ensure it's still "open"
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Topic not found.');
    }

    const topicData = docSnap.data();
    if (topicData.status !== 'open') {
      throw new Error('This topic is no longer available for acceptance.');
    }

    const updateData = {
      status: 'matched',
      acceptedBy: mentorId,
      participants: [topicData.createdBy, mentorId],
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updateData);
    return { id: topicId, ...topicData, ...updateData };
  } catch (error) {
    console.error(`Error accepting topic ${topicId}:`, error);
    throw new Error(`Failed to accept topic: ${error.message}`);
  }
};

/**
 * 5. Update topic status dynamically
 */
export const updateTopicStatus = async (topicId, status) => {
  try {
    if (!topicId) throw new Error('Topic ID is required.');
    
    // Validate Enum
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error(`Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`);
    }

    const docRef = doc(db, 'topics', topicId);
    await updateDoc(docRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error(`Error updating status for topic ${topicId}:`, error);
    throw new Error(`Failed to update topic status: ${error.message}`);
  }
};

/**
 * 6. Finalize topic after session completion
 */
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
    console.error(`Error finalizing session for topic ${topicId}:`, error);
    throw new Error(`Failed to finalize session: ${error.message}`);
  }
};