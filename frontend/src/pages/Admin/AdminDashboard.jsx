// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="admin-error">
        <p>Error loading dashboard data</p>
      </div>
    );
  }

  const { stats, recentOrders, lowStockItems, recentUsers } = dashboardData;

  return (
    <div>
      <div className="admin-table-header">
        <h1>Admin Dashboard</h1>
        <button onClick={fetchDashboardData} className="btn btn-primary">
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card medicines">
          <div className="stat-icon">💊</div>
          <div className="stat-number">{stats.totalMedicines}</div>
          <div className="stat-label">Total Medicines</div>
        </div>
        <div className="stat-card equipment">
          <div className="stat-icon">🏥</div>
          <div className="stat-number">{stats.totalEquipment}</div>
          <div className="stat-label">Total Equipment</div>
        </div>
        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-number">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Orders */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-primary btn-sm">
              View All
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.user_name}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>${order.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
              No recent orders
            </p>
          )}
        </div>

        {/* Low Stock Items */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Low Stock Items</h3>
          </div>
          {lowStockItems.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.item_type}</td>
                    <td>
                      <span style={{ 
                        color: item.quantity < 5 ? '#e74c3c' : '#f39c12',
                        fontWeight: 'bold'
                      }}>
                        {item.quantity} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
              All items are well stocked
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;