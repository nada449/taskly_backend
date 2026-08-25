const mongoose = require('mongoose');
const membershipSchema  = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    workspace: {type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true},
    role: {type: String, enum: ['admin', 'member'], default: 'member'},
}, {timestamps: true});

const Membership = mongoose.model('Membership', membershipSchema);
module.exports = Membership;