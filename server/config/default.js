require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/socketio-chat',
  JWT_SECRET: process.env.JWT_SECRET || 'kapaka123!',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};