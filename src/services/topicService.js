import { collection, addDoc, doc, updateDoc, getDoc, getDocs, serverTimestamp, query } from 'firebase/firestore';
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
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
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
  
  const actualCreator = topicData.createdBy || topicData.creatorId || topicData.learnerId;
  if (actualCreator === mentorId) {
    throw new Error("You cannot mentor your own topic.");
  }
  
  if (topicData.status !== 'open') {
    throw new Error("This topic is no longer available.");
  }

  const updatedParticipants = Array.from(new Set([...(topicData.participants || [actualCreator]), mentorId]));

  await updateDoc(topicRef, {
    status: 'matched',
    acceptedBy: mentorId,
    participants: updatedParticipants,
    updatedAt: serverTimestamp()
  });

  return { id: topicSnap.id, ...topicData, createdBy: actualCreator };
};

export const updateTopicStatus = async (topicId, status) => {
  const topicRef = doc(db, 'topics', topicId);
  await updateDoc(topicRef, { status, updatedAt: serverTimestamp() });
};

export const completeTopic = async (topicId) => {
  await updateTopicStatus(topicId, 'completed');
};