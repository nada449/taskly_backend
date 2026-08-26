const Invite = require('../models/invite.model');
const Membership = require('../models/membership.model');
const User = require('../models/user.model');
const crypto = require('crypto'); // built into Node, no install needed

module.exports.createInvite = async (req, res) => {
  try {
    const { workspaceId, email, invitedBy } = req.body; // TODO: invitedBy from req.user later
    const token = crypto.randomBytes(20).toString('hex'); // random unique string for the link
    const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // short human code

    const newInvite = await Invite.create({
      workspace: workspaceId,
      email,
      token,
      code,
      invitedBy,
    });

    res.status(201).json({ message: 'Invite created', invite: newInvite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.acceptInvite = async (req, res) => {
  try {
    const { code, name, password, phone } = req.body; // accepting via code (or use token instead)

    const invite = await Invite.findOne({ code, status: 'pending' });
    if (!invite) {
      return res.status(404).json({ message: 'Invalid or already used invite' });
    }

    let user = await User.findOne({ email: invite.email });
    if (!user) {
      user = await User.create({ name, email: invite.email, password, phone });
    }

    const membership = await Membership.create({
      user: user._id,
      workspace: invite.workspace,
      role: 'member',
    });

    invite.status = 'accepted';
    await invite.save(); // new method: saves changes to an EXISTING document

    res.status(200).json({ message: 'Invite accepted', user, membership });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};