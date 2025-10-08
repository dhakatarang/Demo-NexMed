import React from 'react';
import ArticleCard from '../ArticleCard/ArticleCard';
import css from './ArticleSection.module.css';

const ArticleSection = () => {
  const articles = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      category: 'Donation Guide',
      title: 'How to Responsibly Donate Unused Medicines',
      description: 'Learn the proper way to donate your unused medications to ensure they help those in need while maintaining safety standards.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1913&q=80',
      category: 'Community Impact',
      title: 'Bridging the Healthcare Gap in Underserved Areas',
      description: 'Discover how medicine donation programs are making healthcare more accessible to communities in need.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      category: 'Technology',
      title: 'How AI is Revolutionizing Medicine Distribution',
      description: 'Explore how artificial intelligence helps match donated medicines with those who need them most efficiently.',
    }
  ];

  return (
    <section className={css.articlesSection}>
      <div className={css.container}>
        <h2 className={css.sectionTitle}>Latest Health Insights</h2>
        <p className={css.sectionSubtitle}>Discover valuable information about medicine donation and healthcare</p>
        
        <div className={css.articlesGrid}>
          {articles.map(article => (
            <ArticleCard 
              key={article.id} 
              article={article}
              onReadMore={() => {}}
            />
          ))}
        </div>
        
        <div className={css.ctaBox}>
          <h3>Want to contribute to our health blog?</h3>
          <p>Share your expertise and help educate others about responsible medicine use and donation.</p>
          <button className={css.ctaButton}>Become a Contributor</button>
        </div>
      </div>
    </section>
  );
};

export default ArticleSection;