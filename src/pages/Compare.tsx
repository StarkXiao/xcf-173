import React from 'react';
import { Link } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import type { Signboard } from '../types';
import { getEraStageByYear } from '../types';
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

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getColorCategory = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '其他';
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  if (diff < 30 && max > 200) return '白色系';
  if (diff < 30 && max < 80) return '黑色系';
  if (diff < 30) return '灰色系';
  if (r === max && g > b) return g > 150 ? '橙黄色系' : '红色系';
  if (r === max) return '紫红色系';
  if (g === max && r > b) return '黄绿色系';
  if (g === max) return '青绿色系';
  if (b === max && r > g) return '蓝紫色系';
  return '蓝色系';
};

const getColorWarmth = (hex: string): 'warm' | 'cool' | 'neutral' => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'neutral';
  const { r, g, b } = rgb;
  const warmScore = r + (g * 0.5);
  const coolScore = b + (g * 0.5);
  if (Math.abs(warmScore - coolScore) < 60) return 'neutral';
  return warmScore > coolScore ? 'warm' : 'cool';
};

const fontStyleFeatures: Record<string, { strokes: string; feeling: string; era: string; features: string[] }> = {
  '楷书': { strokes: '笔画工整', feeling: '端庄典雅', era: '通用', features: ['结构方正', '横平竖直', '易读性强'] },
  '行书': { strokes: '笔画流畅', feeling: '飘逸灵动', era: '民国流行', features: ['连笔自然', '节奏感强', '艺术感高'] },
  '隶书': { strokes: '蚕头燕尾', feeling: '古朴厚重', era: '清代传统', features: ['字形扁方', '波磔分明', '端庄大气'] },
  '魏碑': { strokes: '笔力遒劲', feeling: '雄浑古朴', era: '北朝风格', features: ['方笔为主', '棱角分明', '气势开张'] },
  '篆书': { strokes: '线条匀净', feeling: '高古典雅', era: '先秦古风', features: ['曲线优美', '装饰性强', '辨识度低'] },
  '宋体': { strokes: '横细竖粗', feeling: '规范工整', era: '建国后普及', features: ['印刷标准', '棱角分明', '现代感强'] },
  '艺术字': { strokes: '造型多变', feeling: '时尚新潮', era: '民国西风东渐', features: ['中西合璧', '装饰性强', '个性鲜明'] }
};

