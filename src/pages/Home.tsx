import React, { useState, useMemo } from 'react';
import { signboards } from '../data/signboards';
import type { Filters } from '../types';
import { hasEventInEraStage } from '../types';
import Filter from '../components/Filter';
import SignboardCard from '../components/SignboardCard';
import RestorationTimeline from '../components/RestorationTimeline';
import './Home.css';

const Home: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    era: '全部',
    fontStyle: '全部',
    tag: '全部',
    condition: '全部',
    eraStage: '全部',
    hasRestoration: '全部'
  });

  const filteredSignboards = useMemo(() => {
    return signboards.filter(s => {
      if (filters.era !== '全部' && s.era !== filters.era) return false;
      if (filters.fontStyle !== '全部' && s.fontStyle !== filters.fontStyle) return false;
      if (filters.condition !== '全部' && s.condition !== filters.condition) return false;
      if (filters.tag !== '全部' && !s.tags.includes(filters.tag)) return false;

      if (filters.eraStage !== '全部') {
        if (!hasEventInEraStage(s, filters.eraStage)) return false;
      }

      if (filters.hasRestoration !== '全部') {
        const history = s.restorationHistory;
        if (filters.hasRestoration === 'has-restored' && !history.some(h => h.type === 'restoration')) return false;
        if (filters.hasRestoration === 'has-damaged' && !history.some(h => h.type === 'damaged')) return false;
        if (filters.hasRestoration === 'has-repainted' && !history.some(h => h.type === 'repaint')) return false;
        if (filters.hasRestoration === 'multi-restoration' && history.filter(h => h.type === 'restoration').length < 2) return false;
      }

      return true;
    });
  }, [filters]);

  const handleReset = () => {
    setFilters({
      era: '全部',
      fontStyle: '全部',
      tag: '全部',
      condition: '全部',
      eraStage: '全部',
      hasRestoration: '全部'
    });
  };

  const handleSelectEraStage = (stageId: string) => {
    setFilters(prev => ({ ...prev, eraStage: stageId || '全部' }));
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-decor">◆ ◇ ◆</div>
          <h2 className="hero-title">街角招牌考古册</h2>
          <p className="hero-subtitle">
            记录那些被时光遗忘的城市记忆<br />
            探索百年老店招牌的字体美学与色彩智慧
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{signboards.length}</span>
              <span className="stat-label">块珍藏招牌</span>
            </div>
            <div className="stat-divider">|</div>
            <div className="stat-item">
              <span className="stat-number">{new Set(signboards.map(s => s.era)).size}</span>
              <span className="stat-label">个历史年代</span>
            </div>
            <div className="stat-divider">|</div>
            <div className="stat-item">
              <span className="stat-number">{new Set(signboards.map(s => s.fontStyle)).size}</span>
              <span className="stat-label">种字体风格</span>
            </div>
          </div>
        </div>
      </div>

      <div className="era-stage-section">
        <h3 className="era-stage-title">🕰️ 按年代阶段回看</h3>
        <RestorationTimeline
          history={[]}
          showEraStages
          signboards={signboards}
          onSelectEraStage={handleSelectEraStage}
          selectedEraStage={filters.eraStage === '全部' ? '' : filters.eraStage}
        />
      </div>

      <div className="main-content">
        <Filter
          filters={filters}
          onChange={setFilters}
          onReset={handleReset}
          resultCount={filteredSignboards.length}
        />

        {filteredSignboards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p className="empty-text">没有找到符合条件的招牌</p>
            <button className="empty-btn" onClick={handleReset}>清除筛选条件</button>
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredSignboards.map((signboard, index) => (
              <div key={signboard.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <SignboardCard signboard={signboard} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
