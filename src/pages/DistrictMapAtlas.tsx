import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { districts, routes, getRoutesByDistrict, getCities } from '../data/roaming';
import type { District, Route, Signboard } from '../types';
import { conditionStatusLabels } from '../types';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import SignboardCard from '../components/SignboardCard';
import './DistrictMapAtlas.css';

type ViewMode = 'map' | 'grid' | 'cluster';
type ClusterType = 'era' | 'fontStyle' | 'condition';

const DistrictMapAtlas: React.FC = () => {
  const { signboards, getSignboard } = useSignboards();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [selectedCity, setSelectedCity] = useState<string>('全部');
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [clusterType, setClusterType] = useState<ClusterType>('era');
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  const cities = useMemo(() => ['全部', ...getCities()], []);

  const filteredDistricts = useMemo(() => {
    let result = [...districts];
    if (selectedCity !== '全部') {
      result = result.filter(d => d.city === selectedCity);
    }
    if (showFavoritesOnly) {
      result = result.filter(d =>
        d.signboardIds.some(id => isFavorite(id))
      );
    }
    return result;
  }, [selectedCity, showFavoritesOnly, isFavorite]);

  const districtSignboards = useMemo(() => {
    if (!selectedDistrict) return [];
    return selectedDistrict.signboardIds
      .map(id => getSignboard(id))
      .filter((sb): sb is Signboard => sb !== undefined);
  }, [selectedDistrict, getSignboard]);

  const districtRoutes = useMemo(() => {
    if (!selectedDistrict) return [];
    return getRoutesByDistrict(selectedDistrict.id);
  }, [selectedDistrict]);

  const routeStopsDetail = useMemo(() => {
    if (!selectedRoute) return [];
    return selectedRoute.stops
      .sort((a, b) => a.order - b.order)
      .map(stop => {
        const sb = getSignboard(stop.signboardId);
        return sb ? { signboard: sb, note: stop.note, order: stop.order } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [selectedRoute, getSignboard]);

  const favoriteCountInDistrict = useCallback((district: District) => {
    return district.signboardIds.filter(id => isFavorite(id)).length;
  }, [isFavorite]);

  const totalStats = useMemo(() => {
    const totalSignboards = signboards.length;
    const totalFavorites = favorites.length;
    const totalDistricts = districts.length;
    const totalRoutes = routes.length;
    const citiesCovered = getCities().length;
    return { totalSignboards, totalFavorites, totalDistricts, totalRoutes, citiesCovered };
  }, [signboards, favorites]);

  const cityMapPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; districts: District[] }> = {};
    districts.forEach(d => {
      if (!positions[d.city]) {
        positions[d.city] = { x: 0, y: 0, districts: [] };
      }
      positions[d.city].districts.push(d);
    });
    const layout = [
      { city: '北京', x: 420, y: 120 },
      { city: '上海', x: 560, y: 280 },
      { city: '杭州', x: 520, y: 340 },
      { city: '广州', x: 440, y: 480 },
      { city: '香港', x: 470, y: 520 },
    ];
    layout.forEach(l => {
      if (positions[l.city]) {
        positions[l.city].x = l.x;
        positions[l.city].y = l.y;
      }
    });
    return positions;
  }, []);

  const getDistrictOffset = (_district: District, index: number, total: number) => {
    const angle = (index / Math.max(total, 1)) * Math.PI * 2;
    const radius = 45 + total * 8;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  const clusterData = useMemo(() => {
    const allDistrictSignboards = filteredDistricts.flatMap(d =>
      d.signboardIds.map(id => getSignboard(id)).filter((sb): sb is Signboard => sb !== undefined)
    );
    const filtered = showFavoritesOnly
      ? allDistrictSignboards.filter(sb => isFavorite(sb.id))
      : allDistrictSignboards;

    const groups: Record<string, Signboard[]> = {};
    filtered.forEach(sb => {
      let key: string;
      switch (clusterType) {
        case 'era':
          key = sb.era;
          break;
        case 'fontStyle':
          key = sb.fontStyle;
          break;
        case 'condition':
          key = conditionStatusLabels[sb.condition].text;
          break;
        default:
          key = sb.era;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(sb);
    });
    return groups;
  }, [filteredDistricts, getSignboard, clusterType, showFavoritesOnly, isFavorite]);

  const handleBack = () => {
    if (selectedRoute) {
      setSelectedRoute(null);
    } else if (selectedDistrict) {
      setSelectedDistrict(null);
    }
  };

  const difficultyLabels: Record<Route['difficulty'], { text: string; icon: string }> = {
    easy: { text: '轻松漫步', icon: '🚶' },
    moderate: { text: '适中探路', icon: '🧭' },
    advanced: { text: '深度探索', icon: '🏔️' }
  };

  const clusterLabels: Record<ClusterType, { label: string; icon: string }> = {
    era: { label: '年代', icon: '📅' },
    fontStyle: { label: '字体', icon: '✍️' },
    condition: { label: '状态', icon: '🏷️' }
  };

  return (
    <div className="atlas-page">
      <div className="atlas-hero">
        <div className="atlas-hero-bg">
          <div className="atlas-grid-pattern" />
        </div>
        <div className="atlas-hero-content">
          <div className="atlas-hero-badge">🗺️ 街区招牌地图册</div>
          <h1 className="atlas-hero-title">按图索骥，寻觅街巷招牌</h1>
          <p className="atlas-hero-subtitle">
            以地图视角俯瞰招牌分布，点击街区探索招牌集群，沿着推荐路线打卡百年老店
          </p>
          <div className="atlas-stats">
            <div className="atlas-stat">
              <span className="atlas-stat-icon">🏙️</span>
              <span className="atlas-stat-num">{totalStats.citiesCovered}</span>
              <span className="atlas-stat-label">座城市</span>
            </div>
            <div className="atlas-stat-divider" />
            <div className="atlas-stat">
              <span className="atlas-stat-icon">📍</span>
              <span className="atlas-stat-num">{totalStats.totalDistricts}</span>
              <span className="atlas-stat-label">个街区</span>
            </div>
            <div className="atlas-stat-divider" />
            <div className="atlas-stat">
              <span className="atlas-stat-icon">🪧</span>
              <span className="atlas-stat-num">{totalStats.totalSignboards}</span>
              <span className="atlas-stat-label">块招牌</span>
            </div>
            <div className="atlas-stat-divider" />
            <div className="atlas-stat">
              <span className="atlas-stat-icon">🧭</span>
              <span className="atlas-stat-num">{totalStats.totalRoutes}</span>
              <span className="atlas-stat-label">条路线</span>
            </div>
            <div className="atlas-stat-divider" />
            <div className="atlas-stat">
              <span className="atlas-stat-icon">❤️</span>
              <span className="atlas-stat-num">{totalStats.totalFavorites}</span>
              <span className="atlas-stat-label">已收藏</span>
            </div>
          </div>
        </div>
      </div>

      <div className="atlas-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-label">城市筛选</span>
          <div className="city-chips">
            {cities.map(city => (
              <button
                key={city}
                className={`city-chip ${selectedCity === city ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCity(city);
                  setSelectedDistrict(null);
                  setSelectedRoute(null);
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-center">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
              title="地图视图"
            >
              <span className="view-icon">🗺️</span>
              <span>地图</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="网格视图"
            >
              <span className="view-icon">▦</span>
              <span>网格</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'cluster' ? 'active' : ''}`}
              onClick={() => setViewMode('cluster')}
              title="聚合视图"
            >
              <span className="view-icon">◈</span>
              <span>聚合</span>
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            className={`fav-filter-btn ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <span>{showFavoritesOnly ? '❤️' : '🤍'}</span>
            <span>仅看收藏</span>
          </button>
        </div>
      </div>

      {!selectedDistrict && !selectedRoute && (
        <>
          {viewMode === 'map' && (
            <div className="map-view-section">
              <div className="map-container">
                <svg viewBox="0 0 800 620" className="china-map-svg" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <pattern id="paperTexture" patternUnits="userSpaceOnUse" width="100" height="100">
                      <rect width="100" height="100" fill="#F5E6C8" />
                      <circle cx="20" cy="30" r="1" fill="#D4C4A0" opacity="0.3" />
                      <circle cx="70" cy="60" r="0.5" fill="#D4C4A0" opacity="0.4" />
                      <circle cx="40" cy="80" r="0.8" fill="#D4C4A0" opacity="0.2" />
                    </pattern>
                  </defs>

                  <rect width="800" height="620" fill="url(#paperTexture)" rx="16" />

                  <path
                    d="M150,80 Q200,50 300,70 Q400,40 500,80 Q580,60 650,120 Q700,160 680,250 Q720,320 680,400 Q660,480 580,520 Q500,560 420,540 Q340,560 280,500 Q200,520 160,440 Q100,380 120,300 Q80,220 150,80Z"
                    fill="#E8DCC0"
                    stroke="#C4A97A"
                    strokeWidth="2"
                  />

                  <path
                    d="M180,120 Q250,100 350,120 Q450,100 520,140 Q580,180 560,260 Q600,320 570,400 Q550,460 490,490 Q420,520 370,500 Q300,520 250,470 Q180,490 160,420 Q110,370 130,290 Q90,210 180,120Z"
                    fill="#F0E6D0"
                    stroke="#D4BFA0"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />

                  {Object.entries(cityMapPositions).map(([city, pos]) => {
                    if (selectedCity !== '全部' && selectedCity !== city) return null;
                    return (
                      <g key={city} className="city-marker-group">
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="28"
                          fill="rgba(139, 69, 19, 0.15)"
                          className="city-pulse-ring"
                        />
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="18"
                          fill="#8B4513"
                          className="city-main-dot"
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {city}
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y + 48}
                          textAnchor="middle"
                          fill="#5D4037"
                          fontSize="11"
                          fontWeight="600"
                        >
                          {pos.districts.length} 个街区
                        </text>

                        {pos.districts.map((district, idx) => {
                          const offset = getDistrictOffset(district, idx, pos.districts.length);
                          const dx = pos.x + offset.x;
                          const dy = pos.y + offset.y;
                          const favCount = favoriteCountInDistrict(district);
                          return (
                            <g
                              key={district.id}
                              className="district-marker"
                              onClick={() => setSelectedDistrict(district)}
                              style={{ cursor: 'pointer' }}
                            >
                              <line
                                x1={pos.x}
                                y1={pos.y}
                                x2={dx}
                                y2={dy}
                                stroke={district.color}
                                strokeWidth="1.5"
                                strokeDasharray="3,3"
                                opacity="0.6"
                              />
                              <circle
                                cx={dx}
                                cy={dy}
                                r="14"
                                fill={district.color}
                                stroke="white"
                                strokeWidth="2"
                                className="district-dot"
                              />
                              <text
                                x={dx}
                                y={dy + 3}
                                textAnchor="middle"
                                fill="white"
                                fontSize="9"
                                fontWeight="600"
                              >
                                {district.signboardIds.length}
                              </text>
                              <text
                                x={dx}
                                y={dy + 26}
                                textAnchor="middle"
                                fill="#5D4037"
                                fontSize="10"
                                fontWeight="500"
                              >
                                {district.name}
                              </text>
                              {favCount > 0 && (
                                <text
                                  x={dx + 12}
                                  y={dy - 10}
                                  fontSize="10"
                                >
                                  ❤️{favCount}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="map-legend">
                <div className="legend-title">地图图例</div>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-dot city-dot" />
                    <span>城市中心</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot district-dot" />
                    <span>街区（数字为招牌数）</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon">❤️</span>
                    <span>已收藏数量</span>
                  </div>
                </div>
                <div className="legend-tip">点击街区圆点查看详情</div>
              </div>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid-view-section">
              <div className="district-grid">
                {filteredDistricts.map((district, idx) => {
                  const favCount = favoriteCountInDistrict(district);
                  return (
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
                            <span>🪧 {district.signboardIds.length} 块招牌</span>
                            {favCount > 0 && <span>❤️ {favCount} 已收藏</span>}
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
                  );
                })}
              </div>
              {filteredDistricts.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">🗺️</span>
                  <p>没有找到符合条件的街区</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'cluster' && (
            <div className="cluster-view-section">
              <div className="cluster-toolbar">
                <span className="cluster-label">聚合维度</span>
                <div className="cluster-toggle">
                  {(Object.keys(clusterLabels) as ClusterType[]).map(type => (
                    <button
                      key={type}
                      className={`cluster-btn ${clusterType === type ? 'active' : ''}`}
                      onClick={() => {
                        setClusterType(type);
                        setExpandedCluster(null);
                      }}
                    >
                      <span>{clusterLabels[type].icon}</span>
                      <span>{clusterLabels[type].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cluster-grid">
                {Object.entries(clusterData).map(([groupName, signboardsList], idx) => {
                  const isExpanded = expandedCluster === groupName;
                  return (
                    <div
                      key={groupName}
                      className={`cluster-card ${isExpanded ? 'expanded' : ''} animate-fade-in`}
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      <div
                        className="cluster-card-header"
                        onClick={() => setExpandedCluster(isExpanded ? null : groupName)}
                      >
                        <div className="cluster-title-wrap">
                          <h3 className="cluster-title">{groupName}</h3>
                          <span className="cluster-count">{signboardsList.length} 块招牌</span>
                        </div>
                        <div className="cluster-preview">
                          {signboardsList.slice(0, 4).map(sb => (
                            <div key={sb.id} className="cluster-preview-item">
                              <img src={sb.image} alt={sb.name} />
                            </div>
                          ))}
                          {signboardsList.length > 4 && (
                            <div className="cluster-preview-more">
                              +{signboardsList.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="cluster-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                      </div>

                      {isExpanded && (
                        <div className="cluster-card-content">
                          <div className="cluster-signboards">
                            {signboardsList.map(sb => (
                              <div key={sb.id} className="cluster-signboard-item">
                                <SignboardCard signboard={sb} showActions={true} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {Object.keys(clusterData).length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">◈</span>
                  <p>没有找到符合条件的招牌</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedDistrict && !selectedRoute && (
        <div className="district-detail-section">
          <div className="detail-header">
            <button className="back-btn" onClick={handleBack}>
              ← 返回地图
            </button>
            <div className="detail-title-wrap">
              <div className="detail-breadcrumb">
                <span>{selectedDistrict.city}</span>
                <span className="breadcrumb-sep">·</span>
                <span className="current">{selectedDistrict.name}</span>
              </div>
              <h2 className="detail-title" style={{ color: selectedDistrict.color }}>
                {selectedDistrict.name}
              </h2>
              <p className="detail-subtitle">{selectedDistrict.description}</p>
            </div>
          </div>

          <div className="district-info-cards">
            <div className="info-card">
              <span className="info-card-icon">🪧</span>
              <span className="info-card-num">{districtSignboards.length}</span>
              <span className="info-card-label">块招牌</span>
            </div>
            <div className="info-card">
              <span className="info-card-icon">🧭</span>
              <span className="info-card-num">{districtRoutes.length}</span>
              <span className="info-card-label">条路线</span>
            </div>
            <div className="info-card">
              <span className="info-card-icon">❤️</span>
              <span className="info-card-num">{favoriteCountInDistrict(selectedDistrict)}</span>
              <span className="info-card-label">已收藏</span>
            </div>
            <div className="info-card">
              <span className="info-card-icon">📍</span>
              <span className="info-card-label">地标</span>
              <div className="info-card-landmarks">
                {selectedDistrict.landmarks.map(lm => (
                  <span key={lm} className="landmark-chip">{lm}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="district-section">
            <div className="section-header">
              <h3 className="section-title">🪧 街区招牌</h3>
              <span className="section-count">{districtSignboards.length} 块</span>
            </div>
            <div className="signboards-grid">
              {districtSignboards.map(sb => (
                <SignboardCard key={sb.id} signboard={sb} />
              ))}
            </div>
          </div>

          <div className="district-section">
            <div className="section-header">
              <h3 className="section-title">🧭 推荐路线</h3>
              <span className="section-count">{districtRoutes.length} 条</span>
            </div>
            <div className="routes-grid">
              {districtRoutes.map((route, idx) => (
                <div
                  key={route.id}
                  className="route-card animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="route-card-image">
                    <img src={route.coverImage} alt={route.name} loading="lazy" />
                    <div className="route-card-badge">
                      {difficultyLabels[route.difficulty].icon} {difficultyLabels[route.difficulty].text}
                    </div>
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
                            <span className="route-stop-dot" style={{ backgroundColor: selectedDistrict.color }} />
                            {sIdx < route.stops.length - 1 && <span className="route-stop-line" />}
                            <span className="route-stop-name">{sb?.name || '未知'}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button className="route-card-enter" style={{ borderColor: selectedDistrict.color, color: selectedDistrict.color }}>
                      查看路线 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRoute && selectedDistrict && (
        <div className="route-detail-section">
          <div className="detail-header">
            <button className="back-btn" onClick={handleBack}>
              ← 返回街区
            </button>
            <div className="detail-title-wrap">
              <div className="detail-breadcrumb">
                <span>{selectedDistrict.city}</span>
                <span className="breadcrumb-sep">·</span>
                <Link to="#" onClick={handleBack} className="breadcrumb-link">{selectedDistrict.name}</Link>
                <span className="breadcrumb-sep">·</span>
                <span className="current">路线</span>
              </div>
              <h2 className="detail-title" style={{ color: selectedDistrict.color }}>
                {selectedRoute.name}
              </h2>
              <div className="route-detail-meta">
                <span>⏱ {selectedRoute.duration}</span>
                <span>📏 {selectedRoute.distance}</span>
                <span>{difficultyLabels[selectedRoute.difficulty].icon} {difficultyLabels[selectedRoute.difficulty].text}</span>
                <span>🏷️ {selectedRoute.theme}</span>
              </div>
              <p className="detail-subtitle">{selectedRoute.description}</p>
            </div>
          </div>

          <div className="route-map-visual">
            <div className="route-map-line" style={{ background: selectedDistrict.color }} />
            {routeStopsDetail.map((item, idx) => {
              const isFav = isFavorite(item.signboard.id);
              return (
                <div
                  key={item.signboard.id}
                  className="route-stop-card animate-fade-in"
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  <div className="route-stop-marker">
                    <div className="stop-marker-dot" style={{ borderColor: selectedDistrict.color }} />
                    {idx < routeStopsDetail.length - 1 && (
                      <div className="stop-marker-connector" style={{ borderColor: selectedDistrict.color }} />
                    )}
                    <span className="stop-marker-label">第 {item.order} 站</span>
                  </div>

                  <div className="route-stop-content">
                    <Link to={`/signboard/${item.signboard.id}`} className="route-stop-image-link">
                      <div className="route-stop-image">
                        <img src={item.signboard.image} alt={item.signboard.name} loading="lazy" />
                      </div>
                    </Link>
                    <div className="route-stop-info">
                      <Link to={`/signboard/${item.signboard.id}`} className="route-stop-name-link">
                        <h4 className="route-stop-name">{item.signboard.name}</h4>
                      </Link>
                      <p className="route-stop-note">{item.note}</p>
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
                      <div className="route-stop-actions">
                        <Link to={`/signboard/${item.signboard.id}`} className="stop-detail-btn">
                          查看详情 →
                        </Link>
                        <button
                          className={`stop-fav-btn ${isFav ? 'active' : ''}`}
                          onClick={() => toggleFavorite(item.signboard.id)}
                        >
                          {isFav ? '❤️ 已收藏' : '🤍 收藏'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictMapAtlas;
