import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { signboards } from '../data/signboards';
import type { Filters } from '../types';
import { hasEventInEraStage } from '../types';
import { useCollections } from '../context/CollectionsContext';
import Filter from '../components/Filter';
import SearchBar, { type SearchQuery } from '../components/SearchBar';
import SignboardCard from '../components/SignboardCard';
import CollectionCard from '../components/CollectionCard';
import RestorationTimeline from '../components/RestorationTimeline';
import { getNeighborhoodRecommendations } from '../utils/recommendation';
import './Home.css';

const Home: React.FC = () => {
  const { collections } = useCollections();
  const [filters, setFilters] = useState<Filters>({
    era: '全部',
    fontStyle: '全部',
    tag: '全部',
    condition: '全部',
    eraStage: '全部',
    hasRestoration: '全部'
  });
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    shopName: '',
    location: '',
    fontStyle: '',
    tags: ''
  });

  const hasNonEmptyCollections = collections.some(c => c.items.length > 0);

  const featuredSignboard = signboards[0];
  const featuredRecommendations = useMemo(() => {
    return getNeighborhoodRecommendations(featuredSignboard, signboards, { limit: 4, minScore: 10 });
  }, [featuredSignboard]);

  const filteredSignboards = useMemo(() => {
    return signboards.filter(s => {
      if (searchQuery.shopName.trim()) {
        const keyword = searchQuery.shopName.trim().toLowerCase();
        if (!s.name.toLowerCase().includes(keyword) && !s.shopName.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      if (searchQuery.location.trim()) {
        const keyword = searchQuery.location.trim().toLowerCase();
        if (!s.location.toLowerCase().includes(keyword)) return false;
      }
      if (searchQuery.fontStyle.trim()) {
        const keyword = searchQuery.fontStyle.trim().toLowerCase();
        if (!s.fontStyle.toLowerCase().includes(keyword) && !s.fontFamily.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      if (searchQuery.tags.trim()) {
        const keyword = searchQuery.tags.trim().toLowerCase();
        const hasMatch = s.tags.some(tag => tag.toLowerCase().includes(keyword));
        if (!hasMatch) return false;
      }

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
  }, [filters, searchQuery]);

  const handleReset = () => {
    setFilters({
      era: '全部',
      fontStyle: '全部',
      tag: '全部',
      condition: '全部',
      eraStage: '全部',
      hasRestoration: '全部'
    });
    setSearchQuery({
      shopName: '',
      location: '',
      fontStyle: '',
      tags: ''
    });
  };

  const handleClearSearch = () => {
    setSearchQuery({
      shopName: '',
      location: '',
      fontStyle: '',
      tags: ''
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

      <div className="discovery-section">
        <div className="discovery-section-header">
          <div className="discovery-title-wrap">
            <h3 className="discovery-section-title">🔍 今日发现</h3>
            <p className="discovery-subtitle">
              从「{featuredSignboard.name}」出发，探索同街区的招牌故事
            </p>
          </div>
          <Link to={`/signboard/${featuredSignboard.id}`} className="discovery-more-link">
            查看详情 →
          </Link>
        </div>

        <div className="discovery-content">
          <Link to={`/signboard/${featuredSignboard.id}`} className="discovery-featured-card">
            <div className="discovery-featured-image">
              <img src={featuredSignboard.image} alt={featuredSignboard.name} />
              <div className="discovery-featured-overlay">
                <span className="discovery-featured-tag">今日精选</span>
              </div>
            </div>
            <div className="discovery-featured-info">
              <div className="discovery-featured-meta">
                <span className="discovery-era">{featuredSignboard.era}</span>
                <span className="discovery-location">📍 {featuredSignboard.location}</span>
              </div>
              <h4 className="discovery-featured-title">{featuredSignboard.name}</h4>
              <p className="discovery-featured-desc">{featuredSignboard.description}</p>
            </div>
          </Link>

          <div className="discovery-recommendations">
            <div className="discovery-rec-title">
              <span>🏘️ 同街区发现</span>
              <span className="discovery-rec-count">{featuredRecommendations.length} 个相关</span>
            </div>
            <div className="discovery-rec-list">
              {featuredRecommendations.map((rec, idx) => (
                <Link
                  key={rec.signboard.id}
                  to={`/signboard/${rec.signboard.id}`}
                  className="discovery-rec-item"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="discovery-rec-image">
                    <img src={rec.signboard.image} alt={rec.signboard.name} loading="lazy" />
                  </div>
                  <div className="discovery-rec-info">
                    <div className="discovery-rec-header">
                      <h5 className="discovery-rec-name">{rec.signboard.name}</h5>
                      <span className="discovery-rec-score">{rec.score}%</span>
                    </div>
                    <p className="discovery-rec-location">📍 {rec.signboard.location}</p>
                    <div className="discovery-rec-tags">
                      <span className="discovery-rec-tag">{rec.signboard.era}</span>
                      <span className="discovery-rec-tag">{rec.signboard.fontStyle}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {hasNonEmptyCollections && (
        <div className="collections-section">
          <div className="collections-section-header">
            <h3 className="collections-section-title">📚 我的藏册</h3>
            <Link to="/favorites" className="collections-more-link">
              管理藏册 →
            </Link>
          </div>
          <div className="masonry-grid">
            {collections
              .filter(c => c.items.length > 0)
              .slice(0, 4)
              .map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
          </div>
        </div>
      )}

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
        <SearchBar
          searchQuery={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
          resultCount={filteredSignboards.length}
        />

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
