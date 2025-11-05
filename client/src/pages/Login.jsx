import React from 'react';
import { Box, Button, TextField, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder behavior: store dummy token and navigate to chat
    localStorage.setItem('token', 'dummy-token');
    // navigate to the explicit chat route
    navigate('/chat');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <TextField label="Username" fullWidth required sx={{ mb: 2 }} />
        <TextField label="Password" type="password" fullWidth required sx={{ mb: 2 }} />
        <Button type="submit" variant="contained" color="primary">Login</Button>
      </Box>
    </Container>
  );
};

export default Login;
