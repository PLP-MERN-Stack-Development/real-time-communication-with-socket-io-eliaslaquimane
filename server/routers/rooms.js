const express = require('express');
const Room = require('../models/Room');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const config = require('../config/default');

const router = express.Router();

// Middleware to authenticate token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Create a room
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, participants } = req.body;
    
    // Add the creator to participants
    const allParticipants = [...new Set([...participants, req.userId])];
    
    const room = new Room({
      name,
      type,
      participants: allParticipants
    });

    await room.save();
    
    // Populate participants info
    await room.populate('participants', 'username email');

    // Notify all participants through socket
    const io = req.app.get('io');
    allParticipants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('room-created', room);
    });

    res.json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ participants: req.userId })
      .populate('participants', 'username email status')
      .populate('lastMessage');
    
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room messages
router.get('/:roomId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username')
      .sort('-createdAt')
      .limit(50);
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;