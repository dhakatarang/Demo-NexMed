import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MedicalEquipment.css';

const MedicalEquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(1);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id]);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5001/api/equipments/${id}`);
      
      if (response.data.success) {
        // Format equipment data with safety checks
        const equipmentData = {
          id: response.data.equipment.id || 0,
          name: response.data.equipment.name || 'Unnamed Equipment',
          description: response.data.equipment.description || 'No description available',
          quantity: response.data.equipment.quantity || 0,
          price: response.data.equipment.price || 0,
          rentPrice: response.data.equipment.rentPrice || response.data.equipment.rent_price || 0,
          optionType: response.data.equipment.optionType || response.data.equipment.option_type || 'donate',
          image: response.data.equipment.image || response.data.equipment.image_path || null,
          duration: response.data.equipment.duration || response.data.equipment.min_rental_days || 0,
          condition: response.data.equipment.condition || 'good'
        };
        
        setEquipment(equipmentData);
        // Set default rental days to minimum or 1
        setRentalDays(Math.max(equipmentData.duration || 1, 1));
      } else {
        setMessage('Equipment not found');
      }
    } catch (error) {
      console.error('Error fetching equipment details:', error);
      setMessage('Error loading equipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      setMessage('');
      
      const payload = {
        action: action,
        quantity: quantity
      };

      // Add rental days for rent action
      if (action === 'rent' && equipment.optionType === 'rent') {
        payload.rentalDays = rentalDays;
      }

      const response = await axios.post(`http://localhost:5001/api/equipments/action/${id}`, payload);

      if (response.data.success) {
        setMessage(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`);
        // Update equipment quantity
        setEquipment(prev => ({
          ...prev,
          quantity: response.data.remainingQuantity
        }));
        
        // Optionally redirect back to equipment list after 2 seconds
        setTimeout(() => {
          navigate('/medicalequipments');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || `Error during ${action}`);
    }
  };

  const handleAddToCart = async () => {
    try {
      setMessage('');
      const response = await axios.post('http://localhost:5001/api/cart/add', {
        itemId: equipment.id,
        itemType: 'medicalequipment',
        name: equipment.name,
        description: equipment.description,
        quantity: quantity,
        price: equipment.price,
        rentPrice: equipment.rentPrice,
        optionType: equipment.optionType,
        image: equipment.image,
        rentalDays: equipment.optionType === 'rent' ? rentalDays : 0
      });

      if (response.data.success) {
        setMessage('Item added to cart successfully!');
        setTimeout(() => {
          navigate('/cart');
        }, 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding to cart');
    }
  };

  const getEquipmentIcon = (equipmentName) => {
    const name = equipmentName?.toLowerCase() || '';
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

  const getActionButtonText = () => {
    if (!equipment) return '';
    
    switch (equipment.optionType) {
      case 'donate':
        return `Get ${quantity} Free`;
      case 'sell':
        return `Buy ${quantity} - $${(equipment.price * quantity).toFixed(2)}`;
      case 'rent':
        return `Rent ${quantity} for ${rentalDays} days - $${(equipment.rentPrice * rentalDays * quantity).toFixed(2)}`;
      default:
        return 'Take Action';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading equipment details...
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="error-container">
        <h2>Equipment Not Found</h2>
        <button onClick={() => navigate('/medicalequipments')} className="back-btn">
          ← Back to Equipment
        </button>
      </div>
    );
  }

  return (
    <div className="equipment-details-container">
      <button onClick={() => navigate('/medicalequipments')} className="back-btn">
        ← Back to Medical Equipment
      </button>

      <div className="equipment-details">
        <div className="image-section">
          {equipment.image ? (
            <img 
              src={`http://localhost:5001/uploads/${equipment.image}`} 
              alt={equipment.name}
              className="equipment-details-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`image-placeholder ${equipment.image ? 'hidden' : ''}`}>
            <span className="equipment-icon">{getEquipmentIcon(equipment.name)}</span>
          </div>
        </div>
        
        <div className="equipment-details-info">
          <h1>{equipment.name}</h1>
          <p className="description">{equipment.description}</p>
          
          <div className="details-section">
            <h3>Equipment Details</h3>
            <div className="equipment-details-meta">
              <span className={`option-type ${equipment.optionType?.toLowerCase() || 'donate'}`}>
                {(equipment.optionType || 'donate').toUpperCase()}
              </span>
              <span className="quantity">Available: {equipment.quantity}</span>
              <span className="condition">Condition: {equipment.condition}</span>
            </div>

            {equipment.optionType === 'sell' && equipment.price > 0 && (
              <div className="price-info">
                <span className="price-label">Price:</span>
                <span className="price-value">${equipment.price}</span>
              </div>
            )}
            
            {equipment.optionType === 'rent' && equipment.rentPrice > 0 && (
              <div className="rent-info">
                <span className="rent-label">Rental Price:</span>
                <span className="rent-value">${equipment.rentPrice}/day</span>
              </div>
            )}
            
            {equipment.optionType === 'rent' && equipment.duration > 0 && (
              <div className="duration-info">
                <span className="duration-label">Minimum Rental Period:</span>
                <span className="duration-value">{equipment.duration} days</span>
              </div>
            )}
          </div>

          {equipment.quantity > 0 ? (
            <div className="action-section">
              <h3>Take Action</h3>
              
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={equipment.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <span className="max-quantity">(Max: {equipment.quantity})</span>
              </div>

              {equipment.optionType === 'rent' && (
                <div className="rental-days-selector">
                  <label htmlFor="rentalDays">Rental Days:</label>
                  <input
                    id="rentalDays"
                    type="number"
                    min={equipment.duration || 1}
                    max="365"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(parseInt(e.target.value) || 1)}
                  />
                  {equipment.duration > 0 && (
                    <span className="min-days">(Min: {equipment.duration} days)</span>
                  )}
                </div>
              )}
              
              <div className="action-buttons">
                <button 
                  onClick={() => handleAction(
                    equipment.optionType === 'donate' ? 'get' : 
                    equipment.optionType === 'sell' ? 'buy' : 'rent'
                  )}
                  disabled={
                    quantity > equipment.quantity || 
                    quantity < 1 ||
                    (equipment.optionType === 'rent' && rentalDays < (equipment.duration || 1))
                  }
                  className={`action-btn large ${equipment.optionType} ${
                    (quantity > equipment.quantity || quantity < 1) ? 'disabled' : ''
                  }`}
                >
                  {getActionButtonText()}
                </button>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={
                    quantity > equipment.quantity || 
                    quantity < 1 ||
                    (equipment.optionType === 'rent' && rentalDays < (equipment.duration || 1))
                  }
                  className="add-to-cart-btn large"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ) : (
            <div className="out-of-stock">
              <h3>Out of Stock</h3>
              <p>This equipment is currently unavailable.</p>
            </div>
          )}

          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalEquipmentDetails;