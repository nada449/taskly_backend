require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const crypto = require('crypto');
const mongoose = require('mongoose');
const Workspace = require('../models/workspace.model');
const Membership = require('../models/membership.model');
const Invite = require('../models/invite.model');

function createInviteeEmail(index) {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `invitee${index}-${suffix}@example.test`;
}

async function seedInvites() {
  await mongoose.connect(process.env.mongo_uri);

  const [workspaces, adminMemberships] = await Promise.all([
    Workspace.find().lean(),
    Membership.find({ role: 'admin' }).lean()
  ]);
  const adminByWorkspace = new Map(
    adminMemberships.map((membership) => [String(membership.workspace), membership.user])
  );
  let createdCount = 0;
  let inviteeIndex = 1;

  for (const workspace of workspaces) {
    const adminUserId = adminByWorkspace.get(String(workspace._id));
    if (!adminUserId) {
      continue;
    }

    const inviteCount = Math.floor(Math.random() * 2) + 2;
    const invites = Array.from({ length: inviteCount }, () => ({
      workspace: workspace._id,
      email: createInviteeEmail(inviteeIndex++),
      token: crypto.randomBytes(20).toString('hex'),
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      invitedBy: adminUserId,
      status: 'pending'
    }));

    await Invite.insertMany(invites);
    createdCount += invites.length;
  }

  console.log(`${createdCount} invite(s) created.`);
}

seedInvites()
  .catch((error) => {
    console.error('Error while seeding invites:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
