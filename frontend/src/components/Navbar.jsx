// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for login state changes
    const handleLoginChange = () => {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };

    window.addEventListener('storage', handleLoginChange);
    window.addEventListener('loginStateChange', handleLoginChange);

    return () => {
      window.removeEventListener('storage', handleLoginChange);
      window.removeEventListener('loginStateChange', handleLoginChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('loginStateChange'));
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <Link to="/home" className="logo-link">
            <span className="logo-icon"></span>
            <span className="logo-text">NexMed</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link 
            to="/home" 
            className={`nav-link ${isActiveRoute('/home') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/medicines" 
            className={`nav-link ${isActiveRoute('/medicines') ? 'active' : ''}`}
          >
            Medicines
          </Link>
          <Link 
            to="/medicalequipments" 
            className={`nav-link ${isActiveRoute('/medicalequipments') ? 'active' : ''}`}
          >
            Medical Equipment
          </Link>
          <Link 
            to="/donaterent" 
            className={`nav-link ${isActiveRoute('/donaterent') ? 'active' : ''}`}
          >
            Donate/Rent
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${isActiveRoute('/about') ? 'active' : ''}`}
          >
            About
          </Link>
        </div>

        {/* User Section */}
        <div className="nav-user">
          {user ? (
            <div className="user-menu">
              <div className="user-info" onClick={toggleDropdown}>
                <span className="user-name">
                  {user.name || user.email}
                  {user.role === 'admin' && <span className="admin-badge">👑</span>}
                </span>
                <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>
                  ▼
                </span>
              </div>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={closeDropdown}
                  >
                    👤 Profile
                  </Link>
                  
                  <Link 
                    to="/cart" 
                    className="dropdown-item"
                    onClick={closeDropdown}
                  >
                    🛒 Cart
                  </Link>
                  
                  {/* Admin Link - Only show for admin users */}
                  {user.role === 'admin' && (
                    <>
                      <div className="dropdown-divider"></div>
                      <Link 
                        to="/admin" 
                        className="dropdown-item admin-link"
                        onClick={closeDropdown}
                      >
                        ⚙️ Admin Panel
                      </Link>
                    </>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={() => {
                      closeDropdown();
                      handleLogout();
                    }}
                    className="dropdown-item logout"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div 
          className="dropdown-overlay" 
          onClick={closeDropdown}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;