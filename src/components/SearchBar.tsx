import React from 'react';
import './SearchBar.css';

export interface SearchQuery {
  shopName: string;
  location: string;
  fontStyle: string;
  tags: string;
}

interface SearchBarProps {
  searchQuery: SearchQuery;
  onChange: (query: SearchQuery) => void;
  onClear: () => void;
  resultCount: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onChange, onClear, resultCount }) => {
  const handleInputChange = (key: keyof SearchQuery, value: string) => {
    onChange({ ...searchQuery, [key]: value });
  };

  const handleRemoveTag = (key: keyof SearchQuery) => {
    onChange({ ...searchQuery, [key]: '' });
  };

  const hasActiveSearch = Object.values(searchQuery).some(v => v.trim() !== '');

  const activeTags: { key: keyof SearchQuery; label: string; value: string }[] = [];
  if (searchQuery.shopName.trim()) {
    activeTags.push({ key: 'shopName', label: '店名', value: searchQuery.shopName.trim() });
  }
  if (searchQuery.location.trim()) {
    activeTags.push({ key: 'location', label: '街区', value: searchQuery.location.trim() });
  }
  if (searchQuery.fontStyle.trim()) {
    activeTags.push({ key: 'fontStyle', label: '字体', value: searchQuery.fontStyle.trim() });
  }
  if (searchQuery.tags.trim()) {
    activeTags.push({ key: 'tags', label: '标签', value: searchQuery.tags.trim() });
  }

  return (
    <div className="search-bar-container">
      <div className="search-bar-header">
        <h2 className="search-bar-title">🔎 多条件搜索</h2>
        <button
          className="search-clear-btn"
          onClick={onClear}
          disabled={!hasActiveSearch}
        >
          清空搜索
        </button>
      </div>

      <div className="search-inputs-grid">
        <div className="search-input-group">
          <label className="search-input-label">
            <span>🏪</span> 店名
          </label>
          <input
            type="text"
            className="search-input"
            placeholder="输入店名，如：同仁堂、德兴茶庄..."
            value={searchQuery.shopName}
            onChange={(e) => handleInputChange('shopName', e.target.value)}
          />
        </div>

        <div className="search-input-group">
          <label className="search-input-label">
            <span>📍</span> 街区
          </label>
          <input
            type="text"
            className="search-input"
            placeholder="输入街区/地址，如：南京路、北京路、大栅栏..."
            value={searchQuery.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        <div className="search-input-group">
          <label className="search-input-label">
            <span>✍️</span> 字体
          </label>
          <input
            type="text"
            className="search-input"
            placeholder="输入字体，如：楷书、行书、隶书、魏碑..."
            value={searchQuery.fontStyle}
            onChange={(e) => handleInputChange('fontStyle', e.target.value)}
          />
        </div>

        <div className="search-input-group">
          <label className="search-input-label">
            <span>🏷️</span> 标签
          </label>
          <input
            type="text"
            className="search-input"
            placeholder="输入标签，如：老字号、民国、茶庄、港式..."
            value={searchQuery.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
          />
        </div>
      </div>

      <div className="active-search-tags">
        <span className="active-search-label">当前搜索条件：</span>
        {activeTags.length === 0 ? (
          <span className="no-active-tags">暂无，在上方输入框中输入关键词开始搜索</span>
        ) : (
          activeTags.map(tag => (
            <span key={tag.key} className="active-search-tag">
              <span className="search-tag-type">{tag.label}:</span>
              <span>"{tag.value}"</span>
              <button
                className="search-tag-remove"
                onClick={() => handleRemoveTag(tag.key)}
                title={`移除${tag.label}搜索条件`}
              >
                ×
              </button>
            </span>
          ))
        )}
        {hasActiveSearch && (
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            匹配 <strong style={{ color: 'var(--primary-color)' }}>{resultCount}</strong> 块招牌
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
