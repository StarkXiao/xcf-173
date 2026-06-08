import React from 'react';
import { Link } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import type { Signboard } from '../types';
import RestorationTimeline from '../components/RestorationTimeline';
import './Compare.css';

const conditionLabels: Record<string, string> = {
  'well-preserved': '保存完好',
  'weathered': '自然风化',
  'damaged': '有所损坏',
  'restored': '经过修复'
};

const eventTypeCount = (s: Signboard, type: string) =>
  s.restorationHistory.filter(h => h.type === type).length;

const Compare: React.FC = () => {
  const { getCompareSignboards, toggleCompare, clearCompare, compareList } = useFavorites();
  const compareSignboards = getCompareSignboards(signboards);

  const renderRow = (label: string, renderValue: (s: Signboard) => React.ReactNode) => (
    <tr className="compare-row">
      <td className="compare-label-cell">{label}</td>
      {compareSignboards.map(s => (
        <td key={s.id} className="compare-value-cell">{renderValue(s)}</td>
      ))}
      {Array.from({ length: Math.max(0, 4 - compareSignboards.length) }).map((_, i) => (
        <td key={`empty-${i}`} className="compare-empty-cell">-</td>
      ))}
    </tr>
  );

  return (
    <div className="compare-page animate-fade-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">⚖️ 对比分析</h1>
          <p className="page-subtitle">
            已选择 <strong>{compareList.length}</strong> / 4 块招牌进行对比
          </p>
        </div>
        <div className="header-actions">
          {compareSignboards.length > 0 && (
            <button className="clear-btn" onClick={clearCompare}>
              清空对比
            </button>
          )}
          <Link to="/" className="browse-btn">
            添加招牌 →
          </Link>
        </div>
      </div>

      {compareSignboards.length === 0 ? (
        <div className="empty-compare">
          <div className="empty-icon">📊</div>
          <h2>暂无对比项</h2>
          <p>最多可选择 4 块招牌进行字体、色彩等方面的对比分析</p>
          <Link to="/" className="go-btn">去选择招牌</Link>
        </div>
      ) : (
        <div className="compare-container">
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-corner">对比项</th>
                  {compareSignboards.map(s => (
                    <th key={s.id} className="compare-header-cell">
                      <button
                        className="remove-btn"
                        onClick={() => toggleCompare(s.id)}
                        title="移除此项"
                      >
                        ✕
                      </button>
                      <div className="compare-thumb">
                        <img src={s.image} alt={s.name} />
                      </div>
                      <Link to={`/signboard/${s.id}`} className="compare-name">
                        {s.name}
                      </Link>
                    </th>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - compareSignboards.length) }).map((_, i) => (
                    <th key={`placeholder-${i}`} className="compare-placeholder-cell">
                      <div className="placeholder-icon">➕</div>
                      <span>添加招牌</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderRow('招牌图片', (s) => (
                  <div className="full-image">
                    <img src={s.image} alt={s.name} />
                  </div>
                ))}
                {renderRow('店铺名称', (s) => <span>{s.shopName}</span>)}
                {renderRow('历史年代', (s) => (
                  <span className="value-highlight">{s.era}</span>
                ))}
                {renderRow('创立年份', (s) => <span>{s.year}年</span>)}
                {renderRow('所在位置', (s) => <span>{s.location}</span>)}
                {renderRow('建筑类型', (s) => <span>{s.buildingType}</span>)}
                {renderRow('字体风格', (s) => (
                  <span className="font-style">{s.fontStyle}</span>
                ))}
                {renderRow('字体家族', (s) => <span className="font-family">{s.fontFamily}</span>)}
                {renderRow('保存状态', (s) => (
                  <span className={`status-tag status-${s.condition}`}>
                    {conditionLabels[s.condition]}
                  </span>
                ))}
                {renderRow('招牌配色', (s) => (
                  <div className="colors-row">
                    {s.colors.map((color, idx) => (
                      <div key={idx} className="color-swatch" style={{ backgroundColor: color }} title={color}>
                        <span className="color-text">{color}</span>
                      </div>
                    ))}
                  </div>
                ))}
                {renderRow('相关标签', (s) => (
                  <div className="tags-row">
                    {s.tags.map(tag => (
                      <span key={tag} className="mini-tag">#{tag}</span>
                    ))}
                  </div>
                ))}
                {renderRow('修缮大事记', (s) => (
                  <div className="restoration-compact">
                    <RestorationTimeline history={s.restorationHistory} compact />
                  </div>
                ))}
                {renderRow('修缮统计', (s) => (
                  <div className="restoration-stats">
                    <div className="stat-pill">
                      <span className="pill-icon">📜</span>
                      <span className="pill-label">总计</span>
                      <span className="pill-value">{s.restorationHistory.length}</span>
                    </div>
                    <div className="stat-pill stat-good">
                      <span className="pill-icon">🏛️</span>
                      <span className="pill-label">修缮</span>
                      <span className="pill-value">{eventTypeCount(s, 'restoration')}</span>
                    </div>
                    <div className="stat-pill stat-warning">
                      <span className="pill-icon">⚠️</span>
                      <span className="pill-label">受损</span>
                      <span className="pill-value">{eventTypeCount(s, 'damaged')}</span>
                    </div>
                    <div className="stat-pill stat-paint">
                      <span className="pill-icon">🎨</span>
                      <span className="pill-label">重漆</span>
                      <span className="pill-value">{eventTypeCount(s, 'repaint')}</span>
                    </div>
                  </div>
                ))}
                {renderRow('历史跨度', (s) => {
                  const years = s.restorationHistory.map(h => h.year);
                  const min = Math.min(...years);
                  const max = Math.max(...years);
                  return (
                    <span className="value-highlight">
                      {min}-{max}（{max - min}年）
                    </span>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="compare-analysis">
            <h3 className="analysis-title">📋 对比小结</h3>
            <div className="analysis-content">
              <div className="analysis-item">
                <span className="analysis-label">年代跨度</span>
                <span className="analysis-value">
                  {Math.min(...compareSignboards.map(s => s.year))} - {Math.max(...compareSignboards.map(s => s.year))} 年
                  （跨度 {Math.max(...compareSignboards.map(s => s.year)) - Math.min(...compareSignboards.map(s => s.year))} 年）
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">字体种类</span>
                <span className="analysis-value">
                  {new Set(compareSignboards.map(s => s.fontStyle)).size} 种
                  （{[...new Set(compareSignboards.map(s => s.fontStyle))].join('、')}）
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">使用颜色</span>
                <span className="analysis-value">
                  {new Set(compareSignboards.flatMap(s => s.colors)).size} 种
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">修缮事件总数</span>
                <span className="analysis-value">
                  {compareSignboards.reduce((sum, s) => sum + s.restorationHistory.length, 0)} 次
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">历经磨难</span>
                <span className="analysis-value">
                  {compareSignboards.reduce((sum, s) => sum + eventTypeCount(s, 'damaged'), 0)} 次受损记录
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">老字号代表</span>
                <span className="analysis-value">
                  {compareSignboards.find(s => s.restorationHistory.length >= 5)?.name ?? '暂无'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
