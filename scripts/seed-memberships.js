require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require('../models/user.model');
const Workspace = require('../models/workspace.model');
const Membership = require('../models/membership.model');

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

async function seedMemberships() {
  await mongoose.connect(process.env.mongo_uri);

  const [workspaces, users] = await Promise.all([
    Workspace.find().lean(),
    User.find().lean()
  ]);
  let createdCount = 0;

  for (const workspace of workspaces) {
    const otherUsers = users.filter(
      (user) => String(user._id) !== String(workspace.createdBy)
    );
    const memberCount = Math.min(
      otherUsers.length,
      Math.floor(Math.random() * 4) + 5
    );
    const selectedUsers = shuffle(otherUsers).slice(0, memberCount);
    const memberships = [
      { user: workspace.createdBy, role: 'admin' },
      ...selectedUsers.map((user) => ({ user: user._id, role: 'member' }))
    ];

    const results = await Promise.all(memberships.map((membership) => (
      Membership.updateOne(
        { user: membership.user, workspace: workspace._id },
        {
          $setOnInsert: {
            user: membership.user,
            workspace: workspace._id,
            role: membership.role
          }
        },
        { upsert: true }
      )
    )));

    createdCount += results.reduce(
      (count, result) => count + (result.upsertedCount || 0),
      0
    );
  }

  console.log(`${createdCount} membership(s) created.`);
}

seedMemberships()
  .catch((error) => {
    console.error('Error while seeding memberships:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
