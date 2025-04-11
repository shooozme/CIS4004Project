import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { EventContext } from '../context/eventcontext';

const EventFormDialog = ({ open, onClose, initialStart, initialEnd, event, groups }) => {
  const { addEvent, updateEvent, error, clearErrors } = useContext(EventContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: initialStart || new Date(),
    end: initialEnd || new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
    allDay: false,
    groupId: groups && groups.length > 0 ? groups[0]._id : ''
  });
  
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { title, description, start, end, allDay, groupId } = formData;

  // Initialize form data when editing an existing event
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: event.allDay || false,
        groupId: event.group._id || ''
      });
    } else if (initialStart && initialEnd) {
      setFormData(prevState => ({
        ...prevState,
        start: initialStart,
        end: initialEnd
      }));
    }
  }, [event, initialStart, initialEnd]);

  // Clear errors when dialog closes
  useEffect(() => {
    if (!open) {
      clearErrors();
      setFormError('');
    }
  }, [open]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllDayChange = (e) => {
    const isAllDay = e.target.checked;
    setFormData({ 
      ...formData, 
      allDay: isAllDay,
      start: isAllDay ? moment(start).startOf('day').toDate() : start,
      end: isAllDay ? moment(start).endOf('day').toDate() : end
    });
  };

  const handleStartChange = (newValue) => {
    // Adjust end time if necessary (ensure end is after start)
    let newEnd = end;
    if (moment(newValue).isAfter(moment(end))) {
      if (allDay) {
        newEnd = moment(newValue).endOf('day').toDate();
      } else {
        newEnd = moment(newValue).add(1, 'hour').toDate();
      }
    }
    
    setFormData({ 
      ...formData, 
      start: newValue.toDate(),
      end: newEnd
    });
  };

  const handleEndChange = (newValue) => {
    setFormData({ ...formData, end: newValue.toDate() });
  };

  const handleSubmit = async () => {
    // Validate form
    if (!title.trim()) {
      setFormError('Event title is required');
      return;
    }
    
    if (!groupId) {
      setFormError('Please select a group for this event');
      return;
    }
    
    // Validate dates
    if (moment(end).isBefore(moment(start))) {
      setFormError('End time cannot be before start time');
      return;
    }
    
    setLoading(true);
    setFormError('');
    
    try {
      if (event) {
        // Update existing event
        await updateEvent(event._id, {
          title,
          description,
          start,
          end,
          allDay,
          groupId
        });
      } else {
        // Create new event
        await addEvent({
          title,
          description,
          start,
          end,
          allDay,
          groupId
        });
      }
      
      onClose();
    } catch (err) {
      setFormError('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {event ? 'Edit Event' : 'Create New Event'}
      </DialogTitle>
      <DialogContent>
        {(error || formError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || error}
          </Alert>
        )}
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="Event Title"
          name="title"
          value={title}
          onChange={handleInputChange}
          autoFocus
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Description"
          name="description"
          value={description}
          onChange={handleInputChange}
          multiline
          rows={3}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={allDay}
              onChange={handleAllDayChange}
              name="allDay"
              color="primary"
            />
          }
          label="All Day Event"
          sx={{ mb: 2, mt: 1 }}
        />
        
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Box sx={{ mb: 2 }}>
            {allDay ? (
              <DatePicker
                label="Date"
                value={moment(start)}
                onChange={handleStartChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            ) : (
              <>
                <DateTimePicker
                  label="Start Time"
                  value={moment(start)}
                  onChange={handleStartChange}
                  renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                />
                <DateTimePicker
                  label="End Time"
                  value={moment(end)}
                  onChange={handleEndChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </>
            )}
          </Box>
        </LocalizationProvider>
        
        <TextField
          select
          margin="normal"
          required
          fullWidth
          id="groupId"
          label="Group"
          name="groupId"
          value={groupId}
          onChange={handleInputChange}
        >
          {groups && groups.map((group) => (
            <MenuItem key={group._id} value={group._id}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: group.color,
                    mr: 1
                  }}
                />
                {group.name}
              </Box>
            </MenuItem>
          ))}
        </TextField>
        <FormHelperText>
          Events must be associated with a group. All group members will be able to see this event.
        </FormHelperText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (event ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventFormDialog;