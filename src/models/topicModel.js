// src/models/topicModel.js

/**
 * Firestore "topics" collection schema blueprint.
 * * Data Path in Firebase: topics/{topicId}
 * * Business Rules:
 * 1. Default status on creation is "open".
 * 2. When accepted, status -> "matched", acceptedBy -> mentor UID.
 * 3. When session starts, status -> "in_session".
 * 4. When ended, status -> "completed".
 */

export const defaultTopicTemplate = {
  // 1. Basic Info
  title: "",
  description: "",
  subject: "",
  createdBy: "",
  creatorName: "",
  creatorPhoto: "",

  // 2. Status System
  type: "public", // Options: "public" | "private"
  status: "open", // Options: "open" | "matched" | "in_session" | "completed"

  // 3. Academic Info
  university: "",
  department: "",
  year: "",

  // 4. Learning Data
  skillsNeeded: [],
  attachments: [], // Format: { type: "image" | "pdf", url: "...", name: "..." }
  preferredTime: "",

  // 5. Social System
  invitedUsers: [],
  participants: [],
  acceptedBy: null, // Will store mentor UID when matched

  // 6. System Data
  createdAt: null, // Firestore serverTimestamp() goes here
  updatedAt: null, // Firestore serverTimestamp() goes here

  // 7. Future Scaling Fields
  rating: 0,
  feedback: "",
  creditsEarned: 0
};