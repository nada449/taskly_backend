var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/users',authController.getAllUsers);
router.post('/create', authController.createWorkspace);
router.get('/:workspaceId', authController.getWorkspace);
router.get('/', authController.getAllWorkspaces);
router.post('/login', authController.login);



module.exports = router;
