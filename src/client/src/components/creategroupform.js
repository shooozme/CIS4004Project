import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { GroupContext } from '../context/groupcontext';

const CreateGroupForm = ({ open, onClose }) => {
  const { addGroup } = useContext(GroupContext);

  const [formData, setFormData] = useState({
    name: '',
    color: '#4285F4' // Default color (blue)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const { name, color } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await addGroup(formData);
      
      if (result.success) {
        // Reset form and close dialog
        setFormData({
          name: '',
          color: '#4285F4'
        });
        onClose();
      } else {
        setError(result.error || 'Failed to create group');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      color: '#4285F4'
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Group Name"
            name="name"
            value={name}
            onChange={onChange}
            autoFocus
          />
          
          <TextField
            select
            margin="normal"
            fullWidth
            label="Group Color"
            name="color"
            value={color}
            onChange={onChange}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupForm;