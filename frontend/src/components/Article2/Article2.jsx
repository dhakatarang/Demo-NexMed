import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Article2.module.css'

const Article2 = () => {
  return (
    <div className={styles.articleContainer}>
      <article className={styles.articleContent}>
        <header>
          <h1>Bridging the Healthcare Gap in Underserved Areas</h1>
          <p className={styles.articleMeta}>Community Impact • 6 min read</p>
        </header>

        <section>
          <h2>The Global Medicine Access Crisis</h2>
          <p>While developed nations struggle with medication surpluses, nearly 2 billion people worldwide lack access to essential medicines. This disparity creates preventable suffering and perpetuates health inequities across socioeconomic and geographic lines.</p>
          
          <h3>The Impact of Medicine Donation Programs</h3>
          <ul>
            <li><strong>Rural clinics:</strong> Providing critical supplies to remote healthcare facilities</li>
            <li><strong>Disaster relief:</strong> Emergency medical aid during crises</li>
            <li><strong>Low-income patients:</strong> Helping those who must choose between medicine and basic necessities</li>
          </ul>
        </section>

        <section>
          <h2>Success Stories</h2>
          <div className={styles.caseStudy}>
            <h3>Appalachian Health Initiative</h3>
            <p>This program redistributed over $12 million worth of medicines to rural clinics in Kentucky and West Virginia, serving communities devastated by the opioid crisis and economic downturn.</p>
          </div>
          <div className={styles.caseStudy}>
            <h3>Global Health Share</h3>
            <p>A nonprofit that partners with pharmaceutical companies to redirect near-expiry medicines to developing nations, preventing waste while saving lives.</p>
          </div>
        </section>

        <section>
          <h2>How You Can Help</h2>
          <ol>
            <li><strong>Donate responsibly</strong> - Follow proper guidelines for medicine donation</li>
            <li><strong>Volunteer</strong> - Many organizations need help with sorting and distribution</li>
            <li><strong>Advocate</strong> - Support policies that facilitate safe medicine redistribution</li>
            <li><strong>Educate</strong> - Spread awareness about proper donation practices</li>
          </ol>
        </section>

        <div className={styles.backButtonContainer}>
          <Link to="/home" className={styles.backButton}>
            ← Back to Articles
          </Link>
        </div>
      </article>
    </div>
  );
};

export default Article2;