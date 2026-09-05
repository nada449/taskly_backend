const AssistantConversation = require('../models/assistantConversation.model');
const AssistantMessage = require('../models/assistantMessage.model');
const ProjectAssignment = require('../models/projectAssignment.model');
const Membership = require('../models/membership.model');
const Project = require('../models/project.model');
const Task = require('../models/task.model');

//Security check, reused everywhere — same principle as chat's verifyProjectAccess ---
async function verifyScopeAccess(userId, scope) {
  if (scope.type === 'project') {
    const assignment = await ProjectAssignment.findOne({ user: userId, project: scope.projectId });
    return !!assignment;
  }
  if (scope.type === 'workspace') {
    const membership = await Membership.findOne({ user: userId, workspace: scope.workspaceId, role: 'admin' });
    return !!membership;
  }
  return true; // 'general' scope always allowed — self-scoped
}

// --- Build the data context to feed the AI, based on scope ---
async function buildContext(userId, scope) {
  if (scope.type === 'project') {
    const project = await Project.findById(scope.projectId);
    const tasks = await Task.find({ project: scope.projectId }).populate('assignedTo', 'name');
    return `Project: ${project.name}\nTasks:\n` +
      tasks.map(t => `- "${t.title}" — ${t.status}, assigned to ${t.assignedTo.name}, due ${t.dueDate}`).join('\n');
  }
  if (scope.type === 'workspace') {
    const projects = await Project.find({ workspace: scope.workspaceId });
    return 'Workspace projects:\n' + projects.map(p => `- ${p.name} (${p.priority})`).join('\n');
  }
  // general — self-scoped
  const assignments = await ProjectAssignment.find({ user: userId }).populate('project', 'name');
  const projectIds = assignments.map(a => a.project._id);
  const tasks = await Task.find({ project: { $in: projectIds }, assignedTo: userId });
  return 'My tasks:\n' + tasks.map(t => `- "${t.title}" — ${t.status}, due ${t.dueDate}`).join('\n');
}

// --- Gemini API call ---
async function callAI(messages) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.gemini_api_key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );

  const data = await response.json();

  if (data.error) {
    console.error('Gemini API error:', data.error);
    return 'Sorry, the assistant is unavailable right now.';
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

// --- Start a new conversation ---
module.exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scope } = req.body;

    const allowed = await verifyScopeAccess(userId, scope || { type: 'general' });
    if (!allowed) return res.status(403).json({ message: 'You do not have access to this scope' });

    const conversation = await AssistantConversation.create({ user: userId, scope: scope || { type: 'general' } });
    res.status(201).json({ conversation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- List all of MY conversations ---
module.exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await AssistantConversation.find({ user: userId }).sort({ updatedAt: -1 });
    res.status(200).json({ conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Get all messages in one conversation ---
module.exports.getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const conversation = await AssistantConversation.findOne({ _id: conversationId, user: userId });
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const messages = await AssistantMessage.find({ conversation: conversationId }).sort({ createdAt: 1 });
    res.status(200).json({ conversation, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Send a message in an existing conversation ---
module.exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { question } = req.body;

    const conversation = await AssistantConversation.findOne({ _id: conversationId, user: userId });
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const allowed = await verifyScopeAccess(userId, conversation.scope);
    if (!allowed) return res.status(403).json({ message: 'You no longer have access to this scope' });

    await AssistantMessage.create({ conversation: conversationId, role: 'user', content: question });

    const dataContext = await buildContext(userId, conversation.scope);
    const priorMessages = await AssistantMessage.find({ conversation: conversationId }).sort({ createdAt: 1 });

    const aiMessages = [
      { role: 'user', content: `You are a helpful project assistant. Use ONLY this data:\n${dataContext}` },
      ...priorMessages.map(m => ({ role: m.role, content: m.content })),
    ];

    const answerText = await callAI(aiMessages);
    const answerMessage = await AssistantMessage.create({ conversation: conversationId, role: 'assistant', content: answerText });

    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(200).json({ answer: answerMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Delete a conversation ---
module.exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    const conversation = await AssistantConversation.findOneAndDelete({ _id: conversationId, user: userId });
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    await AssistantMessage.deleteMany({ conversation: conversationId });
    res.status(200).json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
