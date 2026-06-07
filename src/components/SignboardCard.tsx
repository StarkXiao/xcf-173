import React from 'react';
import { Link } from 'react-router-dom';
import type { Signboard } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import './SignboardCard.css';

interface SignboardCardProps {
  signboard: Signboard;
  showActions?: boolean;
}

const conditionLabels: Record<Signboard['condition'], { text: string; className: string }> = {
  'well-preserved': { text: '保存完好', className: 'condition-good' },
  'weathered': { text: '自然风化', className: 'condition-weathered' },
  'damaged': { text: '有所损坏', className: 'condition-damaged' },
  'restored': { text: '经过修复', className: 'condition-restored' }
};

const SignboardCard: React.FC<SignboardCardProps> = ({ signboard, showActions = true }) => {
  const { toggleFavorite, toggleCompare, isFavorite, isInCompare } = useFavorites();

  return (
    <div className="signboard-card animate-fade-in">
      <Link to={`/signboard/${signboard.id}`} className="card-image-link">
        <div className="card-image">
          <img src={signboard.image} alt={signboard.name} loading="lazy" />
          <div className="card-overlay">
            <span className="card-era">{signboard.era}</span>
            <span className={`card-condition ${conditionLabels[signboard.condition].className}`}>
              {conditionLabels[signboard.condition].text}
            </span>
          </div>
        </div>
      </Link>

      <div className="card-content">
        <Link to={`/signboard/${signboard.id}`} className="card-title-link">
          <h3 className="card-title">{signboard.name}</h3>
        </Link>
        
        <p className="card-shop">{signboard.shopName}</p>

        <div className="card-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>{signboard.year}年</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">✍️</span>
            <span>{signboard.fontStyle}</span>
          </div>
        </div>

        <div className="card-colors">
          {signboard.colors.map((color, idx) => (
            <div
              key={idx}
              className="color-dot"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        <div className="card-tags">
          {signboard.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="card-location">
          <span className="meta-icon">📍</span>
          <span className="location-text">{signboard.location}</span>
        </div>

        {showActions && (
          <div className="card-actions">
            <button
              className={`action-btn favorite-btn ${isFavorite(signboard.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(signboard.id)}
              title={isFavorite(signboard.id) ? '取消收藏' : '加入收藏'}
            >
              <span className="action-icon">{isFavorite(signboard.id) ? '❤️' : '🤍'}</span>
              <span>{isFavorite(signboard.id) ? '已收藏' : '收藏'}</span>
            </button>
            <button
              className={`action-btn compare-btn ${isInCompare(signboard.id) ? 'active' : ''}`}
              onClick={() => toggleCompare(signboard.id)}
              title={isInCompare(signboard.id) ? '移出对比' : '加入对比'}
            >
              <span className="action-icon">{isInCompare(signboard.id) ? '⚖️' : '⚖️'}</span>
              <span>{isInCompare(signboard.id) ? '已对比' : '对比'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignboardCard;
