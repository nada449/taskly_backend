const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notifs.controller');

router.get('/', verifyToken, notificationController.getMyNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.put('/read-all', verifyToken, notificationController.markAllAsRead);
router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;