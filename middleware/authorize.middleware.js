const ProjectAssignment = require('../models/projectAssignment.model');
const Membership = require('../models/membership.model');

// Requires the user to be assigned to the project (manager OR member) — used by chat, task actions, assistant
async function requireProjectAccess(req, res, next) {
  try {
    const userId = req.user.userId;
    const projectId = req.params.projectId || req.body.projectId || req.params.id;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const assignment = await ProjectAssignment.findOne({ user: userId, project: projectId });
    if (!assignment) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    req.projectAssignment = assignment; // stash it, in case the controller wants to know the role too
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Requires the user to be the MANAGER of the project specifically — used by createTask, addMembers
async function requireProjectManager(req, res, next) {
  try {
    const userId = req.user.userId;
    const projectId = req.params.projectId || req.body.projectId || req.params.id;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const assignment = await ProjectAssignment.findOne({ user: userId, project: projectId, role: 'manager' });
    if (!assignment) {
      return res.status(403).json({ message: 'Only the project manager can do this' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Requires the user to be an admin of the workspace — used by invite creation, admin dashboard
async function requireWorkspaceAdmin(req, res, next) {
  try {
    const userId = req.user.userId;
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const membership = await Membership.findOne({ user: userId, workspace: workspaceId, role: 'admin' });
    if (!membership) {
      return res.status(403).json({ message: 'Admins only' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { requireProjectAccess, requireProjectManager, requireWorkspaceAdmin };