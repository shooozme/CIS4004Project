import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AuthContext } from '../context/authcontext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loadUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  // Check authentication status on component mount
  useEffect(() => {
    // If token exists but user isn't loaded yet, load the user
    if (localStorage.getItem('token') && !user) {
      loadUser();
    }
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleCalendarClick = () => {
    navigate('/calendar');
  };

  // Determine authentication status - check both context state and localStorage
  const checkIsAuthenticated = () => {
    return isAuthenticated || localStorage.getItem('token') !== null;
  };
  
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton 
          color="inherit" 
          onClick={handleCalendarClick}
          sx={{ mr: 1 }}
        >
          <CalendarTodayIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/calendar" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          Calendar App
        </Typography>

        {checkIsAuthenticated() ? (
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'primary.dark',
                  fontSize: '1rem'
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button 
              color="inherit" 
              variant="outlined" 
              component={Link} 
              to="/register"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;