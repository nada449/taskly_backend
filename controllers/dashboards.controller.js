const Task = require('../models/task.model');
const Project = require('../models/project.model');
const ProjectAssignment = require('../models/projectAssignment.model');
const Membership = require('../models/membership.model');
const Invite = require('../models/invite.model');

// --- Shared helper: compute stats from a list of tasks ---
function computeTaskStats(tasks) {
  const now = new Date();
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'done').length,
  };
  stats.completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  return stats;
}

function getUpcomingDeadlines(tasks, daysAhead = 7) {
  const now = new Date();
  const soon = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return tasks.filter(t => t.dueDate && t.dueDate >= now && t.dueDate <= soon && t.status !== 'done');
}

// =========================
// MEMBER DASHBOARD
// =========================
module.exports.getMemberDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const tasks = await Task.find({ assignedTo: userId }).populate('project', 'name');
    const stats = computeTaskStats(tasks);
    const upcomingDeadlines = getUpcomingDeadlines(tasks);
    const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done');

    const priorityBreakdown = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
    };

    const assignments = await ProjectAssignment.find({ user: userId }).populate('project', 'name priority deadline');
    const myProjects = assignments.map(a => ({
      project: a.project,
      role: a.role,
    }));

    res.status(200).json({
      stats,
      upcomingDeadlines,
      overdueTasks,
      priorityBreakdown,
      myProjects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// MANAGER DASHBOARD
// =========================
module.exports.getManagerDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // "my progress" — same as member view, managers have tasks too
    const myTasks = await Task.find({ assignedTo: userId }).populate('project', 'name');
    const myStats = computeTaskStats(myTasks);

    // "my team's progress" — only projects where I am the manager
    const managedAssignments = await ProjectAssignment.find({ user: userId, role: 'manager' })
      .populate('project', 'name priority deadline');

    const managedProjects = [];
    for (const assignment of managedAssignments) {
      const projectId = assignment.project._id;

      const teamAssignments = await ProjectAssignment.find({ project: projectId }).populate('user', 'name');
      const projectTasks = await Task.find({ project: projectId });
      const projectStats = computeTaskStats(projectTasks);

      const memberBreakdown = teamAssignments.map(member => {
        const memberTasks = projectTasks.filter(t => String(t.assignedTo) === String(member.user._id));
        return {
          user: { id: member.user._id, name: member.user.name },
          role: member.role,
          ...computeTaskStats(memberTasks),
        };
      });

      const deadlineRisk = assignment.project.deadline
        ? assignment.project.deadline < new Date() && projectStats.completionRate < 100
        : false;

      managedProjects.push({
        project: assignment.project,
        stats: projectStats,
        memberBreakdown,
        deadlineRisk,
      });
    }

    res.status(200).json({
      myStats,
      managedProjects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// ADMIN DASHBOARD
// =========================
module.exports.getAdminDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { workspaceId } = req.params;

    // explicit authorization check — NOT naturally scoped like member/manager views
    const membership = await Membership.findOne({ user: userId, workspace: workspaceId, role: 'admin' });
    if (!membership) {
      return res.status(403).json({ message: 'Admins only' });
    }

    const projects = await Project.find({ workspace: workspaceId });

    const projectOverviews = [];
    let projectsWithoutManager = 0;
    let overdueProjectsCount = 0;

    for (const project of projects) {
      const tasks = await Task.find({ project: project._id });
      const stats = computeTaskStats(tasks);

      const managerAssignment = await ProjectAssignment.findOne({ project: project._id, role: 'manager' }).populate('user', 'name');
      if (!managerAssignment) projectsWithoutManager++;

      const isOverdue = project.deadline && project.deadline < new Date() && stats.completionRate < 100;
      if (isOverdue) overdueProjectsCount++;

      projectOverviews.push({
        project: { id: project._id, name: project.name, priority: project.priority, deadline: project.deadline },
        manager: managerAssignment ? managerAssignment.user.name : null,
        stats,
        overdue: isOverdue,
      });
    }

    const totalMembers = await Membership.countDocuments({ workspace: workspaceId });
    const pendingInvites = await Invite.countDocuments({ workspace: workspaceId, status: 'pending' });

    // workload distribution across the whole workspace
    const allWorkspaceMemberships = await Membership.find({ workspace: workspaceId }).populate('user', 'name');
    const projectIds = projects.map(p => p._id);
    const allTasks = await Task.find({ project: { $in: projectIds } });

    const workloadDistribution = allWorkspaceMemberships.map(m => {
      const userTasks = allTasks.filter(t => String(t.assignedTo) === String(m.user._id));
      return {
        user: m.user.name,
        openTasks: userTasks.filter(t => t.status !== 'done').length,
      };
    });

    res.status(200).json({
      summary: {
        totalProjects: projects.length,
        projectsWithoutManager,
        overdueProjectsCount,
        totalMembers,
        pendingInvites,
      },
      projectOverviews,
      workloadDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};