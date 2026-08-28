import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const subscribeToUserNotifications = (uid, callback) => {
  if (!uid) return () => {};

  const q = query(
    collection(db, 'notifications'), 
    where('recipientId', '==', uid), 
    where('isRead', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    console.error("Notification listener failed (Safe Fallback to 0):", error);
    callback([]);
  });
};

export const createNotification = async (notifData) => {
  try {
    if (!notifData.recipientId) return;
    
    await addDoc(collection(db, 'notifications'), {
      recipientId: notifData.recipientId,
      senderId: notifData.senderId || null,
      type: notifData.type || "general",
      title: notifData.title || "New Notification",
      message: notifData.message || "",
      relatedId: notifData.relatedId || null,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Safe Notification Failure:", err);
  }
};