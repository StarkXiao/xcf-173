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

type EventCondition = ConditionStatus | undefined;

const eventTypeLabels: Record<RestorationEvent['type'], { label: string; icon: string }> = {
  creation: { label: '创立', icon: '🏗️' },
  renovation: { label: '改制', icon: '🔄' },
  restoration: { label: '修缮', icon: '🏛️' },
  repaint: { label: '重漆', icon: '🎨' },
  relocation: { label: '迁址', icon: '🚚' },
  damaged: { label: '受损', icon: '⚠️' },
  weathered: { label: '风化', icon: '🍂' }
};

interface RestorationTransition {
  beforeEvent: RestorationEvent;
  afterEvent: RestorationEvent;
  beforeCondition: ConditionStatus;
  afterCondition: ConditionStatus;
  beforeColors: string[];
  afterColors: string[];
  yearGap: number;
  keyMoment: 'damage-repair' | 'wear-repair' | 'creation-change' | 'gradual';
}

const getRestorationTransitions = (s: Signboard): RestorationTransition[] => {
  const history = s.restorationHistory;
  if (history.length < 2) return [];

  const transitions: RestorationTransition[] = [];

  for (let i = 1; i < history.length; i++) {
    const beforeEvent = history[i - 1];
    const afterEvent = history[i];
    const beforeCondition = beforeEvent.changes?.condition || 'well-preserved';
    const afterCondition = afterEvent.changes?.condition || 'well-preserved';
    const beforeColors = beforeEvent.changes?.colors || afterEvent.changes?.colors || s.colors;
    const afterColors = afterEvent.changes?.colors || s.colors;
    const yearGap = afterEvent.year - beforeEvent.year;

    let keyMoment: RestorationTransition['keyMoment'] = 'gradual';
    if ((beforeEvent.type === 'damaged' || beforeEvent.type === 'weathered') &&
        (afterEvent.type === 'restoration' || afterEvent.type === 'renovation' || afterEvent.type === 'repaint')) {
      keyMoment = 'damage-repair';
    } else if (beforeCondition === 'weathered' || beforeCondition === 'damaged') {
      if (afterCondition === 'restored' || afterCondition === 'well-preserved') {
        keyMoment = 'wear-repair';
      }
    } else if (i === 1) {
      keyMoment = 'creation-change';
    }

    transitions.push({
      beforeEvent,
      afterEvent,
      beforeCondition,
      afterCondition,
      beforeColors,
      afterColors,
      yearGap,
      keyMoment
    });
  }

  return transitions;
};

const getBestTransition = (s: Signboard): RestorationTransition | null => {
  const transitions = getRestorationTransitions(s);
  if (transitions.length === 0) return null;
  
  const priority: RestorationTransition['keyMoment'][] = ['damage-repair', 'wear-repair', 'creation-change', 'gradual'];
  for (const key of priority) {
    const found = transitions.find(t => t.keyMoment === key);
    if (found) return found;
  }
  return transitions[0];
};

