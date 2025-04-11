import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GroupContext } from '../context/groupcontext';
import { AuthContext } from '../context/authcontext';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, getGroup, updateGroup, deleteGroup, inviteUser, removeUser, error, clearErrors } = useContext(GroupContext);
  const { user } = useContext(AuthContext);

  const [tabValue, setTabValue] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    color: ''
  });
  
  const [inviteEmail, setInviteEmail] = useState('');
  
  const colors = [
    { value: '#4285F4', label: 'Blue' },
    { value: '#EA4335', label: 'Red' },
    { value: '#FBBC05', label: 'Yellow' },
    { value: '#34A853', label: 'Green' },
    { value: '#9C27B0', label: 'Purple' },
    { value: '#FF9800', label: 'Orange' },
    { value: '#795548', label: 'Brown' },
    { value: '#607D8B', label: 'Gray' }
  ];

  useEffect(() => {
    getGroup(id);
    
    return () => {
      clearErrors();
    };
  }, [id]);

  useEffect(() => {
    if (currentGroup) {
      setFormData({
        name: currentGroup.name || '',
        color: currentGroup.color || '#4285F4'
      });
    }
  }, [currentGroup]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleOpenEditModal = () => {
    handleCloseMenu();
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleOpenInviteModal = () => {
    setInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setInviteEmail('');
    setLocalError('');
    setInviteModalOpen(false);
  };

  const handleOpenDeleteModal = () => {
    handleCloseMenu();
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    setLocalError('');
    
    try {
      const result = await updateGroup(id, formData);
      
      if (result.success) {
        handleCloseEditModal();
      } else {
        setLocalError(result.error || 'Failed to update group');
      }
    } catch (err) {
      setLocalError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async () => {
    if (!inviteEmail.trim()) {
      setLocalError('Email is required');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setLocalError('');
    
    try {
      const result = await inviteUser(id, inviteEmail);
      
      if (result.success) {
        setInviteEmail('');
        handleCloseInviteModal();
      } else {
        setLocalError(result.error || 'Failed to invite user');
      }
    } catch (err) {
      setLocalError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setLoading(true);
    
    try {
      const result = await deleteGroup(id);
      
      if (result.success) {
        navigate('/profile');
      }
    } catch (err) {
      setLocalError('Failed to delete group');
    } finally {
      setLoading(false);
      handleCloseDeleteModal();
    }
  };

  const handleRemoveMember = async (email) => {
    try {
      await removeUser(id, email);
    } catch (err) {
      console.error('Failed to remove member', err);
    }
  };

  const isGroupLeader = currentGroup && user && currentGroup.leader._id === user._id;

  if (!currentGroup) {
    return (
      <Container>
        <Box my={4} textAlign="center">
          <CircularProgress />
          <Typography variant="h6" mt={2}>Loading group details...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box my={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate('/profile')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Group Details
          </Typography>
          {isGroupLeader && (
            <>
              <IconButton 
                sx={{ ml: 'auto' }} 
                onClick={handleOpenMenu}
                aria-label="group options"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={handleOpenEditModal}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit Group
                </MenuItem>
                <MenuItem onClick={handleOpenDeleteModal} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete Group
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3}>
          <Box p={3}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: currentGroup.color || '#4285F4',
                  mr: 2
                }}
              >
                <PeopleIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5">{currentGroup.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {currentGroup.members.length} {currentGroup.members.length === 1 ? 'member' : 'members'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Members" />
              <Tab label="Invites" />
            </Tabs>

            {tabValue === 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Group Members</Typography>
                  {isGroupLeader && (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={handleOpenInviteModal}
                    >
                      Invite Member
                    </Button>
                  )}
                </Box>
                
                <List>
                  {currentGroup.members.map((member, index) => (
                    <React.Fragment key={member.email}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.name || member.email}
                          secondary={
                            <>
                              {member.email}
                              {currentGroup.leader._id === (member.user?._id || member.user) && (
                                <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
                                  (Group Leader)
                                </Typography>
                              )}
                            </>
                          }
                        />
                        {isGroupLeader && member.user?._id !== currentGroup.leader._id && (
                          <Tooltip title="Remove from group">
                            <IconButton 
                              edge="end" 
                              onClick={() => handleRemoveMember(member.email)}
                              aria-label="delete"
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItem>
                      {index < currentGroup.members.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" mb={2}>Pending Invites</Typography>
                
                {currentGroup.invites.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center" py={2}>
                    No pending invites
                  </Typography>
                ) : (
                  <List>
                    {currentGroup.invites.map((invite, index) => (
                      <React.Fragment key={invite.email}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={invite.email}
                            secondary={`Invited ${new Date(invite.invitedAt).toLocaleDateString()}`}
                          />
                          {isGroupLeader && (
                            <IconButton 
                              edge="end" 
                              onClick={() => handleRemoveMember(invite.email)}
                              aria-label="delete invite"
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          )}
                        </ListItem>
                        {index < currentGroup.invites.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Edit Group Modal */}
      <Dialog open={editModalOpen} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <TextField
            select
            margin="normal"
            fullWidth
            label="Group Color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          >
            {colors.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: option.value,
                      mr: 1
                    }}
                  />
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onClose={handleCloseInviteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
          
          <Typography variant="body2" color="textSecondary" paragraph>
            Enter the email address of the person you want to invite to this group.
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInviteModal} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleInviteSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Group Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="sm">
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{currentGroup.name}"? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            All members will be removed from the group.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteGroup} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupDetail;