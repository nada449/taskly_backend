const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Workspace = require('../models/workspace.model');
const Membership = require('../models/membership.model');


module.exports.createWorkspace = async (req, res) => {
    try {
        const { name, email, phone, password, workspaceName } = req.body;
        //todo: hash password with bcrypt before saving
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, phone, password: hashedPassword });
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

}
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user._id },
             process.env.jwt_secret,
             { expiresIn: '7d' });
        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
module.exports.getWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }
        res.status(200).json({ workspace });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
module.exports.getAllWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find();
        res.status(200).json({ workspaces });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }   
};