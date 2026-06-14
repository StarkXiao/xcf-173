import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFontEvolution } from '../context/FontEvolutionContext';
import { useFavorites } from '../context/FavoritesContext';
import SignboardCard from '../components/SignboardCard';
import type { FontEraVariant } from '../types';
import './FontFamilyDetail.css';

const FontFamilyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFontFamily, getSignboardsForFontFamily, getEraVariantsForFontFamily } = useFontEvolution();
  const { toggleFontFamilyFavorite, isFontFamilyFavorite, addToCompare, compareList, maxCompare } = useFavorites();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'signboards'>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const fontFamily = useMemo(() => {
    if (!id) return undefined;
    return getFontFamily(id);
  }, [id, getFontFamily]);

  const signboards = useMemo(() => {
    if (!id) return [];
    return getSignboardsForFontFamily(id);
  }, [id, getSignboardsForFontFamily]);

  const eraVariants = useMemo(() => {
    if (!id) return [];
    return getEraVariantsForFontFamily(id);
  }, [id, getEraVariantsForFontFamily]);

  const showToastMsg = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCompareAll = () => {
    const available = signboards.filter(s => !compareList.includes(s.id));
    const spaceLeft = maxCompare - compareList.length;
    
    if (spaceLeft <= 0) {
      showToastMsg('对比列表已满', 'error');
      return;
    }
    
    const toAdd = available.slice(0, spaceLeft);
    toAdd.forEach(s => addToCompare(s.id));
    showToastMsg(`已添加 ${toAdd.length} 块招牌到对比`, 'success');
  };

  if (!fontFamily) {
    return (
      <div className="font-detail-page animate-fade-in">
        <div className="not-found">
          <div className="not-found-icon">🔍</div>
          <h2>未找到该字体家族</h2>
          <Link to="/font-evolution" className="back-btn">返回字体档案</Link>
        </div>
      </div>
    );
  }

  const difficultyLabels: Record<string, string> = {
    basic: '入门级',
    intermediate: '进阶级',
    advanced: '专家级'
  };

  return (
    <div className="font-detail-page animate-fade-in">
      {toast && (
        <div className={`detail-toast detail-toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="detail-back">
        <button onClick={() => navigate('/font-evolution')}>
          ← 返回字体流变档案
        </button>
      </div>

      <div className="font-detail-header" style={{ borderTopColor: fontFamily.color }}>
        <div className="font-detail-icon" style={{ backgroundColor: fontFamily.color + '20', color: fontFamily.color }}>
          {fontFamily.icon}
        </div>
        <div className="font-detail-title">
          <h1 style={{ color: fontFamily.color }}>{fontFamily.name}</h1>
          <p className="font-english">{fontFamily.englishName}</p>
          <div className="font-meta-tags">
            <span className="meta-tag">起源：{fontFamily.originEra}</span>
            <span className="meta-tag">风格：{fontFamily.style}</span>
            <span className="meta-tag">难度：{difficultyLabels[fontFamily.difficulty]}</span>
          </div>
        </div>
        <div className="font-detail-actions">
          <button
            className={`action-btn ${isFontFamilyFavorite(id || '') ? 'active' : ''}`}
            onClick={() => {
              toggleFontFamilyFavorite(id || '');
              showToastMsg(isFontFamilyFavorite(id || '') ? '已取消收藏' : '已收藏字体', 'success');
            }}
          >
            {isFontFamilyFavorite(id || '') ? '❤️ 已收藏' : '🤍 收藏字体'}
          </button>
          <button className="action-btn primary" onClick={handleCompareAll}>
            ⚖️ 全部对比
          </button>
          <Link to="/favorites" className="action-btn">
            📋 查看收藏
          </Link>
        </div>
      </div>

      <div className="font-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 字体概览
        </button>
        <button
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          📅 演变历程
        </button>
        <button
          className={`tab-btn ${activeTab === 'signboards' ? 'active' : ''}`}
          onClick={() => setActiveTab('signboards')}
        >
          🪧 招牌样本 ({signboards.length})
        </button>
      </div>

      <div className="font-tab-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-main">
              <div className="description-card">
                <h3>📜 字体简介</h3>
                <p>{fontFamily.description}</p>
              </div>

              <div className="features-card">
                <h3>✨ 字体特征</h3>
                <div className="features-grid">
                  <div className="feature-item">
                    <div className="feature-label">笔画特点</div>
                    <div className="feature-value">{fontFamily.features.strokes}</div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-label">整体气质</div>
                    <div className="feature-value">{fontFamily.features.feeling}</div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-label">流行年代</div>
                    <div className="feature-value">{fontFamily.features.era}</div>
                  </div>
                </div>
                <div className="feature-tags">
                  {fontFamily.features.features.map((f, idx) => (
                    <span key={idx} className="feature-tag-large" style={{ borderColor: fontFamily.color }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="metrics-card">
              <h3>📊 维度评分</h3>
              <div className="metrics-list">
                <div className="metric-item-large">
                  <div className="metric-header">
                    <span className="metric-name">易读性</span>
                    <span className="metric-score" style={{ color: fontFamily.color }}>
                      {fontFamily.readability}
                    </span>
                  </div>
                  <div className="metric-bar-large">
                    <div
                      className="metric-fill-large"
                      style={{ width: `${fontFamily.readability}%`, backgroundColor: fontFamily.color }}
                    />
                  </div>
                </div>
                <div className="metric-item-large">
                  <div className="metric-header">
                    <span className="metric-name">艺术价值</span>
                    <span className="metric-score" style={{ color: fontFamily.color }}>
                      {fontFamily.artisticValue}
                    </span>
                  </div>
                  <div className="metric-bar-large">
                    <div
                      className="metric-fill-large"
                      style={{ width: `${fontFamily.artisticValue}%`, backgroundColor: fontFamily.color }}
                    />
                  </div>
                </div>
                <div className="metric-item-large">
                  <div className="metric-header">
                    <span className="metric-name">历史意义</span>
                    <span className="metric-score" style={{ color: fontFamily.color }}>
                      {fontFamily.historicalSignificance}
                    </span>
                  </div>
                  <div className="metric-bar-large">
                    <div
                      className="metric-fill-large"
                      style={{ width: `${fontFamily.historicalSignificance}%`, backgroundColor: fontFamily.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="timeline-section">
            <div className="era-timeline">
              {eraVariants.map((variant: FontEraVariant, index: number) => (
                <div key={index} className="era-timeline-item">
                  <div className="era-timeline-marker" style={{ backgroundColor: fontFamily.color }}>
                    {index + 1}
                  </div>
                  <div className="era-timeline-content">
                    <div className="era-timeline-header">
                      <h3 style={{ color: fontFamily.color }}>{variant.era}</h3>
                      <span className="era-year-range">{variant.yearRange}</span>
                    </div>
                    <p className="era-timeline-desc">{variant.description}</p>
                    
                    <div className="era-characteristics">
                      <h4>🔹 风格特点</h4>
                      <div className="char-tags">
                        {variant.characteristics.map((char, idx) => (
                          <span key={idx} className="char-tag">
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="era-representative">
                      <h4>🏆 代表作品</h4>
                      <div className="rep-works">
                        {variant.representativeWorks.map((work, idx) => (
                          <span key={idx} className="rep-work">
                            {work}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'signboards' && (
          <div className="signboards-section">
            <div className="signboards-header">
              <h3>🪧 使用该字体的招牌样本</h3>
              <p>共 {signboards.length} 块招牌</p>
            </div>
            {signboards.length === 0 ? (
              <div className="empty-signboards">
                <div className="empty-icon">📭</div>
                <p>暂无该字体的招牌样本</p>
              </div>
            ) : (
              <div className="signboards-grid">
                {signboards.map(signboard => (
                  <SignboardCard key={signboard.id} signboard={signboard} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FontFamilyDetail;
