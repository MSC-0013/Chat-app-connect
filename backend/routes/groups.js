const router = require('express').Router();
const Group = require('../models/Group');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// ✅ Create a group (name + members only at creation)
router.post('/', verifyToken, async (req, res) => {
  try {
    const newGroup = new Group({
      name: req.body.name,
      description: req.body.description || "",
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

// ✅ Get groups for the current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('groups');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get group by ID if the user is a member
router.get('/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', '-password')
      .populate('admin', '-password');

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some(member => member._id.toString() === req.userId)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
