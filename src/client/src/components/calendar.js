import React, { useContext, useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { GroupContext } from '../context/groupcontext';
import { EventContext } from '../context/eventcontext';
import { AuthContext } from '../context/authcontext';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { 
    filteredEvents, 
    visibleGroups, 
    loading: eventsLoading, 
    error: eventsError, 
    getEvents, 
    toggleGroupVisibility,
    addEvent,
    updateEvent,
    deleteEvent
  } = useContext(EventContext);
  const { 
    groups, 
    loading: groupsLoading, 
    error: groupsError, 
    getGroups 
  } = useContext(GroupContext);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000),
    allDay: false,
    groupId: ''
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load events and groups on component mount
  useEffect(() => {
    getEvents();
    getGroups();
  }, []);

  // Initialize form data when editing an event or selecting a slot
  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title || '',
        description: selectedEvent.description || '',
        start: new Date(selectedEvent.start),
        end: new Date(selectedEvent.end),
        allDay: selectedEvent.allDay || false,
        groupId: selectedEvent.group._id || ''
      });
    } else if (selectedSlot) {
      setFormData({
        ...formData,
        start: selectedSlot.start,
        end: selectedSlot.end,
        groupId: groups && groups.length > 0 ? groups[0]._id : ''
      });
    }
  }, [selectedEvent, selectedSlot, groups]);

  // Format events for react-big-calendar
  const formattedEvents = filteredEvents.map(event => ({
    id: event._id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay,
    resource: event
  }));

  // Handle clicking on an event
  const handleEventClick = (event) => {
    setSelectedEvent(event.resource);
    setShowEventDetails(true);
  };

  // Handle selecting a time slot
  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent(null);
    setSelectedSlot(slotInfo);
    setShowEventForm(true);
  };

  // Handle adding a new event
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setSelectedSlot({
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour later
    });
    setShowEventForm(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle all day toggle
  const handleAllDayChange = (e) => {
    const isAllDay = e.target.checked;
    const { start } = formData;
    
    setFormData({ 
      ...formData, 
      allDay: isAllDay,
      start: isAllDay ? moment(start).startOf('day').toDate() : start,
      end: isAllDay ? moment(start).endOf('day').toDate() : moment(start).add(1, 'hour').toDate()
    });
  };

  // Handle event form submission
  const handleSubmitEvent = async () => {
    const { title, description, start, end, allDay, groupId } = formData;
    
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
      if (selectedEvent) {
        // Update existing event
        await updateEvent(selectedEvent._id, {
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
      
      handleCloseEventForm();
    } catch (err) {
      setFormError('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    
    try {
      await deleteEvent(selectedEvent._id);
      handleCloseEventDetails();
      setShowDeleteConfirm(false);
    } catch (err) {
      setFormError('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  // Close event form dialog
  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
      allDay: false,
      groupId: groups && groups.length > 0 ? groups[0]._id : ''
    });
    setFormError('');
  };

  // Close event details dialog
  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  // Custom event component to apply group colors
  const EventComponent = ({ event }) => {
    const { color } = event.resource?.group || { color: theme.palette.primary.main };
    
    return (
      <div
        style={{
          backgroundColor: color || theme.palette.primary.main,
          color: theme.palette.getContrastText(color || theme.palette.primary.main),
          borderRadius: '4px',
          padding: '2px 4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          height: '100%'
        }}
      >
        {event.title}
      </div>
    );
  };

  if (eventsLoading || groupsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Format date/time for display
  const formatDateTime = (start, end, allDay) => {
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {(eventsError || groupsError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {eventsError || groupsError}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} md={9}>
          <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 180px)' }}>
            <BigCalendar
              localizer={localizer}
              events={formattedEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              selectable
              onSelectEvent={handleEventClick}
              onSelectSlot={handleSelectSlot}
              components={{
                event: EventComponent
              }}
            />
          </Paper>
        </Grid>
        
        {/* Groups Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 180px)', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              My Groups
            </Typography>
            
            <List>
              {groups.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                  You haven't joined any groups yet.
                </Typography>
              ) : (
                groups.map((group, index) => (
                  <React.Fragment key={group._id}>
                    <ListItem>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={visibleGroups.includes(group._id)}
                          onChange={() => toggleGroupVisibility(group._id)}
                          sx={{
                            color: group.color,
                            '&.Mui-checked': {
                              color: group.color,
                            }
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={group.name}
                        primaryTypographyProps={{
                          style: {
                            fontWeight: visibleGroups.includes(group._id) ? 'bold' : 'normal'
                          }
                        }}
                      />
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: group.color,
                          ml: 1
                        }}
                      />
                    </ListItem>
                    {index < groups.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20
        }}
        onClick={handleAddEvent}
      >
        <AddIcon />
      </Fab>
      
      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onClose={handleCloseEventDetails} maxWidth="sm" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Event Details</Typography>
                <Box>
                  <IconButton 
                    onClick={() => {
                      setShowEventDetails(false);
                      setShowEventForm(true);
                    }}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => setShowDeleteConfirm(true)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h5" gutterBottom>
                {selectedEvent.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: selectedEvent.group.color,
                    mr: 1
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  {selectedEvent.group.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {formatDateTime(selectedEvent.start, selectedEvent.end, selectedEvent.allDay)}
                {selectedEvent.allDay && ' (All day)'}
              </Typography>
              
              {selectedEvent.description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1">
                    {selectedEvent.description}
                  </Typography>
                </>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Created by: {selectedEvent.createdBy?.name || selectedEvent.createdBy?.email || "Unknown user"}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEventDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Event Form Dialog */}
      <Dialog open={showEventForm} onClose={handleCloseEventForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            autoFocus
          />
          
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.allDay}
                onChange={handleAllDayChange}
                name="allDay"
                color="primary"
              />
            }
            label="All Day Event"
            sx={{ mb: 2, mt: 1 }}
          />
          
          <Box sx={{ mb: 2 }}>
            {/* For now, we'll just show the date string since we're not using the date picker yet */}
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Start: {moment(formData.start).format('MMM D, YYYY h:mm A')}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              End: {moment(formData.end).format('MMM D, YYYY h:mm A')}
            </Typography>
          </Box>
          
          <TextField
            select
            margin="normal"
            required
            fullWidth
            id="groupId"
            label="Group"
            name="groupId"
            value={formData.groupId}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventForm} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitEvent} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (selectedEvent ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteEvent} 
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

export default CalendarView;