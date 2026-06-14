import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { tourRoutes, getTourById } from '../data/exhibitions';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import './TourPage.css';

const difficultyLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  easy: { label: '轻松', color: '#22c55e', bgColor: '#f0fdf4' },
  moderate: { label: '适中', color: '#f59e0b', bgColor: '#fffbeb' },
  advanced: { label: '深入', color: '#ef4444', bgColor: '#fef2f2' }
};

const TourPage: React.FC = () => {
  const { tourId, stopIndex } = useParams<{ tourId?: string; stopIndex?: string }>();
  const { getSignboard } = useSignboards();
  const { addToCompare, compareList, maxCompare } = useFavorites();
  const [selectedTour, setSelectedTour] = useState<string | null>(tourId || null);
  const [currentStop, setCurrentStop] = useState<number>(stopIndex ? parseInt(stopIndex) - 1 : 0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  const currentTour = useMemo(() => {
    if (selectedTour) {
      return getTourById(selectedTour);
    }
    return null;
  }, [selectedTour]);

  const stopSignboards = useMemo(() => {
    if (!currentTour) return [];
    return currentTour.stops
      .map(stop => ({
        ...stop,
        signboard: getSignboard(stop.signboardId)
      }))
      .filter(stop => stop.signboard !== undefined);
  }, [currentTour, getSignboard]);

  const handleStartTour = (tourId: string) => {
    setSelectedTour(tourId);
    setCurrentStop(0);
  };

  const handleNextStop = () => {
    if (!currentTour) return;
    if (currentStop < currentTour.stops.length - 1) {
      setCurrentStop(prev => prev + 1);
    }
  };

  const handlePrevStop = () => {
    if (currentStop > 0) {
      setCurrentStop(prev => prev - 1);
    }
  };

  const handleAddAllToCompare = () => {
    if (!currentTour) return;
    let added = 0;
    let skipped = 0;
    let failed = 0;
    stopSignboards.forEach(stop => {
      if (stop.signboard) {
        const result = addToCompare(stop.signboard.id);
        if (result.success) added++;
        else if (result.alreadyIn) skipped++;
        else failed++;
      }
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

  if (!currentTour) {
    return (
      <div className="tour-page animate-fade-in">
        {toast && (
          <div className={`tour-toast toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        )}

        <div className="tour-hero">
          <Link to="/exhibition" className="back-link">← 返回展厅首页</Link>
          <div className="tour-hero-content">
            <div className="hero-icon">🗺️</div>
            <h1 className="tour-hero-title">展厅导览</h1>
            <p className="tour-hero-subtitle">Exhibition Tour Guide</p>
            <p className="tour-hero-desc">
              精选 {tourRoutes.length} 条主题导览路线，跟随专业策展人的脚步，
              <br />
              深入探索每一块招牌背后的故事与文化
            </p>
            <div className="tour-stats">
              <div className="stat-item">
                <span className="stat-number">{tourRoutes.length}</span>
                <span className="stat-label">条导览路线</span>
              </div>
              <div className="stat-divider">|</div>
              <div className="stat-item">
                <span className="stat-number">
                  {new Set(tourRoutes.flatMap(t => t.stops.map(s => s.signboardId))).size}
                </span>
                <span className="stat-label">个精选展品</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tour-routes-section">
          <h2 className="section-title">🎯 选择导览路线</h2>
          <div className="tour-routes-grid">
            {tourRoutes.map((route, index) => (
              <div
                key={route.id}
                className="tour-route-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="route-header"
                  style={{
                    background: `linear-gradient(135deg, ${route.color}15 0%, ${route.color}08 100%)`,
                    borderLeftColor: route.color
                  }}
                >
                  <div className="route-icon" style={{ color: route.color }}>
                    {route.icon}
                  </div>
                  <div className="route-title-wrap">
                    <h3 className="route-name">{route.name}</h3>
                    <span
                      className="difficulty-badge"
                      style={{
                        color: difficultyLabels[route.difficulty].color,
                        backgroundColor: difficultyLabels[route.difficulty].bgColor
                      }}
                    >
                      {difficultyLabels[route.difficulty].label}
                    </span>
                  </div>
                </div>

                <div className="route-body">
                  <p className="route-desc">{route.description}</p>

                  <div className="route-meta">
                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <span className="meta-text">{route.duration}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📏</span>
                      <span className="meta-text">{route.distance}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📦</span>
                      <span className="meta-text">{route.stops.length} 件展品</span>
                    </div>
                  </div>

                  <div className="route-stops-preview">
                    <span className="stops-label">展品预览：</span>
                    <div className="stops-avatars">
                      {route.stops.slice(0, 5).map((stop, idx) => {
                        const sb = getSignboard(stop.signboardId);
                        return sb ? (
                          <div
                            key={stop.signboardId}
                            className="stop-avatar"
                            style={{ zIndex: 5 - idx }}
                            title={sb.name}
                          >
                            <img src={sb.image} alt={sb.name} />
                          </div>
                        ) : null;
                      })}
                      {route.stops.length > 5 && (
                        <div className="stop-avatar more-avatar">
                          <span>+{route.stops.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="route-footer">
                  <button
                    className="start-tour-btn"
                    style={{ backgroundColor: route.color }}
                    onClick={() => handleStartTour(route.id)}
                  >
                    开始导览 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tour-tips-section">
          <div className="tips-card">
            <h3 className="tips-title">💡 参观小贴士</h3>
            <div className="tips-grid">
              <div className="tip-item">
                <div className="tip-icon">🎧</div>
                <div className="tip-content">
                  <h4>建议佩戴耳机</h4>
                  <p>沉浸体验更佳，可聆听语音讲解</p>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">📸</div>
                <div className="tip-content">
                  <h4>拍照打卡</h4>
                  <p>记录你最爱的展品，分享给朋友</p>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">📝</div>
                <div className="tip-content">
                  <h4>收藏展品</h4>
                  <p>加入收藏夹，随时回顾经典</p>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">⚖️</div>
                <div className="tip-content">
                  <h4>对比分析</h4>
                  <p>使用对比功能，深入研究展品差异</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStopData = stopSignboards[currentStop];
  const progress = ((currentStop + 1) / currentTour.stops.length) * 100;

  return (
    <div className="tour-detail-page animate-fade-in">
      {toast && (
        <div className={`tour-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      <div className="tour-header-bar">
        <button className="back-btn" onClick={() => setSelectedTour(null)}>
          ← 选择路线
        </button>
        <div className="tour-title-mini">
          <span className="tour-icon">{currentTour.icon}</span>
          <span className="tour-name">{currentTour.name}</span>
        </div>
        <button className="compare-all-btn" onClick={handleAddAllToCompare}>
          ⚖️ 全部加入对比
        </button>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <span className="progress-label">参观进度</span>
          <span className="progress-count">
            {currentStop + 1} / {currentTour.stops.length}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%`, backgroundColor: currentTour.color }}
          />
        </div>
        <div className="progress-stops">
          {currentTour.stops.map((stop, idx) => (
            <div
              key={stop.signboardId}
              className={`progress-dot ${idx < currentStop ? 'completed' : idx === currentStop ? 'current' : 'upcoming'}`}
              onClick={() => setCurrentStop(idx)}
              style={{
                backgroundColor: idx <= currentStop ? currentTour.color : '#e0e0e0'
              }}
              title={`第${idx + 1}站`}
            />
          ))}
        </div>
      </div>

      <div className="tour-content">
        <div className="stop-image-section">
          <div className="stop-number-badge" style={{ backgroundColor: currentTour.color }}>
            第 {currentStop + 1} 站
          </div>
          {currentStopData?.signboard && (
            <div className="stop-image-frame">
              <img
                src={currentStopData.signboard.image}
                alt={currentStopData.signboard.name}
              />
            </div>
          )}
        </div>

        <div className="stop-info-section">
          {currentStopData?.signboard && (
            <>
              <div className="stop-header">
                <h2 className="stop-title">{currentStopData.signboard.name}</h2>
                <p className="stop-shop-name">{currentStopData.signboard.shopName}</p>
              </div>

              <div className="stop-highlight">
                <div className="highlight-icon">💡</div>
                <div className="highlight-content">
                  <h4 className="highlight-title">导览重点</h4>
                  <p className="highlight-text">{currentStopData.highlight}</p>
                </div>
              </div>

              <div className="stop-meta-grid">
                <div className="stop-meta-item">
                  <span className="meta-icon">📅</span>
                  <span className="meta-label">年代</span>
                  <span className="meta-value">{currentStopData.signboard.era}</span>
                </div>
                <div className="stop-meta-item">
                  <span className="meta-icon">📍</span>
                  <span className="meta-label">位置</span>
                  <span className="meta-value">{currentStopData.signboard.location}</span>
                </div>
                <div className="stop-meta-item">
                  <span className="meta-icon">✍️</span>
                  <span className="meta-label">字体</span>
                  <span className="meta-value">{currentStopData.signboard.fontStyle}</span>
                </div>
                <div className="stop-meta-item">
                  <span className="meta-icon">🏠</span>
                  <span className="meta-label">建筑</span>
                  <span className="meta-value">{currentStopData.signboard.buildingType}</span>
                </div>
              </div>

              <div className="stop-description">
                <h4 className="desc-title">📜 展品介绍</h4>
                <p className="desc-text">{currentStopData.signboard.description}</p>
              </div>

              <div className="stop-actions">
                <Link
                  to={`/exhibition/exhibit/${currentStopData.signboard.id}`}
                  className="detail-link-btn"
                >
                  查看完整展品详情 →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="tour-nav-buttons">
        <button
          className="nav-btn prev-btn"
          onClick={handlePrevStop}
          disabled={currentStop === 0}
        >
          ← 上一站
        </button>
        <Link to="/exhibition/compare" className="nav-btn compare-link-btn">
          ⚖️ 去对比
        </Link>
        {currentStop === currentTour.stops.length - 1 ? (
          <button
            className="nav-btn next-btn finish-btn"
            style={{ backgroundColor: currentTour.color }}
            onClick={() => setSelectedTour(null)}
          >
            完成参观 ✓
          </button>
        ) : (
          <button
            className="nav-btn next-btn"
            style={{ backgroundColor: currentTour.color }}
            onClick={handleNextStop}
          >
            下一站 →
          </button>
        )}
      </div>

      <div className="stops-list-section">
        <h3 className="stops-list-title">📋 全部展品</h3>
        <div className="stops-list">
          {stopSignboards.map((stop, idx) => (
            <div
              key={stop.signboardId}
              className={`stops-list-item ${idx === currentStop ? 'active' : ''}`}
              onClick={() => setCurrentStop(idx)}
              style={{
                borderLeftColor: idx < currentStop ? currentTour.color : idx === currentStop ? currentTour.color : '#e0e0e0'
              }}
            >
              <div
                className="stop-index"
                style={{
                  backgroundColor: idx <= currentStop ? currentTour.color : '#e0e0e0',
                  color: idx <= currentStop ? 'white' : '#999'
                }}
              >
                {idx < currentStop ? '✓' : idx + 1}
              </div>
              <div className="stop-thumb">
                {stop.signboard && <img src={stop.signboard.image} alt={stop.signboard.name} />}
              </div>
              <div className="stop-info">
                <span className="stop-name">{stop.signboard?.name}</span>
                <span className="stop-era">{stop.signboard?.era}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourPage;
