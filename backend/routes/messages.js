const router = require('express').Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const verifyToken = require('../middleware/verifyToken');

// ✅ Delete message for everyone (only sender allowed)
router.delete('/:messageId', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this message for everyone" });
    }

    await Message.findByIdAndDelete(req.params.messageId);
    res.status(200).json({ message: "Message deleted for everyone" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Hide message for current user only
router.put('/hide/:messageId', verifyToken, async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.messageId,
      { $addToSet: { hiddenFor: req.userId } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Message not found" });

    res.status(200).json({ message: "Message hidden for you only" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get messages between two users (excluding hidden)
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId }
      ],
      hiddenFor: { $ne: req.userId }
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get group messages (excluding hidden)
router.get('/group/:groupId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      group: req.params.groupId,
      hiddenFor: { $ne: req.userId }
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Mark messages as read
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


module.exports = router;
