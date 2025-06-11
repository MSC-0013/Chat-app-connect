
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/verifyToken');

// Get all users
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get users excluding the current user
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('-password');
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user
router.put('/:id', verifyToken, async (req, res) => {
  // Ensure user can only update their own profile
  if (req.params.id !== req.userId) {
    return res.status(403).json({ message: "You can only update your own profile" });
  }

  try {
    // If password is being updated
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search users by username
router.get('/search/:username', verifyToken, async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.username, $options: 'i' },
      _id: { $ne: req.userId }
    }).select('-password');
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add user to contacts
router.put('/contacts/add/:id', verifyToken, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    // Add to current user's contacts
    const currentUser = await User.findById(req.userId);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (currentUser.contacts.includes(req.params.id)) {
      return res.status(400).json({ message: "User already in contacts" });
    }
    
    await User.findByIdAndUpdate(req.userId, {
      $push: { contacts: req.params.id }
    });
    
    // Add current user to other user's contacts
    await User.findByIdAndUpdate(req.params.id, {
      $push: { contacts: req.userId }
    });
    
    res.status(200).json({ message: "Contact added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user contacts
router.get('/contacts/all', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('contacts', '-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user.contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
