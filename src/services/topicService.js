import { collection, addDoc, doc, updateDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

export const createTopic = async (topicData) => {
  const docRef = await addDoc(collection(db, 'topics'), {
    ...topicData,
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getAllTopics = async () => {
  const snapshot = await getDocs(collection(db, 'topics'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTopicById = async (topicId) => {
  const docRef = doc(db, 'topics', topicId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Topic not found");
  return { id: docSnap.id, ...docSnap.data() };
};

export const acceptTopic = async (topicId, mentorId) => {
  const topicRef = doc(db, 'topics', topicId);
  const topicSnap = await getDoc(topicRef);
  
  if (!topicSnap.exists()) throw new Error("Topic not found");
  const topicData = topicSnap.data();
  
  if (topicData.createdBy === mentorId) {
    throw new Error("You cannot mentor your own topic.");
  }
  
  if (topicData.status !== 'open') {
    throw new Error("This topic is no longer available.");
  }

  await updateDoc(topicRef, {
    status: 'matched',
    acceptedBy: mentorId,
    updatedAt: serverTimestamp()
  });

  return topicData;
};

export const updateTopicStatus = async (topicId, status) => {
  const topicRef = doc(db, 'topics', topicId);
  await updateDoc(topicRef, { status, updatedAt: serverTimestamp() });
};

export const completeTopic = async (topicId) => {
  await updateTopicStatus(topicId, 'completed');
};