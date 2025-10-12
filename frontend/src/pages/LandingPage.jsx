import React from 'react';
import { useNavigate } from 'react-router-dom';
import medicalImage from '../assets/medical-hero.jpg';
import './LandingPage.css';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* Header/Navigation */}
            <header className="landing-header">
                <div className="logo">
                    NexMed
                </div>
                
                <button 
                    className="auth-btn"
                    onClick={() => navigate('/signup')}
                >
                    SignUp/Login
                </button>
            </header>

            {/* Main Content */}
            <main className="landing-main">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Donate, Buy, or Rent Medical Supplies
                        </h1>
                        <p className="hero-description">
                            Empowering communities to share and access medical essentials — donate, buy, or rent with NexMed.
                        </p>
                        <button 
                            className="hero-cta-btn"
                            onClick={() => navigate('/signup')}
                        >
                            Get Started
                        </button>
                    </div>
                       <div className="hero-image">
                        <img 
                            src={medicalImage} 
                            alt="Medical Supplies" 
                            className="hero-img" 
                        />
                    </div>
                </div>

                {/* Articles Section */}
                <div className="articles-section">
                    <h2 className="section-title">Latest Articles</h2>
                    <div className="articles-grid">
                        <div className="article-card">
                            <h3>Medical Equipment Sharing</h3>
                            <p>Learn how sharing medical resources can benefit communities and reduce healthcare costs.</p>
                        </div>
                        <div className="article-card">
                            <h3>Affordable Healthcare</h3>
                            <p>Discover how our platform makes medical supplies accessible to everyone.</p>
                        </div>
                        <div className="article-card">
                            <h3>Community Impact</h3>
                            <p>Read stories about how our community is making a difference in healthcare access.</p>
                        </div>
                    </div>
                </div>

                {/* Community Section */}
                <div className="community-section">
                    <div className="community-content">
                        <h2>Join Our Community</h2>
                        <p>Be part of a network that's transforming healthcare accessibility through sharing and collaboration.</p>
                        <button 
                            className="community-btn"
                            onClick={() => navigate('/signup')}
                        >
                            Join Community
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>NexMed</h4>
                        <p>Making healthcare accessible through community sharing.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#services">Services</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact</h4>
                        <p>Email: info@nexmed.com</p>
                        <p>Phone: +1 (555) 123-4567</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 NexMed. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
