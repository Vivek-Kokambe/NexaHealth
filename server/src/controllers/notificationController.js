const { getIsMock } = require('../config/db');
const Notification = require('../models/Notification');
const mockDb = require('../utils/mockStore');

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getIsMock()) {
      const notifs = mockDb.find('notifications', { userId });
      return res.json({ success: true, count: notifs.length, notifications: notifs });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMock()) {
      const updated = mockDb.findByIdAndUpdate('notifications', id, { isRead: true });
      return res.json({ success: true, notification: updated });
    }

    const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json({ success: true, notification: updated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getIsMock()) {
      mockDb.notifications.forEach(n => {
        if (n.userId === userId || String(n.userId) === String(userId)) {
          n.isRead = true;
        }
      });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    await Notification.updateMany({ userId }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
