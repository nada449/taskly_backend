var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/create-workspace', authController.createWorkspace);

module.exports = router;