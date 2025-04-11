import React, { createContext, useReducer } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  groups: [],
  currentGroup: null,
  loading: true,
  error: null
};

// Create context
const GroupContext = createContext(initialState);

// Reducer function
const groupReducer = (state, action) => {
  switch (action.type) {
    case 'GET_GROUPS':
      return {
        ...state,
        groups: action.payload,
        loading: false
      };
    case 'GET_GROUP':
      return {
        ...state,
        currentGroup: action.payload,
        loading: false
      };
    case 'ADD_GROUP':
      return {
        ...state,
        groups: [...state.groups, action.payload],
        currentGroup: action.payload,
        loading: false
      };
    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(group => 
          group._id === action.payload._id ? action.payload : group
        ),
        currentGroup: action.payload,
        loading: false
      };
    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(group => group._id !== action.payload),
        currentGroup: null,
        loading: false
      };
    case 'GROUP_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_GROUP_ERROR':
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
const GroupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(groupReducer, initialState);

  // Get all groups
  const getGroups = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get('/api/groups');
      dispatch({ type: 'GET_GROUPS', payload: res.data });
    } catch (err) {
      dispatch({
        type: 'GROUP_ERROR',
        payload: err.response?.data?.msg || 'Failed to fetch groups'
      });
    }
  };

  // Get single group
  const getGroup = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get(`/api/groups/${id}`);
      dispatch({ type: 'GET_GROUP', payload: res.data });
    } catch (err) {
      dispatch({
        type: 'GROUP_ERROR',
        payload: err.response?.data?.msg || 'Failed to fetch group'
      });
    }
  };

  // Create new group
  const addGroup = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.post('/api/groups', formData, config);
      dispatch({ type: 'ADD_GROUP', payload: res.data });
      return { success: true, data: res.data };
    } catch (err) {
      dispatch({
        type: 'GROUP_ERROR',
        payload: err.response?.data?.msg || 'Failed to create group'
      });
      return { success: false, error: err.response?.data?.msg || 'Failed to create group' };
    }
  };

  // Update group
  const updateGroup = async (id, formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.put(`/api/groups/${id}`, formData, config);
      dispatch({ type: 'UPDATE_GROUP', payload: res.data });
      return { success: true, data: res.data };
    } catch (err) {
      dispatch({
        type: 'GROUP_ERROR',
        payload: err.response?.data?.msg || 'Failed to update group'
      });
      return { success: false, error: err.response?.data?.msg || 'Failed to update group' };
    }
  };

  // Delete group
  const deleteGroup = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      await axios.delete(`/api/groups/${id}`);
      dispatch({ type: 'DELETE_GROUP', payload: id });
      return { success: true };
    } catch (err) {
      dispatch({
        type: 'GROUP_ERROR',
        payload: err.response?.data?.msg || 'Failed to delete group'
      });
      return { success: false, error: err.response?.data?.msg || 'Failed to delete group' };
    }
  };

  // Invite user to group
  const inviteUser = async (groupId, email) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.post(`/api/groups/${groupId}/invite`, { email }, config);
      dispatch({ type: 'UPDATE_GROUP', payload: res.data });
      return { success: true, data: res.data };
    } catch (err) {
      dispatch({
        type: 'GROUP_ERROR',
        payload: err.response?.data?.msg || 'Failed to invite user'
      });
      return { success: false, error: err.response?.data?.msg || 'Failed to invite user' };
    }
  };

  // Remove user from group
  const removeUser = async (groupId, email) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.delete(`/api/groups/${groupId}/member/${email}`);
      dispatch({ type: 'UPDATE_GROUP', payload: res.data });
      return { success: true, data: res.data };
    } catch (err) {
      dispatch({
        type: 'GROUP_ERROR',
        payload: err.response?.data?.msg || 'Failed to remove user'
      });
      return { success: false, error: err.response?.data?.msg || 'Failed to remove user' };
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_GROUP_ERROR' });
  };

  return (
    <GroupContext.Provider
      value={{
        groups: state.groups,
        currentGroup: state.currentGroup,
        loading: state.loading,
        error: state.error,
        getGroups,
        getGroup,
        addGroup,
        updateGroup,
        deleteGroup,
        inviteUser,
        removeUser,
        clearErrors
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export { GroupContext, GroupProvider };