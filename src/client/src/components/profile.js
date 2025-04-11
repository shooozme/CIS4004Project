import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  Divider, 
  Alert,
  Tab, 
  Tabs 
} from '@mui/material';
import { AuthContext } from '../context/authcontext';
import { GroupContext } from '../context/groupcontext';
import GroupList from './grouplist';
import CreateGroupForm from './creategroupform';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, error: authError, clearErrors: clearAuthErrors } = useContext(AuthContext);
  const { groups, getGroups, error: groupError, clearErrors: clearGroupErrors } = useContext(GroupContext);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  });
  const [success, setSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || ''
      });
      
      getGroups();
    }
    
    // Clear any success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    if (authError) {
      clearAuthErrors();
    }
    
    if (groupError) {
      clearGroupErrors();
    }
  }, [user, success, authError, groupError]);

  const { name, bio } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const result = await updateProfile({
      name,
      bio
    });
    
    if (result.success) {
      setSuccess(true);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenGroupModal = () => {
    setGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setGroupModalOpen(false);
  };

  if (!user) {
    return (
      <Container>
        <Box my={4} textAlign="center">
          <Typography variant="h5">Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box my={4}>
        <Paper elevation={3}>
          <Box p={3}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} textAlign="center">
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    margin: '0 auto',
                    bgcolor: 'primary.main',
                    fontSize: '3rem'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Typography variant="h5" mt={2}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                  <Tab label="Personal Info" />
                  <Tab label="My Groups" />
                </Tabs>
                
                {tabValue === 0 && (
                  <Box component="form" onSubmit={onSubmit}>
                    {success && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Profile updated successfully
                      </Alert>
                    )}
                    
                    {authError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {authError}
                      </Alert>
                    )}
                    
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Name"
                      name="name"
                      value={name}
                      onChange={onChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Bio"
                      name="bio"
                      value={bio}
                      onChange={onChange}
                      multiline
                      rows={4}
                      placeholder="Tell us a bit about yourself..."
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Update Profile
                    </Button>
                  </Box>
                )}
                
                {tabValue === 1 && (
                  <Box>
                    {groupError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {groupError}
                      </Alert>
                    )}
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">Your Groups</Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenGroupModal}
                      >
                        Create New Group
                      </Button>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <GroupList groups={groups} />
                    
                    <CreateGroupForm open={groupModalOpen} onClose={handleCloseGroupModal} />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;