const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboards.controller');

router.get('/member', verifyToken, dashboardController.getMemberDashboard);
router.get('/manager', verifyToken, dashboardController.getManagerDashboard);
router.get('/admin/:workspaceId', verifyToken, dashboardController.getAdminDashboard);

module.exports = router;