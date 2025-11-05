import React from 'react';
import { Box, Button, TextField, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  // After register, navigate to sign page and show login
  navigate('/sign');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>Register</Typography>
        <TextField label="Username" fullWidth required sx={{ mb: 2 }} />
        <TextField label="Email" type="email" fullWidth required sx={{ mb: 2 }} />
        <TextField label="Password" type="password" fullWidth required sx={{ mb: 2 }} />
        <Button type="submit" variant="contained" color="primary">Register</Button>
      </Box>
    </Container>
  );
};

export default Register;
