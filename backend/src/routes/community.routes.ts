import { Router } from 'express';
import {
  handleGetDiscussions,
  handleGetDiscussionDetail,
  handleCreateDiscussion,
  handleUpdateDiscussion,
  handleDeleteDiscussion,
  handleAddComment,
  handleDeleteComment,
  handleToggleBestSolution,
  handleToggleHelpfulVote,
  handleReportContent,
  handleGetUserNotifications,
  handleMarkNotificationRead,
  handleMarkAllNotificationsRead,
  handleGetUserReputation,
  handleGetCommunityStats,
  handleValidateEvidenceImage,
} from '../controllers/community.controller';
import { requireUserAuth, optionalUserAuth } from '../middlewares/userAuth';

const router = Router();

// =========================================================================
// PUBLIC / GUEST ACCESSIBLE ENDPOINTS (WITH OPTIONAL AUTH FOR USER CONTEXT)
// =========================================================================
router.get('/discussions', optionalUserAuth, handleGetDiscussions);
router.get('/discussions/:id', optionalUserAuth, handleGetDiscussionDetail);
router.get('/stats', handleGetCommunityStats);
router.get('/reputation/:userId', handleGetUserReputation);

// =========================================================================
// AUTHENTICATED CITIZEN & CONTRIBUTOR ENDPOINTS (REQUIRE USER AUTH)
// =========================================================================
router.post('/discussions', requireUserAuth, handleCreateDiscussion);
router.put('/discussions/:id', requireUserAuth, handleUpdateDiscussion);
router.delete('/discussions/:id', requireUserAuth, handleDeleteDiscussion);

router.post('/discussions/:id/comments', requireUserAuth, handleAddComment);
router.delete('/comments/:id', requireUserAuth, handleDeleteComment);

router.put('/discussions/:id/best-solution', requireUserAuth, handleToggleBestSolution);
router.post('/vote', requireUserAuth, handleToggleHelpfulVote);
router.post('/reports', requireUserAuth, handleReportContent);

router.post('/validate-evidence', requireUserAuth, handleValidateEvidenceImage);

// Notifications
router.get('/notifications', requireUserAuth, handleGetUserNotifications);
router.put('/notifications/:id/read', requireUserAuth, handleMarkNotificationRead);
router.put('/notifications/read-all', requireUserAuth, handleMarkAllNotificationsRead);

export default router;
