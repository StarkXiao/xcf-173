import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreetCorner } from '../context/StreetCornerContext';
import { useSignboards } from '../context/SignboardsContext';
import { categoryLabels, timeRangeLabels } from '../data/streetcorners';
import type { RankingCategory, RankingTimeRange } from '../types';
import './StreetCornerRanking.css';

const StreetCornerRanking: React.FC = () => {
  const navigate = useNavigate();
  const {
    rankingLists,
    streetCorners,
    getRankingsByCategory,
    getRankingsByTimeRange,
    getAllCities,
    toggleFavoriteRankingList,
    toggleFavoriteStreetCorner,
    isRankingListFavorite,
    isStreetCornerFavorite
  } = useStreetCorner();
  const { getSignboard } = useSignboards();

  const [activeCategory, setActiveCategory] = useState<RankingCategory | 'all'>('all');
  const [activeTimeRange, setActiveTimeRange] = useState<RankingTimeRange | 'all'>('all');
  const [activeCity, setActiveCity] = useState<string>('all');

  const cities = useMemo(() => ['all', ...getAllCities()], [getAllCities]);

  const filteredRankings = useMemo(() => {
    let result = rankingLists;

    if (activeCategory !== 'all') {
      result = getRankingsByCategory(activeCategory);
    }
    if (activeTimeRange !== 'all') {
      const timeFiltered = new Set(getRankingsByTimeRange(activeTimeRange).map(r => r.id));
      result = result.filter(r => timeFiltered.has(r.id));
    }

    return result;
  }, [activeCategory, activeTimeRange, rankingLists, getRankingsByCategory, getRankingsByTimeRange]);

  const filteredStreetCorners = useMemo(() => {
    if (activeCity === 'all') return streetCorners;
    return streetCorners.filter(sc => sc.city === activeCity);
  }, [activeCity, streetCorners]);

  const categoryOptions: { value: RankingCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: '全部榜单', icon: '📊' },
    { value: 'block', label: '街区榜', icon: '🏘️' },
    { value: 'style', label: '风格榜', icon: '🎨' },
    { value: 'heat', label: '热度榜', icon: '🔥' }
  ];

  const timeRangeOptions: { value: RankingTimeRange | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: '全部时间', icon: '⏰' },
    { value: 'weekly', label: '周榜', icon: '📅' },
    { value: 'monthly', label: '月榜', icon: '📆' },
    { value: 'allTime', label: '总榜', icon: '🏆' }
  ];

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'top-1';
    if (rank === 2) return 'top-2';
    if (rank === 3) return 'top-3';
    return 'normal';
  };

  const blockRankings = filteredRankings.filter(r => r.category === 'block');
  const styleRankings = filteredRankings.filter(r => r.category === 'style');
  const heatRankings = filteredRankings.filter(r => r.category === 'heat');

  const showCategorySection = (category: RankingCategory) => {
    if (activeCategory === 'all') return true;
    return activeCategory === category;
  };

  return (
    <div className="streetcorner-page">
      <div className="ranking-hero">
        <div className="ranking-hero-bg">
          <div className="ranking-hero-pattern" />
        </div>
        <div className="ranking-hero-content">
          <div className="ranking-hero-badge">🏆 街角招牌发现榜</div>
          <h1 className="ranking-hero-title">发现城市里的招牌传奇</h1>
          <p className="ranking-hero-subtitle">
            按街区、风格、热度三大维度精心呈现每一块招牌的独特魅力，
            带你发现那些藏在街角巷弄里的百年风华与文化记忆
          </p>
          <div className="ranking-hero-stats">
            <div className="ranking-stat">
              <span className="ranking-stat-num">{streetCorners.length}</span>
              <span className="ranking-stat-label">特色街区</span>
            </div>
            <div className="ranking-stat-divider">◆</div>
            <div className="ranking-stat">
              <span className="ranking-stat-num">{rankingLists.length}</span>
              <span className="ranking-stat-label">精选榜单</span>
            </div>
            <div className="ranking-stat-divider">◆</div>
            <div className="ranking-stat">
              <span className="ranking-stat-num">{getAllCities().length}</span>
              <span className="ranking-stat-label">座城市</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ranking-filter-bar">
        <div className="filter-group">
          <span className="filter-group-label">榜单分类</span>
          <div className="filter-options">
            {categoryOptions.map(opt => (
              <button
                key={opt.value}
                className={`filter-btn ${activeCategory === opt.value ? 'active' : ''}`}
                onClick={() => setActiveCategory(opt.value)}
              >
                <span style={{ marginRight: 6 }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">时间范围</span>
          <div className="filter-options">
            {timeRangeOptions.map(opt => (
              <button
                key={opt.value}
                className={`filter-btn ${activeTimeRange === opt.value ? 'active' : ''}`}
                onClick={() => setActiveTimeRange(opt.value)}
              >
                <span style={{ marginRight: 6 }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">城市筛选</span>
          <div className="filter-options">
            {cities.map(city => (
              <button
                key={city}
                className={`filter-btn ${activeCity === city ? 'active' : ''}`}
                onClick={() => setActiveCity(city)}
              >
                {city === 'all' ? '🏙️ 全部城市' : `📍 ${city}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showCategorySection('heat') && heatRankings.length > 0 && (
        <div className="ranking-list-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-icon">🔥</span>
              <div>
                <h2 className="section-title">热度榜单</h2>
                <p className="section-subtitle">多维度数据计算，呈现当下最受关注的招牌</p>
              </div>
            </div>
            <span className="section-count">{heatRankings.length} 个榜单</span>
          </div>
          <div className="ranking-grid">
            {heatRankings.map((ranking, idx) => {
              const catLabel = categoryLabels[ranking.category];
              const timeLabel = timeRangeLabels[ranking.timeRange];
              const previewItems = ranking.items.slice(0, 3);
              const isFav = isRankingListFavorite(ranking.id);

              return (
                <div
                  key={ranking.id}
                  className="ranking-card animate-fade-in"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                  onClick={() => navigate(`/streetcorner/ranking/${ranking.id}`)}
                >
                  <div className="ranking-card-cover">
                    <img src={ranking.coverImage} alt={ranking.title} loading="lazy" />
                    <div className="ranking-card-overlay" />
                    <div className="ranking-card-badges">
                      <span
                        className="category-badge"
                        style={{ backgroundColor: ranking.accentColor + 'DD' }}
                      >
                        {catLabel.icon} {catLabel.text}
                      </span>
                      <span className="time-badge">
                        {timeLabel.icon} {timeLabel.text}
                      </span>
                    </div>
                    <button
                      className={`fav-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteRankingList(ranking.id);
                      }}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                    <div className="ranking-card-info">
                      <h3 className="ranking-card-title">
                        <span className="card-icon">{ranking.icon}</span>
                        {ranking.title}
                      </h3>
                      <p className="ranking-card-subtitle">{ranking.subtitle}</p>
                    </div>
                  </div>
                  <div className="ranking-card-body">
                    <p className="ranking-card-desc">{ranking.description}</p>
                    <div className="ranking-preview">
                      {previewItems.map(item => {
                        const sb = getSignboard(item.signboardId);
                        return (
                          <div key={item.signboardId} className="ranking-preview-item">
                            <span className={`preview-rank ${getRankBadgeClass(item.rank)}`}>
                              {item.rank}
                            </span>
                            <div className="preview-rank-info">
                              <div className="preview-rank-name">{sb?.name || '未知'}</div>
                              <div className="preview-rank-score">{item.score} 热度</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="ranking-card-footer">
                      <div className="ranking-card-meta">
                        <span className="meta-item">📋 {ranking.totalItems} 块招牌</span>
                        <span className="meta-item">🕐 {ranking.updatedAt}</span>
                      </div>
                      <button className="view-detail-btn">
                        查看详情 →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showCategorySection('block') && blockRankings.length > 0 && (
        <div className="ranking-list-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-icon">🏘️</span>
              <div>
                <h2 className="section-title">街区榜单</h2>
                <p className="section-subtitle">按历史街区划分，探索每条街巷的招牌故事</p>
              </div>
            </div>
            <span className="section-count">{blockRankings.length} 个街区</span>
          </div>
          <div className="ranking-grid">
            {blockRankings.map((ranking, idx) => {
              const catLabel = categoryLabels[ranking.category];
              const timeLabel = timeRangeLabels[ranking.timeRange];
              const previewItems = ranking.items.slice(0, 3);
              const isFav = isRankingListFavorite(ranking.id);

              return (
                <div
                  key={ranking.id}
                  className="ranking-card animate-fade-in"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                  onClick={() => navigate(`/streetcorner/ranking/${ranking.id}`)}
                >
                  <div className="ranking-card-cover">
                    <img src={ranking.coverImage} alt={ranking.title} loading="lazy" />
                    <div className="ranking-card-overlay" />
                    <div className="ranking-card-badges">
                      <span
                        className="category-badge"
                        style={{ backgroundColor: ranking.accentColor + 'DD' }}
                      >
                        {catLabel.icon} {catLabel.text}
                      </span>
                      <span className="time-badge">
                        {timeLabel.icon} {timeLabel.text}
                      </span>
                    </div>
                    <button
                      className={`fav-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteRankingList(ranking.id);
                      }}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                    <div className="ranking-card-info">
                      <h3 className="ranking-card-title">
                        <span className="card-icon">{ranking.icon}</span>
                        {ranking.title}
                      </h3>
                      <p className="ranking-card-subtitle">{ranking.subtitle}</p>
                    </div>
                  </div>
                  <div className="ranking-card-body">
                    <p className="ranking-card-desc">{ranking.description}</p>
                    <div className="ranking-preview">
                      {previewItems.map(item => {
                        const sb = getSignboard(item.signboardId);
                        return (
                          <div key={item.signboardId} className="ranking-preview-item">
                            <span className={`preview-rank ${getRankBadgeClass(item.rank)}`}>
                              {item.rank}
                            </span>
                            <div className="preview-rank-info">
                              <div className="preview-rank-name">{sb?.name || '未知'}</div>
                              <div className="preview-rank-score">{item.score} 分</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="ranking-card-footer">
                      <div className="ranking-card-meta">
                        <span className="meta-item">📋 {ranking.totalItems} 块招牌</span>
                        <span className="meta-item">🕐 {ranking.updatedAt}</span>
                      </div>
                      <button className="view-detail-btn">
                        查看详情 →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showCategorySection('style') && styleRankings.length > 0 && (
        <div className="ranking-list-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-icon">🎨</span>
              <div>
                <h2 className="section-title">风格榜单</h2>
                <p className="section-subtitle">按字体与设计流派分类，领略招牌美学的千姿百态</p>
              </div>
            </div>
            <span className="section-count">{styleRankings.length} 种风格</span>
          </div>
          <div className="ranking-grid">
            {styleRankings.map((ranking, idx) => {
              const catLabel = categoryLabels[ranking.category];
              const timeLabel = timeRangeLabels[ranking.timeRange];
              const previewItems = ranking.items.slice(0, 3);
              const isFav = isRankingListFavorite(ranking.id);

              return (
                <div
                  key={ranking.id}
                  className="ranking-card animate-fade-in"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                  onClick={() => navigate(`/streetcorner/ranking/${ranking.id}`)}
                >
                  <div className="ranking-card-cover">
                    <img src={ranking.coverImage} alt={ranking.title} loading="lazy" />
                    <div className="ranking-card-overlay" />
                    <div className="ranking-card-badges">
                      <span
                        className="category-badge"
                        style={{ backgroundColor: ranking.accentColor + 'DD' }}
                      >
                        {catLabel.icon} {catLabel.text}
                      </span>
                      <span className="time-badge">
                        {timeLabel.icon} {timeLabel.text}
                      </span>
                    </div>
                    <button
                      className={`fav-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteRankingList(ranking.id);
                      }}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                    <div className="ranking-card-info">
                      <h3 className="ranking-card-title">
                        <span className="card-icon">{ranking.icon}</span>
                        {ranking.title}
                      </h3>
                      <p className="ranking-card-subtitle">{ranking.subtitle}</p>
                    </div>
                  </div>
                  <div className="ranking-card-body">
                    <p className="ranking-card-desc">{ranking.description}</p>
                    <div className="ranking-preview">
                      {previewItems.map(item => {
                        const sb = getSignboard(item.signboardId);
                        return (
                          <div key={item.signboardId} className="ranking-preview-item">
                            <span className={`preview-rank ${getRankBadgeClass(item.rank)}`}>
                              {item.rank}
                            </span>
                            <div className="preview-rank-info">
                              <div className="preview-rank-name">{sb?.name || '未知'}</div>
                              <div className="preview-rank-score">{item.score} 分</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="ranking-card-footer">
                      <div className="ranking-card-meta">
                        <span className="meta-item">📋 {ranking.totalItems} 块招牌</span>
                        <span className="meta-item">🕐 {ranking.updatedAt}</span>
                      </div>
                      <button className="view-detail-btn">
                        查看详情 →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredRankings.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-text">暂无符合条件的榜单，试试调整筛选条件吧</p>
        </div>
      )}

      <div className="ranking-list-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="section-icon">📍</span>
            <div>
              <h2 className="section-title">探索街角</h2>
              <p className="section-subtitle">走进每一条特色街区，发现藏在巷弄里的招牌故事</p>
            </div>
          </div>
          <span className="section-count">{filteredStreetCorners.length} 个街区</span>
        </div>
        <div className="streetcorner-grid">
          {filteredStreetCorners.map((corner, idx) => {
            const isFav = isStreetCornerFavorite(corner.id);
            return (
              <div
                key={corner.id}
                className="streetcorner-card animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => navigate(`/streetcorner/corner/${corner.id}`)}
              >
                <div className="streetcorner-card-cover">
                  <img src={corner.coverImage} alt={corner.name} loading="lazy" />
                  <div className="streetcorner-overlay" />
                  <span className="streetcorner-card-city">📍 {corner.city}</span>
                  <button
                    className={`fav-btn ${isFav ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteStreetCorner(corner.id);
                    }}
                  >
                    {isFav ? '❤️' : '🤍'}
                  </button>
                  <div className="streetcorner-card-info">
                    <h3 className="streetcorner-card-name">{corner.name}</h3>
                    <p className="streetcorner-card-district">{corner.district}</p>
                  </div>
                </div>
                <div className="streetcorner-card-body">
                  <div className="streetcorner-card-tags">
                    {corner.tags.map(tag => (
                      <span key={tag} className="streetcorner-tag">#{tag}</span>
                    ))}
                  </div>
                  <p className="streetcorner-card-desc">{corner.description}</p>
                  <div className="streetcorner-card-footer">
                    <span className="signboard-count">🪧 {corner.signboardIds.length} 块招牌</span>
                    <span className="enter-btn">探索街区 →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreetCornerRanking;
