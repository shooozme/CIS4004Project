const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const Group = require('../models/group');

// @route   POST api/groups
// @desc    Create a new group
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, color } = req.body;

    // Get the user creating the group
    const user = await User.findById(req.user.id).select('-password');
    
    // Create a new group
    const newGroup = new Group({
      name,
      color: color || '#4285F4', // Default blue if no color specified
      leader: req.user.id,
      members: [{ user: req.user.id, email: user.email, name: user.name }]
    });

    // Save the group to database
    const group = await newGroup.save();

    // Add the group to the user's groups
    user.groups.push(group._id);
    await user.save();

    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/groups
// @desc    Get all groups for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get all groups the user is a member of
    const groups = await Group.find({
      '_id': { $in: user.groups }
    }).populate('leader', ['name', 'email']);

    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/groups/:id
// @desc    Get group by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('leader', ['name', 'email'])
      .populate('members.user', ['name', 'email']);

    // Check if group exists
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.user && member.user._id.toString() === req.user.id);
    
    if (!isMember) {
      return res.status(401).json({ msg: 'User not authorized to view this group' });
    }

    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/groups/:id
// @desc    Update group info (name, color)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Find the group
    const group = await Group.findById(req.params.id);
    
    // Check if group exists
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is group leader
    if (group.leader.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Only group leader can update the group' });
    }
    
    // Update fields
    if (name) group.name = name;
    if (color) group.color = color;
    
    await group.save();
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/groups/:id/invite
// @desc    Invite a user to group by email
// @access  Private
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find the group
    const group = await Group.findById(req.params.id);
    
    // Check if group exists
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is group leader
    if (group.leader.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Only group leader can invite users' });
    }
    
    // Check if user is already in the group
    const existingMember = group.members.find(member => member.email === email);
    if (existingMember) {
      return res.status(400).json({ msg: 'User is already a member of this group' });
    }
    
    // Check if user is already invited
    const existingInvite = group.invites.find(invite => invite.email === email);
    if (existingInvite) {
      return res.status(400).json({ msg: 'User is already invited to this group' });
    }
    
    // Add to invites
    group.invites.push({ email });
    await group.save();
    
    // Check if user exists in the system
    const invitedUser = await User.findOne({ email });
    if (invitedUser) {
      // If user exists, add group to their list
      if (!invitedUser.groups.includes(group._id)) {
        invitedUser.groups.push(group._id);
        await invitedUser.save();
      }
      
      // Add user to members array
      group.members.push({
        user: invitedUser._id,
        email: invitedUser.email,
        name: invitedUser.name
      });
      
      // Remove from invites
      group.invites = group.invites.filter(invite => invite.email !== email);
      await group.save();
    }
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/groups/:id/member/:email
// @desc    Remove a member from group
// @access  Private
router.delete('/:id/member/:email', auth, async (req, res) => {
  try {
    // Find the group
    const group = await Group.findById(req.params.id);
    
    // Check if group exists
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is group leader
    if (group.leader.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Only group leader can remove members' });
    }
    
    // Check if trying to remove the leader (which is not allowed)
    const memberToRemove = group.members.find(member => member.email === req.params.email);
    if (memberToRemove && memberToRemove.user && memberToRemove.user.toString() === group.leader.toString()) {
      return res.status(400).json({ msg: 'Group leader cannot be removed' });
    }
    
    // Remove the member from the group
    group.members = group.members.filter(member => member.email !== req.params.email);
    await group.save();
    
    // If user exists, remove group from their groups list
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      user.groups = user.groups.filter(groupId => groupId.toString() !== req.params.id);
      await user.save();
    }
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/groups/:id
// @desc    Delete a group
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the group
    const group = await Group.findById(req.params.id);
    
    // Check if group exists
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is group leader
    if (group.leader.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Only group leader can delete the group' });
    }
    
    // Remove the group from all members' groups list
    for (const member of group.members) {
      if (member.user) {
        const user = await User.findById(member.user);
        if (user) {
          user.groups = user.groups.filter(groupId => groupId.toString() !== req.params.id);
          await user.save();
        }
      }
    }
    
    // Delete the group
    await Group.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Group removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;