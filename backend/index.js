const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

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
    methods: ['GET', 'POST'],
  },
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Store online users globally
const onlineUsers = new Map();

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Send current online users to this socket immediately
  socket.emit('onlineUsers', Array.from(onlineUsers.keys()));

  // User joins
  socket.on('join', async ({ userId }) => {
    try {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('onlineUsers', Array.from(onlineUsers.keys())); // broadcast updated list
      console.log('User joined:', userId);
    } catch (err) {
      console.error('Join error:', err);
    }
  });

  // Send message
  socket.on('sendMessage', async ({ senderId, receiverId, text, groupId }) => {
    try {
      const newMessage = new Message({
        sender: senderId,
        text,
        ...(groupId ? { group: groupId } : { receiver: receiverId }),
        createdAt: new Date(),
      });
      const savedMessage = await newMessage.save();

      if (groupId) {
        io.to(groupId).emit('receiveMessage', savedMessage);
      } else {
        const receiverSocket = onlineUsers.get(receiverId);
        io.to(socket.id).emit('receiveMessage', savedMessage);
        if (receiverSocket) io.to(receiverSocket).emit('receiveMessage', savedMessage);
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  });

  // Typing
  socket.on('typing', ({ senderId, receiverId, groupId }) => {
    if (groupId) socket.to(groupId).emit('userTyping', { userId: senderId, groupId });
    else {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('userTyping', { userId: senderId });
    }
  });

  socket.on('stopTyping', ({ senderId, receiverId, groupId }) => {
    if (groupId) socket.to(groupId).emit('userStopTyping', { userId: senderId, groupId });
    else {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('userStopTyping', { userId: senderId });
    }
  });

  // Group join/leave
  socket.on('joinGroup', ({ groupId }) => socket.join(groupId));
  socket.on('leaveGroup', ({ groupId }) => socket.leave(groupId));

  // Disconnect
  socket.on('disconnect', async () => {
    try {
      let disconnectedUserId = null;
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        await User.findByIdAndUpdate(disconnectedUserId, { isOnline: false });
        io.emit('onlineUsers', Array.from(onlineUsers.keys())); // send updated list
        console.log('User disconnected:', disconnectedUserId);
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
