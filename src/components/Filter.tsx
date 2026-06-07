import React from 'react';
import type { Filters } from '../types';
import { eras, fontStyles, conditions, allTags } from '../data/signboards';
import './Filter.css';

interface FilterProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
  resultCount: number;
}

const Filter: React.FC<FilterProps> = ({ filters, onChange, onReset, resultCount }) => {
  const handleChange = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

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
          <label className="filter-label">保存状态</label>
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
