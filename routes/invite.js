const router = require('express').Router();
const inviteController = require('../controllers/invites.controller');

router.post('/create-invitation', inviteController.createInvite);
router.post('/accept-invitation', inviteController.acceptInvite );

module.exports = router;