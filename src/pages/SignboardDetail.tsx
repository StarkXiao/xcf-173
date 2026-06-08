import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import SignboardCard from '../components/SignboardCard';
import RestorationTimeline from '../components/RestorationTimeline';
import './SignboardDetail.css';

const conditionLabels: Record<string, { text: string; className: string }> = {
  'well-preserved': { text: '保存完好', className: 'good' },
  'weathered': { text: '自然风化', className: 'weathered' },
  'damaged': { text: '有所损坏', className: 'damaged' },
  'restored': { text: '经过修复', className: 'restored' }
};

const SignboardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, toggleCompare, isFavorite, isInCompare } = useFavorites();

  const signboard = signboards.find(s => s.id === id);

  if (!signboard) {
    return (
      <div className="detail-container">
        <div className="not-found">
          <div className="not-found-icon">📜</div>
          <h2>未找到该招牌</h2>
          <p>可能已被归档或不存在</p>
          <Link to="/" className="back-link">← 返回首页</Link>
        </div>
      </div>
    );
  }

  const relatedSignboards = signboards
    .filter(s =>
      s.id !== signboard.id && (
        s.era === signboard.era ||
        s.fontStyle === signboard.fontStyle ||
        s.tags.some(t => signboard.tags.includes(t))
      )
    )
    .slice(0, 3);

  return (
    <div className="detail-container animate-fade-in">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <div className="detail-hero">
        <div className="detail-image-wrap">
          <div className="detail-image">
            <img src={signboard.image} alt={signboard.name} />
            <div className="image-overlay">
              <div className="overlay-decor-left">❖</div>
              <div className="overlay-decor-right">❖</div>
            </div>
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-header">
            <div className="detail-tags">
              <span className="detail-era-tag">{signboard.era}</span>
              <span className={`detail-condition-tag condition-${conditionLabels[signboard.condition].className}`}>
                {conditionLabels[signboard.condition].text}
              </span>
            </div>
            <h1 className="detail-title">{signboard.name}</h1>
            <p className="detail-shop">{signboard.shopName}</p>
          </div>

          <div className="detail-meta">
            <div className="meta-row">
              <span className="meta-icon">📅</span>
              <span className="meta-label">创立年份</span>
              <span className="meta-value">{signboard.year}年</span>
            </div>
            <div className="meta-row">
              <span className="meta-icon">📍</span>
              <span className="meta-label">所在位置</span>
              <span className="meta-value">{signboard.location}</span>
            </div>
            <div className="meta-row">
              <span className="meta-icon">🏠</span>
              <span className="meta-label">建筑类型</span>
              <span className="meta-value">{signboard.buildingType}</span>
            </div>
            <div className="meta-row">
              <span className="meta-icon">✍️</span>
              <span className="meta-label">字体风格</span>
              <span className="meta-value">{signboard.fontStyle}（{signboard.fontFamily}）</span>
            </div>
          </div>

          <div className="detail-colors">
            <h3 className="section-title">🎨 招牌配色</h3>
            <div className="colors-display">
              {signboard.colors.map((color, idx) => (
                <div key={idx} className="color-block">
                  <div className="color-swatch" style={{ backgroundColor: color }} />
                  <span className="color-code">{color}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-tags-section">
            <h3 className="section-title">🏷️ 标签</h3>
            <div className="tags-list">
              {signboard.tags.map(tag => (
                <span key={tag} className="detail-tag">#{tag}</span>
              ))}
            </div>
          </div>

          <div className="detail-actions">
            <button
              className={`detail-action-btn favorite-btn ${isFavorite(signboard.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(signboard.id)}
            >
              <span>{isFavorite(signboard.id) ? '❤️' : '🤍'}</span>
              <span>{isFavorite(signboard.id) ? '取消收藏' : '加入收藏'}</span>
            </button>
            <button
              className={`detail-action-btn compare-btn ${isInCompare(signboard.id) ? 'active' : ''}`}
              onClick={() => toggleCompare(signboard.id)}
            >
              <span>⚖️</span>
              <span>{isInCompare(signboard.id) ? '移出对比' : '加入对比'}</span>
            </button>
            {isInCompare(signboard.id) && (
              <Link to="/compare" className="detail-action-btn goto-compare-btn">
                <span>📊</span>
                <span>前往对比</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="detail-description">
        <h3 className="section-title">📜 招牌故事</h3>
        <div className="description-content">
          <p>{signboard.description}</p>
        </div>
      </div>

      <RestorationTimeline history={signboard.restorationHistory} />

      {relatedSignboards.length > 0 && (
        <div className="related-section">
          <div className="related-section-header">
            <h3 className="section-title">🔗 相关招牌</h3>
            <div className="related-actions">
              <button
                className="batch-compare-btn"
                onClick={() => {
                  relatedSignboards.forEach(s => {
                    if (!isInCompare(s.id)) toggleCompare(s.id);
                  });
                }}
                title="将所有相关招牌加入对比"
              >
                ⚖️ 全部加入对比
              </button>
              <Link to="/compare" className="goto-compare-link">
                📊 前往对比页 →
              </Link>
            </div>
          </div>
          <div className="related-grid">
            {relatedSignboards.map(s => (
              <SignboardCard key={s.id} signboard={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignboardDetail;
