import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import SimpleHome from './pages/SimpleHome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SimpleRoomDetail from './pages/rooms/SimpleRoomDetail';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddRoom from './pages/owner/AddRoom';
import RenterDashboard from './pages/renter/RenterDashboard';
import Profile from './pages/profile/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<SimpleHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/rooms/:id" element={<SimpleRoomDetail />} />
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/add-room" element={<AddRoom />} />
              <Route path="/renter/dashboard" element={<RenterDashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;