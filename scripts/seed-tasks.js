require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const ProjectAssignment = require('../models/projectAssignment.model');
const Task = require('../models/task.model');

const priorities = ['low', 'medium', 'high'];
const statuses = ['todo', 'in-progress', 'done'];
const taskTemplates = [
  {
    title: 'Define project requirements',
    description: 'Collect the key requirements, confirm the scope, and document the expected deliverables.'
  },
  {
    title: 'Prepare the first project milestone',
    description: 'Break down the upcoming milestone into actionable steps and prepare the initial deliverables.'
  }
];

function randomDueDate() {
  const daysFromNow = Math.floor(Math.random() * 21) + 3;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysFromNow);
  return dueDate;
}

async function seedTasks() {
  await mongoose.connect(process.env.mongo_uri);

  const assignments = await ProjectAssignment.find().lean();
  const tasks = [];

  for (const assignment of assignments) {
    const taskCount = Math.floor(Math.random() * 2) + 1;

    for (let index = 0; index < taskCount; index += 1) {
      const template = taskTemplates[index];
      tasks.push({
        title: template.title,
        description: template.description,
        project: assignment.project,
        assignedTo: assignment.user,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dueDate: randomDueDate()
      });
    }
  }

  if (tasks.length > 0) {
    await Task.insertMany(tasks);
  }

  console.log(`${tasks.length} task(s) created.`);
}

seedTasks()
  .catch((error) => {
    console.error('Error while seeding tasks:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