const RestorationArchive: React.FC = () => {
  const { signboards } = useSignboards();
  const { toggleFavorite, isFavorite, toggleCompare, isInCompare, addToCompare } = useFavorites();
  const { getLatestStatus, getRecordsForSignboard, hasRecords, getStatusStats } = useStatusTracking();
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignboard, setSelectedSignboard] = useState<Signboard | null>(null);
  const [comparePair, setComparePair] = useState<[Signboard | null, Signboard | null]>([null, null]);
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

  const statusFilters: { value: StatusFilter; label: string; icon: string; color: string }[] = [
    { value: 'all', label: '全部', icon: '📚', color: '#8B4513' },
    { value: 'restored', label: conditionStatusLabels['restored'].text, icon: conditionStatusLabels['restored'].icon, color: conditionStatusLabels['restored'].color },
    { value: 'well-preserved', label: conditionStatusLabels['well-preserved'].text, icon: conditionStatusLabels['well-preserved'].icon, color: conditionStatusLabels['well-preserved'].color },
    { value: 'weathered', label: conditionStatusLabels['weathered'].text, icon: conditionStatusLabels['weathered'].icon, color: conditionStatusLabels['weathered'].color },
    { value: 'damaged', label: conditionStatusLabels['damaged'].text, icon: conditionStatusLabels['damaged'].icon, color: conditionStatusLabels['damaged'].color }
  ];

  const renderColorStrip = (colors: string[]) => (
    <div className="color-strip">
      {colors.map((c, i) => (
        <div key={i} className="color-strip-swatch" style={{ backgroundColor: c }} title={c} />
      ))}
    </div>
  );

  const renderConditionBadge = (condition: EventCondition) => {
    if (!condition) return <span className="condition-badge unknown">未知</span>;
    const info = conditionStatusLabels[condition];
    return (
      <span className="condition-badge" style={{ backgroundColor: info.color + '20', color: info.color }}>
        {info.icon} {info.text}
      </span>
    );
  };

  const renderCard = (s: Signboard) => {
    const { earliest, latest, span } = getEarliestAndLatest(s);
    const latestStatus = getLatestStatus(s.id) || s.condition;
    const statusInfo = conditionStatusLabels[latestStatus];
    const records = getRecordsForSignboard(s.id);
    const bestTransition = getBestTransition(s);
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

          {bestTransition && (
            <div className="card-compare-preview" onClick={() => { setSelectedSignboard(s); setViewMode('compare'); }}>
              <div className="compare-preview-label">
                {bestTransition.keyMoment === 'damage-repair' && '受损→修复'}
                {bestTransition.keyMoment === 'wear-repair' && '风化→修缮'}
                {bestTransition.keyMoment === 'creation-change' && '初制→改制'}
                {bestTransition.keyMoment === 'gradual' && '阶段变化'}
              </div>
              <div className="compare-preview-images">
                <div className="compare-preview-before">
                  <span className="preview-tag before-tag">{bestTransition.beforeEvent.year}</span>
                  <div className="preview-event-title">{bestTransition.beforeEvent.title}</div>
                  {renderConditionBadge(bestTransition.beforeCondition)}
                  {bestTransition.beforeColors.length > 0 && renderColorStrip(bestTransition.beforeColors)}
                </div>
                <div className="compare-preview-arrow">
                  <span className="arrow-year-gap">{bestTransition.yearGap}年</span>
                  →
                </div>
                <div className="compare-preview-after">
                  <span className="preview-tag after-tag">{bestTransition.afterEvent.year}</span>
                  <div className="preview-event-title">{bestTransition.afterEvent.title}</div>
                  {renderConditionBadge(bestTransition.afterCondition)}
                  {bestTransition.afterColors.length > 0 && renderColorStrip(bestTransition.afterColors)}
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

  const renderSingleCompare = (s: Signboard) => {
    const transitions = getRestorationTransitions(s);
    if (transitions.length === 0) return null;

    return (
      <div className="single-compare">
        <div className="single-compare-header">
          <h3 className="single-compare-title">
            {s.name} · 修复历程记录
          </h3>
          <button className="close-btn" onClick={() => setSelectedSignboard(null)}>✕</button>
        </div>

        <div className="record-based-intro">
          <img src={s.image} alt={s.name} className="record-intro-image" />
          <div className="record-intro-info">
            <h4>{s.shopName}</h4>
            <p>{s.era} · {s.year}年创立 · 📍 {s.location}</p>
            <p className="record-intro-desc">{s.description}</p>
            <div className="record-intro-colors">
              <span className="record-colors-label">招牌配色</span>
              {renderColorStrip(s.colors)}
            </div>
          </div>
        </div>

        <div className="record-transitions-section">
          <h4 className="transitions-section-title">📋 状态变化记录（基于{transitions.length}次历史事件）</h4>
          <div className="transitions-list">
            {transitions.map((t, idx) => {
              const beforeInfo = eventTypeLabels[t.beforeEvent.type];
              const afterInfo = eventTypeLabels[t.afterEvent.type];
              const momentLabel = t.keyMoment === 'damage-repair' ? '受损后修复'
                : t.keyMoment === 'wear-repair' ? '风化后修缮'
                : t.keyMoment === 'creation-change' ? '创立后改制'
                : '渐进变化';

              return (
                <div key={idx} className={`transition-card transition-${t.keyMoment}`}>
                  <div className="transition-moment-tag">{momentLabel}</div>
                  <div className="transition-body">
                    <div className="transition-side before-side">
                      <div className="transition-year">{t.beforeEvent.year}</div>
                      <div className="transition-event-icon">{beforeInfo.icon}</div>
                      <div className="transition-event-title">{t.beforeEvent.title}</div>
                      <div className="transition-event-type">{beforeInfo.label}</div>
                      <div className="transition-condition">
                        {renderConditionBadge(t.beforeCondition)}
                      </div>
                      {t.beforeColors.length > 0 && (
                        <div className="transition-colors">
                          {renderColorStrip(t.beforeColors)}
                        </div>
                      )}
                      <p className="transition-event-desc">{t.beforeEvent.description}</p>
                    </div>

                    <div className="transition-middle">
                      <div className="transition-connector" />
                      <div className="transition-gap-badge">{t.yearGap > 0 ? `${t.yearGap}年` : '同年'}</div>
                      <div className="transition-connector" />
                    </div>

                    <div className="transition-side after-side">
                      <div className="transition-year">{t.afterEvent.year}</div>
                      <div className="transition-event-icon">{afterInfo.icon}</div>
                      <div className="transition-event-title">{t.afterEvent.title}</div>
                      <div className="transition-event-type">{afterInfo.label}</div>
                      <div className="transition-condition">
                        {renderConditionBadge(t.afterCondition)}
                      </div>
                      {t.afterColors.length > 0 && (
                        <div className="transition-colors">
                          {renderColorStrip(t.afterColors)}
                        </div>
                      )}
                      <p className="transition-event-desc">{t.afterEvent.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="record-timeline-section">
          <h4 className="transitions-section-title">🕐 完整修复时间线</h4>
          <RestorationTimeline history={s.restorationHistory} />
        </div>
      </div>
    );
  };

  const renderPairCompare = (a: Signboard, b: Signboard) => {
    const aDamaged = a.restorationHistory.filter(e => e.type === 'damaged' || e.type === 'weathered');
    const bDamaged = b.restorationHistory.filter(e => e.type === 'damaged' || e.type === 'weathered');
    const aRepaired = a.restorationHistory.filter(e => e.type === 'restoration' || e.type === 'renovation' || e.type === 'repaint');
    const bRepaired = b.restorationHistory.filter(e => e.type === 'restoration' || e.type === 'renovation' || e.type === 'repaint');
    const aBest = getBestTransition(a);
    const bBest = getBestTransition(b);

    return (
      <div className="pair-compare">
        <div className="pair-compare-header">
          <h3 className="pair-compare-title">
            {a.name} VS {b.name}
          </h3>
          <button className="close-btn" onClick={() => setComparePair([null, null])}>✕</button>
        </div>

        <div className="pair-overview">
          <div className="pair-overview-card">
            <img src={a.image} alt={a.name} />
            <h4>{a.name}</h4>
            <p>{a.era} · {a.year}年</p>
            <p className="pair-overview-location">📍 {a.location}</p>
            {renderConditionBadge(a.condition)}
            {renderColorStrip(a.colors)}
          </div>
          <div className="pair-overview-middle">
            <div className="pair-stat-compare">
              <div className="pair-stat-row">
                <span className="pair-stat-val">{a.restorationHistory.length}</span>
                <span className="pair-stat-lbl">历史事件</span>
                <span className="pair-stat-val">{b.restorationHistory.length}</span>
              </div>
              <div className="pair-stat-row">
                <span className="pair-stat-val">{aDamaged.length}</span>
                <span className="pair-stat-lbl">受损/风化</span>
                <span className="pair-stat-val">{bDamaged.length}</span>
              </div>
              <div className="pair-stat-row">
                <span className="pair-stat-val">{aRepaired.length}</span>
                <span className="pair-stat-lbl">修缮/重漆</span>
                <span className="pair-stat-val">{bRepaired.length}</span>
              </div>
              <div className="pair-stat-row">
                <span className="pair-stat-val">{getEarliestAndLatest(a).span}年</span>
                <span className="pair-stat-lbl">历史跨度</span>
                <span className="pair-stat-val">{getEarliestAndLatest(b).span}年</span>
              </div>
              <div className="pair-stat-row">
                <span className="pair-stat-val">{a.fontStyle}</span>
                <span className="pair-stat-lbl">字体风格</span>
                <span className="pair-stat-val">{b.fontStyle}</span>
              </div>
              <div className="pair-stat-row">
                <span className="pair-stat-val" style={{ color: conditionStatusLabels[a.condition].color }}>
                  {conditionStatusLabels[a.condition].text}
                </span>
                <span className="pair-stat-lbl">当前状态</span>
                <span className="pair-stat-val" style={{ color: conditionStatusLabels[b.condition].color }}>
                  {conditionStatusLabels[b.condition].text}
                </span>
              </div>
            </div>
          </div>
          <div className="pair-overview-card">
            <img src={b.image} alt={b.name} />
            <h4>{b.name}</h4>
            <p>{b.era} · {b.year}年</p>
            <p className="pair-overview-location">📍 {b.location}</p>
            {renderConditionBadge(b.condition)}
            {renderColorStrip(b.colors)}
          </div>
        </div>

        <div className="pair-key-moments">
          <h4 className="transitions-section-title">🔑 关键转折对比</h4>
          <div className="key-moments-grid">
            <div className="key-moment-card">
              <div className="key-moment-header">
                <span className="key-moment-name">{a.name}</span>
                <span className="key-moment-label">最显著变化</span>
              </div>
              {aBest ? (
                <div className="key-moment-body">
                  <div className="key-moment-before">
                    <span className="key-moment-year">{aBest.beforeEvent.year}</span>
                    <span className="key-moment-title">{aBest.beforeEvent.title}</span>
                    {renderConditionBadge(aBest.beforeCondition)}
                  </div>
                  <div className="key-moment-arrow">→ {aBest.yearGap}年 →</div>
                  <div className="key-moment-after">
                    <span className="key-moment-year">{aBest.afterEvent.year}</span>
                    <span className="key-moment-title">{aBest.afterEvent.title}</span>
                    {renderConditionBadge(aBest.afterCondition)}
                  </div>
                  <p className="key-moment-desc">{aBest.afterEvent.description}</p>
                </div>
              ) : (
                <p className="key-moment-empty">暂无足够记录</p>
              )}
            </div>
            <div className="key-moment-card">
              <div className="key-moment-header">
                <span className="key-moment-name">{b.name}</span>
                <span className="key-moment-label">最显著变化</span>
              </div>
              {bBest ? (
                <div className="key-moment-body">
                  <div className="key-moment-before">
                    <span className="key-moment-year">{bBest.beforeEvent.year}</span>
                    <span className="key-moment-title">{bBest.beforeEvent.title}</span>
                    {renderConditionBadge(bBest.beforeCondition)}
                  </div>
                  <div className="key-moment-arrow">→ {bBest.yearGap}年 →</div>
                  <div className="key-moment-after">
                    <span className="key-moment-year">{bBest.afterEvent.year}</span>
                    <span className="key-moment-title">{bBest.afterEvent.title}</span>
                    {renderConditionBadge(bBest.afterCondition)}
                  </div>
                  <p className="key-moment-desc">{bBest.afterEvent.description}</p>
                </div>
              ) : (
                <p className="key-moment-empty">暂无足够记录</p>
              )}
            </div>
          </div>
        </div>

        <div className="pair-history-compare">
          <h4 className="transitions-section-title">📜 修复历程对照</h4>
          <div className="history-compare-table">
            <div className="history-compare-row header-row">
              <div className="history-col">{a.name}</div>
              <div className="history-col-center">年份</div>
              <div className="history-col">{b.name}</div>
            </div>
            {(() => {
              const maxLen = Math.max(a.restorationHistory.length, b.restorationHistory.length);
              const rows = [];
              for (let i = 0; i < maxLen; i++) {
                const aEvent = a.restorationHistory[i];
                const bEvent = b.restorationHistory[i];
                rows.push(
                  <div key={i} className="history-compare-row">
                    <div className={`history-col ${aEvent ? `event-type-${aEvent.type}` : 'empty'}`}>
                      {aEvent ? (
                        <>
                          <span className="history-event-icon">{eventTypeLabels[aEvent.type].icon}</span>
                          <span className="history-event-title">{aEvent.title}</span>
                          {aEvent.changes?.condition && renderConditionBadge(aEvent.changes.condition)}
                        </>
                      ) : <span className="history-empty">—</span>}
                    </div>
                    <div className="history-col-center">
                      <span className="history-year-a">{aEvent?.year || '—'}</span>
                      <span className="history-year-sep">/</span>
                      <span className="history-year-b">{bEvent?.year || '—'}</span>
                    </div>
                    <div className={`history-col ${bEvent ? `event-type-${bEvent.type}` : 'empty'}`}>
                      {bEvent ? (
                        <>
                          <span className="history-event-icon">{eventTypeLabels[bEvent.type].icon}</span>
                          <span className="history-event-title">{bEvent.title}</span>
                          {bEvent.changes?.condition && renderConditionBadge(bEvent.changes.condition)}
                        </>
                      ) : <span className="history-empty">—</span>}
                    </div>
                  </div>
                );
              }
              return rows;
            })()}
          </div>
        </div>
      </div>
    );
  };

  const renderCompareView = () => (
    <div className="compare-view">
      {!selectedSignboard && !comparePair[0] && !comparePair[1] && (
        <div className="compare-selector">
          <h3 className="compare-selector-title">选择招牌查看修复记录，或选择两块招牌进行对比</h3>
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
                <span className="compare-slot-placeholder">选择招牌 A<br /><small>点击下方招牌可单独查看</small></span>
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
                <span className="compare-slot-placeholder">选择招牌 B<br /><small>可选，留空查看单招牌</small></span>
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
                    setSelectedSignboard(s);
                  }
                }}
              >
                <img src={s.image} alt={s.name} />
                <span className="selector-item-name">{s.name}</span>
                <span className="selector-item-year">{s.year}年 · {s.restorationHistory.length}次记录</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSignboard && !comparePair[0] && !comparePair[1] && renderSingleCompare(selectedSignboard)}

      {comparePair[0] && !comparePair[1] && renderSingleCompare(comparePair[0] as Signboard)}

      {comparePair[0] && comparePair[1] && !selectedSignboard && renderPairCompare(comparePair[0] as Signboard, comparePair[1] as Signboard)}
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
