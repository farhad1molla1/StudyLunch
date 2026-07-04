import { db } from '../config/firebase'; 
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

const ALLOWED_TYPES = [
  'topic_created', 
  'mentor_accepted', 
  'session_scheduled', 
  'session_confirmed', 
  'session_ready', 
  'system'
];

/**
 * 1. Create a new notification
 */
export const createNotification = async (data) => {
  try {
    const { recipientId, senderId, type, title, message, relatedId, relatedType } = data;

    if (!recipientId) throw new Error('Recipient ID is required.');
    if (!ALLOWED_TYPES.includes(type)) throw new Error('Invalid notification type.');

    const notificationsRef = collection(db, 'notifications');
    
    const newNotification = {
      recipientId,
      senderId: senderId || 'system',
      type,
      title,
      message,
      relatedId: relatedId || null,
      relatedType: relatedType || null,
      isRead: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(notificationsRef, newNotification);
    return { id: docRef.id, ...newNotification };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

/**
 * 2. Get all notifications for a specific user
 */
export const getUserNotifications = async (uid) => {
  try {
    if (!uid) throw new Error('User ID is required.');

    const notificationsRef = collection(db, 'notifications');
    // Note: Requires a composite index in Firestore (recipientId ASC, createdAt DESC)
    const q = query(
      notificationsRef, 
      where('recipientId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    return notifications;
  } catch (error) {
    console.error(`Error fetching notifications for user ${uid}:`, error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
};

/**
 * 3. Mark a single notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    if (!notificationId) throw new Error('Notification ID is required.');

    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, {
      isRead: true
    });

    return true;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
};

/**
 * 4. Mark all notifications as read for a user
 */
export const markAllAsRead = async (uid) => {
  try {
    if (!uid) throw new Error('User ID is required.');

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('recipientId', '==', uid),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return true;

    // Use writeBatch to perform multiple updates atomically
    const batch = writeBatch(db);
    
    querySnapshot.forEach((document) => {
      const docRef = doc(db, 'notifications', document.id);
      batch.update(docRef, { isRead: true });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error(`Error marking all notifications as read for user ${uid}:`, error);
    throw new Error(`Failed to mark all as read: ${error.message}`);
  }
};