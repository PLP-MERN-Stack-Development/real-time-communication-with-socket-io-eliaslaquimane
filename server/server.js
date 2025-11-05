const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { setupSocket } = require('./socket/socket');
const config = require('./config/default');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: config.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set up Socket.io
const io = setupSocket(server);
app.set('io', io);

// Routes
app.use('/api/auth', require('./routers/auth'));
app.use('/api/rooms', require('./routers/rooms'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({ 
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!' 
  });
});

// Start server
server.listen(config.PORT, () => {
  console.log(`Server running on port http://localhost:${config.PORT}`);
});