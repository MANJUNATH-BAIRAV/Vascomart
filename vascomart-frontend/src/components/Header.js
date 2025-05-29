import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBell, FaUser } from 'react-icons/fa';
import Notifications from '../pages/Notifications';
import '../styles/Header.css';
import '../pages/Notifications.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check auth status on component mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isUserLoggedIn = !!token && !!user;
    console.log('Auth check - Token exists:', !!token, 'User exists:', !!user, 'Is logged in:', isUserLoggedIn);
    setIsLoggedIn(isUserLoggedIn);
  }, [location]);

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
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products')}`}>
            Products
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                Orders
              </Link>
              
              <div className="header-icon-container" ref={notificationRef}>
                <button 
                  className={`header-icon ${showNotifications ? 'active' : ''}`}
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                >
                  <FaBell />
                </button>
                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="notifications-dropdown-header">
                      <h4>Notifications</h4>
                      <Link 
                        to="/notifications" 
                        className="view-all-link"
                        onClick={() => setShowNotifications(false)}
                      >
                        View All
                      </Link>
                    </div>
                    <div className="notifications-dropdown-content">
                      <Notifications isDropdown />
                    </div>
                  </div>
                )}
              </div>

              <Link to="/profile" className={`nav-link ${isActive('/profile')} profile-link`}>
                <FaUser className="profile-icon" />
                <span>Profile</span>
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
