import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Article3.module.css'

const Article3 = () => {
  return (
    <div className={styles.articleContainer}>
      <article className={styles.articleContent}>
        <header>
          <h1>How AI is Revolutionizing Medicine Distribution</h1>
          <p className={styles.articleMeta}>Technology • 7 min read</p>
        </header>

        <section>
          <h2>The Matching Challenge</h2>
          <p>One of the biggest hurdles in medicine donation is efficiently matching available medications with those who need them most. Artificial intelligence is transforming this process through:</p>
          
          <ul>
            <li><strong>Predictive analytics</strong> - Forecasting medication needs based on population health data</li>
            <li><strong>Real-time inventory matching</strong> - Connecting donors with recipients instantly</li>
            <li><strong>Logistics optimization</strong> - Determining the most efficient distribution routes</li>
          </ul>
        </section>

        <section>
          <h2>Innovative AI Solutions</h2>
          <div className={styles.techFeature}>
            <h3>MedMatch AI</h3>
            <p>This platform uses machine learning to analyze donation patterns and healthcare needs across 12,000+ facilities, reducing medication waste by 37% in pilot programs.</p>
          </div>
          <div className={styles.techFeature}>
            <h3>PharmaChain Blockchain</h3>
            <p>Combining AI with blockchain technology to create transparent, tamper-proof records of medication donations from source to recipient.</p>
          </div>
        </section>

        <section>
          <h2>The Future of Medical Donations</h2>
          <p>Emerging technologies promise to further transform medicine redistribution:</p>
          <ol>
            <li><strong>IoT-enabled smart packaging</strong> - Monitoring temperature and expiration in real-time</li>
            <li><strong>Drone delivery networks</strong> - Reaching remote areas quickly</li>
            <li><strong>Personalized matching algorithms</strong> - Accounting for individual patient needs and allergies</li>
          </ol>
        </section>

        <div className={styles.backButtonContainer}>
          <Link to="/home" className={styles.backButton}>
            Back to Articles
          </Link>
        </div>
      </article>
    </div>
  );
};

export default Article3;