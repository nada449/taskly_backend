const Notification = require('../models/notif.model');

module.exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: userId }, // scoped so you can only touch YOUR OWN
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deleted = await Notification.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!deleted) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};