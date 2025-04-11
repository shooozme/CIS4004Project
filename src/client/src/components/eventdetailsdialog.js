import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import { EventContext } from '../context/eventcontext';
import { AuthContext } from '../context/authcontext';
import EventFormDialog from './eventformdialog';

const EventDetailsDialog = ({ open, onClose, event }) => {
  const { deleteEvent } = useContext(EventContext);
  const { user } = useContext(AuthContext);
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!event) return null;

  const { title, description, start, end, allDay, group, createdBy } = event;
  
  // Format date/time for display
  const formatDateTime = () => {
    if (allDay) {
      // If multi-day all-day event
      if (!moment(start).isSame(moment(end), 'day')) {
        return `${moment(start).format('MMM D, YYYY')} - ${moment(end).format('MMM D, YYYY')}`;
      }
      return moment(start).format('MMM D, YYYY');
    } else {
      // If multi-day event
      if (!moment(start).isSame(moment(end), 'day')) {
        return `${moment(start).format('MMM D, YYYY h:mm A')} - ${moment(end).format('MMM D, YYYY h:mm A')}`;
      }
      return `${moment(start).format('MMM D, YYYY h:mm A')} - ${moment(end).format('h:mm A')}`;
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    
    try {
      await deleteEvent(event._id);
      onClose();
    } catch (err) {
      setError('Failed to delete event');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Check if the current user is the creator or group leader
  const canModifyEvent = () => {
    return (
      user && 
      (createdBy._id === user._id || group.leader === user._id)
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Event Details
            </Typography>
            {canModifyEvent() && (
              <Box>
                <IconButton onClick={handleEdit} color="primary" size="small">
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => setShowDeleteConfirm(true)} 
                  color="error" 
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: group.color,
                mr: 1
              }}
            />
            <Typography variant="body2" color="textSecondary">
              {group.name}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {formatDateTime()}
            {allDay && ' (All day)'}
          </Typography>
          
          {description && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">
                {description}
              </Typography>
            </>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="textSecondary">
            Created by: {createdBy.name || createdBy.email}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Form Dialog */}
      {showEditForm && (
        <EventFormDialog
          open={showEditForm}
          onClose={handleCloseEditForm}
          event={event}
          groups={[group]} // Pass the current group
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventDetailsDialog;