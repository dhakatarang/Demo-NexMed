import React from 'react';
import css from './MotivationBox.module.css';

const MotivationBox = () => {
  return (
    <div className={css.thoughtsBox}>
      <div className={css.content}>
        <p className={css.thought}>
          "Your unused medicines could be someone's lifeline. 
          Every pill donated is a step toward healthier communities."
        </p>
        <div className={css.divider}></div>
        <p className={css.thought}>
          "Medicines save lives only when they reach those in need. 
          Your donation bridges that gap."
        </p>
      </div>
    </div>
  );
};

export default MotivationBox;