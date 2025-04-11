import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AuthContext } from '../context/authcontext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

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

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/calendar') return 0;
    if (path === '/profile') return 1;
    // For group details pages
    if (path.startsWith('/groups/')) return 1;
    return false;
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) navigate('/calendar');
    if (newValue === 1) navigate('/profile');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <CalendarTodayIcon sx={{ mr: 2 }} />
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Calendar App
        </Typography>

        {isAuthenticated ? (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <Tabs 
                value={getActiveTab()} 
                onChange={handleTabChange}
                textColor="inherit"
                indicatorColor="secondary"
              >
                <Tab label="Calendar" />
                <Tab label="Profile" />
              </Tabs>
            </Box>
            
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
          </>
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