
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: req.body.email },
        { username: req.body.username }
      ] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === req.body.email ? 
          "Email already in use" : "Username already taken"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      profilePicture: req.body.profilePicture || "",
      bio: req.body.bio || ""
    });

    // Save user to DB
    const user = await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );

    // Return user info without password
    const { password, ...userWithoutPassword } = user._doc;
    
    res.status(201).json({
      ...userWithoutPassword,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    // Find user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );

    // Update online status
    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save();

    // Return user info without password
    const { password, ...userWithoutPassword } = user._doc;
    
    res.status(200).json({
      ...userWithoutPassword,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout (update user status only)
router.post('/logout', async (req, res) => {
  try {
    const userId = req.body.userId;
    
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: Date.now()
    });
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
