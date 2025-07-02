
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const path = require('path');



// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');

// Models
const User = require('./models/User');
const Message = require('./models/Message');

// Load environment variables
dotenv.config();

// Setup Express
const app = express();
app.use(express.json());
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB
connectDB();


// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);



// Store online users
const onlineUsers = new Map();

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);


  // User joins
  socket.on('join', async (userData) => {
    try {
      const { userId } = userData;
      
      // Add user to online users
      onlineUsers.set(userId, socket.id);
      
      // Update user status to online
      await User.findByIdAndUpdate(userId, { isOnline: true });
      
      // Emit to all clients that user is online
      io.emit('userStatus', { userId, status: true });
      
      console.log('User joined:', userId);
      console.log('Online users:', Array.from(onlineUsers.keys()));
    } catch (error) {
      console.error('Join error:', error);
    }
  });

  // User sends a message
  socket.on('sendMessage', async (messageData) => {
    try {
      const { senderId, receiverId, text, groupId } = messageData;
      
      // Create new message
      const newMessage = new Message({
        sender: senderId,
        text,
        ...(groupId ? { group: groupId } : { receiver: receiverId }),
        createdAt: new Date()
      });
      
      // Save message to database
      const savedMessage = await newMessage.save();
      
      // If it's a group message, send to all users in the group
      if (groupId) {
        io.to(groupId).emit('receiveMessage', savedMessage);
      } 
      // If it's a private message, send to the receiver
      else {
        const receiverSocketId = onlineUsers.get(receiverId);
        
        // Send message to sender
        io.to(socket.id).emit('receiveMessage', savedMessage);
        
        // Send message to receiver if online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', savedMessage);
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  });

  // User is typing
  socket.on('typing', ({ senderId, receiverId, groupId }) => {
    if (groupId) {
      socket.to(groupId).emit('userTyping', { userId: senderId, groupId });
    } else {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { userId: senderId });
      }
    }
  });

  // User stops typing
  socket.on('stopTyping', ({ senderId, receiverId, groupId }) => {
    if (groupId) {
      socket.to(groupId).emit('userStopTyping', { userId: senderId, groupId });
    } else {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStopTyping', { userId: senderId });
      }
    }
  });

  // User joins a group chat
  socket.on('joinGroup', ({ groupId }) => {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  });

  // User leaves a group chat
  socket.on('leaveGroup', ({ groupId }) => {
    socket.leave(groupId);
    console.log(`User left group: ${groupId}`);
  });

  // User disconnects
  socket.on('disconnect', async () => {
    try {
      // Find user by socket ID
      let userId = null;
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          userId = key;
          break;
        }
      }
      
      if (userId) {
        // Remove user from online users
        onlineUsers.delete(userId);
        
        // Update user status to offline
        await User.findByIdAndUpdate(userId, { isOnline: false });
        
        // Emit to all clients that user is offline
        io.emit('userStatus', { userId, status: false });
        
        console.log('User disconnected:', userId);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
