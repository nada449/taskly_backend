const mongoose = require('mongoose');
const inviteSchema  = new mongoose.Schema({
    workspace: {type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true},
    email: {type: String, required: true},
    token: {type: String, required: true, unique: true},
    code: {type: String, required: true, unique: true},
    invitedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    status: {type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending'},

}, {timestamps: true});

const Invite = mongoose.model('Invite', inviteSchema);
module.exports = Invite;