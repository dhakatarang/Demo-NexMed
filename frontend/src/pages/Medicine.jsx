import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Medicine.css';

const Medicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Debug: Check token
      const token = localStorage.getItem('token');
      console.log('🔐 Token exists:', !!token);
      console.log('🔐 Token value:', token);
      
      const response = await axios.get('http://localhost:5001/api/medicines/all');
      console.log('✅ Medicines response:', response.data);
      
      if (response.data.success) {
        setMedicines(response.data.medicines);
      } else {
        setMessage('Failed to fetch medicines');
      }
    } catch (error) {
      console.error('💥 Error fetching medicines:', error);
      
      // Detailed error info
      if (error.response) {
        // Server responded with error status
        console.error('💥 Server error:', error.response.status, error.response.data);
        setMessage(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // No response received
        console.error('💥 No response:', error.request);
        setMessage('Network error: Could not connect to server');
      } else {
        // Other errors
        console.error('💥 Other error:', error.message);
        setMessage('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (medicineId, quantity = 1) => {
    try {
      setMessage('');
      
      const response = await axios.post(`http://localhost:5001/api/medicines/buy/${medicineId}`, {
        quantity: quantity
      });

      if (response.data.success) {
        setMessage('Purchase successful!');
        // Update local state
        setMedicines(prevMedicines => 
          prevMedicines.map(med => 
            med.id === medicineId 
              ? { ...med, quantity: response.data.remainingQuantity }
              : med
          )
        );
      }
    } catch (error) {
      console.error('💥 Purchase error:', error);
      setMessage(error.response?.data?.message || 'Error purchasing medicine');
    }
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
            Retry
          </button>
        </div>
      )}

      <div className="medicines-grid">
        {medicines.length === 0 ? (
          <div className="no-items">No medicines available</div>
        ) : (
          medicines.map(medicine => (
            <div key={medicine.id} className="medicine-card">
              {medicine.image && (
                <img 
                  src={`http://localhost:5001/uploads/${medicine.image}`} 
                  alt={medicine.name}
                  className="medicine-image"
                />
              )}
              <div className="medicine-info">
                <h3>{medicine.name}</h3>
                <p className="description">{medicine.description}</p>
                <div className="medicine-details">
                  <span className={`option-type ${medicine.optionType}`}>
                    {medicine.optionType.toUpperCase()}
                  </span>
                  <span className="quantity">Qty: {medicine.quantity}</span>
                  {medicine.optionType === 'sell' && medicine.price && (
                    <span className="price">${medicine.price}</span>
                  )}
                </div>
                <button 
                  onClick={() => handleBuy(medicine.id, 1)}
                  disabled={medicine.quantity === 0}
                  className={`buy-btn ${medicine.optionType} ${medicine.quantity === 0 ? 'disabled' : ''}`}
                >
                  {medicine.optionType === 'donate' ? 'Get Free' : `Buy - $${medicine.price}`}
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