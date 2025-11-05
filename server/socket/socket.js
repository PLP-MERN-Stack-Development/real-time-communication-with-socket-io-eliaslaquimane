const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');

const socketUsers = new Map();

function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: config.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.username);
    socketUsers.set(socket.user._id.toString(), socket.id);

    // Update user status to online
    User.findByIdAndUpdate(socket.user._id, { status: 'online' }).exec();

    // Join user to their rooms
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      const { roomId, content } = data;
      
      // Emit to all users in the room
      io.to(roomId).emit('new-message', {
        roomId,
        message: {
          content,
          sender: {
            _id: socket.user._id,
            username: socket.user.username
          },
          createdAt: new Date()
        }
      });
    });

    // Handle typing indicator
    socket.on('typing', (roomId) => {
      socket.to(roomId).emit('user-typing', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    // Handle stop typing
    socket.on('stop-typing', (roomId) => {
      socket.to(roomId).emit('user-stop-typing', {
        userId: socket.user._id
      });
    });

    // Handle read receipts
    socket.on('message-read', async (data) => {
      const { roomId, messageId } = data;
      io.to(roomId).emit('message-read-update', {
        messageId,
        userId: socket.user._id
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.user.username);
      socketUsers.delete(socket.user._id.toString());
      
      // Update user status to offline and last seen
      await User.findByIdAndUpdate(socket.user._id, {
        status: 'offline',
        lastSeen: new Date()
      });

      io.emit('user-offline', socket.user._id);
    });
  });

  return io;
}

module.exports = { setupSocket, socketUsers };