import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import BasicLayout from './components/BasicLayout';
import BasicHome from './pages/BasicHome';
import BasicRoomDetail from './pages/BasicRoomDetail';
import BasicLogin from './pages/auth/BasicLogin';
import BasicRegister from './pages/auth/BasicRegister';
import './BasicApp.css';

const BasicApp: React.FC = () => {
  return (
    <div className="basic-app">
      <AuthProvider>
        <Router>
          <BasicLayout>
            <Routes>
              <Route path="/" element={<BasicHome />} />
              <Route path="/login" element={<BasicLogin />} />
              <Route path="/register" element={<BasicRegister />} />
              <Route path="/rooms/:id" element={<BasicRoomDetail />} />
            </Routes>
          </BasicLayout>
        </Router>
      </AuthProvider>
    </div>
  );
};

export default BasicApp;