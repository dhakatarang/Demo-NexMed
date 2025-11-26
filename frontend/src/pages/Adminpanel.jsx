import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

// Admin sub-components - Fixed import paths
import AdminDashboard from './Admin/AdminDashboard';
import AdminUsers from './Admin/AdminUsers';
import AdminMedicines from './Admin/AdminMedicines';
import AdminEquipment from './Admin/AdminEquipment';
import AdminOrders from './Admin/AdminOrders';
import AdminAnalytics from './Admin/AdminAnalytics';

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        window.location.href = '/login';
        return;
      }

      const user = JSON.parse(userData);
      setUser(user);

      // Add authorization header
      const token = localStorage.getItem('token');
      console.log('🔐 Checking admin access with token:', token);

      const response = await axios.get('http://localhost:5001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Admin access response:', response.data);
      
      if (!response.data.success) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Admin access error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Error checking admin access. Please try again.');
      }
      setLoading(false);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Checking admin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <div className="error-icon">🚫</div>
        <h2>Access Denied</h2>
        <p>{error}</p>
        <Link to="/home" className="back-home-btn">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Admin Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>🏥 Admin Panel</h2>
          <p>Welcome, {user?.name}</p>
          <small className="user-role">👑 Administrator</small>
        </div>

        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`nav-item ${isActiveRoute('/admin') ? 'active' : ''}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/admin/users" 
            className={`nav-item ${isActiveRoute('/admin/users') ? 'active' : ''}`}
          >
            👥 User Management
          </Link>
          <Link 
            to="/admin/medicines" 
            className={`nav-item ${isActiveRoute('/admin/medicines') ? 'active' : ''}`}
          >
            💊 Medicine Management
          </Link>
          <Link 
            to="/admin/equipment" 
            className={`nav-item ${isActiveRoute('/admin/equipment') ? 'active' : ''}`}
          >
            🏥 Equipment Management
          </Link>
          <Link 
            to="/admin/orders" 
            className={`nav-item ${isActiveRoute('/admin/orders') ? 'active' : ''}`}
          >
            📦 Order Management
          </Link>
          <Link 
            to="/admin/analytics" 
            className={`nav-item ${isActiveRoute('/admin/analytics') ? 'active' : ''}`}
          >
            📈 Analytics & Reports
          </Link>
        </nav>

        <div className="admin-footer">
          <Link to="/home" className="back-to-site">
            ← Back to Main Site
          </Link>
        </div>
      </div>

      {/* Admin Content */}
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/medicines" element={<AdminMedicines />} />
          <Route path="/equipment" element={<AdminEquipment />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;