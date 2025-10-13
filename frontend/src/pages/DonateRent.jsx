import React, { useState } from 'react';
import axios from 'axios';
import './DonateRent.css';

const DonateRent = () => {
  const [formData, setFormData] = useState({
    itemType: 'medicine',
    optionType: 'donate',
    name: '',
    description: '',
    quantity: '',
    price: '',
    rentPrice: '',
    duration: '',
    termsAccepted: false
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      setMessage('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setMessage('');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    if (image) {
      submitData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:5001/api/donaterent/add', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage('Item added successfully!');
        // Reset form
        setFormData({
          itemType: 'medicine',
          optionType: 'donate',
          name: '',
          description: '',
          quantity: '',
          price: '',
          rentPrice: '',
          duration: '',
          termsAccepted: false
        });
        setImage(null);
        document.getElementById('image-upload').value = '';
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-rent-container">
      <div className="donate-rent-form">
        <h2>Add Item for Donation/Sale/Rental</h2>
        
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Item Type Selection */}
          <div className="form-group">
            <label>Item Type:</label>
            <select 
              name="itemType" 
              value={formData.itemType} 
              onChange={handleInputChange}
              required
            >
              <option value="medicine">Medicine</option>
              <option value="medicalequipment">Medical Equipment</option>
            </select>
          </div>

          {/* Option Type Selection */}
          <div className="form-group">
            <label>Option Type:</label>
            <select 
              name="optionType" 
              value={formData.optionType} 
              onChange={handleInputChange}
              required
            >
              <option value="donate">Donate</option>
              <option value="sell">Sell</option>
              {formData.itemType === 'medicalequipment' && (
                <option value="rent">Rent</option>
              )}
            </select>
          </div>

          {/* Name */}
          <div className="form-group">
            <label>Item Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter item name"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter item description"
              rows="3"
            />
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              min="1"
              required
            />
          </div>

          {/* Price (show for sell/rent) */}
          {(formData.optionType === 'sell' || formData.optionType === 'rent') && (
            <div className="form-group">
              <label>Price ($):</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required={formData.optionType === 'sell' || formData.optionType === 'rent'}
              />
            </div>
          )}

          {/* Rent Price (show for rent only) */}
          {formData.optionType === 'rent' && (
            <div className="form-group">
              <label>Rent Price ($/day):</label>
              <input
                type="number"
                name="rentPrice"
                value={formData.rentPrice}
                onChange={handleInputChange}
                placeholder="Enter rent price per day"
                min="0"
                step="0.01"
                required
              />
            </div>
          )}

          {/* Duration (show for rent only) */}
          {formData.optionType === 'rent' && (
            <div className="form-group">
              <label>Rental Duration (days):</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Enter rental duration in days"
                min="1"
                required
              />
            </div>
          )}

          {/* Image Upload */}
          <div className="form-group">
            <label>Item Image:</label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                required
              />
              I accept the terms and conditions
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Adding Item...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonateRent;