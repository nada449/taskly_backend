const router = require('express').Router();
const inviteController = require('../controllers/invites.controller');

router.post('/create', inviteController.createInvite);
router.post('/accept', inviteController.acceptInvite );

module.exports = router;