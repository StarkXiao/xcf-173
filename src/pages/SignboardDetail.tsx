import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import RestorationTimeline from '../components/RestorationTimeline';
import { getNeighborhoodRecommendations } from '../utils/recommendation';
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
  const { toggleFavorite, toggleCompare, addToCompare, maxCompare, isFavorite, isInCompare, compareList } = useFavorites();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const neighborhoodRecommendations = useMemo(() => {
    return getNeighborhoodRecommendations(signboard, signboards, { limit: 6, minScore: 10 });
  }, [signboard]);

  return (
    <div className="detail-container animate-fade-in">
      {toast && (
        <div className={`detail-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
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
              onClick={() => {
                if (isInCompare(signboard.id)) {
                  toggleCompare(signboard.id);
                  showToast('已从对比列表移除', 'warning');
                } else {
                  const result = addToCompare(signboard.id);
                  if (result.success) {
                    showToast(`已加入对比（${compareList.length}/${maxCompare}）`, 'success');
                  } else {
                    showToast(result.reason || '添加失败', 'error');
                  }
                }
              }}
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

      {neighborhoodRecommendations.length > 0 && (
        <div className="neighborhood-section">
          <div className="neighborhood-section-header">
            <div className="neighborhood-title-wrap">
              <h3 className="section-title neighborhood-title">🏘️ 同街区发现</h3>
              <p className="neighborhood-subtitle">
                基于位置、年代和风格智能推荐，发现更多相似的招牌故事
              </p>
            </div>
            <div className="neighborhood-actions">
              <button
                className="batch-compare-btn"
                onClick={() => {
                  let added = 0;
                  let skipped = 0;
                  let failed = 0;
                  neighborhoodRecommendations.forEach(r => {
                    const result = addToCompare(r.signboard.id);
                    if (result.success) added++;
                    else if (result.alreadyIn) skipped++;
                    else failed++;
                  });
                  if (added > 0 && failed === 0) {
                    showToast(`成功加入 ${added} 块招牌（${compareList.length}/${maxCompare}）`, 'success');
                  } else if (added > 0 && failed > 0) {
                    showToast(`加入 ${added} 块，${skipped} 块已在列表，${failed} 块因列表已满未能加入`, 'warning');
                  } else if (added === 0 && failed > 0) {
                    showToast(`对比列表已满（最多 ${maxCompare} 块），请先移除部分招牌`, 'error');
                  } else if (skipped > 0) {
                    showToast(`${skipped} 块招牌已在对比列表中`, 'warning');
                  }
                }}
                title="将所有推荐招牌加入对比"
              >
                ⚖️ 全部加入对比
              </button>
              <Link to="/" className="back-home-link">
                🏠 返回首页 →
              </Link>
            </div>
          </div>

          <div className="neighborhood-grid">
            {neighborhoodRecommendations.map((result, index) => (
              <div key={result.signboard.id} className="neighborhood-card-wrapper" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="neighborhood-card">
                  <Link to={`/signboard/${result.signboard.id}`} className="neighborhood-card-link">
                    <div className="neighborhood-card-image">
                      <img src={result.signboard.image} alt={result.signboard.name} loading="lazy" />
                      <div className="neighborhood-card-overlay">
                        <span className="neighborhood-card-era">{result.signboard.era}</span>
                        <span className="neighborhood-score-badge">
                          匹配度 {result.score}%
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="neighborhood-card-content">
                    <Link to={`/signboard/${result.signboard.id}`} className="neighborhood-card-title-link">
                      <h4 className="neighborhood-card-title">{result.signboard.name}</h4>
                    </Link>
                    <p className="neighborhood-card-shop">{result.signboard.shopName}</p>

                    <div className="neighborhood-match-info">
                      <div className="match-item">
                        <span className="match-icon">📍</span>
                        <span className="match-text">{result.matchDetails.locationMatch}</span>
                      </div>
                      <div className="match-item">
                        <span className="match-icon">🕰️</span>
                        <span className="match-text">{result.matchDetails.eraMatch}</span>
                      </div>
                      <div className="match-item">
                        <span className="match-icon">🎨</span>
                        <span className="match-text">{result.matchDetails.styleMatch}</span>
                      </div>
                    </div>

                    <div className="neighborhood-score-bar">
                      <div className="score-label">综合匹配度</div>
                      <div className="score-track">
                        <div
                          className="score-fill"
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                      <div className="score-value">{result.score}%</div>
                    </div>

                    <div className="neighborhood-score-breakdown">
                      <div className="score-breakdown-item">
                        <span className="breakdown-label">位置</span>
                        <div className="breakdown-bar">
                          <div className="breakdown-fill location-fill" style={{ width: `${result.matchDetails.locationScore}%` }} />
                        </div>
                        <span className="breakdown-value">{result.matchDetails.locationScore}</span>
                      </div>
                      <div className="score-breakdown-item">
                        <span className="breakdown-label">年代</span>
                        <div className="breakdown-bar">
                          <div className="breakdown-fill era-fill" style={{ width: `${result.matchDetails.eraScore}%` }} />
                        </div>
                        <span className="breakdown-value">{result.matchDetails.eraScore}</span>
                      </div>
                      <div className="score-breakdown-item">
                        <span className="breakdown-label">风格</span>
                        <div className="breakdown-bar">
                          <div className="breakdown-fill style-fill" style={{ width: `${result.matchDetails.styleScore}%` }} />
                        </div>
                        <span className="breakdown-value">{result.matchDetails.styleScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignboardDetail;
