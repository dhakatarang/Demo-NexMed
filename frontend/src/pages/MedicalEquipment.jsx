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
      setLoading(true);
      console.log('🔍 Fetching medical equipment...');
      
      const response = await axios.get('http://localhost:5001/api/equipments/all');
      console.log('✅ Equipment response:', response.data);
      
      if (response.data.success) {
        // Add safety checks to ensure all equipment has required properties
        const safeEquipments = response.data.equipments.map(equipment => ({
          id: equipment.id || 0,
          name: equipment.name || 'Unnamed Equipment',
          description: equipment.description || 'No description available',
          quantity: equipment.quantity || 0,
          price: equipment.price || 0,
          rentPrice: equipment.rentPrice || equipment.rent_price || 0,
          optionType: equipment.optionType || equipment.option_type || 'donate',
          image: equipment.image || equipment.image_path || null,
          duration: equipment.duration || equipment.min_rental_days || 0,
          condition: equipment.condition || 'good'
        }));
        
        setEquipments(safeEquipments);
        console.log(`✅ Loaded ${safeEquipments.length} equipment items`);
      } else {
        setMessage('Failed to fetch medical equipment');
      }
    } catch (error) {
      console.error('💥 Error fetching medical equipment:', error);
      setMessage(error.response?.data?.message || 'Error fetching medical equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (equipmentId, action, quantity = 1) => {
    try {
      setMessage('');
      
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
      console.error(`💥 ${action} error:`, error);
      setMessage(error.response?.data?.message || `Error during ${action}`);
    }
  };

  const getActionButton = (equipment) => {
    const optionType = equipment.optionType?.toLowerCase() || 'donate';
    
    switch (optionType) {
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
            Buy - ${equipment.price || 0}
          </button>
        );
      case 'rent':
        return (
          <button 
            onClick={() => handleAction(equipment.id, 'rent')}
            disabled={equipment.quantity === 0}
            className="action-btn rent"
          >
            Rent - ${equipment.rentPrice || 0}/day
          </button>
        );
      default:
        return (
          <button className="action-btn unknown" disabled>
            Unknown Type
          </button>
        );
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
          <button 
            onClick={fetchEquipments} 
            style={{marginLeft: '10px', padding: '5px 10px'}}
          >
            Refresh
          </button>
        </div>
      )}

      <div className="equipment-grid">
        {equipments.length === 0 ? (
          <div className="no-items">
            No medical equipment available
            <button 
              onClick={fetchEquipments} 
              style={{marginTop: '10px', padding: '8px 16px'}}
            >
              Try Again
            </button>
          </div>
        ) : (
          equipments.map(equipment => (
            <div key={equipment.id} className="equipment-card">
              {equipment.image && (
                <img 
                  src={`http://localhost:5001/uploads/${equipment.image}`} 
                  alt={equipment.name}
                  className="equipment-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="equipment-info">
                <h3>{equipment.name}</h3>
                <p className="description">{equipment.description}</p>
                <div className="equipment-details">
                  <span className={`option-type ${equipment.optionType?.toLowerCase() || 'donate'}`}>
                    {(equipment.optionType || 'donate').toUpperCase()}
                  </span>
                  <span className="quantity">Qty: {equipment.quantity}</span>
                  {equipment.optionType === 'sell' && equipment.price > 0 && (
                    <span className="price">${equipment.price}</span>
                  )}
                  {equipment.optionType === 'rent' && equipment.rentPrice > 0 && (
                    <span className="rent-price">${equipment.rentPrice}/day</span>
                  )}
                  {equipment.optionType === 'rent' && equipment.duration > 0 && (
                    <span className="duration">Min: {equipment.duration} days</span>
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