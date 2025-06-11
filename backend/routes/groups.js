
const router = require('express').Router();
const Group = require('../models/Group');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// Create a group
router.post('/', verifyToken, async (req, res) => {
  try {
    const newGroup = new Group({
      name: req.body.name,
      description: req.body.description || "",
      picture: req.body.picture || "",
      admin: req.userId,
      members: [req.userId, ...req.body.members]
    });
    
    const savedGroup = await newGroup.save();
    
    // Add group to all members' groups array
    await User.updateMany(
      { _id: { $in: savedGroup.members } },
      { $push: { groups: savedGroup._id } }
    );
    
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's groups
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('groups');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user.groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get group by ID
router.get('/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', '-password')
      .populate('admin', '-password');
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Check if user is a member of the group
    if (!group.members.some(member => member._id.toString() === req.userId)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }
    
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add member to group
router.put('/:groupId/members', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Check if user is admin
    if (group.admin.toString() !== req.userId) {
      return res.status(403).json({ message: "Only admin can add members" });
    }
    
    // Check if user is already a member
    if (group.members.includes(req.body.userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }
    
    // Add member to group
    await Group.findByIdAndUpdate(req.params.groupId, {
      $push: { members: req.body.userId }
    });
    
    // Add group to user's groups
    await User.findByIdAndUpdate(req.body.userId, {
      $push: { groups: req.params.groupId }
    });
    
    res.status(200).json({ message: "Member added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Check if user is admin or removing self
    if (group.admin.toString() !== req.userId && req.params.userId !== req.userId) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }
    
    // Remove member from group
    await Group.findByIdAndUpdate(req.params.groupId, {
      $pull: { members: req.params.userId }
    });
    
    // Remove group from user's groups
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { groups: req.params.groupId }
    });
    
    res.status(200).json({ message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update group
router.put('/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Check if user is admin
    if (group.admin.toString() !== req.userId) {
      return res.status(403).json({ message: "Only admin can update group" });
    }
    
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.groupId,
      { $set: req.body },
      { new: true }
    );
    
    res.status(200).json(updatedGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
