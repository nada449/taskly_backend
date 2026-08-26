var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/create', authController.createWorkspace);
router.get('/:workspaceId', authController.getWorkspace);
router.get('/', authController.getAllWorkspaces);


module.exports = router;
