const mongoose = require('mongoose');
const workspaceSchema  = new mongoose.Schema({
    name: {type: String, required: true},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    }, {timestamps: true});

const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;