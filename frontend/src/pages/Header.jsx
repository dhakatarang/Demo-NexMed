import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, logout }) => {
  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <div className="logo">NexMed</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/medicines">Medicines</Link></li>
            <li><Link to="/alerts">Alerts</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li>
              <button 
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: 'inherit'
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;