import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);
export default router;
