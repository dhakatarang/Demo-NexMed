import React, { useState, useEffect } from 'react';
import css from './ImpactDashboard.module.css';

const ImpactDashboard = () => {
  // State for counters (you'll replace these with real API data)
  const [counters, setCounters] = useState({
    medicinesDonated: 0,
    livesImpacted: 0,
    activeDonors: 0,
    communitiesServed: 0
  });

  // Animation effect for counters
  useEffect(() => {
    const targetValues = {
      medicinesDonated: 12543,
      livesImpacted: 8921,
      activeDonors: 2314,
      communitiesServed: 47
    };

    const duration = 3000; // Animation duration in ms
    const increment = 50; // Update interval in ms

    Object.keys(targetValues).forEach(key => {
      const start = 0;
      const end = targetValues[key];
      const step = (end - start) / (duration / increment);

      let current = start;
      const timer = setInterval(() => {
        current += step;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, increment);

      return () => clearInterval(timer);
    });
  }, []);

  return (
    <section className={css.impactDashboard}>
      <h2 className={css.sectionTitle}>Our Impact in Real-Time</h2>
      <p className={css.sectionSubtitle}>Every donation makes a difference</p>
      
      <div className={css.counterGrid}>
        {/* Medicine Donations Counter */}
        <div className={css.counterCard}>
          <div className={css.counterIcon}>💊</div>
          <div className={css.counterWrapper}>
            <span className={css.counterNumber}>
              {counters.medicinesDonated.toLocaleString()}
            </span>
            <span className={css.counterSuffix}>+</span>
          </div>
          <p className={css.counterLabel}>Medicines Donated</p>
        </div>

        {/* Lives Impacted Counter */}
        <div className={css.counterCard}>
          <div className={css.counterIcon}>❤️</div>
          <div className={css.counterWrapper}>
            <span className={css.counterNumber}>
              {counters.livesImpacted.toLocaleString()}
            </span>
            <span className={css.counterSuffix}>+</span>
          </div>
          <p className={css.counterLabel}>Lives Impacted</p>
        </div>

        {/* Active Donors Counter */}
        <div className={css.counterCard}>
          <div className={css.counterIcon}>👥</div>
          <div className={css.counterWrapper}>
            <span className={css.counterNumber}>
              {counters.activeDonors.toLocaleString()}
            </span>
            <span className={css.counterSuffix}>+</span>
          </div>
          <p className={css.counterLabel}>Active Donors</p>
        </div>

        {/* Communities Served Counter */}
        <div className={css.counterCard}>
          <div className={css.counterIcon}>🌍</div>
          <div className={css.counterWrapper}>
            <span className={css.counterNumber}>
              {counters.communitiesServed}
            </span>
          </div>
          <p className={css.counterLabel}>Communities Served</p>
        </div>
      </div>

      <div className={css.updateNote}>
        <span className={css.livePulse}>●</span> Updated in real-time
      </div>
    </section>
  );
};

export default ImpactDashboard;