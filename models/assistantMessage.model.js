const mongoose = require('mongoose');

const assistantMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'AssistantConversation', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true }, // who "said" this — the human or the AI
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AssistantMessage', assistantMessageSchema);