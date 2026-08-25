const mongoose = require('mongoose');
const projectSchema  = new mongoose.Schema({
    name: {type: String, required: true},
    workspace: {type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true},
    description: {type: String},
    deadline: {type: Date},
    priority: {type: String, enum: ['low', 'medium', 'high'], default: 'medium'},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, {timestamps: true});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;