
const router = require('express').Router();
const Message = require('../models/Message');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// Get messages between two users
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    // Find messages between current user and specified user
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId }
      ]
    }).sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages in a group
router.get('/group/:groupId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      group: req.params.groupId
    }).sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark messages as read
router.put('/read/:senderId', verifyToken, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.senderId, receiver: req.userId, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread message count
router.get('/unread/count', verifyToken, async (req, res) => {
  try {
    const unreadCounts = await Message.aggregate([
      { 
        $match: { 
          receiver: mongoose.Types.ObjectId(req.userId),
          read: false
        } 
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json(unreadCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
