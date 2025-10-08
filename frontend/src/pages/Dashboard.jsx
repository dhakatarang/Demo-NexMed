import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MedicineCard from '../components/MedicineCard/MedicineCard';

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('/api/medicines');
      setMedicines(response.data);
    } catch (err) {
      setError('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const expiringSoon = medicines.filter(med => med.isExpiringSoon && !med.isExpired);
  const expired = medicines.filter(med => med.isExpired);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Total Medicines</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{medicines.length}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Expiring Soon</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e67e22' }}>{expiringSoon.length}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Expired</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>{expired.length}</p>
        </div>
      </div>

      {expiringSoon.length > 0 && (
        <div>
          <h2 style={{ color: '#e67e22' }}>Medicines Expiring Soon</h2>
          <div className="medicines-grid">
            {expiringSoon.map(medicine => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        </div>
      )}

      <h2>All Medicines</h2>
      {medicines.length === 0 ? (
        <p>No medicines added yet. Upload some medicine images to get started!</p>
      ) : (
        <div className="medicines-grid">
          {medicines.map(medicine => (
            <MedicineCard key={medicine.id} medicine={medicine} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;