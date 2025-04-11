import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  AppBar, 
  Toolbar 
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <Container>
        <Box my={4} textAlign="center">
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to your calendar dashboard! This is where your events will be displayed.
          </Typography>
          <Box mt={4}>
            {/* Calendar will be implemented here */}
            <Typography variant="body2" color="textSecondary">
              Calendar implementation coming soon...
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;