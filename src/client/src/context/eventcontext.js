import React, { createContext, useReducer } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  events: [],
  filteredEvents: [],
  visibleGroups: [], // IDs of groups whose events are visible
  loading: true,
  error: null
};

// Create context
const EventContext = createContext(initialState);

// Reducer function
const eventReducer = (state, action) => {
  switch (action.type) {
    case 'GET_EVENTS':
      return {
        ...state,
        events: action.payload,
        filteredEvents: action.payload.filter(event => 
          state.visibleGroups.includes(event.group._id)),
        loading: false
      };
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
        filteredEvents: state.visibleGroups.includes(action.payload.group._id) 
          ? [...state.filteredEvents, action.payload] 
          : state.filteredEvents,
        loading: false
      };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event => 
          event._id === action.payload._id ? action.payload : event
        ),
        filteredEvents: state.filteredEvents.map(event => 
          event._id === action.payload._id && state.visibleGroups.includes(action.payload.group._id) 
            ? action.payload 
            : event
        ).filter(event => state.visibleGroups.includes(event.group._id)),
        loading: false
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event._id !== action.payload),
        filteredEvents: state.filteredEvents.filter(event => event._id !== action.payload),
        loading: false
      };
    case 'SET_VISIBLE_GROUPS':
      return {
        ...state,
        visibleGroups: action.payload,
        filteredEvents: state.events.filter(event => 
          action.payload.includes(event.group._id)),
        loading: false
      };
    case 'TOGGLE_GROUP_VISIBILITY':
      const groupId = action.payload;
      let newVisibleGroups;
      
      if (state.visibleGroups.includes(groupId)) {
        // Remove group if it's currently visible
        newVisibleGroups = state.visibleGroups.filter(id => id !== groupId);
      } else {
        // Add group if it's currently hidden
        newVisibleGroups = [...state.visibleGroups, groupId];
      }
      
      return {
        ...state,
        visibleGroups: newVisibleGroups,
        filteredEvents: state.events.filter(event => 
          newVisibleGroups.includes(event.group._id)),
        loading: false
      };
    case 'EVENT_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_EVENT_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
};

// Provider component
const EventProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  // Get all events for user's groups
  const getEvents = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get('/api/events');
      
      // Initialize visible groups with all groups
      const groupIds = [...new Set(res.data.map(event => event.group._id))];
      dispatch({ type: 'SET_VISIBLE_GROUPS', payload: groupIds });
      
      dispatch({ type: 'GET_EVENTS', payload: res.data });
    } catch (err) {
      dispatch({
        type: 'EVENT_ERROR',
        payload: err.response?.data?.msg || 'Failed to fetch events'
      });
    }
  };

  // Create new event
  const addEvent = async (eventData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.post('/api/events', eventData, config);
      dispatch({ type: 'ADD_EVENT', payload: res.data });
      return { success: true, data: res.data };
    } catch (err) {
      dispatch({
        type: 'EVENT_ERROR',
        payload: err.response?.data?.msg || 'Failed to create event'
      });
      return { success: false, error: err.response?.data?.msg || 'Failed to create event' };
    }
  };

  // Update event
  const updateEvent = async (id, eventData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.put(`/api/events/${id}`, eventData, config);
      dispatch({ type: 'UPDATE_EVENT', payload: res.data });
      return { success: true, data: res.data };
    } catch (err) {
      dispatch({
        type: 'EVENT_ERROR',
        payload: err.response?.data?.msg || 'Failed to update event'
      });
      return { success: false, error: err.response?.data?.msg || 'Failed to update event' };
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      await axios.delete(`/api/events/${id}`);
      dispatch({ type: 'DELETE_EVENT', payload: id });
      return { success: true };
    } catch (err) {
      dispatch({
        type: 'EVENT_ERROR',
        payload: err.response?.data?.msg || 'Failed to delete event'
      });
      return { success: false, error: err.response?.data?.msg || 'Failed to delete event' };
    }
  };

  // Toggle group visibility
  const toggleGroupVisibility = (groupId) => {
    dispatch({ type: 'TOGGLE_GROUP_VISIBILITY', payload: groupId });
  };

  // Set all visible groups
  const setVisibleGroups = (groupIds) => {
    dispatch({ type: 'SET_VISIBLE_GROUPS', payload: groupIds });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_EVENT_ERROR' });
  };

  return (
    <EventContext.Provider
      value={{
        events: state.events,
        filteredEvents: state.filteredEvents,
        visibleGroups: state.visibleGroups,
        loading: state.loading,
        error: state.error,
        getEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleGroupVisibility,
        setVisibleGroups,
        clearErrors
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export { EventContext, EventProvider };