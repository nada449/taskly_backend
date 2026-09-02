const mongoose = require('mongoose');

const assistantConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New conversation' }, // e.g. auto-generated from first question, or user-renamed
  // scope tells the frontend/backend what this conversation is "about" — optional but useful
  scope: {
    type: { type: String, enum: ['general', 'project', 'workspace'], default: 'general' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // only if scope.type === 'project'
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }, // only if scope.type === 'workspace'
  },
}, { timestamps: true });

module.exports = mongoose.model('AssistantConversation', assistantConversationSchema);