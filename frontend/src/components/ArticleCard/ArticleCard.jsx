import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import css from './ArticleCard.module.css';

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const getArticlePath = (id) => {
    switch(id) {
      case 1: return '/articles/medicine-donation';
      case 2: return '/articles/healthcare-gap';
      case 3: return '/articles/ai-medicine';
      default: return '/';
    }
  };

  const handleReadMore = () => {
    navigate(getArticlePath(article.id));
  };

  return (
    <article className={css.articleCard}>
      <div className={css.articleImage}>
        <img src={article.image} alt={article.title} />
      </div>
      <div className={css.articleContent}>
        <span className={css.articleCategory}>{article.category}</span>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <button onClick={handleReadMore} className={css.readMore}>
          Read More <FaArrowRight />
        </button>
      </div>
    </article>
  );
};

export default ArticleCard;