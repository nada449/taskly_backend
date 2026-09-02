const ChatMessage = require('../models/chat.model');
const ProjectAssignment = require('../models/projectAssignment.model');

// Helper: confirms the requester is currently assigned to this project.
// Reused by every function below — this IS your access control for chat.
async function verifyProjectAccess(userId, projectId) {
  const assignment = await ProjectAssignment.findOne({ user: userId, project: projectId });
  return !!assignment; // true if found, false if not
}

module.exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT middleware, not req.body
    const { projectId, content, attachments } = req.body;

    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this project chat' });
    }

    const newMessage = await ChatMessage.create({
      project: projectId,
      sender: userId,
      content,
      attachments: attachments || [], // optional, defaults to empty array if not sent
    });

    res.status(201).json({ message: 'Message sent', chatMessage: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getProjectMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.params;

    const hasAccess = await verifyProjectAccess(userId, projectId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this project chat' });
    }

    // pagination: most recent 50 by default, oldest first for display
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const messages = await ChatMessage.find({ project: projectId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name');

    res.status(200).json({ messages: messages.reverse() }); // reverse so oldest-first for chat display
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.editMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { content } = req.body;

    const message = await ChatMessage.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // only the ORIGINAL SENDER can edit — this is the check you specifically asked about
    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    message.content = content;
    message.editedAt = new Date();
    await message.save();

    res.status(200).json({ message: 'Message updated', chatMessage: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const message = await ChatMessage.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    message.deleted = true;
    message.content = ''; // clear actual content, keep the placeholder logic to the frontend
    await message.save();

    res.status(200).json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};