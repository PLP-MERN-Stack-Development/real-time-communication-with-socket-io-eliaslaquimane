import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton,
  Badge,
  Snackbar,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatRoom from '../components/ChatRoom';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../hooks/useNotification';

const drawerWidth = 240;

const Chat = () => {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { sendNotification } = useNotification();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch rooms
    fetch('http://localhost:5000/api/rooms', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        if (data.length > 0) {
          setActiveRoom(data[0]._id);
        }
      })
      .catch(err => {
        console.error('Error fetching rooms:', err);
        setSnackbar({
          open: true,
          message: 'Error loading chat rooms',
          severity: 'error'
        });
      });
  }, [navigate]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages in all rooms
    socket.on('new-message', (data) => {
      const { roomId, message } = data;
      
      // If message is in a different room than the active one, increment unread count
      if (roomId !== activeRoom) {
        setUnreadMessages(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1
        }));

        // Send desktop notification
        const room = rooms.find(r => r._id === roomId);
        if (room) {
          sendNotification(`New message in ${room.name}`, {
            body: `${message.sender.username}: ${message.content}`,
            icon: '/chat-icon.png' // You'll need to add this icon to your public folder
          });
        }
      }
    });

    // Listen for user join/leave events
    socket.on('user-joined', ({ username, roomId }) => {
      setSnackbar({
        open: true,
        message: `${username} joined the chat`,
        severity: 'info'
      });
    });

    socket.on('user-offline', (userId) => {
      const user = rooms.find(room => 
        room.participants.some(p => p._id === userId)
      )?.participants.find(p => p._id === userId);

      if (user) {
        setSnackbar({
          open: true,
          message: `${user.username} went offline`,
          severity: 'info'
        });
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-offline');
    };
  }, [socket, activeRoom, rooms, sendNotification]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRoomSelect = (roomId) => {
    setActiveRoom(roomId);
    // Clear unread messages for this room
    setUnreadMessages(prev => ({
      ...prev,
      [roomId]: 0
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Rooms
        </Typography>
      </Toolbar>
      <List>
        {rooms.map((room) => (
          <ListItem
            button
            key={room._id}
            selected={activeRoom === room._id}
            onClick={() => handleRoomSelect(room._id)}
          >
            <Badge 
              badgeContent={unreadMessages[room._id] || 0} 
              color="primary"
              sx={{ width: '100%' }}
            >
              <ListItemText 
                primary={room.name} 
                secondary={room.type === 'private' ? 'Private Room' : 'Public Room'}
              />
            </Badge>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {rooms.find(room => room._id === activeRoom)?.name || 'Chat'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          height: 'calc(100vh - 64px)',
        }}
      >
        {!connected && (
          <Typography color="error" sx={{ mb: 2 }}>
            Disconnected from server. Trying to reconnect...
          </Typography>
        )}
        {activeRoom && <ChatRoom roomId={activeRoom} />}
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat;
