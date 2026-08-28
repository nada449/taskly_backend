require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Project = require('../models/project.model');
const Membership = require('../models/membership.model');
const ProjectAssignment = require('../models/projectAssignment.model');

function shuffle(items) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index]
    ];
  }

  return shuffledItems;
}

async function createAssignmentIfMissing(userId, projectId, role) {
  const existingAssignment = await ProjectAssignment.findOne({
    user: userId,
    project: projectId
  });
  if (existingAssignment) {
    return false;
  }

  await ProjectAssignment.create({
    user: userId,
    project: projectId,
    role
  });
  return true;
}

async function seedProjectAssignments() {
  await mongoose.connect(process.env.mongo_uri);

  const projects = await Project.find().lean();
  let createdCount = 0;

  for (const project of projects) {
    const memberships = await Membership.find({ workspace: project.workspace }).lean();
    const workspaceUsers = shuffle(memberships.map((membership) => membership.user));
    const manager = workspaceUsers.shift();

    if (!manager) {
      continue;
    }

    if (await createAssignmentIfMissing(manager, project._id, 'manager')) {
      createdCount += 1;
    }

    const memberCount = Math.min(
      workspaceUsers.length,
      Math.floor(Math.random() * 3) + 2
    );
    const selectedMembers = workspaceUsers.slice(0, memberCount);

    for (const member of selectedMembers) {
      if (await createAssignmentIfMissing(member, project._id, 'member')) {
        createdCount += 1;
      }
    }
  }

  console.log(`${createdCount} project assignment(s) created.`);
}

seedProjectAssignments()
  .catch((error) => {
    console.error('Error while seeding project assignments:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
