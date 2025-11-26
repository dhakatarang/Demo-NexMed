// frontend/src/pages/admin/AdminMedicines.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/medicines');
      if (response.data.success) {
        setMedicines(response.data.medicines);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMessage('Error fetching medicines');
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (medicineId, medicineName) => {
    if (!window.confirm(`Are you sure you want to delete "${medicineName}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5001/api/admin/medicines/${medicineId}`);
      if (response.data.success) {
        setMessage('Medicine deleted successfully');
        setMedicines(medicines.filter(med => med.id !== medicineId));
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      setMessage('Error deleting medicine');
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: '#e74c3c' };
    if (quantity < 10) return { text: 'Low Stock', color: '#f39c12' };
    return { text: 'In Stock', color: '#27ae60' };
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading medicines...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-table-header">
        <h1>Medicine Management</h1>
        <div>
          <button onClick={fetchMedicines} className="btn btn-primary" style={{ marginRight: '10px' }}>
            Refresh
          </button>
          <span className="badge" style={{ background: '#f8f9fa', color: '#6c757d', padding: '8px 12px' }}>
            Total: {medicines.length} medicines
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
              <th>Price</th>
              <th>Quantity</th>
              <th>Stock Status</th>
              <th>Added By</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(medicine => {
              const stockStatus = getStockStatus(medicine.quantity);
              return (
                <tr key={medicine.id}>
                  <td>#{medicine.id}</td>
                  <td>
                    <strong>{medicine.name}</strong>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {medicine.description}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${medicine.option_type === 'donate' ? 'status-completed' : 'status-pending'}`}>
                      {medicine.option_type}
                    </span>
                  </td>
                  <td>
                    {medicine.option_type === 'sell' ? `$${medicine.price}` : 'Free'}
                  </td>
                  <td>
                    <strong>{medicine.quantity}</strong>
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
                  <td>{medicine.added_by_name || 'Unknown'}</td>
                  <td>
                    {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => deleteMedicine(medicine.id, medicine.name)}
                        className="btn btn-danger btn-sm"
                        disabled={medicine.quantity > 0}
                        title={medicine.quantity > 0 ? 'Cannot delete medicine with stock' : 'Delete medicine'}
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

        {medicines.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💊</div>
            <h3>No Medicines Found</h3>
            <p>There are no medicines in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMedicines;