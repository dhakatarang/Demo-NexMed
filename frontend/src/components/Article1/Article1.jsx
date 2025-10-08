import React from 'react';
import styles from './Article1.module.css';
import { useNavigate } from 'react-router-dom';

const Article1 = () => {
  const navigate = useNavigate();

  return (
    <article className={styles.donationGuide}>
      <header className={styles.guideHeader}>
        <h1>How to Responsibly Donate Unused Medicines</h1>
        <p className={styles.introText}>
          Many of us have unused medications sitting in our cabinets - prescriptions we didn't finish, 
          over-the-counter medicines we no longer need, or supplies that have expired. Instead of letting 
          these go to waste or flushing them down the toilet (which can harm the environment), consider 
          donating them to help those in need.
        </p>
      </header>

      <section className={styles.guideSection}>
        <h2>Why Donate Unused Medicines?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>❤️</div>
            <h3>Help Those in Need</h3>
            <p>Many people can't afford their medications, and your donation could be life-saving.</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>♻️</div>
            <h3>Reduce Waste</h3>
            <p>Proper donation prevents usable medicines from ending up in landfills or water systems.</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>🌎</div>
            <h3>Environmental Protection</h3>
            <p>Safe disposal through donation programs prevents pharmaceutical pollution.</p>
          </div>
        </div>
      </section>

      <section className={styles.guideSection}>
        <h2>What Can Be Donated?</h2>
        <div className={styles.acceptanceGrid}>
          <div className={styles.acceptedItems}>
            <h3>✅ Accepted Items</h3>
            <ul>
              <li>Unopened, unexpired prescription medications (in original packaging)</li>
              <li>Sealed over-the-counter medicines</li>
              <li>Unused medical supplies (bandages, syringes in original packaging)</li>
              <li>Non-prescription health products (vitamins, supplements if sealed)</li>
            </ul>
          </div>
          <div className={styles.rejectedItems}>
            <h3>❌ Not Accepted</h3>
            <ul>
              <li>Opened or used medications</li>
              <li>Expired drugs (more than 6 months past expiry)</li>
              <li>Controlled substances (narcotics, opioids)</li>
              <li>Temperature-sensitive medications that weren't properly stored</li>
              <li>Recalled medications</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.guideSection}>
        <h2>How to Prepare Medicines for Donation</h2>
        <ol className={styles.preparationSteps}>
          <li>
            <strong>Check Expiry Dates:</strong> Only donate medicines with at least 6 months before expiration.
          </li>
          <li>
            <strong>Keep Original Packaging:</strong> Leave medicines in their original containers with labels intact.
          </li>
          <li>
            <strong>Remove Personal Information:</strong> Black out your personal details but leave drug information visible.
          </li>
          <li>
            <strong>Sort by Type:</strong> Group similar medications together to help with distribution.
          </li>
          <li>
            <strong>Check Storage Requirements:</strong> Note if any medications require special storage (refrigeration, etc.).
          </li>
        </ol>
      </section>

      <section className={styles.guideSection}>
        <h2>Where to Donate</h2>
        <div className={styles.donationLocations}>
          <div className={styles.locationCard}>
            <h3>Local Pharmacies</h3>
            <p>Many participate in take-back programs.</p>
          </div>
          <div className={styles.locationCard}>
            <h3>Medical Facilities</h3>
            <p>Hospitals and clinics often accept donations.</p>
          </div>
          <div className={styles.locationCard}>
            <h3>Charitable Organizations</h3>
            <p>Look for nonprofits that specialize in medicine redistribution.</p>
          </div>
          <div className={styles.locationCard}>
            <h3>Online Platforms</h3>
            <p>Some websites connect donors with recipients (ensure they're legitimate).</p>
          </div>
        </div>
        <p className={styles.note}><em>*Always call ahead to confirm acceptance policies.*</em></p>
      </section>

      <section className={`${styles.guideSection} ${styles.safetySection}`}>
        <h2>Safety Considerations</h2>
        <ul className={styles.safetyList}>
          <li>Never donate medications that have been stored improperly</li>
          <li>Controlled substances should only be returned to authorized collectors</li>
          <li>If unsure about a medication's suitability for donation, consult a pharmacist</li>
          <li>Follow all local regulations regarding medicine donation</li>
        </ul>
        <div className={styles.closingMessage}>
          <p>By donating responsibly, you can make a real difference in someone's life while protecting public health and the environment.</p>
        </div>
        
        <div className={styles.backButtonContainer}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}  
          >
            ← Back to Articles
          </button>
        </div>
      </section>
    </article>
  );
};

export default Article1;