import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Medicine.css';

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchMedicineDetails();
  }, [id]);

  const fetchMedicineDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5001/api/medicines/${id}`);
      
      if (response.data.success) {
        setMedicine(response.data.medicine);
      } else {
        setMessage('Medicine not found');
      }
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      setMessage('Error loading medicine details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setMessage('');
      const response = await axios.post(`http://localhost:5001/api/medicines/buy/${id}`, {
        quantity: quantity
      });

      if (response.data.success) {
        setMessage('Purchase successful!');
        // Update medicine quantity
        setMedicine(prev => ({
          ...prev,
          quantity: response.data.remainingQuantity
        }));
        
        // Optionally redirect back to medicines list after 2 seconds
        setTimeout(() => {
          navigate('/medicines');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error purchasing medicine');
    }
  };

  const handleAddToCart = async () => {
    try {
      setMessage('');
      const response = await axios.post('http://localhost:5001/api/cart/add', {
        itemId: medicine.id,
        itemType: 'medicine',
        name: medicine.name,
        description: medicine.description,
        quantity: quantity,
        price: medicine.price,
        rentPrice: 0,
        optionType: medicine.optionType,
        image: medicine.image,
        rentalDays: 0
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

  if (loading) return <div className="loading">Loading medicine details...</div>;
  if (!medicine) return <div className="error">Medicine not found</div>;

  return (
    <div className="medicine-details-container">
      <button onClick={() => navigate('/medicines')} className="back-btn">
        ← Back to Medicines
      </button>

      <div className="medicine-details">
        {medicine.image && (
          <img 
            src={`http://localhost:5001/uploads/${medicine.image}`} 
            alt={medicine.name}
            className="medicine-details-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        
        <div className="medicine-details-info">
          <h1>{medicine.name}</h1>
          <p className="description">{medicine.description}</p>
          
          <div className="details-section">
            <h3>Details</h3>
            <div className="medicine-details-meta">
              <span className={`option-type ${medicine.optionType?.toLowerCase() || 'donate'}`}>
                {(medicine.optionType || 'donate').toUpperCase()}
              </span>
              <span className="quantity">Available: {medicine.quantity}</span>
              {medicine.optionType === 'sell' && medicine.price > 0 && (
                <span className="price">Price: ${medicine.price}</span>
              )}
            </div>
          </div>

          {medicine.quantity > 0 ? (
            <div className="purchase-section">
              <h3>Purchase Options</h3>
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={medicine.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <span className="max-quantity">(Max: {medicine.quantity})</span>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={handlePurchase}
                  disabled={quantity > medicine.quantity || quantity < 1}
                  className={`buy-btn large ${medicine.optionType} ${quantity > medicine.quantity ? 'disabled' : ''}`}
                >
                  {medicine.optionType === 'donate' 
                    ? `Get ${quantity} Free` 
                    : `Buy ${quantity} - $${(medicine.price * quantity).toFixed(2)}`
                  }
                </button>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={quantity > medicine.quantity || quantity < 1}
                  className="add-to-cart-btn large"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ) : (
            <div className="out-of-stock">
              <h3>Out of Stock</h3>
              <p>This medicine is currently unavailable.</p>
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

export default MedicineDetails;