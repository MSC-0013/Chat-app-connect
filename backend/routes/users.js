const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔍 Search users
router.get("/search/:username", verifyToken, async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.username, $options: "i" },
      _id: { $ne: req.userId },
    }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📁 Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ FIXED: Upload image + update profile info
router.post("/upload-profile", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (bio) updates.bio = bio;
    if (req.file) {
      updates.profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// 👥 Add contact
router.put("/contacts/add/:id", verifyToken, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    if (currentUser.contacts.includes(req.params.id)) {
      return res.status(400).json({ message: "User already in contacts" });
    }

    await User.findByIdAndUpdate(req.userId, { $push: { contacts: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $push: { contacts: req.userId } });

    res.status(200).json({ message: "Contact added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👤 Get all users except self
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👁️ Get user by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update profile (no image)
router.put("/:id", verifyToken, async (req, res) => {
  if (req.params.id !== req.userId) {
    return res.status(403).json({ message: "You can only update your own profile" });
  }

  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📇 Get contacts
router.get("/contacts/all", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("contacts", "-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
