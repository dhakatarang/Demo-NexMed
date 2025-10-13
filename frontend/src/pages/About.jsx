import React from "react";
import "./About.css";
import aboutImage from "../assets/about.jpg";
import wheelchairImage from "../assets/wheelchair.jpg";

const About = () => {
  return (
    <div className="about-container">
      {/* Mission Section */}
      <div className="mission-section">
        <div className="mission-header">
          <h2 className="mission-title">Our Mission</h2>
          <div className="title-underline"></div>
        </div>
        
      </div>

      {/* Feature 1 */}
      <div className="feature-section">
        <div className="feature-content">
          <div className="feature-text">
            <h3 className="feature-title">
              Medical Equipment Sharing
            </h3>
            <p className="feature-description">
              Our innovative medical equipment sharing platform revolutionizes healthcare accessibility 
        by creating a sustainable ecosystem where underutilized medical devices find new purpose. 
        We bridge the gap between equipment owners and those in temporary need, transforming 
        idle resources into life-changing solutions. From wheelchairs and mobility aids to 
        advanced oxygen concentrators and diagnostic tools, our network ensures that quality 
        medical equipment reaches people when they need it most.
            </p>
            
          </div>
          
          <div className="feature-graphic">
            <img 
              src={wheelchairImage} 
              alt="Medical Equipment Sharing" 
              className="feature-image"
            />
          </div>
        </div>
      </div>

      {/* Feature 2 - Reversed */}
      <div className="feature-section">
        <div className="feature-content reversed">
          <div className="feature-text">
            <h3 className="feature-title">
              Medicine Redistribution
            </h3>
            <p className="feature-description">
              We facilitate the safe and regulated redistribution of unused medicines 
        to patients who cannot afford them. Our verification system ensures 
        all medications meet safety standards before reaching those in need.
        Through strategic partnerships with pharmacies and healthcare providers,
        we create a seamless channel for surplus medications to reach underserved communities.
        Our digital platform tracks every medication from donation to distribution,
        ensuring complete transparency and regulatory compliance at every step.
            </p>
            
          </div>
          
          <div className="feature-graphic">
            <img 
              src={aboutImage} 
              alt="Medicine Redistribution" 
              className="feature-image"
            />
          </div>
        </div>
      </div>



      {/* Final CTA */}
      <div className="cta-section">
        <p className="cta-text">
          Join us in making healthcare accessible to everyone
        </p>
        <button className="cta-button">
          Get Involved Today
        </button>
      </div>
    </div>
  );
};

export default About;