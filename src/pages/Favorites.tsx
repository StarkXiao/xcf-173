import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import SignboardCard from '../components/SignboardCard';
import RestorationTimeline from '../components/RestorationTimeline';
import { eraStages, getSignboardEraStages, getEventsInEraStage } from '../types';
import type { Signboard, RestorationEvent } from '../types';
import './Favorites.css';

type ViewMode = 'grid' | 'timeline' | 'grouped';

const Favorites: React.FC = () => {
  const { getFavoriteSignboards, favorites } = useFavorites();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const favoriteSignboards = getFavoriteSignboards(signboards);

  const groupedByEraStage = useMemo(() => {
    const groups: Record<string, Signboard[]> = {};
    favoriteSignboards.forEach(s => {
      const stages = getSignboardEraStages(s);
      stages.forEach(stage => {
        if (!groups[stage.id]) groups[stage.id] = [];
        groups[stage.id].push(s);
      });
    });
    return groups;
  }, [favoriteSignboards]);

  interface TimelineEntry {
    signboard: Signboard;
    events: RestorationEvent[];
    stageId: string;
  }

  const timelineEntries = useMemo((): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];
    favoriteSignboards.forEach(s => {
      const stages = getSignboardEraStages(s);
      stages.forEach(stage => {
        entries.push({
          signboard: s,
          events: getEventsInEraStage(s, stage.id),
          stageId: stage.id
        });
      });
    });
    return entries.sort((a, b) => {
      const aMin = Math.min(...a.events.map(e => e.year));
      const bMin = Math.min(...b.events.map(e => e.year));
      return aMin - bMin;
    });
  }, [favoriteSignboards]);

  return (
    <div className="favorites-page animate-fade-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">❤️ 我的收藏</h1>
          <p className="page-subtitle">
            已收藏 <strong>{favorites.length}</strong> 块珍贵招牌
          </p>
        </div>
        <div className="header-actions-row">
          {favoriteSignboards.length > 0 && (
            <div className="view-switcher">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="网格视图"
              >
                🔲 网格
              </button>
              <button
                className={`view-btn ${viewMode === 'grouped' ? 'active' : ''}`}
                onClick={() => setViewMode('grouped')}
                title="按年代分组"
              >
                📚 年代分组
              </button>
              <button
                className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                onClick={() => setViewMode('timeline')}
                title="年代阶段"
              >
                🕰️ 年代轴
              </button>
            </div>
          )}
          <Link to="/" className="browse-btn">
            继续浏览 →
          </Link>
        </div>
      </div>

      {favoriteSignboards.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">📚</div>
          <h2>收藏夹还是空的</h2>
          <p>去首页看看那些承载着城市记忆的老招牌吧</p>
          <Link to="/" className="go-btn">去发现招牌</Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="masonry-grid">
          {favoriteSignboards.map(signboard => (
            <SignboardCard key={signboard.id} signboard={signboard} />
          ))}
        </div>
      ) : viewMode === 'grouped' ? (
        <div className="grouped-view">
          {Object.entries(groupedByEraStage)
            .sort(([a], [b]) => {
              const stageA = eraStages.find(s => s.id === a);
              const stageB = eraStages.find(s => s.id === b);
              return (stageA?.startYear ?? 9999) - (stageB?.startYear ?? 9999);
            })
            .map(([stageId, items]) => {
              const stage = eraStages.find(s => s.id === stageId);
              return (
                <div key={stageId} className="era-group">
                  <div className="era-group-header" style={stage ? { borderColor: stage.color } : undefined}>
                    <h3 className="era-group-title" style={stage ? { color: stage.color } : undefined}>
                      ◆ {stage?.label ?? '其他年代'}
                    </h3>
                    {stage && (
                      <span className="era-group-years">
                        {stage.startYear} - {stage.endYear}
                      </span>
                    )}
                    <span className="era-group-count">{items.length} 块招牌（含跨阶段）</span>
                  </div>
                  <div className="masonry-grid">
                    {items.map(signboard => {
                      const stageEvents = getEventsInEraStage(signboard, stageId);
                      return (
                        <div key={signboard.id} className="grouped-card-wrapper">
                          <SignboardCard signboard={signboard} />
                          <div className="stage-events-panel">
                            <div className="stage-events-title">
                              {stage?.label ?? ''} · {stageEvents.length} 件事
                            </div>
                            <RestorationTimeline history={stageEvents} compact />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="timeline-view">
          <div className="era-stage-section">
            <h3 className="era-stage-title">🕰️ 收藏招牌年代分布</h3>
            <RestorationTimeline
              history={[]}
              showEraStages
              signboards={favoriteSignboards}
            />
          </div>
          <div className="timeline-cards-list">
            {timelineEntries.map((entry, idx) => {
              const stage = eraStages.find(s => s.id === entry.stageId);
              const minYear = Math.min(...entry.events.map(e => e.year));
              return (
                <div key={`${entry.signboard.id}-${entry.stageId}-${idx}`} className="timeline-card-item">
                  <div className="timeline-card-year" style={stage ? { borderColor: stage.color, color: stage.color } : undefined}>
                    {minYear}
                    <div className="year-stage-tag">{stage?.label}</div>
                  </div>
                  <div className="timeline-card-content">
                    <SignboardCard signboard={entry.signboard} />
                    <div className="stage-events-panel">
                      <div className="stage-events-title">
                        本阶段修缮事件
                      </div>
                      <RestorationTimeline history={entry.events} compact />
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

export default Favorites;
