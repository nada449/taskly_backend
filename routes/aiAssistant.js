const router = require('express').Router();
const verifyToken = require('../middleware/auth.middleware');
const assistantController = require('../controllers/aiAssistant.controller');

router.post('/conversations', verifyToken, assistantController.createConversation);
router.get('/conversations', verifyToken, assistantController.getMyConversations);
router.get('/conversations/:conversationId', verifyToken, assistantController.getConversationMessages);
router.post('/conversations/:conversationId/messages', verifyToken, assistantController.sendMessage);
router.delete('/conversations/:conversationId', verifyToken, assistantController.deleteConversation);

module.exports = router;