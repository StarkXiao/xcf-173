import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import { exhibitionThemes, getSignboardsForExhibition } from '../data/exhibitions';
import type { Signboard } from '../types';
import RestorationTimeline from '../components/RestorationTimeline';
import './CompareArea.css';

const conditionLabels: Record<string, string> = {
  'well-preserved': '保存完好',
  'weathered': '自然风化',
  'damaged': '有所损坏',
  'restored': '经过修复'
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

const CompareArea: React.FC = () => {
  const { signboards } = useSignboards();
  const { getCompareSignboards, toggleCompare, clearCompare, compareList, addToCompare, maxCompare } = useFavorites();
  const compareSignboards = getCompareSignboards(signboards);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'calligraphy' | 'color' | 'history'>('overview');

  const themeSignboards = useMemo(() => {
    if (!selectedTheme) return [];
    return getSignboardsForExhibition(selectedTheme, signboards);
  }, [selectedTheme, signboards]);

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

  const getColorWarmth = (hex: string): 'warm' | 'cool' | 'neutral' => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'neutral';
    const { r, g, b } = rgb;
    const warmScore = r + (g * 0.5);
    const coolScore = b + (g * 0.5);
    if (Math.abs(warmScore - coolScore) < 60) return 'neutral';
    return warmScore > coolScore ? 'warm' : 'cool';
  };

  const handleAddFromTheme = (signboardId: string) => {
    const result = addToCompare(signboardId);
    if (!result.success && result.reason) {
      // 可以加提示
    }
  };

  const tabs = [
    { id: 'overview' as const, label: '总览对比', icon: '📊' },
    { id: 'calligraphy' as const, label: '书法对比', icon: '✍️' },
    { id: 'color' as const, label: '色彩对比', icon: '🎨' },
    { id: 'history' as const, label: '历史对比', icon: '📜' }
  ];

  return (
    <div className="compare-area-page animate-fade-in">
      <div className="compare-area-header">
        <div className="header-content">
          <Link to="/exhibition" className="back-to-hall">
            ← 返回展厅
          </Link>
          <h1 className="compare-area-title">⚖️ 展品对比区</h1>
          <p className="compare-area-subtitle">
            选择最多 {maxCompare} 件展品进行多维度对比分析
          </p>
        </div>
        <div className="header-stats">
          <div className="compare-count-badge">
            <span className="count-number">{compareList.length}</span>
            <span className="count-separator">/</span>
            <span className="count-max">{maxCompare}</span>
            <span className="count-label">已选展品</span>
          </div>
          {compareList.length > 0 && (
            <button className="clear-compare-btn" onClick={clearCompare}>
              清空全部
            </button>
          )}
        </div>
      </div>

      <div className="compare-area-content">
        <div className="compare-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">🏛️ 从展厅添加</h3>
            <select
              className="theme-select"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
            >
              <option value="">选择主题展厅...</option>
              {exhibitionThemes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.icon} {theme.name}
                </option>
              ))}
            </select>

            {selectedTheme && themeSignboards.length > 0 && (
              <div className="theme-signboard-list">
                {themeSignboards.map(sb => {
                  const inCompare = compareList.includes(sb.id);
                  return (
                    <div
                      key={sb.id}
                      className={`theme-signboard-item ${inCompare ? 'in-compare' : ''}`}
                      onClick={() => !inCompare && compareList.length < maxCompare && handleAddFromTheme(sb.id)}
                    >
                      <div className="item-thumb">
                        <img src={sb.image} alt={sb.name} />
                      </div>
                      <div className="item-info">
                        <span className="item-name">{sb.name}</span>
                        <span className="item-era">{sb.era}</span>
                      </div>
                      {inCompare ? (
                        <span className="item-status added">已添加</span>
                      ) : (
                        <span className="item-status add">+ 添加</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">💡 对比小贴士</h3>
            <ul className="tips-list">
              <li>选择 2-4 件展品进行对比效果最佳</li>
              <li>可从不同主题展厅中选择展品</li>
              <li>点击上方标签切换不同对比维度</li>
              <li>点击展品名称可查看详细信息</li>
            </ul>
          </div>
        </div>

        <div className="compare-main-area">
          {compareSignboards.length === 0 ? (
            <div className="empty-compare-area">
              <div className="empty-icon">🖼️</div>
              <h3>还没有选择对比展品</h3>
              <p>从左侧选择主题展厅，或前往展厅浏览添加展品</p>
              <Link to="/exhibition" className="go-exhibition-btn">
                前往展厅 →
              </Link>
            </div>
          ) : (
            <>
              <div className="compare-tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`compare-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="compare-content-area">
                {activeTab === 'overview' && (
                  <div className="overview-compare">
                    <table className="compare-table">
                      <thead>
                        <tr>
                          <th className="compare-corner">对比项</th>
                          {compareSignboards.map(s => (
                            <th key={s.id} className="compare-header-cell">
                              <button
                                className="remove-from-compare"
                                onClick={() => toggleCompare(s.id)}
                                title="移除此项"
                              >
                                ✕
                              </button>
                              <div className="compare-thumb">
                                <img src={s.image} alt={s.name} />
                              </div>
                              <Link to={`/exhibition/exhibit/${s.id}`} className="compare-name">
                                {s.name}
                              </Link>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="compare-row">
                          <td className="compare-label-cell">店铺名称</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">{s.shopName}</td>
                          ))}
                        </tr>
                        <tr className="compare-row">
                          <td className="compare-label-cell">历史年代</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">
                              <span className="value-highlight">{s.era}</span>
                            </td>
                          ))}
                        </tr>
                        <tr className="compare-row">
                          <td className="compare-label-cell">创立年份</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">{s.year}年</td>
                          ))}
                        </tr>
                        <tr className="compare-row">
                          <td className="compare-label-cell">所在位置</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">{s.location}</td>
                          ))}
                        </tr>
                        <tr className="compare-row">
                          <td className="compare-label-cell">建筑类型</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">{s.buildingType}</td>
                          ))}
                        </tr>
                        <tr className="compare-row">
                          <td className="compare-label-cell">字体风格</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">
                              <span className="font-style">{s.fontStyle}</span>
                            </td>
                          ))}
                        </tr>
                        <tr className="compare-row">
                          <td className="compare-label-cell">保存状态</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">
                              <span className={`status-tag status-${s.condition}`}>
                                {conditionLabels[s.condition]}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr className="compare-row">
                          <td className="compare-label-cell">招牌配色</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">
                              <div className="colors-row">
                                {s.colors.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="color-swatch"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="compare-row">
                          <td className="compare-label-cell">修缮次数</td>
                          {compareSignboards.map(s => (
                            <td key={s.id} className="compare-value-cell">
                              {s.restorationHistory.length} 次
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'calligraphy' && (
                  <div className="calligraphy-compare">
                    <div className="calligraphy-grid">
                      {compareSignboards.map(s => {
                        const features = fontStyleFeatures[s.fontStyle] || { strokes: '未知', feeling: '未知', era: '未知', features: ['-'] };
                        return (
                          <div key={s.id} className="calligraphy-card">
                            <Link to={`/exhibition/exhibit/${s.id}`} className="calligraphy-image">
                              <img src={s.image} alt={s.name} />
                            </Link>
                            <div className="calligraphy-content">
                              <h3 className="calligraphy-title">{s.name}</h3>
                              <div
                                className="calligraphy-preview"
                                style={{ fontFamily: s.fontFamily }}
                              >
                                {s.name}
                              </div>
                              <div className="calligraphy-info">
                                <div className="info-row">
                                  <span className="info-label">字体风格</span>
                                  <span className="info-value font-style-tag">{s.fontStyle}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-label">笔画特征</span>
                                  <span className="info-value">{features.strokes}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-label">整体气质</span>
                                  <span className="info-value">{features.feeling}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-label">流行年代</span>
                                  <span className="info-value">{features.era}</span>
                                </div>
                              </div>
                              <div className="calligraphy-features">
                                {features.features.map((f, idx) => (
                                  <span key={idx} className="feature-tag">{f}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="calligraphy-summary">
                      <h4>📝 书法风格总结</h4>
                      <div className="summary-stats">
                        <div className="summary-item">
                          <span className="summary-label">字体种类</span>
                          <span className="summary-value">
                            {new Set(compareSignboards.map(s => s.fontStyle)).size} 种
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">包含书体</span>
                          <span className="summary-value">
                            {[...new Set(compareSignboards.map(s => s.fontStyle))].join('、')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'color' && (
                  <div className="color-compare">
                    <div className="color-compare-grid">
                      {compareSignboards.map(s => {
                        const warmColors = s.colors.filter(c => getColorWarmth(c) === 'warm').length;
                        const coolColors = s.colors.filter(c => getColorWarmth(c) === 'cool').length;
                        const neutralColors = s.colors.filter(c => getColorWarmth(c) === 'neutral').length;
                        return (
                          <div key={s.id} className="color-analysis-card">
                            <Link to={`/exhibition/exhibit/${s.id}`} className="color-card-title">
                              {s.name}
                            </Link>
                            <div className="color-ratio-bar">
                              {s.colors.map((color, idx) => {
                                const ratio = idx === 0 ? 55 : idx === 1 ? 30 : 15;
                                return (
                                  <div
                                    key={idx}
                                    className="color-ratio-segment"
                                    style={{ backgroundColor: color, width: `${ratio}%` }}
                                    title={color}
                                  >
                                    {ratio >= 15 && <span className="ratio-label">{ratio}%</span>}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="color-list">
                              {s.colors.map((color, idx) => (
                                <div key={idx} className="color-item">
                                  <div className="color-swatch-small" style={{ backgroundColor: color }} />
                                  <span className="color-hex">{color}</span>
                                  <span className="color-role">
                                    {idx === 0 ? '主色' : idx === 1 ? '辅色' : '点缀'}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="color-warmth">
                              <span className={`warmth-tag warmth-warm`}>暖 {warmColors}</span>
                              <span className={`warmth-tag warmth-neutral`}>中 {neutralColors}</span>
                              <span className={`warmth-tag warmth-cool`}>冷 {coolColors}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="color-summary">
                      <h4>🎨 色彩分析总结</h4>
                      <div className="summary-stats">
                        <div className="summary-item">
                          <span className="summary-label">总颜色数</span>
                          <span className="summary-value">
                            {new Set(compareSignboards.flatMap(s => s.colors)).size} 种
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">共用颜色</span>
                          <span className="summary-value">
                            {(() => {
                              if (compareSignboards.length < 2) return '-';
                              const colorSets = compareSignboards.map(s => new Set(s.colors));
                              const common = [...colorSets[0]].filter(c => colorSets.every(set => set.has(c)));
                              return common.length > 0 ? `${common.length} 种 (${common.join('、')})` : '无共用色';
                            })()}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">冷暖偏好</span>
                          <span className="summary-value">
                            {(() => {
                              const allColors = compareSignboards.flatMap(s => s.colors);
                              const warm = allColors.filter(c => getColorWarmth(c) === 'warm').length;
                              const cool = allColors.filter(c => getColorWarmth(c) === 'cool').length;
                              if (warm > cool) return `偏暖色调`;
                              if (cool > warm) return `偏冷色调`;
                              return `冷暖均衡`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="history-compare">
                    <div className="history-timeline-compare">
                      {compareSignboards.map(s => (
                        <div key={s.id} className="history-timeline-card">
                          <Link to={`/exhibition/exhibit/${s.id}`} className="history-card-title">
                            {s.name}
                          </Link>
                          <RestorationTimeline history={s.restorationHistory} compact />
                        </div>
                      ))}
                    </div>

                    <div className="history-summary">
                      <h4>📜 历史数据对比</h4>
                      <table className="history-stats-table">
                        <thead>
                          <tr>
                            <th>指标</th>
                            {compareSignboards.map(s => (
                              <th key={s.id}>{s.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>创立年份</td>
                            {compareSignboards.map(s => (
                              <td key={s.id}>{s.year}年</td>
                            ))}
                          </tr>
                          <tr>
                            <td>历史跨度</td>
                            {compareSignboards.map(s => (
                              <td key={s.id}>
                                {Math.min(...s.restorationHistory.map(h => h.year))} - {Math.max(...s.restorationHistory.map(h => h.year))}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td>总事件数</td>
                            {compareSignboards.map(s => (
                              <td key={s.id}>{s.restorationHistory.length} 次</td>
                            ))}
                          </tr>
                          <tr>
                            <td>修缮次数</td>
                            {compareSignboards.map(s => (
                              <td key={s.id}>{eventTypeCount(s, 'restoration')} 次</td>
                            ))}
                          </tr>
                          <tr>
                            <td>受损次数</td>
                            {compareSignboards.map(s => (
                              <td key={s.id}>{eventTypeCount(s, 'damaged')} 次</td>
                            ))}
                          </tr>
                          <tr>
                            <td>重漆次数</td>
                            {compareSignboards.map(s => (
                              <td key={s.id}>{eventTypeCount(s, 'repaint')} 次</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareArea;
