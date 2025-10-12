
// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // We'll create this CSS file

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <Link to="/home" className="logo-link">
                    NexMed
                </Link>
            </div>
            
            <div className="nav-links">
                <Link to="/home" className="nav-link">Home</Link>
                <Link to="/medicines" className="nav-link">Medicines</Link>
                <Link to="/medicalequipments" className="nav-link">Medical Equipments</Link>
                <Link to="/donaterent" className="nav-link">Donate/Rent</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
}

export default Navbar;