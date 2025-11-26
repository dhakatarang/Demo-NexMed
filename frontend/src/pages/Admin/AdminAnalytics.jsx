import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setAnalyticsData(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = (orders) => {
    return orders ? orders.reduce((total, order) => total + (order.total_amount || 0), 0) : 0;
  };

  const getPopularItems = () => {
    return [
      { name: 'Paracetamol 500mg', type: 'medicine', orders: 45 },
      { name: 'Blood Pressure Monitor', type: 'equipment', orders: 32 },
      { name: 'Vitamin C 1000mg', type: 'medicine', orders: 28 },
      { name: 'Oxygen Concentrator', type: 'equipment', orders: 25 },
      { name: 'Ibuprofen 400mg', type: 'medicine', orders: 22 }
    ];
  };

  const getUserGrowthData = () => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [120, 190, 300, 500, 700, 900]
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#3498db',
      shipped: '#9b59b6',
      delivered: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="admin-error">
        <p>Error loading analytics data</p>
      </div>
    );
  }

  const popularItems = getPopularItems();
  const userGrowth = getUserGrowthData();
  const estimatedRevenue = calculateRevenue(analyticsData.recentOrders);

  return (
    <div>
      <div className="admin-table-header">
        <h1>Analytics & Reports</h1>
        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              marginRight: '10px'
            }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <button onClick={fetchAnalyticsData} className="btn btn-primary">
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-number">${estimatedRevenue.toFixed(2)}</div>
          <div className="stat-label">Estimated Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{analyticsData.stats?.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{analyticsData.stats?.totalUsers || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-number">
            {((analyticsData.stats?.totalOrders / Math.max(analyticsData.stats?.totalUsers || 1, 1)) * 100).toFixed(1)}%
          </div>
          <div className="stat-label">Conversion Rate</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        
        {/* Popular Items */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Most Popular Items</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {popularItems.map((item, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index < popularItems.length - 1 ? '1px solid #e9ecef' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {item.type === 'medicine' ? '💊' : '🏥'}
                  </span>
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'capitalize' }}>
                      {item.type}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{item.orders} orders</div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {Math.round((item.orders / popularItems.reduce((sum, i) => sum + i.orders, 0)) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth (Mock Chart) */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>User Growth</h3>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ 
              display: 'flex', 
              height: '200px', 
              gap: '10px',
              justifyContent: 'center',
              alignItems: 'end',
              padding: '20px 0'
            }}>
              {userGrowth.data.map((value, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${(value / Math.max(...userGrowth.data)) * 150}px`,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      width: '30px',
                      borderRadius: '5px 5px 0 0',
                      margin: '0 5px'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', marginTop: '5px', color: '#6c757d' }}>
                    {userGrowth.labels[index]}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Total Users: {userGrowth.data[userGrowth.data.length - 1]}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Order Status Distribution</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => {
              const count = analyticsData.recentOrders ? 
                analyticsData.recentOrders.filter(order => order.status === status).length : 0;
              const total = analyticsData.recentOrders ? analyticsData.recentOrders.length : 1;
              const percentage = (count / total) * 100;
              
              return (
                <div key={status} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                      {status}
                    </span>
                    <span style={{ color: '#6c757d' }}>
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#e9ecef',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        background: getStatusColor(status),
                        width: `${percentage}%`,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Quick Actions</h3>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gap: '15px' }}>
              <button className="btn btn-primary" style={{ textAlign: 'left', padding: '15px' }}>
                📥 Export Orders Report
              </button>
              <button className="btn btn-success" style={{ textAlign: 'left', padding: '15px' }}>
                👥 User Activity Report
              </button>
              <button className="btn btn-warning" style={{ textAlign: 'left', padding: '15px' }}>
                📊 Sales Analytics
              </button>
              <button className="btn btn-primary" style={{ textAlign: 'left', padding: '15px' }}>
                🏥 Inventory Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;