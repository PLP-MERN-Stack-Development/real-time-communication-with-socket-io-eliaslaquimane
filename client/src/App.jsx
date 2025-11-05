import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SocketProvider } from './context/SocketContext';

// Import pages
import Chat from './pages/Chat';
import Sign from './pages/Sign';
import { Navigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/sign" element={<Sign />} />
            <Route path="/chat" element={<Chat />} />
            {/* Redirect root to sign so users see the sign-in/up page first */}
            <Route path="/" element={<Navigate to="/sign" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;