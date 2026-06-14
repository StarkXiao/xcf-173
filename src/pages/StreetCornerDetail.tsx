import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStreetCorner } from '../context/StreetCornerContext';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import { categoryLabels, timeRangeLabels } from '../data/streetcorners';
import { conditionStatusLabels } from '../types';
import './StreetCornerDetail.css';

type DetailMode = 'ranking' | 'corner';

const StreetCornerDetail: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const {
    getRankingList,
    getStreetCorner,
    getStyleCategory,
    rankingLists,
    toggleFavoriteRankingList,
    toggleFavoriteStreetCorner,
    isRankingListFavorite,
    isStreetCornerFavorite
  } = useStreetCorner();
  const { getSignboard } = useSignboards();
  const { toggleFavorite, isFavorite } = useFavorites();

  const mode: DetailMode = params.rankingId ? 'ranking' : 'corner';
  const entityId = params.rankingId || params.cornerId;

  const ranking = mode === 'ranking' && entityId ? getRankingList(entityId) : null;
  const corner = mode === 'corner' && entityId ? getStreetCorner(entityId) : null;
  const styleCategory = ranking?.styleCategoryId ? getStyleCategory(ranking.styleCategoryId) : null;
  const relatedCorner = ranking?.streetCornerId ? getStreetCorner(ranking.streetCornerId) : null;

  const heroData = useMemo(() => {
    if (ranking) {
      return {
        coverImage: ranking.coverImage,
        accentColor: ranking.accentColor,
        title: ranking.title,
        subtitle: ranking.subtitle,
        description: ranking.description,
        icon: ranking.icon,
        badges: [
          { label: categoryLabels[ranking.category].text, icon: categoryLabels[ranking.category].icon },
          { label: timeRangeLabels[ranking.timeRange].text, icon: timeRangeLabels[ranking.timeRange].icon }
        ],
        meta: [
          { value: ranking.totalItems, label: '招牌总数' },
          { value: ranking.updatedAt, label: '更新时间' }
        ],
        isFavorite: isRankingListFavorite(ranking.id),
        onToggleFavorite: () => toggleFavoriteRankingList(ranking.id)
      };
    }
    if (corner) {
      return {
        coverImage: corner.coverImage,
        accentColor: '#8B4513',
        title: corner.name,
        subtitle: `${corner.city}·${corner.district}`,
        description: corner.description,
        icon: '📍',
        badges: corner.tags.map(tag => ({ label: tag, icon: '🏷️' })),
        meta: [
          { value: corner.signboardIds.length, label: '招牌数量' },
          { value: corner.nearbyLandmarks.length, label: '周边地标' }
        ],
        isFavorite: isStreetCornerFavorite(corner.id),
        onToggleFavorite: () => toggleFavoriteStreetCorner(corner.id)
      };
    }
    return null;
  }, [ranking, corner, isRankingListFavorite, isStreetCornerFavorite, toggleFavoriteRankingList, toggleFavoriteStreetCorner]);

  const rankedSignboards = useMemo(() => {
    if (!ranking) return [];
    return ranking.items
      .map(item => {
        const sb = getSignboard(item.signboardId);
        return sb ? { item, signboard: sb } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [ranking, getSignboard]);

  const cornerSignboards = useMemo(() => {
    if (!corner) return [];
    return corner.signboardIds
      .map(id => getSignboard(id))
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [corner, getSignboard]);

  const relatedRankings = useMemo(() => {
    if (!corner) return [];
    return rankingLists
      .filter(r => r.streetCornerId === corner.id)
      .slice(0, 3);
  }, [corner, rankingLists]);

  const trendDisplay = (trend: 'up' | 'down' | 'stable', value: number) => {
    if (trend === 'up') return <span className="rank-trend up">↑ {value}%</span>;
    if (trend === 'down') return <span className="rank-trend down">↓ {value}%</span>;
    return <span className="rank-trend stable">— 持平</span>;
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'normal';
  };

  if (!heroData) {
    return (
      <div className="ranking-detail-page">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <p className="empty-state-text">未找到相关内容</p>
          <button className="back-btn" style={{ marginTop: 24, color: '#374151' }} onClick={() => navigate('/streetcorner')}>
            返回发现榜
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-detail-page">
      <div className="detail-hero">
        <div className="detail-hero-bg">
          <img src={heroData.coverImage} alt={heroData.title} />
        </div>
        <button
          className="detail-fav-btn"
          style={heroData.isFavorite ? {} : {}}
          onClick={heroData.onToggleFavorite}
        >
          {heroData.isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
        </button>
        <div className="detail-hero-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← 返回
          </button>
          <div className="detail-badge-row">
            {heroData.badges.map((badge, idx) => (
              <span key={idx} className="detail-badge">
                {badge.icon} {badge.label}
              </span>
            ))}
          </div>
          <h1 className="detail-title">
            <span className="detail-title-icon">{heroData.icon}</span>
            {heroData.title}
          </h1>
          <p className="detail-subtitle">{heroData.subtitle}</p>
          <p className="detail-description">{heroData.description}</p>
          <div className="detail-meta-row">
            {heroData.meta.map((m, idx) => (
              <div key={idx} className="detail-meta-item">
                <span className="detail-meta-value">{m.value}</span>
                <span className="detail-meta-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {mode === 'ranking' && ranking && (
        <div className="ranking-detail-section" style={{ '--accentColor': ranking.accentColor } as React.CSSProperties}>
          <div className="section-header-row">
            <div>
              <h2 className="section-title">🏆 榜单详情</h2>
              <p className="section-subtitle">共 {ranking.items.length} 块招牌入选本榜单</p>
            </div>
            <div className="legend-row">
              <span className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#22c55e' }} />
                热度上升
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#ef4444' }} />
                热度下降
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#6b7280' }} />
                保持稳定
              </span>
            </div>
          </div>

          <div className="ranking-items-list">
            {rankedSignboards.map(({ item, signboard }, idx) => {
              const isFav = isFavorite(signboard.id);
              return (
                <div
                  key={signboard.id}
                  className="ranking-item-card animate-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s`, '--accentColor': ranking.accentColor } as React.CSSProperties}
                  onClick={() => navigate(`/signboard/${signboard.id}`)}
                >
                  <div className="item-rank-badge">
                    <div className={`rank-number ${getRankClass(item.rank)}`}>
                      {item.rank}
                    </div>
                    {trendDisplay(item.trend, item.trendValue)}
                  </div>

                  <div className="item-image-wrap">
                    <img src={signboard.image} alt={signboard.name} loading="lazy" />
                  </div>

                  <div className="item-info">
                    <div className="item-name-row">
                      <h3 className="item-name">{signboard.name}</h3>
                      <span className="item-era-tag">{signboard.era} · {signboard.year}年</span>
                      <span className="item-era-tag" style={{
                        backgroundColor: conditionStatusLabels[signboard.condition].color + '15',
                        color: conditionStatusLabels[signboard.condition].color
                      }}>
                        {conditionStatusLabels[signboard.condition].icon} {conditionStatusLabels[signboard.condition].text}
                      </span>
                    </div>
                    <div className="item-meta">
                      📍 {signboard.location} · ✍️ {signboard.fontStyle} · 🏛️ {signboard.buildingType}
                    </div>
                    <div className="item-tags">
                      {signboard.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="item-tag">#{tag}</span>
                      ))}
                    </div>
                    <div className="heat-sources">
                      {item.heatSources.map(src => (
                        <span key={src} className="heat-source-tag">🔥 {src}</span>
                      ))}
                    </div>
                  </div>

                  <div className="item-score-wrap">
                    <span className="score-value" style={{
                      background: `linear-gradient(135deg, ${ranking.accentColor}, ${ranking.accentColor}99)`
                    }}>
                      {item.score}
                    </span>
                    <span className="score-label">综合评分</span>
                    <div className="score-bar">
                      <div
                        className="score-bar-fill"
                        style={{
                          width: `${item.score}%`,
                          background: `linear-gradient(90deg, ${ranking.accentColor}, ${ranking.accentColor}CC)`
                        }}
                      />
                    </div>
                    <button
                      className="stop-action-btn"
                      style={{
                        marginTop: 8,
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: isFav ? '#fee2e2' : '#f3f4f6',
                        color: isFav ? '#dc2626' : '#374151',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 13
                      }}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(signboard.id); }}
                    >
                      {isFav ? '❤️ 已收藏' : '🤍 收藏'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'corner' && corner && (
        <>
          <div className="corner-info-section">
            <div className="info-card">
              <h3 className="info-card-title">
                <span className="info-card-icon">🌆</span>
                街区信息
              </h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">所属城市</span>
                  <span className="info-value">📍 {corner.city}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">所属区域</span>
                  <span className="info-value">{corner.district}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">街区氛围</span>
                  <span className="info-value">{corner.atmosphere}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">最佳游览</span>
                  <span className="info-value">🕐 {corner.bestTimeToVisit}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3 className="info-card-title">
                <span className="info-card-icon">🗺️</span>
                周边地标
              </h3>
              <div className="info-list">
                {corner.nearbyLandmarks.map((lm, idx) => (
                  <div key={lm} className="info-item">
                    <span className="info-label">地标 {idx + 1}</span>
                    <span className="info-value">🏛️ {lm}</span>
                  </div>
                ))}
                <div className="info-item">
                  <span className="info-label">经纬度</span>
                  <span className="info-value">
                    {corner.latitude.toFixed(4)}°N, {corner.longitude.toFixed(4)}°E
                  </span>
                </div>
              </div>
            </div>
          </div>

          {styleCategory && (
            <div className="ranking-detail-section">
              <div className="section-header-row">
                <div>
                  <h2 className="section-title">{styleCategory.icon} 风格介绍</h2>
                  <p className="section-subtitle">{styleCategory.name}</p>
                </div>
              </div>
              <div className="info-card">
                <p style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', margin: 0 }}>
                  {styleCategory.description}
                </p>
              </div>
            </div>
          )}

          {relatedCorner && (
            <div className="ranking-detail-section">
              <div className="section-header-row">
                <div>
                  <h2 className="section-title">🏘️ 关联街区</h2>
                  <p className="section-subtitle">{relatedCorner.name}</p>
                </div>
                <button
                  className="view-detail-btn"
                  onClick={() => navigate(`/streetcorner/corner/${relatedCorner.id}`)}
                >
                  查看街区详情 →
                </button>
              </div>
            </div>
          )}

          <div className="corner-signboards-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">🪧 街区招牌</h2>
                <p className="section-subtitle">本街区收录的 {cornerSignboards.length} 块招牌</p>
              </div>
            </div>
            <div className="corner-signboards-grid">
              {cornerSignboards.map((sb, idx) => {
                const isFav = isFavorite(sb.id);
                return (
                  <div
                    key={sb.id}
                    className="corner-signboard-card animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => navigate(`/signboard/${sb.id}`)}
                  >
                    <div className="corner-signboard-image">
                      <img src={sb.image} alt={sb.name} loading="lazy" />
                    </div>
                    <h3 className="corner-signboard-name">{sb.name}</h3>
                    <div className="corner-signboard-meta">
                      {sb.era} · {sb.fontStyle}
                    </div>
                    <div className="corner-signboard-meta">
                      📍 {sb.location}
                    </div>
                    <div className="corner-signboard-tags">
                      {sb.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="corner-signboard-tag">#{tag}</span>
                      ))}
                    </div>
                    <button
                      className="stop-action-btn"
                      style={{
                        marginTop: 4,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: isFav ? '#fee2e2' : '#f9fafb',
                        color: isFav ? '#dc2626' : '#4b5563',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 12,
                        alignSelf: 'flex-start'
                      }}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(sb.id); }}
                    >
                      {isFav ? '❤️ 已收藏' : '🤍 收藏'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {relatedRankings.length > 0 && (
            <div className="related-section">
              <div className="section-header-row">
                <div>
                  <h2 className="section-title">📊 相关榜单</h2>
                  <p className="section-subtitle">本街区的招牌榜单</p>
                </div>
              </div>
              <div className="related-grid">
                {relatedRankings.map(rk => (
                  <div
                    key={rk.id}
                    className="ranking-card animate-fade-in"
                    onClick={() => navigate(`/streetcorner/ranking/${rk.id}`)}
                  >
                    <div className="ranking-card-cover">
                      <img src={rk.coverImage} alt={rk.title} loading="lazy" />
                      <div className="ranking-card-overlay" />
                      <div className="ranking-card-info">
                        <h3 className="ranking-card-title">
                          <span className="card-icon">{rk.icon}</span>
                          {rk.title}
                        </h3>
                        <p className="ranking-card-subtitle">{rk.subtitle}</p>
                      </div>
                    </div>
                    <div className="ranking-card-body">
                      <div className="ranking-card-footer">
                        <div className="ranking-card-meta">
                          <span className="meta-item">📋 {rk.totalItems} 块招牌</span>
                        </div>
                        <button className="view-detail-btn">查看 →</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 40, padding: 24, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', margin: 0 }}>
          💡 想查看招牌详情？点击任意招牌卡片即可跳转
        </p>
        <Link to="/streetcorner" style={{ display: 'inline-block', marginTop: 12, color: '#8B4513', fontWeight: 600 }}>
          ← 返回发现榜首页
        </Link>
      </div>
    </div>
  );
};

export default StreetCornerDetail;