const getEraDiff = (year1: number, year2: number): string => {
  const diff = Math.abs(year1 - year2);
  if (diff <= 10) return '同期';
  if (diff <= 30) return '相近';
  if (diff <= 60) return '跨代';
  if (diff <= 100) return '跨世纪';
  return '跨越百年';
};

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
                {renderRow('颜色占比', (s) => {
                  const total = s.colors.length;
                  return (
                    <div className="color-ratio-bar">
                      {s.colors.map((color, idx) => {
                        const percentage = Math.round((1 / total) * 100);
                        return (
                          <div
                            key={idx}
                            className="color-ratio-segment"
                            style={{ backgroundColor: color, width: `${percentage}%` }}
                            title={`${color} ${percentage}%`}
                          >
                            <span className="ratio-label">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
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
            <h3 className="analysis-title">🎨 颜色占比分析</h3>
            <div className="color-analysis-grid">
              {compareSignboards.map(s => {
                const warmColors = s.colors.filter(c => getColorWarmth(c) === 'warm').length;
                const coolColors = s.colors.filter(c => getColorWarmth(c) === 'cool').length;
                const neutralColors = s.colors.filter(c => getColorWarmth(c) === 'neutral').length;
                const categories = [...new Set(s.colors.map(c => getColorCategory(c)))];
                return (
                  <div key={s.id} className="color-analysis-card">
                    <h4 className="color-analysis-name">{s.name}</h4>
                    <div className="color-ratio-bar large">
                      {s.colors.map((color, idx) => {
                        const percentage = Math.round((1 / s.colors.length) * 100);
                        return (
                          <div
                            key={idx}
                            className="color-ratio-segment"
                            style={{ backgroundColor: color, width: `${percentage}%` }}
                            title={`${color} ${percentage}%`}
                          >
                            <span className="ratio-label">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="color-legend-row">
                      {s.colors.map((color, idx) => (
                        <div key={idx} className="color-legend-item">
                          <div className="legend-swatch" style={{ backgroundColor: color }} />
                          <span className="legend-label">{getColorCategory(color)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="color-meta-row">
                      <span className={`warmth-tag warmth-warm`}>暖 {warmColors}</span>
                      <span className={`warmth-tag warmth-neutral`}>中 {neutralColors}</span>
                      <span className={`warmth-tag warmth-cool`}>冷 {coolColors}</span>
                    </div>
                    <div className="color-categories">
                      色系：{categories.join(' / ')}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="analysis-summary-row">
              <div className="analysis-item">
                <span className="analysis-label">总颜色数</span>
                <span className="analysis-value">
                  {new Set(compareSignboards.flatMap(s => s.colors)).size} 种
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">共用颜色</span>
                <span className="analysis-value">
                  {(() => {
                    if (compareSignboards.length < 2) return '-';
                    const colorSets = compareSignboards.map(s => new Set(s.colors));
                    const common = [...colorSets[0]].filter(c => colorSets.every(set => set.has(c)));
                    return common.length > 0 ? `${common.length} 种 (${common.join('、')})` : '无共用色';
                  })()}
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">色系多样性</span>
                <span className="analysis-value">
                  {new Set(compareSignboards.flatMap(s => s.colors.map(c => getColorCategory(c)))).size} 类
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">冷暖偏好</span>
                <span className="analysis-value">
                  {(() => {
                    const allColors = compareSignboards.flatMap(s => s.colors);
                    const warm = allColors.filter(c => getColorWarmth(c) === 'warm').length;
                    const cool = allColors.filter(c => getColorWarmth(c) === 'cool').length;
                    if (warm > cool) return `偏暖色调 (暖${warm}:冷${cool})`;
                    if (cool > warm) return `偏冷色调 (暖${warm}:冷${cool})`;
                    return `冷暖均衡 (暖${warm}:冷${cool})`;
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className="compare-analysis">
            <h3 className="analysis-title">✍️ 字体特征对比</h3>
            <div className="font-analysis-grid">
              {compareSignboards.map(s => {
                const features = fontStyleFeatures[s.fontStyle] || { strokes: '未知', feeling: '未知', era: '未知', features: ['-'] };
                return (
                  <div key={s.id} className="font-analysis-card">
                    <h4 className="font-analysis-name">{s.name}</h4>
                    <div className="font-style-display" style={{ fontFamily: s.fontFamily }}>
                      {s.name}
                    </div>
                    <div className="font-meta">
                      <div className="font-meta-row">
                        <span className="font-meta-label">字体风格</span>
                        <span className="font-meta-value font-style-tag">{s.fontStyle}</span>
                      </div>
                      <div className="font-meta-row">
                        <span className="font-meta-label">字体家族</span>
                        <span className="font-meta-value font-family-tag">{s.fontFamily}</span>
                      </div>
                      <div className="font-meta-row">
                        <span className="font-meta-label">笔画特征</span>
                        <span className="font-meta-value">{features.strokes}</span>
                      </div>
                      <div className="font-meta-row">
                        <span className="font-meta-label">整体气质</span>
                        <span className="font-meta-value">{features.feeling}</span>
                      </div>
                      <div className="font-meta-row">
                        <span className="font-meta-label">流行年代</span>
                        <span className="font-meta-value">{features.era}</span>
                      </div>
                    </div>
                    <div className="font-features-list">
                      {features.features.map((f, idx) => (
                        <span key={idx} className="font-feature-tag">{f}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="analysis-summary-row">
              <div className="analysis-item">
                <span className="analysis-label">字体种类</span>
                <span className="analysis-value">
                  {new Set(compareSignboards.map(s => s.fontStyle)).size} 种
                  （{[...new Set(compareSignboards.map(s => s.fontStyle))].join('、')}）
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">风格统一度</span>
                <span className="analysis-value">
                  {new Set(compareSignboards.map(s => s.fontStyle)).size === 1
                    ? '完全统一'
                    : new Set(compareSignboards.map(s => s.fontStyle)).size === compareSignboards.length
                    ? '各具特色'
                    : '部分相同'}
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">年代覆盖</span>
                <span className="analysis-value">
                  {[...new Set(compareSignboards.map(s => fontStyleFeatures[s.fontStyle]?.era || '未知'))].join('、')}
                </span>
              </div>
            </div>
          </div>

          <div className="compare-analysis">
            <h3 className="analysis-title">📅 年代差异总结</h3>
            <div className="era-analysis-section">
              <div className="era-timeline-visual">
                {compareSignboards.map(s => {
                  const stage = getEraStageByYear(s.year);
                  const minYear = Math.min(...compareSignboards.map(x => x.year));
                  const maxYear = Math.max(...compareSignboards.map(x => x.year));
                  const range = maxYear - minYear || 1;
                  const leftPos = Math.round(((s.year - minYear) / range) * 100);
                  return (
                    <div key={s.id} className="era-timeline-item" style={{ left: `${leftPos}%` }}>
                      <div className="era-marker" style={{ backgroundColor: stage?.color || '#888' }}>
                        <span className="era-marker-year">{s.year}</span>
                      </div>
                      <div className="era-marker-label">{s.name}</div>
                    </div>
                  );
                })}
                <div className="era-timeline-axis" />
              </div>
            </div>
            <div className="era-analysis-grid">
              {compareSignboards.map(s => {
                const stage = getEraStageByYear(s.year);
                const hasOther = compareSignboards.filter(x => x.id !== s.id);
                const diffs = hasOther.map(x => ({ name: x.name, diff: getEraDiff(s.year, x.year), years: Math.abs(s.year - x.year) }));
                return (
                  <div key={s.id} className="era-analysis-card">
                    <div className="era-card-header" style={{ backgroundColor: stage?.color + '30', borderLeftColor: stage?.color }}>
                      <h4 className="era-analysis-name">{s.name}</h4>
                      <span className="era-year-badge">{s.year}年</span>
                    </div>
                    <div className="era-stage-info">
                      <span className="era-stage-label">{stage?.label || s.era}</span>
                      <span className="era-stage-range">（{stage?.startYear}-{stage?.endYear}）</span>
                    </div>
                    <p className="era-stage-desc">{stage?.description || '暂无历史背景描述'}</p>
                    {diffs.length > 0 && (
                      <div className="era-diff-list">
                        <span className="era-diff-title">与其他招牌对比：</span>
                        {diffs.map((d, idx) => (
                          <span key={idx} className="era-diff-tag">
                            {d.name}：{d.diff}（差{d.years}年）
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="analysis-summary-row">
              <div className="analysis-item">
                <span className="analysis-label">年代跨度</span>
                <span className="analysis-value">
                  {Math.min(...compareSignboards.map(s => s.year))} - {Math.max(...compareSignboards.map(s => s.year))} 年
                  （跨度 {Math.max(...compareSignboards.map(s => s.year)) - Math.min(...compareSignboards.map(s => s.year))} 年）
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">历史阶段</span>
                <span className="analysis-value">
                  {new Set(compareSignboards.map(s => getEraStageByYear(s.year)?.id).filter(Boolean)).size} 个阶段
                  （{[...new Set(compareSignboards.map(s => getEraStageByYear(s.year)?.label).filter(Boolean))].join('、')}）
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">最古老招牌</span>
                <span className="analysis-value">
                  {compareSignboards.reduce((oldest, s) => s.year < oldest.year ? s : oldest).name}
                  （{compareSignboards.reduce((oldest, s) => s.year < oldest.year ? s : oldest).year}年）
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
