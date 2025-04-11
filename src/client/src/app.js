import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Register from './components/register';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Profile from './components/profile';
import GroupDetail from './components/groupdetail';
import CalendarView from './components/calendar';
import { AuthProvider } from './context/authcontext';
import { GroupProvider } from './context/groupcontext';
import { EventProvider } from './context/eventcontext';
import Navbar from './components/navbar';

function App() {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('token') ? true : false;
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <AuthProvider>
      <GroupProvider>
        <EventProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <><Navbar /><Dashboard /></>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <><Navbar /><Profile /></>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:id"
                element={
                  <ProtectedRoute>
                    <><Navbar /><GroupDetail /></>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <><Navbar /><CalendarView /></>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </EventProvider>
      </GroupProvider>
    </AuthProvider>
  );
}

export default App;