// frontend/src/pages/Home.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '@lottiefiles/lottie-player';

import './Home.css'; 
const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search', { state: { query: searchQuery } });
    }
  };

  return (
    <div className="home-page">
      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-content">
          {/* Left Side Text */}
          <div className="hero-left">
            

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your Health,
              <span className="gradient-text"> Our Priority</span>
            </motion.h1>

            <motion.p
              className="hero-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connect with your community to buy, sell, donate, or rent medical supplies 
              and equipment. Safe, reliable, and accessible healthcare for everyone.
            </motion.p>

            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/medicines" className="btn btn-primary">
                <span>Explore Medicines</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/medicalequipments" className="btn btn-secondary">
                View Equipment
              </Link>
            </motion.div>

           
          </div>

          {/* Right Side Animation */}
          <motion.div
            className="hero-right"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="animation-container">
              <lottie-player
                src="https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json"
                background="transparent"
                speed="1"
                style={{ width: '500px', height: '500px' }}
                loop
                autoplay
              ></lottie-player>
            </div>
            
            {/* Floating Cards */}
            <motion.div
              className="floating-card card-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="card-icon"></div>
              <div className="card-text">
                <strong>1000+</strong>
                <span>Medicines Available</span>
              </div>
            </motion.div>

            <motion.div
              className="floating-card card-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="card-icon"></div>
              <div className="card-text">
                <strong>500+</strong>
                <span>Equipment Items</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Search Bar Section */}
      <section className="search-section">
        <div className="search-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="search-content"
          >
            <h2>Find What You Need</h2>
            <p>Search across thousands of medical products and services in our trusted community marketplace</p>
            
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, medical equipment, rental services, or donations..."
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </form>
            
            <div className="search-tags">
              <span>Popular: </span>
              <button onClick={() => setSearchQuery('Diabetes medicines')}>Diabetes medicines</button>
              <button onClick={() => setSearchQuery('Oxygen concentrator')}>Oxygen concentrator</button>
              <button onClick={() => setSearchQuery('Wheelchair')}>Wheelchair</button>
              <button onClick={() => setSearchQuery('First aid kit')}>First aid kit</button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;