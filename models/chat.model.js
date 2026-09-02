const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{
    url: { type: String, required: true },
    filename: { type: String, required: true },
    fileType: { type: String }, // e.g. 'image', 'pdf', 'document' — optional, for UI display logic
  }],
  editedAt: { type: Date }, // set only when the message has been edited; null/undefined = never edited
  deleted: { type: Boolean, default: false }, // soft delete flag, explained below
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;
