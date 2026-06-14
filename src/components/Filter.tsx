import React, { useMemo } from 'react';
import type { Filters } from '../types';
import { eraStages } from '../types';
import { conditions } from '../data/signboards';
import { useSignboards } from '../context/SignboardsContext';
import './Filter.css';

interface FilterProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
  resultCount: number;
}

const Filter: React.FC<FilterProps> = ({ filters, onChange, onReset, resultCount }) => {
  const { getAllTags, getAllEras, getAllFontStyles } = useSignboards();

  const allTags = useMemo(() => getAllTags(), [getAllTags]);
  const eras = useMemo(() => ['全部', ...getAllEras()], [getAllEras]);
  const fontStyles = useMemo(() => ['全部', ...getAllFontStyles()], [getAllFontStyles]);
  const handleChange = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const userStatusOptions = [
    { value: '全部', label: '全部用户状态' },
    { value: 'well-preserved', label: '✨ 保存完好（用户记录）' },
    { value: 'weathered', label: '🍂 自然风化（用户记录）' },
    { value: 'damaged', label: '⚠️ 有所损坏（用户记录）' },
    { value: 'restored', label: '🏛️ 经过修复（用户记录）' },
    { value: 'no-tracking', label: '暂无追踪记录' }
  ];

  return (
    <div className="filter-container">
      <div className="filter-header">
        <h2>🔍 筛选条件</h2>
        <button className="reset-btn" onClick={onReset}>
          重置筛选
        </button>
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label className="filter-label">年代阶段</label>
          <select
            className="filter-select"
            value={filters.eraStage}
            onChange={(e) => handleChange('eraStage', e.target.value)}
          >
            <option value="全部">全部阶段</option>
            {eraStages.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.label}（{stage.startYear}-{stage.endYear}）
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">年代</label>
          <select
            className="filter-select"
            value={filters.era}
            onChange={(e) => handleChange('era', e.target.value)}
          >
            {eras.map(era => (
              <option key={era} value={era}>{era}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">字体</label>
          <select
            className="filter-select"
            value={filters.fontStyle}
            onChange={(e) => handleChange('fontStyle', e.target.value)}
          >
            {fontStyles.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">原始保存状态</label>
          <select
            className="filter-select"
            value={filters.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
          >
            {conditions.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">用户记录状态</label>
          <select
            className="filter-select"
            value={filters.userStatus}
            onChange={(e) => handleChange('userStatus', e.target.value)}
          >
            {userStatusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">状态追踪</label>
          <select
            className="filter-select"
            value={filters.hasStatusTracking}
            onChange={(e) => handleChange('hasStatusTracking', e.target.value)}
          >
            <option value="全部">全部</option>
            <option value="has-tracking">有追踪记录</option>
            <option value="no-tracking">暂无追踪</option>
            <option value="has-damaged-record">曾记录损坏</option>
            <option value="has-restored-record">曾记录修复</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">修缮情况</label>
          <select
            className="filter-select"
            value={filters.hasRestoration}
            onChange={(e) => handleChange('hasRestoration', e.target.value)}
          >
            <option value="全部">全部</option>
            <option value="has-restored">有修缮记录</option>
            <option value="has-damaged">曾受损</option>
            <option value="has-repainted">经重漆</option>
            <option value="multi-restoration">多次修缮</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">标签</label>
          <select
            className="filter-select"
            value={filters.tag}
            onChange={(e) => handleChange('tag', e.target.value)}
          >
            <option value="全部">全部标签</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-footer">
        <span className="result-count">
          共找到 <strong>{resultCount}</strong> 块招牌
        </span>
      </div>
    </div>
  );
};

export default Filter;
