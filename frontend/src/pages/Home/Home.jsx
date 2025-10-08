import React, { useState } from 'react';
import axios from 'axios';
import HeroCarousel from '../../components/HeroCarousel/HeroCarousel';
import ArticlesSection from '../../components/ArticleSection/ArticleSection';
import ImpactDashboard from '../../components/ImpactDashboard/ImpactDashboard';
import MotivationBox from '../../components/MotivationBox/MotivationBox';
import MedicineCard from '../../components/MedicineCard/MedicineCard'; // Adjusted path
import css from './Home.module.css';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/upload-medicine', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMedicines([response.data, ...medicines]);
      setSelectedFile(null);
      // Clear file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please drop a valid image file');
    }
  };

  return (
    <div className={css.homeContainer}>
      {/* Original Hero Section */}
      <HeroCarousel />
      
      {/* Medicine Upload Section */}
      <section className={css.medicineSection}>
        <div className={css.medicineContainer}>
          <h2>Medicine Expiry Tracker</h2>
          <p>Upload medicine images to track expiry dates and get alerts 2 months before expiration.</p>

          <div className={css.uploadSection}>
            <h3>Upload Medicine Image</h3>
            <div 
              className={`${css.uploadArea} ${selectedFile ? css.dragover : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button 
                className={css.uploadBtn}
                onClick={() => document.getElementById('file-input').click()}
                style={{ marginBottom: '1rem' }}
              >
                Select Image
              </button>
              <p>or drag and drop an image here</p>
              {selectedFile && (
                <div className={css.selectedFile}>
                  <p>Selected: {selectedFile.name}</p>
                  <button 
                    className={css.uploadBtn}
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Processing...' : 'Upload & Extract'}
                  </button>
                </div>
              )}
            </div>
            {error && <div className={css.error}>{error}</div>}
          </div>

          {medicines.length > 0 && (
            <div className={css.recentMedicines}>
              <h3>Recently Added Medicines</h3>
              <div className={css.medicinesGrid}>
                {medicines.map(medicine => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Original Content Sections */}
      <ArticlesSection />
      <ImpactDashboard />
      <MotivationBox />
    </div>
  );
};

export default Home;