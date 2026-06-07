import React from 'react';
import { Link } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import SignboardCard from '../components/SignboardCard';
import './Favorites.css';

const Favorites: React.FC = () => {
  const { getFavoriteSignboards, favorites } = useFavorites();
  const favoriteSignboards = getFavoriteSignboards(signboards);

  return (
    <div className="favorites-page animate-fade-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">❤️ 我的收藏</h1>
          <p className="page-subtitle">
            已收藏 <strong>{favorites.length}</strong> 块珍贵招牌
          </p>
        </div>
        <Link to="/" className="browse-btn">
          继续浏览 →
        </Link>
      </div>

      {favoriteSignboards.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">📚</div>
          <h2>收藏夹还是空的</h2>
          <p>去首页看看那些承载着城市记忆的老招牌吧</p>
          <Link to="/" className="go-btn">去发现招牌</Link>
        </div>
      ) : (
        <div className="masonry-grid">
          {favoriteSignboards.map(signboard => (
            <SignboardCard key={signboard.id} signboard={signboard} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
