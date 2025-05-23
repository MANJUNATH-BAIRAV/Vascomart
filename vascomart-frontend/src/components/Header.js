import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();

  // Check if current path matches the nav item
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          VascoMart
        </Link>
        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products')}`}>
            Products
          </Link>
          <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
            Orders
          </Link>
          <Link to="/login" className={`nav-link login-btn ${isActive('/login')}`}>
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
