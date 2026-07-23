// Inside Workspace.jsx component
import { updateSessionStatus } from '../../services/sessionService';
import { completeTopic } from '../../services/topicService';

// Guard: Step 14
if (session.status !== 'in_progress' && session.status !== 'end_requested') {
  return <div>Workspace is locked. Please check-in first.</div>;
}

// Step 16: Mentor requests end
const handleMentorRequestEnd = async () => {
  await updateSessionStatus(session.id, 'end_requested');
  toast.success("Sent completion request to learner.");
};

// Step 17, 18, 19: Learner confirms end
const handleLearnerConfirmEnd = async () => {
  try {
    // 1. Mark session complete
    await updateSessionStatus(session.id, 'completed');
    // 2. Cascade to topic
    await completeTopic(session.topicId);
    
    toast.success("Session completed!");
    navigate(`/sessions/${session.id}/summary`);
  } catch (error) {
    toast.error("Failed to complete session.");
  }
};