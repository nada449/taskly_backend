require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Workspace = require('../models/workspace.model');
const Membership = require('../models/membership.model');
const Project = require('../models/project.model');

const priorities = ['low', 'medium', 'high'];
const projectTemplates = [
  {
    name: 'Website Redesign',
    description: 'Refresh the website structure, visual identity, and user experience across desktop and mobile.'
  },
  {
    name: 'Q3 Marketing Campaign',
    description: 'Plan and launch the next marketing campaign, including content, social media, and performance tracking.'
  }
];

function addMonths(date, months) {
  const futureDate = new Date(date);
  futureDate.setMonth(futureDate.getMonth() + months);
  return futureDate;
}

async function seedProjects() {
  await mongoose.connect(process.env.mongo_uri);

  const [workspaces, adminMemberships] = await Promise.all([
    Workspace.find().lean(),
    Membership.find({ role: 'admin' }).lean()
  ]);
  const adminByWorkspace = new Map(
    adminMemberships.map((membership) => [String(membership.workspace), membership.user])
  );
  let createdCount = 0;

  for (const workspace of workspaces) {
    const adminUserId = adminByWorkspace.get(String(workspace._id));
    if (!adminUserId) {
      continue;
    }

    const projects = projectTemplates.map((template, index) => ({
      name: template.name,
      workspace: workspace._id,
      description: template.description,
      deadline: addMonths(new Date(), index === 0 ? 3 : 5),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      createdBy: adminUserId
    }));

    const results = await Promise.all(projects.map((project) => (
      Project.updateOne(
        { name: project.name, workspace: project.workspace },
        { $setOnInsert: project },
        { upsert: true }
      )
    )));

    createdCount += results.reduce(
      (count, result) => count + (result.upsertedCount || 0),
      0
    );
  }

  console.log(`${createdCount} project(s) created.`);
}

seedProjects()
  .catch((error) => {
    console.error('Error while seeding projects:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
