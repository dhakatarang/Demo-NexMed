import React, { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import css from './HeroCarousel.module.css';

const HeroCarousel = () => {
  const carouselItems = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Connecting Healthcare Needs',
      description: 'Join NexMed today to bridge the gap between medicine donors and those in need. Together we can make healthcare accessible to all.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Donate Unused Medicines',
      description: 'Your unused medicines can save lives. Join our platform to donate medicines responsibly and help those who can\'t afford them.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'AI-Powered Healthcare Assistant',
      description: 'Get instant help with our AI Assistant for medicine information, dosage guidance, and healthcare advice.',
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prevIndex) => 
          prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, carouselItems.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className={css.hero}>
      <div 
        className={css.carousel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={css.carouselInner}>
          {carouselItems.map((item, index) => (
            <div 
              key={item.id}
              className={`${css.carouselItem} ${index === currentIndex ? css.active : ''}`}
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className={css.carouselContent}>
                <h1>{item.title}</h1>
                <p>{item.description}</p>
                <Link to="/explore" className={css.signUpBtn}>
                  EXPLORE MORE <FaArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <ul className={css.carouselIndicators}>
          {carouselItems.map((_, index) => (
            <li 
              key={index}
              className={index === currentIndex ? css.active : ''}
              onClick={() => goToSlide(index)}
            ></li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HeroCarousel;