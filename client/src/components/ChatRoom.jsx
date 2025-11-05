import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Box, Paper, TextField, Button, Typography, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatRoom = ({ roomId }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Join the room
    socket.emit('join-room', roomId);

    // Listen for new messages
    socket.on('new-message', (data) => {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    });

    // Handle typing indicators
    socket.on('user-typing', ({ username }) => {
      setTypingUsers(prev => new Set([...prev, username]));
    });

    socket.on('user-stop-typing', ({ userId }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [socket, roomId]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!isTyping) {
      socket.emit('typing', roomId);
      setIsTyping(true);
    }

    // Stop typing indicator after 2 seconds of inactivity
    const lastTypingTime = new Date().getTime();
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= 2000 && isTyping) {
        socket.emit('stop-typing', roomId);
        setIsTyping(false);
      }
    }, 2000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit('send-message', {
      roomId,
      content: newMessage
    });

    setNewMessage('');
    socket.emit('stop-typing', roomId);
    setIsTyping(false);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              alignSelf: message.sender._id === socket.auth.userId ? 'flex-end' : 'flex-start'
            }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {message.sender.username[0]}
            </Avatar>
            <Paper
              sx={{
                p: 1,
                maxWidth: '70%',
                bgcolor: message.sender._id === socket.auth.userId ? 'primary.light' : 'grey.100'
              }}
            >
              <Typography variant="body2" color="textSecondary">
                {message.sender.username}
              </Typography>
              <Typography>{message.content}</Typography>
            </Paper>
          </Box>
        ))}
        {typingUsers.size > 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </Typography>
        )}
        <div ref={messageEndRef} />
      </Paper>

      <Box component="form" onSubmit={sendMessage} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyUp={handleTyping}
            placeholder="Type a message..."
          />
          <Button type="submit" variant="contained" endIcon={<SendIcon />}>
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatRoom;
