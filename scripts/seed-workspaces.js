require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require('../models/user.model');
const Workspace = require('../models/workspace.model');

async function seedWorkspaces() {
  await mongoose.connect(process.env.mongo_uri);

  const users = await User.find().sort({ _id: 1 }).limit(5).lean();
  const results = await Promise.all(users.map((user) => {
    const firstName = user.name.trim().split(/\s+/)[0];
    const name = `${firstName}'s Workspace`;

    return Workspace.updateOne(
      { name },
      { $setOnInsert: { name, createdBy: user._id } },
      { upsert: true }
    );
  }));

  const createdCount = results.reduce(
    (count, result) => count + (result.upsertedCount || 0),
    0
  );
  console.log(`${createdCount} workspace(s) created.`);
}

seedWorkspaces()
  .catch((error) => {
    console.error('Error while seeding workspaces:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
