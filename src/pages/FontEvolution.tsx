import React, { useMemo, useState } from 'react';
import { useFontEvolution } from '../context/FontEvolutionContext';
import FontFamilyCard from '../components/FontFamilyCard';
import { fontDifficulties, fontStyleCategories, fontSortOptions } from '../data/fontFamilies';
import type { FontEvolutionFilters } from '../types';
import './FontEvolution.css';

const FontEvolution: React.FC = () => {
  const { fontFamilies, filterFontFamilies, sortFontFamilies, getSignboardsForFontFamily } = useFontEvolution();
  
  const [filters, setFilters] = useState<FontEvolutionFilters>({
    style: '全部',
    era: '全部',
    difficulty: '全部',
    sortBy: 'historicalSignificance'
  });

  const [activeView, setActiveView] = useState<'grid' | 'timeline'>('grid');

  const filteredFamilies = useMemo(() => {
    const filtered = filterFontFamilies(filters);
    return sortFontFamilies(filtered, filters.sortBy);
  }, [filters, filterFontFamilies, sortFontFamilies]);

  const handleFilterChange = (key: keyof FontEvolutionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      style: '全部',
      era: '全部',
      difficulty: '全部',
      sortBy: 'historicalSignificance'
    });
  };

  const totalSignboards = useMemo(() => {
    return fontFamilies.reduce((sum, f) => sum + f.signboardIds.length, 0);
  }, [fontFamilies]);

  const timelineData = useMemo(() => {
    const allEras = new Map<string, typeof fontFamilies>();
    
    fontFamilies.forEach(family => {
      family.eraVariants.forEach(variant => {
        if (!allEras.has(variant.era)) {
          allEras.set(variant.era, []);
        }
        const arr = allEras.get(variant.era);
        if (arr && !arr.includes(family)) {
          arr.push(family);
        }
      });
    });
    
    return Array.from(allEras.entries()).sort((a, b) => {
      const getStartYear = (era: string) => {
        const match = era.match(/(\d+)/);
        if (match) return parseInt(match[1]);
        const order = ['先秦', '秦代', '汉代', '东晋', '北魏', '南北朝', '唐代', '宋代', '明代', '清代', '清末', '清末民国', '民国', '民国早期', '民国中期', '民国晚期', '现代'];
        return order.indexOf(era);
      };
      return getStartYear(a[0]) - getStartYear(b[0]);
    });
  }, [fontFamilies]);

  return (
    <div className="font-evolution-page animate-fade-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">✍️ 字体流变档案</h1>
          <p className="page-subtitle">
            探索中华书法字体的演变脉络，领略 {fontFamilies.length} 种字体风格，收录 {totalSignboards} 块招牌样本
          </p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`view-btn ${activeView === 'grid' ? 'active' : ''}`}
              onClick={() => setActiveView('grid')}
            >
              ▦ 网格视图
            </button>
            <button
              className={`view-btn ${activeView === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveView('timeline')}
            >
              📊 时间线视图
            </button>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <h2>🔍 筛选条件</h2>
          <button className="reset-btn" onClick={resetFilters}>
            重置筛选
          </button>
        </div>
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">字体风格</label>
            <select
              className="filter-select"
              value={filters.style}
              onChange={(e) => handleFilterChange('style', e.target.value)}
            >
              {fontStyleCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">年代</label>
            <select
              className="filter-select"
              value={filters.era}
              onChange={(e) => handleFilterChange('era', e.target.value)}
            >
              <option value="全部">全部年代</option>
              <option value="先秦">先秦</option>
              <option value="汉代">汉代</option>
              <option value="唐代">唐代</option>
              <option value="宋代">宋代</option>
              <option value="清代">清代</option>
              <option value="民国">民国</option>
              <option value="现代">现代</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">学习难度</label>
            <select
              className="filter-select"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              {fontDifficulties.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">排序方式</label>
            <select
              className="filter-select"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              {fontSortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-footer">
          <span className="result-count">
            共找到 <strong>{filteredFamilies.length}</strong> 种字体
          </span>
        </div>
      </div>

      {activeView === 'grid' ? (
        <div className="font-grid">
          {filteredFamilies.map(family => (
            <FontFamilyCard
              key={family.id}
              fontFamily={family}
              signboardCount={getSignboardsForFontFamily(family.id).length}
            />
          ))}
        </div>
      ) : (
        <div className="font-timeline">
          <div className="timeline-axis">
            {timelineData.map(([era, families]) => (
              <div key={era} className="timeline-era">
                <div className="timeline-era-label">
                  <h3>{era}</h3>
                </div>
                <div className="timeline-era-content">
                  {families.map(family => (
                    <div
                      key={family.id}
                      className="timeline-item"
                      style={{ borderLeftColor: family.color }}
                    >
                      <div className="timeline-item-header">
                        <span className="timeline-item-icon">{family.icon}</span>
                        <span className="timeline-item-name">{family.name}</span>
                      </div>
                      <p className="timeline-item-desc">
                        {family.eraVariants.find(v => v.era === era)?.description || family.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="font-stats-section">
        <h2 className="section-title">📊 字体数据概览</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">📜</div>
            <div className="stat-card-content">
              <h3>{fontFamilies.length}</h3>
              <p>字体种类</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🪧</div>
            <div className="stat-card-content">
              <h3>{totalSignboards}</h3>
              <p>招牌样本</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">📅</div>
            <div className="stat-card-content">
              <h3>{new Set(fontFamilies.flatMap(f => f.eraVariants.map(v => v.era))).size}</h3>
              <p>历史时期</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🏆</div>
            <div className="stat-card-content">
              <h3>{fontFamilies.filter(f => f.difficulty === 'advanced').length}</h3>
              <p>高难度字体</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontEvolution;
