import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './BasicLayout.css';

interface BasicLayoutProps {
  children: React.ReactNode;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            🏠 RoomRental
          </Link>
          
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            
            {user ? (
              <div className="user-menu">
                <span className="user-name">Welcome, {user.name}</span>
                {user.role === 'owner' && (
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                )}
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link register-link">Register</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 RoomRental. Find your perfect room.</p>
        </div>
      </footer>
    </div>
  );
};

export default BasicLayout;