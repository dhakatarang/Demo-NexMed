import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MedicalEquipment.css';

const MedicalEquipment = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [imageErrors, setImageErrors] = useState(new Set());
  const navigate = useNavigate();

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

  const handleImageError = (equipmentId) => {
    setImageErrors(prev => new Set(prev.add(equipmentId)));
  };

  const handleViewDetails = (equipmentId) => {
    // Navigate to equipment details page
    navigate(`/medicalequipments/${equipmentId}`);
  };

  const getEquipmentIcon = (equipmentName) => {
    const name = equipmentName.toLowerCase();
    if (name.includes('wheelchair')) return '♿';
    if (name.includes('bed')) return '🛏️';
    if (name.includes('walker')) return '🚶';
    if (name.includes('oxygen')) return '💨';
    if (name.includes('monitor')) return '📊';
    if (name.includes('crutch')) return '🩼';
    if (name.includes('injection')) return '💉';
    if (name.includes('stethoscope')) return '🎧';
    return '🏥';
  };

  const getActionButtonText = (equipment) => {
    const optionType = equipment.optionType?.toLowerCase() || 'donate';
    
    switch (optionType) {
      case 'donate':
        return 'Get Free';
      case 'sell':
        return `Buy - $${equipment.price || 0}`;
      case 'rent':
        return `Rent - $${equipment.rentPrice || 0}/day`;
      default:
        return 'View Details';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading medical equipment...
      </div>
    );
  }

  return (
    <div className="equipment-container">
      <h2>Available Medical Equipment</h2>
      
      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
          <button 
            onClick={fetchEquipments} 
            className="refresh-btn"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="equipment-grid">
        {equipments.length === 0 ? (
          <div className="no-items">
            <div style={{fontSize: '3rem', marginBottom: '15px'}}>🏥</div>
            No medical equipment available at the moment
            <button 
              onClick={fetchEquipments} 
              className="refresh-btn"
            >
              Try Again
            </button>
          </div>
        ) : (
          equipments.map(equipment => (
            <div key={equipment.id} className="equipment-card">
              <div className="image-container">
                {equipment.image && !imageErrors.has(equipment.id) ? (
                  <img 
                    src={`http://localhost:5001/uploads/${equipment.image}`} 
                    alt={equipment.name}
                    className="equipment-image"
                    onError={() => handleImageError(equipment.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="image-placeholder">
                    {getEquipmentIcon(equipment.name)}
                  </div>
                )}
                <div className="quantity-badge">
                  {equipment.quantity} in stock
                </div>
              </div>
              
              <div className="equipment-info">
                <h3>{equipment.name}</h3>
                <p className="description">{equipment.description}</p>
                
                <div className="equipment-details">
                  <span className={`option-type ${equipment.optionType?.toLowerCase() || 'donate'}`}>
                    {(equipment.optionType || 'donate').toUpperCase()}
                  </span>
                  
                  <div className="detail-row">
                    <span className="detail-label">Condition:</span>
                    <span className="detail-value">{equipment.condition}</span>
                  </div>

                  {equipment.optionType === 'sell' && equipment.price > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price">${equipment.price}</span>
                    </div>
                  )}
                  
                  {equipment.optionType === 'rent' && equipment.rentPrice > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Rent Price:</span>
                      <span className="detail-value rent-price">${equipment.rentPrice}/day</span>
                    </div>
                  )}
                  
                  {equipment.optionType === 'rent' && equipment.duration > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Minimum Rental:</span>
                      <span className="detail-value duration">{equipment.duration} days</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => handleViewDetails(equipment.id)}
                  className={`view-details-btn ${equipment.optionType}`}
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

export default MedicalEquipment;