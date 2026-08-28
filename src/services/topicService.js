import { collection, addDoc, doc, updateDoc, getDoc, getDocs, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

export const createTopic = async (topicData) => {
  if (!topicData.title || !topicData.subject || !topicData.description || !topicData.createdBy) {
    throw new Error("Missing required topic fields.");
  }
  const docRef = await addDoc(collection(db, 'topics'), {
    title: topicData.title,
    subject: topicData.subject,
    description: topicData.description,
    skillsNeeded: topicData.skillsNeeded || [],
    preferredTime: topicData.preferredTime || 'Flexible',
    attachments: [], 
    university: topicData.university || '',
    department: topicData.department || '',
    academicYear: topicData.academicYear || '',
    createdBy: topicData.createdBy,
    creatorName: topicData.creatorName || 'Student',
    creatorPhoto: topicData.creatorPhoto || null,
    status: 'open',
    acceptedBy: null,
    participants: [topicData.createdBy],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getAllTopics = async () => {
  try {
    const q = query(collection(db, 'topics'));
    const snapshot = await getDocs(q);
    const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    topics.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
      return timeB - timeA;
    });
    return topics;
  } catch (error) {
    console.error("Error in getAllTopics:", error);
    throw new Error("Could not load topics. Please try again.");
  }
};

export const getTopicById = async (topicId) => {
  if (!topicId) return null;
  try {
    const docRef = doc(db, 'topics', topicId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null; 
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error in getTopicById:", error);
    return null; 
  }
};

export const acceptTopic = async (topicId, mentorId) => {
  const topicRef = doc(db, 'topics', topicId);
  const topicSnap = await getDoc(topicRef);
  
  if (!topicSnap.exists()) throw new Error("Topic not found");
  const topicData = topicSnap.data();
  
  const learnerId = topicData.createdBy || topicData.creatorId || topicData.learnerId;
  
  if (!learnerId) {
    throw new Error("This old topic is missing learner information and cannot be accepted.");
  }
  
  if (learnerId === mentorId) {
    throw new Error("You cannot mentor your own topic.");
  }
  
  if (topicData.status !== 'open') {
    throw new Error("This topic is no longer available.");
  }

  const updatedParticipants = Array.from(new Set([...(topicData.participants || [learnerId]), mentorId]));

  await updateDoc(topicRef, {
    status: 'matched',
    acceptedBy: mentorId,
    participants: updatedParticipants,
    updatedAt: serverTimestamp()
  });

  return { id: topicSnap.id, ...topicData, learnerId, mentorId };
};

export const updateTopicStatus = async (topicId, status) => {
  const topicRef = doc(db, 'topics', topicId);
  await updateDoc(topicRef, { status, updatedAt: serverTimestamp() });
};

export const completeTopic = async (topicId) => {
  await updateTopicStatus(topicId, 'completed');
};

export const subscribeToUserTopics = (uid, callback) => {
  if (!uid) return () => {};
  const q = query(collection(db, 'topics'), where('createdBy', '==', uid));
  return onSnapshot(q, (snapshot) => {
    const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    topics.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    callback(topics);
  }, (error) => {
    console.error("Real-time topics fetch failed:", error);
    callback([]);
  });
};