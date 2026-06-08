import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import SignboardCard from '../components/SignboardCard';
import RestorationTimeline from '../components/RestorationTimeline';
import { eraStages } from '../types';
import type { Signboard } from '../types';
import './Favorites.css';

type ViewMode = 'grid' | 'timeline' | 'grouped';

const Favorites: React.FC = () => {
  const { getFavoriteSignboards, favorites } = useFavorites();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const favoriteSignboards = getFavoriteSignboards(signboards);

  const groupedByEraStage = useMemo(() => {
    const groups: Record<string, Signboard[]> = {};
    favoriteSignboards.forEach(s => {
      const firstYear = s.restorationHistory[0]?.year ?? s.year;
      const stage = eraStages.find(es => firstYear >= es.startYear && firstYear <= es.endYear);
      const key = stage?.id ?? 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
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
                    <span className="era-group-count">{items.length} 块招牌</span>
                  </div>
                  <div className="masonry-grid">
                    {items.map(signboard => (
                      <SignboardCard key={signboard.id} signboard={signboard} />
                    ))}
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
            {[...favoriteSignboards]
              .sort((a, b) => (a.restorationHistory[0]?.year ?? a.year) - (b.restorationHistory[0]?.year ?? b.year))
              .map(signboard => (
                <div key={signboard.id} className="timeline-card-item">
                  <div className="timeline-card-year">
                    {signboard.restorationHistory[0]?.year ?? signboard.year}
                  </div>
                  <div className="timeline-card-content">
                    <SignboardCard signboard={signboard} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
