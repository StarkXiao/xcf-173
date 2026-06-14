import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSignboards } from '../context/SignboardsContext';
import { useFavorites } from '../context/FavoritesContext';
import { getEraStageByYear } from '../types';
import './CompareReport.css';

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

const getEraDiff = (year1: number, year2: number): { label: string; years: number } => {
  const diff = Math.abs(year1 - year2);
  let label = '同期';
  if (diff > 10 && diff <= 30) label = '相近';
  else if (diff > 30 && diff <= 60) label = '跨代';
  else if (diff > 60 && diff <= 100) label = '跨世纪';
  else if (diff > 100) label = '跨越百年';
  return { label, years: diff };
};

type ReportStep = 'select' | 'result';

const CompareReport: React.FC = () => {
  const { signboards } = useSignboards();
  const { getFavoriteSignboards, toggleReport, clearReport, reportList, maxReport, getReportSignboards, setReportList } = useFavorites();
  const [step, setStep] = useState<ReportStep>('select');
  const favoriteSignboards = getFavoriteSignboards(signboards);
  const reportSignboards = getReportSignboards(signboards);

  const handleGenerate = () => {
    if (reportSignboards.length >= 2) {
      setStep('result');
    }
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleSelectAll = () => {
    const ids = favoriteSignboards.slice(0, maxReport).map(s => s.id);
    setReportList(ids);
  };

  const colorAnalysis = useMemo(() => {
    if (reportSignboards.length < 2) return null;
    const allColors = reportSignboards.flatMap(s => s.colors);
    const categories = [...new Set(allColors.map(c => getColorCategory(c)))];
    const warm = allColors.filter(c => getColorWarmth(c) === 'warm').length;
    const cool = allColors.filter(c => getColorWarmth(c) === 'cool').length;
    const neutral = allColors.filter(c => getColorWarmth(c) === 'neutral').length;
    const colorSets = reportSignboards.map(s => new Set(s.colors));
    const common = [...colorSets[0]].filter(c => colorSets.every(set => set.has(c)));
    const unique = reportSignboards.map(s => {
      const others = reportSignboards.filter(x => x.id !== s.id).flatMap(x => x.colors);
      const othersSet = new Set(others);
      return {
        name: s.name,
        uniqueColors: s.colors.filter(c => !othersSet.has(c))
      };
    });
    return { categories, warm, cool, neutral, common, unique, total: new Set(allColors).size };
  }, [reportSignboards]);

  const fontAnalysis = useMemo(() => {
    if (reportSignboards.length < 2) return null;
    const fontStyles = [...new Set(reportSignboards.map(s => s.fontStyle))];
    const fontFamilies = [...new Set(reportSignboards.map(s => s.fontFamily))];
    const eras = [...new Set(reportSignboards.map(s => fontStyleFeatures[s.fontStyle]?.era || '未知'))];
    const diversity = fontStyles.length === 1 ? '完全统一' :
      fontStyles.length === reportSignboards.length ? '各具特色' : '部分相同';
    const details = reportSignboards.map(s => {
      const features = fontStyleFeatures[s.fontStyle] || { strokes: '未知', feeling: '未知', era: '未知', features: ['-'] };
      return {
        name: s.name,
        fontStyle: s.fontStyle,
        fontFamily: s.fontFamily,
        ...features
      };
    });
    return { fontStyles, fontFamilies, eras, diversity, details };
  }, [reportSignboards]);

  const eraAnalysis = useMemo(() => {
    if (reportSignboards.length < 2) return null;
    const sorted = [...reportSignboards].sort((a, b) => a.year - b.year);
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const span = newest.year - oldest.year;
    const stages = [...new Set(reportSignboards.map(s => getEraStageByYear(s.year)?.id).filter(Boolean))];
    const stageLabels = [...new Set(reportSignboards.map(s => getEraStageByYear(s.year)?.label).filter(Boolean))];
    const diffs: Array<{ from: string; to: string; diff: string; years: number }> = [];
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const eraDiff = getEraDiff(sorted[i].year, sorted[j].year);
        diffs.push({
          from: sorted[i].name,
          to: sorted[j].name,
          diff: eraDiff.label,
          years: eraDiff.years
        });
      }
    }
    const details = sorted.map(s => {
      const stage = getEraStageByYear(s.year);
      return {
        name: s.name,
        year: s.year,
        era: s.era,
        stage: stage?.label,
        stageRange: stage ? `${stage.startYear}-${stage.endYear}` : '',
        description: stage?.description || ''
      };
    });
    return { oldest, newest, span, stages: stages.length, stageLabels, diffs, details };
  }, [reportSignboards]);

  if (step === 'select') {
    return (
      <div className="report-page animate-fade-in">
        <div className="page-header">
          <div className="page-title-wrap">
            <h1 className="page-title">📋 收藏对比报告</h1>
            <p className="page-subtitle">
              从收藏夹挑选招牌，生成简版对比结论 · 已选择 <strong>{reportList.length}</strong> / {maxReport} 块
            </p>
          </div>
          <div className="header-actions">
            <Link to="/favorites" className="browse-btn">
              ← 返回收藏
            </Link>
          </div>
        </div>

        {favoriteSignboards.length === 0 ? (
          <div className="empty-report">
            <div className="empty-icon">📚</div>
            <h2>收藏夹还是空的</h2>
            <p>先去收藏一些感兴趣的招牌，再来生成对比报告吧</p>
            <Link to="/" className="go-btn">去发现招牌</Link>
          </div>
        ) : (
          <>
            <div className="select-toolbar">
              <div className="select-info">
                <span className="select-count">
                  {favoriteSignboards.length} 块收藏招牌可选
                </span>
                <span className="select-hint">请选择 2-{maxReport} 块招牌进行对比</span>
              </div>
              <div className="select-actions">
                <button className="select-btn secondary" onClick={handleSelectAll} disabled={favoriteSignboards.length === 0}>
                  全选前 {Math.min(maxReport, favoriteSignboards.length)} 个
                </button>
                {reportList.length > 0 && (
                  <button className="select-btn danger" onClick={clearReport}>
                    清空选择
                  </button>
                )}
              </div>
            </div>

            <div className="select-grid">
              {favoriteSignboards.map(signboard => {
                const selected = reportList.includes(signboard.id);
                const stage = getEraStageByYear(signboard.year);
                return (
                  <div
                    key={signboard.id}
                    className={`select-card ${selected ? 'selected' : ''}`}
                    onClick={() => toggleReport(signboard.id)}
                  >
                    <div className="select-checkbox">
                      <div className={`checkbox-inner ${selected ? 'checked' : ''}`}>
                        {selected && <span className="check-icon">✓</span>}
                      </div>
                    </div>
                    <div className="select-card-image">
                      <img src={signboard.image} alt={signboard.name} />
                    </div>
                    <div className="select-card-info">
                      <h3 className="select-card-title">{signboard.name}</h3>
                      <div className="select-card-meta">
                        <span className="meta-chip" style={{ borderColor: stage?.color, color: stage?.color }}>
                          {signboard.era} · {signboard.year}年
                        </span>
                        <span className="meta-chip font">
                          {signboard.fontStyle}
                        </span>
                      </div>
                      <div className="select-card-colors">
                        {signboard.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="mini-swatch"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="generate-bar">
              <div className="generate-info">
                {reportList.length >= 2 ? (
                  <span className="generate-ready">
                    ✓ 已选择 {reportList.length} 块招牌，可以生成报告
                  </span>
                ) : (
                  <span className="generate-hint">
                    还需选择 {2 - reportList.length} 块招牌
                  </span>
                )}
              </div>
              <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={reportList.length < 2}
              >
                📊 生成对比报告
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="report-page animate-fade-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">📊 对比结论报告</h1>
          <p className="page-subtitle">
            {reportSignboards.length} 块招牌 · {new Date().toLocaleDateString('zh-CN')} 生成
          </p>
        </div>
        <div className="header-actions">
          <button className="browse-btn" onClick={handleBack}>
            ← 重新选择
          </button>
          <button className="browse-btn primary" onClick={() => window.print()}>
            🖨️ 打印报告
          </button>
        </div>
      </div>

      <div className="report-overview">
        <h2 className="section-title">📋 概览</h2>
        <div className="overview-cards">
          <div className="overview-card">
            <div className="overview-icon">🏷️</div>
            <div className="overview-content">
              <div className="overview-label">招牌数量</div>
              <div className="overview-value">{reportSignboards.length} 块</div>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">📅</div>
            <div className="overview-content">
              <div className="overview-label">年代跨度</div>
              <div className="overview-value">{eraAnalysis?.span ?? 0} 年</div>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🎨</div>
            <div className="overview-content">
              <div className="overview-label">颜色种类</div>
              <div className="overview-value">{colorAnalysis?.total ?? 0} 种</div>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">✍️</div>
            <div className="overview-content">
              <div className="overview-label">字体风格</div>
              <div className="overview-value">{fontAnalysis?.fontStyles.length ?? 0} 种</div>
            </div>
          </div>
        </div>
      </div>

      <div className="report-signboards">
        <h2 className="section-title">🖼️ 参与对比的招牌</h2>
        <div className="signboards-strip">
          {reportSignboards.map((s, idx) => {
            const stage = getEraStageByYear(s.year);
            return (
              <div key={s.id} className="strip-card">
                <div className="strip-number">{idx + 1}</div>
                <div className="strip-image">
                  <img src={s.image} alt={s.name} />
                </div>
                <div className="strip-info">
                  <h4 className="strip-name">{s.name}</h4>
                  <div className="strip-meta">
                    <span style={{ color: stage?.color }}>{s.era} · {s.year}</span>
                    <span>·</span>
                    <span>{s.fontStyle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="report-section">
        <h2 className="section-title">✍️ 字体差异总结</h2>
        {fontAnalysis && (
          <div className="analysis-content">
            <div className="conclusion-box">
              <div className="conclusion-icon">💡</div>
              <div className="conclusion-text">
                <strong>风格{fontAnalysis.diversity}：</strong>
                共使用 <strong>{fontAnalysis.fontStyles.length}</strong> 种字体风格
                （{fontAnalysis.fontStyles.join('、')}），
                <strong>{fontAnalysis.fontFamilies.length}</strong> 种字体家族，
                跨越 <strong>{fontAnalysis.eras.length}</strong> 个流行时期
                （{fontAnalysis.eras.join('、')}）。
              </div>
            </div>

            <div className="font-compact-grid">
              {fontAnalysis.details.map(d => (
                <div key={d.name} className="font-compact-card">
                  <div className="font-compact-header">
                    <span className="font-compact-name">{d.name}</span>
                    <span className="font-compact-style">{d.fontStyle}</span>
                  </div>
                  <div className="font-compact-display" style={{ fontFamily: d.fontFamily }}>
                    {d.name}
                  </div>
                  <div className="font-compact-tags">
                    <span className="compact-tag">{d.strokes}</span>
                    <span className="compact-tag">{d.feeling}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="report-section">
        <h2 className="section-title">🎨 颜色差异总结</h2>
        {colorAnalysis && (
          <div className="analysis-content">
            <div className="conclusion-box">
              <div className="conclusion-icon">💡</div>
              <div className="conclusion-text">
                <strong>色系多样性：</strong>
                共 <strong>{colorAnalysis.total}</strong> 种颜色，
                涵盖 <strong>{colorAnalysis.categories.length}</strong> 个色系
                （{colorAnalysis.categories.join('、')}）。
                {colorAnalysis.common.length > 0 ? (
                  <>
                    <br />
                    <strong>共用色：</strong>
                    {colorAnalysis.common.length} 种共同使用的颜色（{colorAnalysis.common.join('、')}）。
                  </>
                ) : (
                  <>
                    <br />
                    <strong>无共用色</strong>，每块招牌都有独特的配色方案。
                  </>
                )}
                <br />
                <strong>冷暖倾向：</strong>
                {colorAnalysis.warm > colorAnalysis.cool ? (
                  <>整体<span className="warm-text">偏暖色调</span>（暖{colorAnalysis.warm}:冷{colorAnalysis.cool}:中{colorAnalysis.neutral}）</>
                ) : colorAnalysis.cool > colorAnalysis.warm ? (
                  <>整体<span className="cool-text">偏冷色调</span>（暖{colorAnalysis.warm}:冷{colorAnalysis.cool}:中{colorAnalysis.neutral}）</>
                ) : (
                  <>冷暖<span className="neutral-text">色调均衡</span>（暖{colorAnalysis.warm}:冷{colorAnalysis.cool}:中{colorAnalysis.neutral}）</>
                )}
              </div>
            </div>

            <div className="color-compact-grid">
              {reportSignboards.map(s => (
                <div key={s.id} className="color-compact-card">
                  <div className="color-compact-name">{s.name}</div>
                  <div className="color-compact-bar">
                    {s.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="color-bar-segment"
                        style={{ backgroundColor: color, width: `${100 / s.colors.length}%` }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="color-compact-list">
                    {s.colors.map((color, idx) => (
                      <div key={idx} className="color-compact-item">
                        <div className="color-dot" style={{ backgroundColor: color }} />
                        <span className="color-code">{color}</span>
                        <span className="color-cat">{getColorCategory(color)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {colorAnalysis.unique.some(u => u.uniqueColors.length > 0) && (
              <div className="unique-colors-box">
                <h4 className="subsection-title">🌟 独有颜色</h4>
                <div className="unique-colors-list">
                  {colorAnalysis.unique.filter(u => u.uniqueColors.length > 0).map(u => (
                    <div key={u.name} className="unique-color-row">
                      <span className="unique-name">{u.name}：</span>
                      <div className="unique-colors">
                        {u.uniqueColors.map((c, idx) => (
                          <div key={idx} className="unique-color-item">
                            <div className="color-dot" style={{ backgroundColor: c }} />
                            <span>{getColorCategory(c)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="report-section">
        <h2 className="section-title">📅 年代差异总结</h2>
        {eraAnalysis && (
          <div className="analysis-content">
            <div className="conclusion-box">
              <div className="conclusion-icon">💡</div>
              <div className="conclusion-text">
                <strong>时间跨度：</strong>
                从 <strong>{eraAnalysis.oldest.year}年</strong>（{eraAnalysis.oldest.name}）
                到 <strong>{eraAnalysis.newest.year}年</strong>（{eraAnalysis.newest.name}），
                跨越 <strong>{eraAnalysis.span}年</strong>，
                历经 <strong>{eraAnalysis.stages}</strong> 个历史阶段
                （{eraAnalysis.stageLabels.join(' → ')}）。
              </div>
            </div>

            <div className="era-timeline-compact">
              {eraAnalysis.details.map((d, idx) => {
                const stage = getEraStageByYear(d.year);
                return (
                  <div key={d.name} className="era-timeline-item">
                    <div className="era-timeline-dot" style={{ backgroundColor: stage?.color }} />
                    <div className="era-timeline-line" style={{ display: idx === eraAnalysis.details.length - 1 ? 'none' : 'block' }} />
                    <div className="era-timeline-content">
                      <div className="era-timeline-header">
                        <span className="era-year-badge" style={{ backgroundColor: stage?.color }}>{d.year}</span>
                        <span className="era-name">{d.name}</span>
                      </div>
                      <div className="era-timeline-meta">
                        {d.stage}（{d.stageRange}）
                      </div>
                      <div className="era-timeline-desc">{d.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {eraAnalysis.diffs.length > 0 && (
              <div className="era-diffs-box">
                <h4 className="subsection-title">⏱️ 招牌间年代差</h4>
                <div className="era-diffs-grid">
                  {eraAnalysis.diffs.map((d, idx) => (
                    <div key={idx} className="era-diff-card">
                      <span className="diff-from">{d.from}</span>
                      <span className="diff-arrow">→</span>
                      <span className="diff-to">{d.to}</span>
                      <span className={`diff-tag diff-${d.diff}`}>
                        {d.diff}（{d.years}年）
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="report-footer">
        <p>
          报告生成时间：{new Date().toLocaleString('zh-CN')} ·
          街角招牌考古册 © 2026
        </p>
      </div>
    </div>
  );
};

export default CompareReport;
