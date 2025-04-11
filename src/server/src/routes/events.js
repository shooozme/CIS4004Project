const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/event');
const Group = require('../models/group');
const User = require('../models/user');

// @route   GET api/events
// @desc    Get all events for user's groups
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get all groups the user is a member of
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find all events that belong to the user's groups
    const events = await Event.find({
      group: { $in: user.groups }
    })
      .populate('group', ['name', 'color'])
      .populate('createdBy', ['name', 'email']);
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/events/group/:groupId
// @desc    Get all events for a specific group
// @access  Private
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    // Check if the user is a member of the group
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    const isMember = group.members.some(
      member => member.user && member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(401).json({ msg: 'User not authorized to view this group\'s events' });
    }
    
    // Get all events for the group
    const events = await Event.find({ group: req.params.groupId })
      .populate('group', ['name', 'color'])
      .populate('createdBy', ['name', 'email']);
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/events
// @desc    Create a new event
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, start, end, allDay, groupId } = req.body;
    
    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    const isMember = group.members.some(
      member => member.user && member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(401).json({ msg: 'User not authorized to create events for this group' });
    }
    
    // Create new event
    const newEvent = new Event({
      title,
      description: description || '',
      start,
      end,
      allDay,
      group: groupId,
      createdBy: req.user.id
    });
    
    const event = await newEvent.save();
    
    // Populate group and creator information
    await event.populate('group', ['name', 'color']);
    await event.populate('createdBy', ['name', 'email']);
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, start, end, allDay } = req.body;
    
    // Find the event
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if user is a member of the group
    const group = await Group.findById(event.group);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    const isMember = group.members.some(
      member => member.user && member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(401).json({ msg: 'User not authorized to update events for this group' });
    }
    
    // Update event fields
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (start) event.start = start;
    if (end) event.end = end;
    if (allDay !== undefined) event.allDay = allDay;
    
    event.updatedAt = Date.now();
    
    await event.save();
    
    // Populate group and creator information
    await event.populate('group', ['name', 'color']);
    await event.populate('createdBy', ['name', 'email']);
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the event
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if user is a member of the group
    const group = await Group.findById(event.group);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    const isMember = group.members.some(
      member => member.user && member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(401).json({ msg: 'User not authorized to delete events for this group' });
    }
    
    await Event.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;