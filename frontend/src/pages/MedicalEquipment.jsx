import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MedicalEquipment.css';

const MedicalEquipment = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/equipments/all');
      if (response.data.success) {
        setEquipments(response.data.equipments);
      }
    } catch (error) {
      setMessage('Error fetching medical equipment');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (equipmentId, action, quantity = 1) => {
    try {
      const response = await axios.post(`http://localhost:5001/api/equipments/action/${equipmentId}`, {
        action: action,
        quantity: quantity
      });

      if (response.data.success) {
        setMessage(`${action} successful!`);
        // Update local state
        setEquipments(prevEquipments => 
          prevEquipments.map(eq => 
            eq.id === equipmentId 
              ? { ...eq, quantity: response.data.remainingQuantity }
              : eq
          )
        );
      }
    } catch (error) {
      setMessage(error.response?.data?.message || `Error during ${action}`);
    }
  };

  const getActionButton = (equipment) => {
    switch (equipment.optionType) {
      case 'donate':
        return (
          <button 
            onClick={() => handleAction(equipment.id, 'get')}
            disabled={equipment.quantity === 0}
            className="action-btn donate"
          >
            Get Free
          </button>
        );
      case 'sell':
        return (
          <button 
            onClick={() => handleAction(equipment.id, 'buy')}
            disabled={equipment.quantity === 0}
            className="action-btn sell"
          >
            Buy - ${equipment.price}
          </button>
        );
      case 'rent':
        return (
          <button 
            onClick={() => handleAction(equipment.id, 'rent')}
            disabled={equipment.quantity === 0}
            className="action-btn rent"
          >
            Rent - ${equipment.rentPrice}/day
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading medical equipment...</div>;
  }

  return (
    <div className="equipment-container">
      <h2>Available Medical Equipment</h2>
      
      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="equipment-grid">
        {equipments.length === 0 ? (
          <div className="no-items">No medical equipment available</div>
        ) : (
          equipments.map(equipment => (
            <div key={equipment.id} className="equipment-card">
              {equipment.image && (
                <img 
                  src={`http://localhost:5001/uploads/${equipment.image}`} 
                  alt={equipment.name}
                  className="equipment-image"
                />
              )}
              <div className="equipment-info">
                <h3>{equipment.name}</h3>
                <p className="description">{equipment.description}</p>
                <div className="equipment-details">
                  <span className={`option-type ${equipment.optionType}`}>
                    {equipment.optionType.toUpperCase()}
                  </span>
                  <span className="quantity">Qty: {equipment.quantity}</span>
                  {equipment.optionType === 'sell' && equipment.price && (
                    <span className="price">${equipment.price}</span>
                  )}
                  {equipment.optionType === 'rent' && equipment.rentPrice && (
                    <span className="rent-price">${equipment.rentPrice}/day</span>
                  )}
                  {equipment.optionType === 'rent' && equipment.duration && (
                    <span className="duration">Max: {equipment.duration} days</span>
                  )}
                </div>
                {getActionButton(equipment)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicalEquipment;