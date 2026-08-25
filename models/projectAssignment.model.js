const mongoose = require('mongoose');
const projectAssignmentSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true},
    role: {type: String, enum: ['manager', 'member'], required: true},
}, {timestamps: true});

const ProjectAssignment = mongoose.model('ProjectAssignment', projectAssignmentSchema);
module.exports = ProjectAssignment;