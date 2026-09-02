const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware'); 
const{ requireProjectAccess } = require('../middleware/authorize.middleware');
const chatController = require('../controllers/chat.controller');

router.post('/', verifyToken, chatController.sendMessage);
router.get('/:projectId', verifyToken, chatController.getProjectMessages);
router.put('/:id', verifyToken, chatController.editMessage);
router.delete('/:id', verifyToken, chatController.deleteMessage);

module.exports = router;

