// frontend/src/pages/admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setMessage('Order status updated successfully');
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setMessage('Error updating order status');
    }
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

  const getItemTypeIcon = (itemType) => {
    return itemType === 'medicine' ? '💊' : '🏥';
  };

  const getOptionTypeText = (optionType) => {
    const types = {
      sell: 'Purchase',
      rent: 'Rental',
      donate: 'Donation'
    };
    return types[optionType] || optionType;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-table-header">
        <h1>Order Management</h1>
        <div>
          <button onClick={fetchOrders} className="btn btn-primary" style={{ marginRight: '10px' }}>
            Refresh
          </button>
          <span className="badge" style={{ background: '#f8f9fa', color: '#6c757d', padding: '8px 12px' }}>
            Total: {orders.length} orders
          </span>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          background: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          borderRadius: '5px'
        }}>
          {message}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Item Type</th>
              <th>Transaction Type</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>
                  <strong>#{order.id}</strong>
                </td>
                <td>
                  <div>
                    <strong>{order.user_name}</strong>
                    <br />
                    <small style={{ color: '#6c757d' }}>{order.user_email}</small>
                  </div>
                </td>
                <td>
                  <span style={{ marginRight: '5px' }}>
                    {getItemTypeIcon(order.item_type)}
                  </span>
                  {order.item_type}
                </td>
                <td>
                  {getOptionTypeText(order.option_type)}
                </td>
                <td>
                  <strong>{order.quantity}</strong>
                </td>
                <td>
                  <strong>${order.total_amount || '0.00'}</strong>
                </td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ 
                      background: getStatusColor(order.status),
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  >
                    {order.status}
                  </span>
                </td>
                <td>
                  {new Date(order.created_at).toLocaleDateString()}
                  <br />
                  <small style={{ color: '#6c757d' }}>
                    {new Date(order.created_at).toLocaleTimeString()}
                  </small>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      minWidth: '120px'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📦</div>
            <h3>No Orders Found</h3>
            <p>There are no orders in the system yet.</p>
          </div>
        )}
      </div>

      {/* Order Statistics */}
      {orders.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Order Statistics</h3>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-number">
                {orders.filter(order => order.status === 'pending').length}
              </div>
              <div className="stat-label">Pending Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-number">
                {orders.filter(order => order.status === 'confirmed').length}
              </div>
              <div className="stat-label">Confirmed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚚</div>
              <div className="stat-number">
                {orders.filter(order => order.status === 'shipped').length}
              </div>
              <div className="stat-label">Shipped</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎉</div>
              <div className="stat-number">
                {orders.filter(order => order.status === 'delivered').length}
              </div>
              <div className="stat-label">Delivered</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;