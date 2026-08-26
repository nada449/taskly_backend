const Project = require('../models/project.model');
const ProjectAssignment = require('../models/projectAssignment.model');

module.exports.createProject = async (req, res) => {
  try {
    const { name, workspaceId, description, deadline, priority, createdBy, managerId, memberIds } = req.body;

    const newProject = await Project.create({
      name, workspace: workspaceId, description, deadline, priority, createdBy,
    });

    // assign the manager
    await ProjectAssignment.create({ user: managerId, project: newProject._id, role: 'manager' });

    // assign each member (memberIds is expected to be an array of user IDs)
    if (Array.isArray(memberIds)) {
      for (const memberId of memberIds) {
        await ProjectAssignment.create({ user: memberId, project: newProject._id, role: 'member' });
      }
    }

    res.status(201).json({ message: 'Project created', project: newProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const assignments = await ProjectAssignment.find({ project: project._id }).populate('user', 'name email');

    res.status(200).json({ project, team: assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.getAllProjectsByWorkspace = async (req, res) => {
  try {
    const projects = await Project.find({ workspace: req.params.workspaceId });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project updated', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });

    await ProjectAssignment.deleteMany({ project: req.params.id }); // clean up related assignments too

    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};