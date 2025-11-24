import React, { useState, useEffect } from 'react';
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
  const [highlightRent, setHighlightRent] = useState(false);

  // Calculate estimated values for rent comparison
  const calculateRentComparison = () => {
    if (!formData.price || !formData.rentPrice) return null;
    
    const salePrice = parseFloat(formData.price);
    const dailyRent = parseFloat(formData.rentPrice);
    
    const weeklyCost = dailyRent * 7;
    const monthlyCost = dailyRent * 30;
    const breakEvenDays = salePrice / dailyRent;
    
    return {
      weeklyCost: weeklyCost.toFixed(2),
      monthlyCost: monthlyCost.toFixed(2),
      breakEvenDays: Math.ceil(breakEvenDays)
    };
  };

  const rentComparison = calculateRentComparison();

  useEffect(() => {
    if (formData.optionType === 'rent') {
      setHighlightRent(true);
      const timer = setTimeout(() => setHighlightRent(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [formData.optionType]);

  // Reset option type to donate if medicine is selected and current option is rent
  useEffect(() => {
    if (formData.itemType === 'medicine' && formData.optionType === 'rent') {
      setFormData(prev => ({
        ...prev,
        optionType: 'donate',
        rentPrice: '',
        duration: ''
      }));
      setMessage('Rent option is not available for medicine. Switched to Donate.');
    }
  }, [formData.itemType]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionTypeChange = (optionType) => {
    // Prevent selecting rent for medicine
    if (formData.itemType === 'medicine' && optionType === 'rent') {
      setMessage('Rent option is only available for Medical Equipment');
      return;
    }

    setFormData(prev => ({
      ...prev,
      optionType,
      // Reset price fields when switching to donate
      ...(optionType === 'donate' && { price: '', rentPrice: '', duration: '' }),
      // Reset rent fields when switching from rent
      ...(prev.optionType === 'rent' && optionType !== 'rent' && { rentPrice: '', duration: '' })
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }
    setImage(file);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      setMessage('Please accept the terms and conditions');
      return;
    }

    // Enhanced validation
    if (formData.optionType === 'sell' && !formData.price) {
      setMessage('Price is required for selling items');
      return;
    }

    if (formData.optionType === 'rent') {
      if (!formData.rentPrice) {
        setMessage('Rent price is required for rental items');
        return;
      }
      if (parseFloat(formData.rentPrice) <= 0) {
        setMessage('Rent price must be greater than 0');
        return;
      }
    }

    setLoading(true);
    setMessage('');

    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'termsAccepted') {
        submitData.append(key, formData[key].toString());
      } else {
        submitData.append(key, formData[key]);
      }
    });
    
    if (image) {
      submitData.append('image', image);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to add items');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5001/api/donaterent/add', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
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
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage(error.response?.data?.message || error.response?.data?.error || 'Error adding item');
    } finally {
      setLoading(false);
    }
  };

  // Check if rent option should be available
  const isRentAvailable = formData.itemType === 'medicalequipment';

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

          {/* Enhanced Option Type Selection */}
          <div className="form-group">
            <label>What would you like to do?</label>
            <div className="option-type-container">
              <input
                type="radio"
                name="optionType"
                value="donate"
                id="donate-option"
                checked={formData.optionType === 'donate'}
                onChange={() => handleOptionTypeChange('donate')}
                className="option-type-radio"
              />
              <label htmlFor="donate-option" className="option-type-label">
                <div className="option-icon">🎁</div>
                <div className="option-title">Donate</div>
                <div className="option-description">Give away for free</div>
              </label>

              <input
                type="radio"
                name="optionType"
                value="sell"
                id="sell-option"
                checked={formData.optionType === 'sell'}
                onChange={() => handleOptionTypeChange('sell')}
                className="option-type-radio"
              />
              <label htmlFor="sell-option" className="option-type-label">
                <div className="option-icon">💰</div>
                <div className="option-title">Sell</div>
                <div className="option-description">One-time purchase</div>
              </label>

              {/* Rent Option - Conditionally rendered and styled */}
              <input
                type="radio"
                name="optionType"
                value="rent"
                id="rent-option"
                checked={formData.optionType === 'rent'}
                onChange={() => handleOptionTypeChange('rent')}
                className="option-type-radio"
                disabled={!isRentAvailable}
              />
              <label 
                htmlFor="rent-option" 
                className={`option-type-label ${!isRentAvailable ? 'disabled' : ''}`}
                title={!isRentAvailable ? 'Rent option only available for Medical Equipment' : ''}
              >
                <div className="option-icon">⏱️</div>
                <div className="option-title">Rent</div>
                <div className="option-description">
                  {isRentAvailable ? 'Temporary usage' : 'Medical Equipment only'}
                </div>
              </label>
            </div>

            {/* Warning message when rent is not available */}
            {!isRentAvailable && formData.optionType === 'rent' && (
              <div className="warning-message">
                Rent option is only available for Medical Equipment. Please select Donate or Sell for Medicine.
              </div>
            )}
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
              required
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

          {/* Sale Price (show for sell/rent) */}
          {(formData.optionType === 'sell' || formData.optionType === 'rent') && (
            <div className="form-group">
              <label>
                Sale Price (₹)
                {formData.optionType === 'rent' && (
                  <span className="info-tooltip">
                    <span className="tooltip-text">
                      This is the price if someone wants to buy the item instead of renting
                    </span>
                  </span>
                )}
                :
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder={formData.optionType === 'rent' ? 'Enter sale price (optional)' : 'Enter price'}
                min="0"
                step="0.01"
                required={formData.optionType === 'sell'}
              />
            </div>
          )}

          {/* Rent-specific fields - Only show for medical equipment with rent option */}
          {formData.optionType === 'rent' && isRentAvailable && (
            <div className={`rent-section ${highlightRent ? 'highlight' : ''}`}>
              <h4>Rental Information</h4>
              
              <div className="form-group">
                <label>Rent Price (₹/day):</label>
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

              {/* Rent comparison information */}
              {rentComparison && (
                <div className="price-comparison">
                  <div className="price-item sale">
                    <div className="price-label">Sale Price</div>
                    <div className="price-value">${formData.price}</div>
                  </div>
                  <div className="price-item rent">
                    <div className="price-label">Weekly Rent</div>
                    <div className="price-value">${rentComparison.weeklyCost}</div>
                  </div>
                  <div className="price-item rent">
                    <div className="price-label">Monthly Rent</div>
                    <div className="price-value">${rentComparison.monthlyCost}</div>
                  </div>
                </div>
              )}

              <div className="rent-features">
                <div className="rent-feature">Flexible rental periods</div>
                <div className="rent-feature">Daily pricing</div>
                <div className="rent-feature">No minimum rental period</div>
                <div className="rent-feature">Perfect for temporary needs</div>
              </div>
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
            <small>Maximum file size: 5MB (JPEG, JPG, PNG, GIF)</small>
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
            {loading ? (
              <>
                Adding Item<span className="loading-dots"></span>
              </>
            ) : (
              `Add Item for ${formData.optionType === 'donate' ? 'Donation' : formData.optionType === 'sell' ? 'Sale' : 'Rental'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonateRent;