import React from 'react';

const MedicineCard = ({ medicine }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`medicine-card ${medicine.isExpiringSoon ? 'expiring-soon' : ''}`}>
      <img 
        src={`http://localhost:5000${medicine.imageUrl}`} 
        alt={medicine.name}
        className="medicine-image"
      />
      <div className="medicine-details">
        <h3 className="medicine-name">{medicine.name}</h3>
        <p className="medicine-info">
          <strong>Expiry Date:</strong> {formatDate(medicine.expiryDate)}
        </p>
        <p className="medicine-info">
          <strong>Batch No:</strong> {medicine.batchNumber}
        </p>
        {medicine.isExpiringSoon && (
          <p className="expiry-warning">
            ⚠️ Expiring within 2 months!
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;