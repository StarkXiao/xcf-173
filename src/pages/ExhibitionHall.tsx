import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { exhibitionThemes, getExhibitionById, getSignboardsForExhibition } from '../data/exhibitions';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import SignboardCard from '../components/SignboardCard';
import './ExhibitionHall.css';

const ExhibitionHall: React.FC = () => {
  const { themeId } = useParams<{ themeId?: string }>();
  const { signboards } = useSignboards();
  const { addToCompare, compareList, maxCompare } = useFavorites();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(themeId || null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  const currentTheme = useMemo(() => {
    if (selectedTheme) {
      return getExhibitionById(selectedTheme);
    }
    return null;
  }, [selectedTheme]);

  const themeSignboards = useMemo(() => {
    if (!currentTheme) return [];
    return getSignboardsForExhibition(currentTheme.id, signboards);
  }, [currentTheme, signboards]);

  const handleAddAllToCompare = () => {
    if (!currentTheme) return;
    let added = 0;
    let skipped = 0;
    let failed = 0;
    themeSignboards.forEach(s => {
      const result = addToCompare(s.id);
      if (result.success) added++;
      else if (result.alreadyIn) skipped++;
      else failed++;
    });
    if (added > 0 && failed === 0) {
      showToast(`成功加入 ${added} 块招牌（${compareList.length + added}/${maxCompare}）`, 'success');
    } else if (added > 0 && failed > 0) {
      showToast(`加入 ${added} 块，${skipped} 块已在列表，${failed} 块因列表已满未能加入`, 'warning');
    } else if (added === 0 && failed > 0) {
      showToast(`对比列表已满（最多 ${maxCompare} 块），请先移除部分招牌`, 'error');
    } else if (skipped > 0) {
      showToast(`${skipped} 块招牌已在对比列表中`, 'warning');
    }
  };

  if (!currentTheme) {
    return (
      <div className="exhibition-hall-page animate-fade-in">
        {toast && (
          <div className={`exhibition-toast toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        )}
        
        <div className="exhibition-hero">
          <div className="exhibition-hero-content">
            <div className="hero-decor">❖ ◆ ❖</div>
            <h1 className="exhibition-hero-title">招牌展陈馆</h1>
            <p className="exhibition-hero-subtitle">Signboard Exhibition Hall</p>
            <p className="exhibition-hero-desc">
              按主题策展，带你领略百年老店招牌的独特魅力<br />
              从书法艺术到色彩美学，从民国风尚到地域文化
            </p>
            <div className="exhibition-stats">
              <div className="stat-item">
                <span className="stat-number">{exhibitionThemes.length}</span>
                <span className="stat-label">个主题展厅</span>
              </div>
              <div className="stat-divider">|</div>
              <div className="stat-item">
                <span className="stat-number">
                  {new Set(exhibitionThemes.flatMap(t => t.signboardIds)).size}
                </span>
                <span className="stat-label">件馆藏展品</span>
              </div>
              <div className="stat-divider">|</div>
              <div className="stat-item">
                <span className="stat-number">4</span>
                <span className="stat-label">条精选导览路线</span>
              </div>
            </div>
          </div>
        </div>

        <div className="themes-section">
          <div className="section-header">
            <h2 className="section-title">🖼️ 主题展厅</h2>
            <p className="section-subtitle">选择一个主题，开启你的招牌文化之旅</p>
          </div>

          <div className="themes-grid">
            {exhibitionThemes.map((theme, index) => (
              <div
                key={theme.id}
                className="theme-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div
                  className="theme-card-bg"
                  style={{
                    background: `linear-gradient(135deg, ${theme.bgColor} 0%, ${theme.bgColor}dd 100%)`,
                  }}
                />
                <div className="theme-card-content">
                  <div
                    className="theme-icon-wrap"
                    style={{ backgroundColor: theme.accentColor + '20' }}
                  >
                    <span className="theme-icon">{theme.icon}</span>
                  </div>
                  <h3 className="theme-name" style={{ color: theme.accentColor }}>
                    {theme.name}
                  </h3>
                  <p className="theme-subtitle">{theme.subtitle}</p>
                  <p className="theme-desc">{theme.description}</p>
                  <div className="theme-meta">
                    <span className="theme-count">
                      📦 {theme.signboardIds.length} 件展品
                    </span>
                    <span className="theme-tags">
                      {theme.tags.map(tag => (
                        <span key={tag} className="mini-tag">#{tag}</span>
                      ))}
                    </span>
                  </div>
                  <button className="enter-btn" style={{ backgroundColor: theme.accentColor }}>
                    进入展厅 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tour-teaser-section">
          <div className="section-header">
            <h2 className="section-title">🗺️ 精选导览路线</h2>
            <p className="section-subtitle">跟随专业策展人，深度探索招牌文化</p>
          </div>
          <div className="tour-teaser-cards">
            <Link to="/exhibition/tour" className="tour-teaser-card">
              <div className="tour-teaser-icon">⭐</div>
              <div className="tour-teaser-info">
                <h4>经典精华游</h4>
                <p>约45分钟 · 5件展品</p>
              </div>
              <span className="tour-arrow">→</span>
            </Link>
            <Link to="/exhibition/tour" className="tour-teaser-card">
              <div className="tour-teaser-icon">🖌️</div>
              <div className="tour-teaser-info">
                <h4>书法艺术深度游</h4>
                <p>约60分钟 · 6件展品</p>
              </div>
              <span className="tour-arrow">→</span>
            </Link>
            <Link to="/exhibition/tour" className="tour-teaser-card">
              <div className="tour-teaser-icon">⏳</div>
              <div className="tour-teaser-info">
                <h4>历史穿越之旅</h4>
                <p>约90分钟 · 9件展品</p>
              </div>
              <span className="tour-arrow">→</span>
            </Link>
          </div>
          <div className="view-all-tours">
            <Link to="/exhibition/tour" className="view-all-btn">
              查看全部导览路线 →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exhibition-detail-page animate-fade-in">
      {toast && (
        <div className={`exhibition-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      <button className="back-btn" onClick={() => setSelectedTheme(null)}>
        ← 返回展厅首页
      </button>

      <div
        className="theme-detail-hero"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.bgColor} 0%, ${currentTheme.bgColor}ee 100%)`,
        }}
      >
        <div className="theme-detail-hero-content">
          <div
            className="theme-detail-icon"
            style={{
              backgroundColor: currentTheme.accentColor + '20',
              color: currentTheme.accentColor,
            }}
          >
            <span>{currentTheme.icon}</span>
          </div>
          <div className="theme-detail-header">
            <h1 className="theme-detail-title" style={{ color: currentTheme.accentColor }}>
              {currentTheme.name}
            </h1>
            <p className="theme-detail-subtitle">{currentTheme.subtitle}</p>
          </div>
          <p className="theme-detail-desc">{currentTheme.description}</p>
          <div className="theme-detail-tags">
            {currentTheme.tags.map(tag => (
              <span key={tag} className="theme-tag">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="curator-note-section">
        <div className="curator-note-card">
          <div className="curator-icon">💡</div>
          <div className="curator-content">
            <h4 className="curator-title">策展人寄语</h4>
            <p className="curator-text">{currentTheme.curatorNote}</p>
          </div>
        </div>
      </div>

      <div className="exhibition-signboards-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <h2 className="section-title">📦 馆藏展品</h2>
            <span className="exhibit-count">
              共 {themeSignboards.length} 件展品
            </span>
          </div>
          <div className="section-actions">
            <button
              className="add-all-compare-btn"
              onClick={handleAddAllToCompare}
              disabled={compareList.length >= maxCompare}
            >
              ⚖️ 全部加入对比
            </button>
            <Link to="/exhibition/compare" className="go-compare-btn">
              📊 前往对比区
            </Link>
          </div>
        </div>

        <div className="exhibition-signboards-grid">
          {themeSignboards.map((signboard, index) => (
            <div
              key={signboard.id}
              className="exhibit-item-wrapper"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="exhibit-item">
                <div className="exhibit-number" style={{ backgroundColor: currentTheme.accentColor }}>
                  #{index + 1}
                </div>
                <SignboardCard signboard={signboard} />
                <div className="exhibit-actions">
                  <Link
                    to={`/exhibition/exhibit/${signboard.id}`}
                    className="view-detail-btn"
                    style={{ color: currentTheme.accentColor }}
                  >
                    查看展品详情 →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="related-themes-section">
        <h3 className="related-title">🔗 相关主题展厅</h3>
        <div className="related-themes-list">
          {exhibitionThemes
            .filter(t => t.id !== currentTheme.id)
            .slice(0, 3)
            .map(theme => (
              <button
                key={theme.id}
                className="related-theme-chip"
                onClick={() => setSelectedTheme(theme.id)}
                style={{ borderColor: theme.accentColor + '40' }}
              >
                <span className="chip-icon">{theme.icon}</span>
                <span className="chip-name">{theme.name}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExhibitionHall;
