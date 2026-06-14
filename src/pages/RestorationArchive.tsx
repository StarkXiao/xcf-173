import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import { useStatusTracking } from '../context/StatusTrackingContext';
import type { Signboard, ConditionStatus, RestorationEvent } from '../types';
import { conditionStatusLabels } from '../types';
import RestorationTimeline from '../components/RestorationTimeline';
import './RestorationArchive.css';

type StatusFilter = 'all' | ConditionStatus;
type ViewMode = 'grid' | 'timeline' | 'compare';

const RestorationArchive: React.FC = () => {
  const { signboards } = useSignboards();
  const { toggleFavorite, isFavorite, toggleCompare, isInCompare, addToCompare } = useFavorites();
  const { getLatestStatus, getRecordsForSignboard, hasRecords, getStatusStats } = useStatusTracking();
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignboard, setSelectedSignboard] = useState<Signboard | null>(null);
  const [comparePair, setComparePair] = useState<[Signboard | null, Signboard | null]>([null, null]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const restoredSignboards = useMemo(() => {
    return signboards.filter(s => s.restorationHistory.length > 1);
  }, [signboards]);

  const stats = useMemo(() => {
    const ids = restoredSignboards.map(s => s.id);
    const statusStats = getStatusStats(ids);
    const totalRestorations = restoredSignboards.reduce(
      (sum, s) => sum + s.restorationHistory.filter(h => h.type === 'restoration' || h.type === 'renovation' || h.type === 'repaint').length,
      0
    );
    const totalDamages = restoredSignboards.reduce(
      (sum, s) => sum + s.restorationHistory.filter(h => h.type === 'damaged').length,
      0
    );
    const avgRestorations = restoredSignboards.length > 0
      ? (totalRestorations / restoredSignboards.length).toFixed(1)
      : '0';
    
    return {
      total: restoredSignboards.length,
      totalRestorations,
      totalDamages,
      avgRestorations,
      ...statusStats
    };
  }, [restoredSignboards, getStatusStats]);

  const filteredSignboards = useMemo(() => {
    return restoredSignboards.filter(s => {
      if (statusFilter !== 'all') {
        const latest = getLatestStatus(s.id);
        const current = latest || s.condition;
        if (current !== statusFilter) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.shopName.toLowerCase().includes(query) ||
          s.location.toLowerCase().includes(query) ||
          s.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [restoredSignboards, statusFilter, searchQuery, getLatestStatus]);

  const getEarliestAndLatest = (s: Signboard) => {
    const years = s.restorationHistory.map(h => h.year);
    return {
      earliest: Math.min(...years),
      latest: Math.max(...years),
      span: Math.max(...years) - Math.min(...years)
    };
  };

  const getBeforeAfterEvents = (s: Signboard): [RestorationEvent | null, RestorationEvent | null] => {
    const damaged = s.restorationHistory.find(h => h.type === 'damaged');
    const restored = s.restorationHistory.filter(h => h.type === 'restoration' || h.type === 'renovation');
    return [damaged || s.restorationHistory[0], restored[restored.length - 1] || s.restorationHistory[s.restorationHistory.length - 1]];
  };

  const statusFilters: { value: StatusFilter; label: string; icon: string; color: string }[] = [
    { value: 'all', label: '全部', icon: '📚', color: '#8B4513' },
    { value: 'restored', label: conditionStatusLabels['restored'].text, icon: conditionStatusLabels['restored'].icon, color: conditionStatusLabels['restored'].color },
    { value: 'well-preserved', label: conditionStatusLabels['well-preserved'].text, icon: conditionStatusLabels['well-preserved'].icon, color: conditionStatusLabels['well-preserved'].color },
    { value: 'weathered', label: conditionStatusLabels['weathered'].text, icon: conditionStatusLabels['weathered'].icon, color: conditionStatusLabels['weathered'].color },
    { value: 'damaged', label: conditionStatusLabels['damaged'].text, icon: conditionStatusLabels['damaged'].icon, color: conditionStatusLabels['damaged'].color }
  ];

  const renderCard = (s: Signboard) => {
    const { earliest, latest, span } = getEarliestAndLatest(s);
    const latestStatus = getLatestStatus(s.id) || s.condition;
    const statusInfo = conditionStatusLabels[latestStatus];
    const records = getRecordsForSignboard(s.id);
    const [beforeEvent, afterEvent] = getBeforeAfterEvents(s);
    const isExpanded = expandedCard === s.id;

    return (
      <div key={s.id} className={`archive-card ${isExpanded ? 'expanded' : ''}`}>
        <div className="card-header">
          <div className="card-status-badge" style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-text">{statusInfo.text}</span>
          </div>
          <div className="card-actions">
            <button
              className={`action-btn favorite-btn ${isFavorite(s.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(s.id)}
              title={isFavorite(s.id) ? '取消收藏' : '添加收藏'}
            >
              {isFavorite(s.id) ? '❤️' : '🤍'}
            </button>
            <button
              className={`action-btn compare-btn ${isInCompare(s.id) ? 'active' : ''}`}
              onClick={() => toggleCompare(s.id)}
              title={isInCompare(s.id) ? '移出对比' : '加入对比'}
            >
              ⚖️
            </button>
            <button
              className="action-btn expand-btn"
              onClick={() => setExpandedCard(isExpanded ? null : s.id)}
              title={isExpanded ? '收起' : '展开详情'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        <Link to={`/signboard/${s.id}`} className="card-image-link">
          <div className="card-image-container">
            <img src={s.image} alt={s.name} className="card-image" />
            <div className="card-image-overlay">
              <span className="card-year-badge">{s.year}年创立</span>
              <span className="card-restoration-badge">
                🔧 {s.restorationHistory.length}次记录
              </span>
            </div>
          </div>
        </Link>

        <div className="card-content">
          <Link to={`/signboard/${s.id}`} className="card-title-link">
            <h3 className="card-title">{s.name}</h3>
          </Link>
          <p className="card-shop">{s.shopName}</p>
          <p className="card-location">📍 {s.location}</p>

          <div className="card-time-span">
            <div className="time-span-item">
              <span className="time-label">始建</span>
              <span className="time-value">{earliest}年</span>
            </div>
            <div className="time-span-line">
              <div className="time-span-progress" style={{ width: `${Math.min(100, (span / 200) * 100)}%` }} />
            </div>
            <div className="time-span-item">
              <span className="time-label">最近</span>
              <span className="time-value">{latest}年</span>
            </div>
            <div className="time-span-item total">
              <span className="time-label">跨越</span>
              <span className="time-value highlight">{span}年</span>
            </div>
          </div>

          {beforeEvent && afterEvent && (
            <div className="card-compare-preview" onClick={() => { setSelectedSignboard(s); setViewMode('compare'); }}>
              <div className="compare-preview-label">修复前后对比</div>
              <div className="compare-preview-images">
                <div className="compare-preview-before">
                  <span className="preview-tag before-tag">{beforeEvent.year}</span>
                  <div className="preview-status" style={{ color: conditionStatusLabels[beforeEvent.changes?.condition || 'damaged'].color }}>
                    {conditionStatusLabels[beforeEvent.changes?.condition || 'damaged'].icon} {conditionStatusLabels[beforeEvent.changes?.condition || 'damaged'].text}
                  </div>
                </div>
                <div className="compare-preview-arrow">→</div>
                <div className="compare-preview-after">
                  <span className="preview-tag after-tag">{afterEvent.year}</span>
                  <div className="preview-status" style={{ color: conditionStatusLabels[afterEvent.changes?.condition || 'restored'].color }}>
                    {conditionStatusLabels[afterEvent.changes?.condition || 'restored'].icon} {conditionStatusLabels[afterEvent.changes?.condition || 'restored'].text}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="card-expanded-content">
              <div className="expanded-section">
                <h4 className="expanded-section-title">📜 修复大事记</h4>
                <RestorationTimeline history={s.restorationHistory} compact />
              </div>

              {hasRecords(s.id) && (
                <div className="expanded-section">
                  <h4 className="expanded-section-title">📊 状态追踪记录</h4>
                  <div className="status-records-list">
                    {records.slice(0, 5).map(record => (
                      <div key={record.id} className="status-record-item">
                        <span
                          className="record-status-dot"
                          style={{ backgroundColor: conditionStatusLabels[record.condition].color }}
                        />
                        <span className="record-date">{record.date}</span>
                        <span className="record-condition" style={{ color: conditionStatusLabels[record.condition].color }}>
                          {conditionStatusLabels[record.condition].text}
                        </span>
                        {record.note && <span className="record-note">{record.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="expanded-section">
                <h4 className="expanded-section-title">🏷️ 标签</h4>
                <div className="card-tags">
                  {s.tags.map(tag => (
                    <span key={tag} className="card-tag">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="expanded-actions">
                <Link to={`/signboard/${s.id}`} className="detail-btn">
                  查看详情 →
                </Link>
                <button
                  className="compare-add-btn"
                  onClick={() => {
                    const result = addToCompare(s.id);
                    if (result.success) {
                      setViewMode('compare');
                    }
                  }}
                >
                  加入对比分析
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTimelineView = () => (
    <div className="timeline-view">
      {filteredSignboards.map(s => {
        const { earliest, latest } = getEarliestAndLatest(s);
        const latestStatus = getLatestStatus(s.id) || s.condition;
        const statusInfo = conditionStatusLabels[latestStatus];
        
        return (
          <div key={s.id} className="timeline-item">
            <div className="timeline-marker" style={{ backgroundColor: statusInfo.color }}>
              <span className="timeline-year">{earliest}</span>
            </div>
            <div className="timeline-content-card">
              <div className="timeline-card-header">
                <div className="timeline-title-row">
                  <Link to={`/signboard/${s.id}`} className="timeline-title">{s.name}</Link>
                  <span className="timeline-status-badge" style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                </div>
                <div className="timeline-years">
                  {earliest} - {latest}（跨度{latest - earliest}年）
                </div>
              </div>
              <div className="timeline-card-body">
                <img src={s.image} alt={s.name} className="timeline-thumb" />
                <div className="timeline-info">
                  <p className="timeline-desc">{s.description}</p>
                  <div className="timeline-stats">
                    <span className="timeline-stat">🔧 {s.restorationHistory.length}次修复记录</span>
                    <span className="timeline-stat">📍 {s.location}</span>
                  </div>
                </div>
              </div>
              <div className="timeline-events">
                {s.restorationHistory.slice(-3).reverse().map((event, idx) => (
                  <div key={idx} className="timeline-event-mini">
                    <span className="event-year">{event.year}</span>
                    <span className="event-type">{event.title}</span>
                    <span className="event-desc">{event.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCompareView = () => (
    <div className="compare-view">
      {!selectedSignboard && !comparePair[0] && !comparePair[1] && (
        <div className="compare-selector">
          <h3 className="compare-selector-title">选择两块招牌进行修复前后对比</h3>
          <div className="compare-pair-selector">
            <div
              className={`compare-slot ${comparePair[0] ? 'filled' : ''}`}
              onClick={() => setComparePair([null, comparePair[1]])}
            >
              {comparePair[0] && (
                <>
                  <img src={(comparePair[0] as Signboard).image} alt={(comparePair[0] as Signboard).name} />
                  <span className="compare-slot-name">{(comparePair[0] as Signboard).name}</span>
                </>
              )}
              {!comparePair[0] && (
                <span className="compare-slot-placeholder">选择招牌 A</span>
              )}
            </div>
            <div className="compare-vs">VS</div>
            <div
              className={`compare-slot ${comparePair[1] ? 'filled' : ''}`}
              onClick={() => setComparePair([comparePair[0], null])}
            >
              {comparePair[1] && (
                <>
                  <img src={(comparePair[1] as Signboard).image} alt={(comparePair[1] as Signboard).name} />
                  <span className="compare-slot-name">{(comparePair[1] as Signboard).name}</span>
                </>
              )}
              {!comparePair[1] && (
                <span className="compare-slot-placeholder">选择招牌 B</span>
              )}
            </div>
          </div>
          <div className="compare-selector-grid">
            {restoredSignboards.map(s => (
              <div
                key={s.id}
                className={`compare-selector-item ${comparePair[0]?.id === s.id || comparePair[1]?.id === s.id ? 'selected' : ''}`}
                onClick={() => {
                  if (comparePair[0]?.id === s.id) {
                    setComparePair([null, comparePair[1]]);
                  } else if (comparePair[1]?.id === s.id) {
                    setComparePair([comparePair[0], null]);
                  } else if (!comparePair[0]) {
                    setComparePair([s, comparePair[1]]);
                  } else if (!comparePair[1]) {
                    setComparePair([comparePair[0], s]);
                  } else {
                    setComparePair([s, null]);
                  }
                }}
              >
                <img src={s.image} alt={s.name} />
                <span className="selector-item-name">{s.name}</span>
                <span className="selector-item-year">{s.year}年</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSignboard && (
        <div className="single-compare">
          <div className="single-compare-header">
            <h3 className="single-compare-title">
              {selectedSignboard.name} - 修复前后对比
            </h3>
            <button className="close-btn" onClick={() => setSelectedSignboard(null)}>✕</button>
          </div>
          
          <div className="slider-compare-container">
            <div className="slider-compare">
              <div className="compare-image-layer after-layer">
                <img src={selectedSignboard.image} alt="修复后" />
                <div className="compare-label after-label">
                  修复后 · {getBeforeAfterEvents(selectedSignboard)[1]?.year || selectedSignboard.year}年
                </div>
              </div>
              <div
                className="compare-image-layer before-layer"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <div className="before-image-overlay">
                  <img src={selectedSignboard.image} alt="修复前" className="grayscale-image" />
                </div>
                <div className="compare-label before-label">
                  修复前 · {getBeforeAfterEvents(selectedSignboard)[0]?.year || selectedSignboard.year}年
                </div>
              </div>
              <div
                className="compare-slider-handle"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="slider-line" />
                <div className="slider-button">
                  <span className="slider-arrow left">◀</span>
                  <span className="slider-arrow right">▶</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="compare-range-input"
              />
            </div>
          </div>

          <div className="single-compare-events">
            <div className="compare-events-grid">
              {selectedSignboard.restorationHistory.map((event, idx) => (
                <div
                  key={idx}
                  className={`compare-event-card ${event.type === 'damaged' ? 'damaged' : event.type === 'restoration' ? 'restoration' : ''}`}
                >
                  <div className="event-card-header">
                    <span className="event-card-year">{event.year}</span>
                    <span className="event-card-type">{event.title}</span>
                  </div>
                  <p className="event-card-desc">{event.description}</p>
                  {event.changes?.condition && (
                    <div className="event-card-condition">
                      状态：{conditionStatusLabels[event.changes.condition].icon} {conditionStatusLabels[event.changes.condition].text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {comparePair[0] && comparePair[1] && !selectedSignboard && (
        <div className="pair-compare">
          <div className="pair-compare-header">
            <h3 className="pair-compare-title">
              {comparePair[0].name} VS {comparePair[1].name}
            </h3>
            <button className="close-btn" onClick={() => setComparePair([null, null])}>✕</button>
          </div>

          <div className="pair-compare-grid">
            <div className="pair-compare-card">
              <img src={comparePair[0].image} alt={comparePair[0].name} />
              <h4>{comparePair[0].name}</h4>
              <p>{comparePair[0].shopName}</p>
              <div className="pair-meta">
                <span>创立：{comparePair[0].year}年</span>
                <span>📍 {comparePair[0].location}</span>
              </div>
              <RestorationTimeline history={comparePair[0].restorationHistory} compact />
            </div>
            
            <div className="pair-compare-middle">
              <div className="compare-stats-column">
                <div className="compare-stat-row">
                  <span className="stat-value">{comparePair[0].restorationHistory.length}</span>
                  <span className="stat-label">修复次数</span>
                  <span className="stat-value">{comparePair[1].restorationHistory.length}</span>
                </div>
                <div className="compare-stat-row">
                  <span className="stat-value">{getEarliestAndLatest(comparePair[0]).span}年</span>
                  <span className="stat-label">历史跨度</span>
                  <span className="stat-value">{getEarliestAndLatest(comparePair[1]).span}年</span>
                </div>
                <div className="compare-stat-row">
                  <span className="stat-value" style={{ color: conditionStatusLabels[comparePair[0].condition].color }}>
                    {conditionStatusLabels[comparePair[0].condition].text}
                  </span>
                  <span className="stat-label">当前状态</span>
                  <span className="stat-value" style={{ color: conditionStatusLabels[comparePair[1].condition].color }}>
                    {conditionStatusLabels[comparePair[1].condition].text}
                  </span>
                </div>
                <div className="compare-stat-row">
                  <span className="stat-value">{comparePair[0].fontStyle}</span>
                  <span className="stat-label">字体风格</span>
                  <span className="stat-value">{comparePair[1].fontStyle}</span>
                </div>
              </div>
            </div>

            <div className="pair-compare-card">
              <img src={comparePair[1].image} alt={comparePair[1].name} />
              <h4>{comparePair[1].name}</h4>
              <p>{comparePair[1].shopName}</p>
              <div className="pair-meta">
                <span>创立：{comparePair[1].year}年</span>
                <span>📍 {comparePair[1].location}</span>
              </div>
              <RestorationTimeline history={comparePair[1].restorationHistory} compact />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="restoration-archive-page animate-fade-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">🏛️ 招牌修复档案馆</h1>
          <p className="page-subtitle">
            记录 <strong>{stats.total}</strong> 块招牌的 <strong>{stats.totalRestorations}</strong> 次修复历程，跨越百年风雨
          </p>
        </div>
        <div className="header-actions-row">
          <div className="view-switcher">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              📦 卡片视图
            </button>
            <button
              className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              📅 时间线
            </button>
            <button
              className={`view-btn ${viewMode === 'compare' ? 'active' : ''}`}
              onClick={() => setViewMode('compare')}
            >
              ⚖️ 对比查看
            </button>
          </div>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-card-icon">🏛️</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-label">馆藏招牌</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔧</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.totalRestorations}</div>
            <div className="stat-card-label">修复总次数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">⚠️</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.totalDamages}</div>
            <div className="stat-card-label">受损记录</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.avgRestorations}</div>
            <div className="stat-card-label">平均修复次数</div>
          </div>
        </div>
      </div>

      <div className="status-distribution">
        <h3 className="section-title">📈 状态分布</h3>
        <div className="status-bar-container">
          {(['restored', 'well-preserved', 'weathered', 'damaged'] as ConditionStatus[]).map(status => {
            const count = stats[status];
            const total = stats['restored'] + stats['well-preserved'] + stats['weathered'] + stats['damaged'];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={status}
                className={`status-bar-segment status-${status}`}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: conditionStatusLabels[status].color
                }}
                title={`${conditionStatusLabels[status].text}: ${count}块 (${percentage}%)`}
              >
                {percentage >= 10 && (
                  <span className="status-bar-label">
                    {conditionStatusLabels[status].icon} {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="status-legend">
          {(['restored', 'well-preserved', 'weathered', 'damaged'] as ConditionStatus[]).map(status => (
            <div key={status} className="status-legend-item">
              <span
                className="legend-dot"
                style={{ backgroundColor: conditionStatusLabels[status].color }}
              />
              <span className="legend-text">{conditionStatusLabels[status].text}</span>
              <span className="legend-count">{stats[status]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索招牌名称、店铺、位置..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
        
        <div className="status-filter-tabs">
          {statusFilters.map(filter => (
            <button
              key={filter.value}
              className={`status-filter-tab ${statusFilter === filter.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(filter.value)}
              style={{
                borderColor: statusFilter === filter.value ? filter.color : 'transparent',
                color: statusFilter === filter.value ? filter.color : 'inherit'
              }}
            >
              <span className="tab-icon">{filter.icon}</span>
              <span className="tab-label">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="results-info">
        共找到 <strong>{filteredSignboards.length}</strong> 块招牌
      </div>

      {filteredSignboards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>暂无符合条件的招牌</h2>
          <p>试试调整筛选条件或搜索关键词</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="archive-grid">
              {filteredSignboards.map(renderCard)}
            </div>
          )}
          
          {viewMode === 'timeline' && renderTimelineView()}
          
          {viewMode === 'compare' && renderCompareView()}
        </>
      )}
    </div>
  );
};

export default RestorationArchive;
