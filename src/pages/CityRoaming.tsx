import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { districts, routes, getCities, getRoutesByDistrict } from '../data/roaming';
import type { District, Route, RelayItem, RoamingTheme } from '../types';
import { roamingThemeConfig } from '../types';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCollections } from '../context/CollectionsContext';
import './CityRoaming.css';

const difficultyLabels: Record<Route['difficulty'], { text: string; icon: string }> = {
  easy: { text: '轻松漫步', icon: '🚶' },
  moderate: { text: '适中探路', icon: '🧭' },
  advanced: { text: '深度探索', icon: '🏔️' }
};

const CityRoaming: React.FC = () => {
  const { signboards, getSignboard } = useSignboards();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { createCollection, addToCollection } = useCollections();

  const [selectedCity, setSelectedCity] = useState<string>('全部城市');
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [roamingTheme, setRoamingTheme] = useState<RoamingTheme>('classic');
  const [relayItems, setRelayItems] = useState<RelayItem[]>(() => {
    const saved = localStorage.getItem('roaming-relay');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedStop, setExpandedStop] = useState<string | null>(null);
  const [showRelayPanel, setShowRelayPanel] = useState(false);

  useEffect(() => {
    localStorage.setItem('roaming-relay', JSON.stringify(relayItems));
  }, [relayItems]);

  const cities = useMemo(() => ['全部城市', ...getCities()], []);

  const filteredDistricts = useMemo(() => {
    if (selectedCity === '全部城市') return districts;
    return districts.filter(d => d.city === selectedCity);
  }, [selectedCity]);

  const currentRouteSignboards = useMemo(() => {
    if (!selectedRoute) return [];
    return selectedRoute.stops
      .sort((a, b) => a.order - b.order)
      .map(stop => {
        const sb = getSignboard(stop.signboardId);
        return sb ? { signboard: sb, note: stop.note, order: stop.order } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [selectedRoute]);

  const districtRoutes = useMemo(() => {
    if (!selectedDistrict) return [];
    return getRoutesByDistrict(selectedDistrict.id);
  }, [selectedDistrict]);

  const addRelayItem = useCallback((signboardId: string, note: string = '') => {
    if (relayItems.some(r => r.signboardId === signboardId)) return;
    setRelayItems(prev => [...prev, { signboardId, collectedAt: Date.now(), note }]);
  }, [relayItems]);

  const removeRelayItem = useCallback((signboardId: string) => {
    setRelayItems(prev => prev.filter(r => r.signboardId !== signboardId));
  }, []);

  const clearRelay = useCallback(() => {
    setRelayItems([]);
  }, []);

  const relaySignboards = useMemo(() => {
    return relayItems
      .map(r => {
        const sb = getSignboard(r.signboardId);
        return sb ? { signboard: sb, note: r.note, collectedAt: r.collectedAt } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [relayItems]);

  const handleCreateRelayCollection = useCallback(() => {
    if (relayItems.length === 0) return;
    const col = createCollection(
      `漫游收藏接力 · ${new Date().toLocaleDateString('zh-CN')}`,
      `漫游途中收集的 ${relayItems.length} 块招牌`
    );
    relayItems.forEach(r => {
      addToCollection(col.id, r.signboardId, r.note);
    });
    setRelayItems([]);
  }, [relayItems, createCollection, addToCollection]);

  const handleSelectRoute = useCallback((route: Route) => {
    setSelectedRoute(route);
    const district = districts.find(d => d.id === route.districtId);
    if (district) setSelectedDistrict(district);
  }, []);

  const handleBackToDistricts = useCallback(() => {
    setSelectedRoute(null);
    setSelectedDistrict(null);
  }, []);

  const handleBackToRoutes = useCallback(() => {
    setSelectedRoute(null);
  }, []);

  const themeConfig = roamingThemeConfig[roamingTheme];

  return (
    <div className="roaming-page" data-roaming-theme={roamingTheme}>
      <div className="roaming-hero">
        <div className="roaming-hero-bg" style={{ backgroundColor: themeConfig.accentColor + '15' }}>
          <div className="roaming-hero-pattern" />
        </div>
        <div className="roaming-hero-content">
          <div className="roaming-hero-badge">🗺️ 城市招牌漫游</div>
          <h2 className="roaming-hero-title">漫步街巷，寻觅百年招牌</h2>
          <p className="roaming-hero-subtitle">
            选择一座城市，走进一条老街，让每一块招牌带你穿越时光
          </p>
          <div className="roaming-hero-stats">
            <div className="roaming-stat">
              <span className="roaming-stat-num">{districts.length}</span>
              <span className="roaming-stat-label">个街区</span>
            </div>
            <div className="roaming-stat-divider">◆</div>
            <div className="roaming-stat">
              <span className="roaming-stat-num">{routes.length}</span>
              <span className="roaming-stat-label">条路线</span>
            </div>
            <div className="roaming-stat-divider">◆</div>
            <div className="roaming-stat">
              <span className="roaming-stat-num">{signboards.length}</span>
              <span className="roaming-stat-label">块招牌</span>
            </div>
          </div>
        </div>
      </div>

      <div className="roaming-theme-bar">
        <span className="theme-bar-label">漫游主题</span>
        <div className="theme-bar-options">
          {(Object.keys(roamingThemeConfig) as RoamingTheme[]).map(key => {
            const cfg = roamingThemeConfig[key];
            return (
              <button
                key={key}
                className={`theme-bar-btn ${roamingTheme === key ? 'active' : ''}`}
                onClick={() => setRoamingTheme(key)}
                style={roamingTheme === key ? { borderColor: cfg.accentColor, backgroundColor: cfg.accentColor + '15' } : {}}
              >
                <span className="theme-bar-icon">{cfg.icon}</span>
                <span className="theme-bar-text">{cfg.label}</span>
              </button>
            );
          })}
        </div>
        <button
          className={`relay-toggle-btn ${showRelayPanel ? 'active' : ''} ${relayItems.length > 0 ? 'has-items' : ''}`}
          onClick={() => setShowRelayPanel(!showRelayPanel)}
        >
          <span>接力</span>
          {relayItems.length > 0 && <span className="relay-toggle-count">{relayItems.length}</span>}
        </button>
      </div>

      {showRelayPanel && (
        <div className="relay-panel">
          <div className="relay-panel-header">
            <h3 className="relay-panel-title">🏅 收藏接力</h3>
            <div className="relay-panel-actions">
              {relayItems.length > 0 && (
                <>
                  <button className="relay-action-btn relay-save-btn" onClick={handleCreateRelayCollection}>
                    保存为藏册
                  </button>
                  <button className="relay-action-btn relay-clear-btn" onClick={clearRelay}>
                    清空
                  </button>
                </>
              )}
              <button className="relay-action-btn relay-close-btn" onClick={() => setShowRelayPanel(false)}>
                收起
              </button>
            </div>
          </div>
          {relaySignboards.length === 0 ? (
            <div className="relay-empty">
              <p>在漫游途中点击「接力收集」按钮，将沿途招牌收入你的接力清单</p>
            </div>
          ) : (
            <div className="relay-list">
              {relaySignboards.map((item, idx) => (
                <div key={item.signboard.id} className="relay-item" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div className="relay-item-order">{idx + 1}</div>
                  <div className="relay-item-image">
                    <img src={item.signboard.image} alt={item.signboard.name} />
                  </div>
                  <div className="relay-item-info">
                    <Link to={`/signboard/${item.signboard.id}`} className="relay-item-name">
                      {item.signboard.name}
                    </Link>
                    <span className="relay-item-location">📍 {item.signboard.location}</span>
                  </div>
                  <button className="relay-item-remove" onClick={() => removeRelayItem(item.signboard.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDistrict && !selectedRoute && (
        <div className="district-entrance-section">
          <div className="district-city-filter">
            {cities.map(city => (
              <button
                key={city}
                className={`city-filter-btn ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city === '全部城市' ? '🏙️ ' + city : city}
              </button>
            ))}
          </div>

          <div className="district-grid">
            {filteredDistricts.map((district, idx) => (
              <div
                key={district.id}
                className="district-card animate-fade-in"
                style={{ animationDelay: `${idx * 0.08}s` }}
                onClick={() => setSelectedDistrict(district)}
              >
                <div className="district-card-image">
                  <img src={district.coverImage} alt={district.name} loading="lazy" />
                  <div className="district-card-overlay" style={{ background: `linear-gradient(to bottom, ${district.color}40, ${district.color}CC)` }}>
                    <span className="district-card-city">{district.city}</span>
                    <h3 className="district-card-name">{district.name}</h3>
                    <div className="district-card-count">
                      {district.signboardIds.length} 块招牌
                    </div>
                  </div>
                </div>
                <div className="district-card-body">
                  <p className="district-card-desc">{district.description}</p>
                  <div className="district-card-landmarks">
                    {district.landmarks.map(lm => (
                      <span key={lm} className="district-landmark-tag">📍 {lm}</span>
                    ))}
                  </div>
                  <div className="district-card-footer">
                    <span className="district-card-enter">进入街区 →</span>
                    <span className="district-card-routes">
                      {getRoutesByDistrict(district.id).length} 条路线
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDistrict && !selectedRoute && (
        <div className="route-section">
          <div className="route-section-header">
            <button className="route-back-btn" onClick={handleBackToDistricts}>
              ← 返回街区
            </button>
            <div className="route-section-title-wrap">
              <h3 className="route-section-title">{selectedDistrict.city}·{selectedDistrict.name}</h3>
              <p className="route-section-subtitle">{selectedDistrict.description}</p>
            </div>
          </div>

          <div className="district-signboard-preview">
            <h4 className="preview-title">街区招牌一览</h4>
            <div className="preview-list">
              {selectedDistrict.signboardIds.map(id => {
                const sb = getSignboard(id);
                if (!sb) return null;
                return (
                  <Link key={id} to={`/signboard/${id}`} className="preview-card">
                    <div className="preview-card-image">
                      <img src={sb.image} alt={sb.name} loading="lazy" />
                    </div>
                    <div className="preview-card-info">
                      <span className="preview-card-name">{sb.name}</span>
                      <span className="preview-card-era">{sb.era} · {sb.fontStyle}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <h4 className="route-list-title">🗺️ 推荐漫游路线</h4>
          <div className="route-list">
            {districtRoutes.map((route, idx) => (
              <div
                key={route.id}
                className="route-card animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => handleSelectRoute(route)}
              >
                <div className="route-card-image">
                  <img src={route.coverImage} alt={route.name} loading="lazy" />
                  <div className="route-card-badge">{difficultyLabels[route.difficulty].icon} {difficultyLabels[route.difficulty].text}</div>
                </div>
                <div className="route-card-body">
                  <h4 className="route-card-name">{route.name}</h4>
                  <p className="route-card-desc">{route.description}</p>
                  <div className="route-card-meta">
                    <span className="route-meta-item">⏱ {route.duration}</span>
                    <span className="route-meta-item">📏 {route.distance}</span>
                    <span className="route-meta-item">🏷️ {route.theme}</span>
                    <span className="route-meta-item">{route.stops.length} 站</span>
                  </div>
                  <div className="route-card-stops-preview">
                    {route.stops.sort((a, b) => a.order - b.order).map((stop, sIdx) => {
                      const sb = getSignboard(stop.signboardId);
                      return (
                        <div key={stop.signboardId} className="route-stop-mini">
                          <span className="route-stop-dot" />
                          {sIdx < route.stops.length - 1 && <span className="route-stop-line" />}
                          <span className="route-stop-name">{sb?.name || '未知'}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button className="route-card-enter">开始漫游 →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRoute && (
        <div className="route-detail-section">
          <div className="route-detail-header">
            <button className="route-back-btn" onClick={handleBackToRoutes}>
              ← 返回路线列表
            </button>
            <div className="route-detail-title-wrap">
              <h3 className="route-detail-title">{selectedRoute.name}</h3>
              <div className="route-detail-meta">
                <span>⏱ {selectedRoute.duration}</span>
                <span>📏 {selectedRoute.distance}</span>
                <span>{difficultyLabels[selectedRoute.difficulty].icon} {difficultyLabels[selectedRoute.difficulty].text}</span>
                <span>🏷️ {selectedRoute.theme}</span>
              </div>
            </div>
          </div>

          <div className="route-map-visual">
            <div className="route-map-line" />
            {currentRouteSignboards.map((item, idx) => {
              const isRelayed = relayItems.some(r => r.signboardId === item.signboard.id);
              const isFav = isFavorite(item.signboard.id);
              const isExpanded = expandedStop === item.signboard.id;
              return (
                <div
                  key={item.signboard.id}
                  className={`route-stop-card ${isExpanded ? 'expanded' : ''} ${isRelayed ? 'relayed' : ''}`}
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  <div className="route-stop-marker">
                    <div className="stop-marker-dot" style={{ borderColor: selectedDistrict?.color || themeConfig.accentColor }} />
                    {idx < currentRouteSignboards.length - 1 && (
                      <div className="stop-marker-connector" style={{ borderColor: selectedDistrict?.color || themeConfig.accentColor }} />
                    )}
                    <span className="stop-marker-label">第 {item.order} 站</span>
                  </div>

                  <div className="route-stop-content" onClick={() => setExpandedStop(isExpanded ? null : item.signboard.id)}>
                    <div className="route-stop-header">
                      <div className="route-stop-image">
                        <img src={item.signboard.image} alt={item.signboard.name} loading="lazy" />
                      </div>
                      <div className="route-stop-info">
                        <h5 className="route-stop-name">{item.signboard.name}</h5>
                        <span className="route-stop-note">{item.note}</span>
                        <div className="route-stop-tags">
                          <span className="route-stop-tag">{item.signboard.era}</span>
                          <span className="route-stop-tag">{item.signboard.fontStyle}</span>
                          <span className="route-stop-tag">{item.signboard.buildingType}</span>
                        </div>
                        <div className="route-stop-colors">
                          {item.signboard.colors.map((c, ci) => (
                            <span key={ci} className="stop-color-dot" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="route-stop-expand">
                        <p className="route-stop-desc">{item.signboard.description}</p>
                        <p className="route-stop-location">📍 {item.signboard.location}</p>
                        <div className="route-stop-actions">
                          <Link to={`/signboard/${item.signboard.id}`} className="stop-action-btn stop-detail-btn">
                            查看详情
                          </Link>
                          <button
                            className={`stop-action-btn stop-fav-btn ${isFav ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.signboard.id); }}
                          >
                            {isFav ? '❤️ 已收藏' : '🤍 收藏'}
                          </button>
                          <button
                            className={`stop-action-btn stop-relay-btn ${isRelayed ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isRelayed) {
                                removeRelayItem(item.signboard.id);
                              } else {
                                addRelayItem(item.signboard.id, item.note);
                              }
                            }}
                          >
                            {isRelayed ? '🏆 已接力' : '🏅 接力收集'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {relayItems.length > 0 && (
            <div className="route-relay-summary">
              <div className="relay-summary-header">
                <h4>🏅 本次漫游已接力 {relayItems.length} 块招牌</h4>
              </div>
              <div className="relay-summary-list">
                {relayItems.map((r, idx) => {
                  const sb = getSignboard(r.signboardId);
                  if (!sb) return null;
                  return (
                    <div key={r.signboardId} className="relay-summary-item">
                      <span className="relay-summary-order">{idx + 1}</span>
                      <img src={sb.image} alt={sb.name} className="relay-summary-img" />
                      <span className="relay-summary-name">{sb.name}</span>
                    </div>
                  );
                })}
              </div>
              <button className="relay-summary-save" onClick={handleCreateRelayCollection}>
                保存为藏册
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CityRoaming;
