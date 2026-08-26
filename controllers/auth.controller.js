const User = require('../models/user.model');
const Workspace = require('../models/workspace.model');
const Membership = require('../models/membership.model');

module.exports.createWorkspace = async (req, res) => {
    try {
        const { name, email, phone, password, workspaceName } = req.body;
        //todo: hash password with bcrypt before saving
        const newUser = await User.create({ name, email, phone, password });
        const newWorkspace = await Workspace.create({ 
            name: workspaceName,
            createdBy: newUser._id 
        });
        const newMembership = await Membership.create({
            user: newUser._id,
            workspace: newWorkspace._id,
            role: 'admin'
             });

        res.status(200).json({ 
            message: 'Workspace created successfully',
            user: newUser,
            workspace: newWorkspace,
            membership: newMembership
         });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};