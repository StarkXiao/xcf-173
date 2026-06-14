import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import { getExhibitionsContainingSignboard } from '../data/exhibitions';
import RestorationTimeline from '../components/RestorationTimeline';
import { conditionStatusLabels } from '../types';
import type { ConditionStatus } from '../types';
import './ExhibitDetail.css';

const conditionLabels: Record<string, { text: string; className: string }> = {
  'well-preserved': { text: '保存完好', className: 'good' },
  'weathered': { text: '自然风化', className: 'weathered' },
  'damaged': { text: '有所损坏', className: 'damaged' },
  'restored': { text: '经过修复', className: 'restored' }
};

const ExhibitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSignboard, signboards } = useSignboards();
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

  const signboard = id ? getSignboard(id) : undefined;

  const exhibitionsContaining = useMemo(() => {
    if (!id) return [];
    return getExhibitionsContainingSignboard(id);
  }, [id]);

  const relatedSignboards = useMemo(() => {
    if (!signboard) return [];
    return signboards
      .filter(s => s.id !== signboard.id && s.fontStyle === signboard.fontStyle)
      .slice(0, 4);
  }, [signboard, signboards]);

  if (!signboard) {
    return (
      <div className="exhibit-detail-container">
        <div className="not-found">
          <div className="not-found-icon">🏺</div>
          <h2>未找到该展品</h2>
          <p>可能已被移出展厅或不存在</p>
          <Link to="/exhibition" className="back-link">← 返回展厅</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="exhibit-detail-container animate-fade-in">
      {toast && (
        <div className={`exhibit-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      <div className="exhibit-breadcrumb">
        <Link to="/exhibition" className="breadcrumb-link">招牌展陈馆</Link>
        <span className="breadcrumb-separator">/</span>
        {exhibitionsContaining.length > 0 && (
          <>
            <Link to="/exhibition" className="breadcrumb-link">
              {exhibitionsContaining[0].name}
            </Link>
            <span className="breadcrumb-separator">/</span>
          </>
        )}
        <span className="breadcrumb-current">{signboard.name}</span>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <div className="exhibit-hero">
        <div className="exhibit-image-section">
          <div className="exhibit-image-frame">
            <div className="exhibit-image">
              <img src={signboard.image} alt={signboard.name} />
            </div>
            <div className="exhibit-magnifier">🔍</div>
          </div>
          <div className="exhibit-image-caption">
            <span className="caption-icon">📷</span>
            <span className="caption-text">展品实拍图</span>
          </div>
        </div>

        <div className="exhibit-info-section">
          <div className="exhibit-header">
            <div className="exhibit-number-badge">
              展品编号 #{signboard.id}
            </div>
            <div className="exhibit-tags">
              <span className="exhibit-era-tag">{signboard.era}</span>
              <span
                className={`exhibit-condition-tag condition-${conditionLabels[signboard.condition as ConditionStatus].className}`}
                style={{
                  borderColor: conditionStatusLabels[signboard.condition as ConditionStatus].color,
                  color: conditionStatusLabels[signboard.condition as ConditionStatus].color
                }}
              >
                {conditionStatusLabels[signboard.condition as ConditionStatus].icon} {conditionLabels[signboard.condition as ConditionStatus].text}
              </span>
            </div>
            <h1 className="exhibit-title">{signboard.name}</h1>
            <p className="exhibit-shop-name">{signboard.shopName}</p>
          </div>

          <div className="exhibit-meta-grid">
            <div className="exhibit-meta-item">
              <span className="meta-icon">📅</span>
              <div className="meta-content">
                <span className="meta-label">创立年份</span>
                <span className="meta-value">{signboard.year}年</span>
              </div>
            </div>
            <div className="exhibit-meta-item">
              <span className="meta-icon">📍</span>
              <div className="meta-content">
                <span className="meta-label">所在位置</span>
                <span className="meta-value">{signboard.location}</span>
              </div>
            </div>
            <div className="exhibit-meta-item">
              <span className="meta-icon">🏠</span>
              <div className="meta-content">
                <span className="meta-label">建筑类型</span>
                <span className="meta-value">{signboard.buildingType}</span>
              </div>
            </div>
            <div className="exhibit-meta-item">
              <span className="meta-icon">✍️</span>
              <div className="meta-content">
                <span className="meta-label">字体风格</span>
                <span className="meta-value">{signboard.fontStyle}</span>
              </div>
            </div>
          </div>

          <div className="exhibit-colors-section">
            <h3 className="exhibit-section-title">🎨 招牌配色</h3>
            <div className="exhibit-colors-display">
              {signboard.colors.map((color, idx) => (
                <div key={idx} className="exhibit-color-block">
                  <div className="color-swatch-large" style={{ backgroundColor: color }} />
                  <div className="color-info">
                    <span className="color-name">
                      {idx === 0 ? '主色（底色）' : idx === 1 ? '辅色（字色）' : '点缀色'}
                    </span>
                    <span className="color-code">{color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="exhibit-actions">
            <button
              className={`exhibit-action-btn favorite-btn ${isFavorite(signboard.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(signboard.id)}
            >
              <span>{isFavorite(signboard.id) ? '❤️' : '🤍'}</span>
              <span>{isFavorite(signboard.id) ? '已收藏' : '加入收藏'}</span>
            </button>
            <button
              className={`exhibit-action-btn compare-btn ${isInCompare(signboard.id) ? 'active' : ''}`}
              onClick={() => {
                if (isInCompare(signboard.id)) {
                  toggleCompare(signboard.id);
                  showToast('已从对比列表移除', 'warning');
                } else {
                  const result = addToCompare(signboard.id);
                  if (result.success) {
                    showToast(`已加入对比（${compareList.length + 1}/${maxCompare}）`, 'success');
                  } else {
                    showToast(result.reason || '添加失败', 'error');
                  }
                }
              }}
            >
              <span>⚖️</span>
              <span>{isInCompare(signboard.id) ? '移出对比' : '加入对比'}</span>
            </button>
            <Link to="/exhibition/compare" className="exhibit-action-btn goto-compare-btn">
              <span>📊</span>
              <span>前往对比区</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="exhibit-description-section">
        <div className="section-header-line">
          <h2 className="exhibit-main-title">📜 展品介绍</h2>
        </div>
        <div className="exhibit-description-content">
          <p>{signboard.description}</p>
        </div>
      </div>

      <div className="exhibit-exhibitions-section">
        <div className="section-header-line">
          <h2 className="exhibit-main-title">🏛️ 所属展厅</h2>
        </div>
        <div className="exhibit-exhibition-tags">
          {exhibitionsContaining.map(exhibition => (
            <Link
              key={exhibition.id}
              to="/exhibition"
              className="exhibition-tag-card"
              style={{ borderLeftColor: exhibition.accentColor }}
            >
              <span className="tag-icon">{exhibition.icon}</span>
              <div className="tag-info">
                <span className="tag-name">{exhibition.name}</span>
                <span className="tag-desc">{exhibition.subtitle}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="exhibit-timeline-section">
        <div className="section-header-line">
          <h2 className="exhibit-main-title">⏳ 修缮历程</h2>
        </div>
        <RestorationTimeline history={signboard.restorationHistory} />
      </div>

      {relatedSignboards.length > 0 && (
        <div className="exhibit-related-section">
          <div className="section-header-line">
            <h2 className="exhibit-main-title">🔗 相关展品</h2>
            <p className="section-subtitle">相似字体风格的其他展品</p>
          </div>
          <div className="related-exhibits-grid">
            {relatedSignboards.map(related => (
              <Link
                key={related.id}
                to={`/exhibition/exhibit/${related.id}`}
                className="related-exhibit-card"
              >
                <div className="related-exhibit-image">
                  <img src={related.image} alt={related.name} loading="lazy" />
                </div>
                <div className="related-exhibit-info">
                  <h4 className="related-exhibit-name">{related.name}</h4>
                  <span className="related-exhibit-era">{related.era}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="exhibit-nav-buttons">
        <Link to="/exhibition" className="nav-btn nav-btn-secondary">
          ← 返回展厅首页
        </Link>
        <Link to="/exhibition/tour" className="nav-btn nav-btn-primary">
          开始导览 →
        </Link>
      </div>
    </div>
  );
};

export default ExhibitDetail;
