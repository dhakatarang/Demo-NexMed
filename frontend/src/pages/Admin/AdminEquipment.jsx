// frontend/src/pages/admin/AdminEquipment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/equipment');
      if (response.data.success) {
        setEquipment(response.data.equipment);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setMessage('Error fetching equipment');
    } finally {
      setLoading(false);
    }
  };

  const deleteEquipment = async (equipmentId, equipmentName) => {
    if (!window.confirm(`Are you sure you want to delete "${equipmentName}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5001/api/admin/equipment/${equipmentId}`);
      if (response.data.success) {
        setMessage('Equipment deleted successfully');
        setEquipment(equipment.filter(item => item.id !== equipmentId));
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setMessage('Error deleting equipment');
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: '#e74c3c' };
    if (quantity < 5) return { text: 'Low Stock', color: '#f39c12' };
    return { text: 'In Stock', color: '#27ae60' };
  };

  const getConditionColor = (condition) => {
    const colors = {
      excellent: '#27ae60',
      good: '#3498db',
      fair: '#f39c12',
      poor: '#e74c3c'
    };
    return colors[condition] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading equipment...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-table-header">
        <h1>Equipment Management</h1>
        <div>
          <button onClick={fetchEquipment} className="btn btn-primary" style={{ marginRight: '10px' }}>
            Refresh
          </button>
          <span className="badge" style={{ background: '#f8f9fa', color: '#6c757d', padding: '8px 12px' }}>
            Total: {equipment.length} items
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
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Price/Rent</th>
              <th>Quantity</th>
              <th>Stock Status</th>
              <th>Condition</th>
              <th>Added By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map(item => {
              const stockStatus = getStockStatus(item.quantity);
              return (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.description}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      item.option_type === 'donate' ? 'status-completed' : 
                      item.option_type === 'sell' ? 'status-pending' : 'status-active'
                    }`}>
                      {item.option_type}
                    </span>
                  </td>
                  <td>
                    {item.option_type === 'sell' && `$${item.price}`}
                    {item.option_type === 'rent' && `$${item.rent_price}/day`}
                    {item.option_type === 'donate' && 'Free'}
                  </td>
                  <td>
                    <strong>{item.quantity}</strong>
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ 
                        background: stockStatus.color,
                        color: 'white'
                      }}
                    >
                      {stockStatus.text}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ 
                        background: getConditionColor(item.condition),
                        color: 'white',
                        textTransform: 'capitalize'
                      }}
                    >
                      {item.condition}
                    </span>
                  </td>
                  <td>{item.added_by_name || 'Unknown'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => deleteEquipment(item.id, item.name)}
                        className="btn btn-danger btn-sm"
                        disabled={item.quantity > 0}
                        title={item.quantity > 0 ? 'Cannot delete equipment with stock' : 'Delete equipment'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {equipment.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏥</div>
            <h3>No Equipment Found</h3>
            <p>There is no medical equipment in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEquipment;