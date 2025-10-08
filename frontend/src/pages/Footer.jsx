import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import css from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={css.footer}>
      <div className={css.container}>
        {/* Main Footer Content */}
        <div className={css.grid}>
          <div className={css.brandColumn}>
            <h3 className={css.logo}>NexMed</h3>
            <p className={css.description}>
              Connecting medicine donors with those in need through safe and responsible distribution.
            </p>
            <div className={css.socials}>
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
          </div>

          <div className={css.linksColumn}>
            <h4 className={css.heading}>Quick Links</h4>
            <ul className={css.links}>
              <li><a href="#">Home</a></li>
              <li><a href="#">Donate</a></li>
              <li><a href="#">Request</a></li>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          <div className={css.linksColumn}>
            <h4 className={css.heading}>Legal</h4>
            <ul className={css.links}>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Disclaimer</a></li>
              <li><a href="#">Safety</a></li>
            </ul>
          </div>

          <div className={css.newsletterColumn}>
            <h4 className={css.heading}>Stay Updated</h4>
            <form className={css.newsletter}>
              <input 
                type="email" 
                placeholder="Your email" 
                className={css.input} 
                required 
              />
              <button type="submit" className={css.button}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={css.bottom}>
          <p className={css.copyright}>
            &copy; {new Date().getFullYear()} NexMed. All rights reserved.
          </p>
          <p className={css.disclaimer}>
            Note: NexMed facilitates medicine redistribution but does not provide medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;