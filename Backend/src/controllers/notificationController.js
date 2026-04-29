import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    const unread = notifications.filter((item) => !item.read).length;
    res.json({ success: true, data: { items: notifications, unread }, message: 'Notifications loaded' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to load notifications' } });
  }
};

export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }
    res.json({ success: true, data: notification, message: 'Notification marked as read' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to update notification' } });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to update notifications' } });
  }
};
