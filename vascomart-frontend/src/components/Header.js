import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth status on component mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isUserLoggedIn = !!token && !!user;
    console.log('Auth check - Token exists:', !!token, 'User exists:', !!user, 'Is logged in:', isUserLoggedIn);
    setIsLoggedIn(isUserLoggedIn);
    
    // Force a re-render when location changes
  }, [location, isLoggedIn]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">VascoMart</Link>
        
        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/products" className={`nav-link ${isActive('/products')}`}>Products</Link>
          <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>Orders</Link>
          <Link to="/notifications" className={`nav-link ${isActive('/notifications')}`}>Notifications</Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                Profile
              </Link>
              <button onClick={handleLogout} className="nav-link login-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={`nav-link login-btn ${isActive('/login')}`}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
