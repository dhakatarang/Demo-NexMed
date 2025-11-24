import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Medicine.css';

const Medicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      console.log('🔍 Fetching medicines...');
      const response = await axios.get('http://localhost:5001/api/medicines/all');
      console.log('✅ Medicines response:', response.data);
      
      if (response.data.success) {
        setMedicines(response.data.medicines);
      } else {
        setMessage('Failed to fetch medicines');
      }
    } catch (error) {
      console.error('💥 Error fetching medicines:', error);
      
      if (error.response) {
        setMessage(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        setMessage('Network error: Could not connect to server');
      } else {
        setMessage('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (medicineId) => {
    // Navigate to medicine details page
    navigate(`/medicines/${medicineId}`);
  };

  if (loading) {
    return <div className="loading">Loading medicines...</div>;
  }

  return (
    <div className="medicine-container">
      <h2>Available Medicines</h2>
      
      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
          <button 
            onClick={fetchMedicines} 
            style={{marginLeft: '10px', padding: '5px 10px'}}
          >
            Refresh
          </button>
        </div>
      )}

      <div className="medicines-grid">
        {medicines.length === 0 ? (
          <div className="no-items">
            No medicines available
            <button 
              onClick={fetchMedicines} 
              style={{marginTop: '10px', padding: '8px 16px'}}
            >
              Try Again
            </button>
          </div>
        ) : (
          medicines.map(medicine => (
            <div key={medicine.id} className="medicine-card">
              {medicine.image && (
                <img 
                  src={`http://localhost:5001/uploads/${medicine.image}`} 
                  alt={medicine.name}
                  className="medicine-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="medicine-info">
                <h3>{medicine.name}</h3>
                <p className="description">{medicine.description}</p>
                <div className="medicine-details">
                  <span className={`option-type ${medicine.optionType?.toLowerCase() || 'donate'}`}>
                    {(medicine.optionType || 'donate').toUpperCase()}
                  </span>
                  <span className="quantity">Qty: {medicine.quantity}</span>
                  {medicine.optionType === 'sell' && medicine.price > 0 && (
                    <span className="price">${medicine.price}</span>
                  )}
                </div>
                <button 
                  onClick={() => handleViewDetails(medicine.id)}
                  className={`view-details-btn ${medicine.optionType}`}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Medicine;