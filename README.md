# Real-Time Chat Application with Socket.io

A full-stack real-time chat application built with Socket.io, React, and Node.js.

## Features

- Real-time messaging using Socket.io
- User authentication with JWT
- Multiple chat rooms
- Private messaging
- Real-time notifications
- Typing indicators
- Read receipts
- Responsive design with Material-UI

## Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # UI components
│   │   ├── context/       # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── socket/       # Socket.io client setup
│   │   └── App.jsx       # Main application component
│   └── package.json       # Client dependencies
├── server/                # Node.js back-end
│   ├── config/           # Configuration files
│   ├── controllers/      # Socket event handlers
│   ├── models/          # Data models
│   ├── socket/          # Socket.io server setup
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json     # Server dependencies
└── README.md            # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd socketio-chat
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socketio-chat
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

## Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Rooms
- GET `/api/rooms` - Get all rooms
- POST `/api/rooms` - Create a new room
- GET `/api/rooms/:id` - Get room by ID
- GET `/api/rooms/:id/messages` - Get room messages

## Socket Events

### Client Events
- `join-room` - Join a chat room
- `send-message` - Send a message
- `typing` - Emit typing indicator
- `stop-typing` - Stop typing indicator
- `message-read` - Mark message as read

### Server Events
- `new-message` - New message received
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing
- `message-read-update` - Message read status update
- `user-joined` - User joined the room
- `user-offline` - User went offline

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.