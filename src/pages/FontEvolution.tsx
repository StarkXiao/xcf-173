import React, { useMemo, useState } from 'react';
import { useFontEvolution } from '../context/FontEvolutionContext';
import FontFamilyCard from '../components/FontFamilyCard';
import {
  PageHeader,
  ViewToggle,
  FilterSection,
  FilterGroup,
  FilterGrid,
  FilterFooter,
  FormSelect,
  EmptyState,
  StatsGrid,
  ResetButton
} from '../components/common';
import type { StatChip, ViewOption } from '../components/common';
import { fontDifficulties, fontStyleCategories, fontSortOptions } from '../data/fontFamilies';
import type { FontFamily } from '../types';
import './FontEvolution.css';

const eraOptions = [
  { value: '全部', label: '全部年代' },
  { value: '先秦', label: '先秦' },
  { value: '汉代', label: '汉代' },
  { value: '唐代', label: '唐代' },
  { value: '宋代', label: '宋代' },
  { value: '清代', label: '清代' },
  { value: '民国', label: '民国' },
  { value: '现代', label: '现代' }
];

const viewOptions: ViewOption[] = [
  { key: 'grid', label: '网格视图', icon: '▦' },
  { key: 'timeline', label: '时间线视图', icon: '📊' }
];

const FontEvolution: React.FC = () => {
  const {
    fontFamilies,
    filters,
    resetFilters,
    handleFilterChange,
    filterFontFamilies,
    sortFontFamilies,
    getSignboardsForFontFamily
  } = useFontEvolution();

  const [activeView, setActiveView] = useState<'grid' | 'timeline'>('grid');

  const filteredFamilies = useMemo(() => {
    const filtered = filterFontFamilies();
    return sortFontFamilies(filtered, filters.sortBy);
  }, [filters, filterFontFamilies, sortFontFamilies]);

  const totalSignboards = useMemo(() => {
    return fontFamilies.reduce((sum, f) => sum + f.signboardIds.length, 0);
  }, [fontFamilies]);

  const pageStats = useMemo<StatChip[]>(() => [
    {
      icon: '📜',
      value: fontFamilies.length,
      label: '字体种类'
    },
    {
      icon: '🪧',
      value: totalSignboards,
      label: '招牌样本'
    },
    {
      icon: '📅',
      value: new Set(fontFamilies.flatMap(f => f.eraVariants.map(v => v.era))).size,
      label: '历史时期'
    },
    {
      icon: '🏆',
      value: fontFamilies.filter(f => f.difficulty === 'advanced').length,
      label: '高难度字体'
    }
  ], [fontFamilies, totalSignboards]);

  const timelineData = useMemo(() => {
    const allEras = new Map<string, FontFamily[]>();

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

  const renderRightActions = () => (
    <ViewToggle
      views={viewOptions}
      activeView={activeView}
      onViewChange={(key) => setActiveView(key as 'grid' | 'timeline')}
    />
  );

  return (
    <div className="font-evolution-page animate-fade-in">
      <PageHeader
        icon="✍️"
        title="字体流变档案"
        subtitle={`探索中华书法字体的演变脉络，领略 ${fontFamilies.length} 种字体风格，收录 ${totalSignboards} 块招牌样本`}
        rightActions={renderRightActions()}
      />

      <FilterSection title="🔍 筛选条件">
        <FilterGrid>
          <FilterGroup label="字体风格">
            <FormSelect
              value={filters.style}
              onChange={(e) => handleFilterChange('style', e.target.value)}
            >
              {fontStyleCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </FormSelect>
          </FilterGroup>

          <FilterGroup label="年代">
            <FormSelect
              value={filters.era}
              onChange={(e) => handleFilterChange('era', e.target.value)}
            >
              {eraOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </FormSelect>
          </FilterGroup>

          <FilterGroup label="学习难度">
            <FormSelect
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              {fontDifficulties.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </FormSelect>
          </FilterGroup>

          <FilterGroup label="排序方式">
            <FormSelect
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              {fontSortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </FormSelect>
          </FilterGroup>
        </FilterGrid>

        <FilterFooter>
          <span className="common-result-count">
            共找到 <strong>{filteredFamilies.length}</strong> 种字体
          </span>
          <ResetButton onClick={resetFilters} />
        </FilterFooter>
      </FilterSection>

      {filteredFamilies.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="没有找到匹配的字体"
          description="尝试调整筛选条件，或点击重置查看全部字体"
          actionLabel="重置筛选"
          onAction={resetFilters}
        />
      ) : activeView === 'grid' ? (
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

      <StatsGrid
        title="📊 字体数据概览"
        stats={pageStats.map(stat => ({
          icon: stat.icon,
          value: String(stat.value),
          label: typeof stat.label === 'string' ? stat.label : '数据'
        }))}
      />
    </div>
  );
};

export default FontEvolution;
