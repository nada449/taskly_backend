const Task = require('../models/task.model');

module.exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
    // TODO: verify req.user is actually the manager of this project, once JWT exists

    const newTask = await Task.create({
      title, description, project: projectId, assignedTo, priority, dueDate,
    });

    res.status(201).json({ message: 'Task created', task: newTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getMyTasks = async (req, res) => {
  try {
    const { userId } = req.params; // TODO: get from req.user once JWT exists
    const tasks = await Task.find({ assignedTo: userId });
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task updated', task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};