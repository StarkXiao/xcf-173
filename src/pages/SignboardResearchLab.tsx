import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSignboards } from '../context/SignboardsContext';
import { useResearchLab } from '../context/ResearchLabContext';
import SignboardCard from '../components/SignboardCard';
import {
  eraStages,
  getEraStageByYear,
  conditionStatusLabels
} from '../types';
import type {
  ResearchNote,
  ColorComparisonGroup,
  EraAnalysisSnapshot,
  Signboard
} from '../types';
import './SignboardResearchLab.css';

type TabKey = 'era' | 'color' | 'screen' | 'notes';
type NoteCategory = ResearchNote['category'];

const tabConfig: { key: TabKey; label: string; icon: string; desc: string }[] = [
  { key: 'era', label: '年代分析', icon: '🕰️', desc: '跨时代演变研究' },
  { key: 'color', label: '色彩对照', icon: '🎨', desc: '配色方案比对' },
  { key: 'screen', label: '样本筛查', icon: '🔬', desc: '多维度样本筛选' },
  { key: 'notes', label: '收藏笔记', icon: '📓', desc: '个人研究记录' }
];

const categoryLabels: Record<NoteCategory, { label: string; color: string; icon: string }> = {
  '年代分析': { label: '年代分析', color: '#8B4513', icon: '🕰️' },
  '色彩对照': { label: '色彩对照', color: '#C2185B', icon: '🎨' },
  '样本筛查': { label: '样本筛查', color: '#2E7D32', icon: '🔬' },
  '综合研究': { label: '综合研究', color: '#1565C0', icon: '📚' }
};

const SignboardResearchLab: React.FC = () => {
  const { signboards, getAllEras, getAllFontStyles, getAllTags, getAllColorPresets } = useSignboards();
  const {
    notes,
    colorGroups,
    eraSnapshots,
    activeFilter,
    addNote,
    updateNote,
    deleteNote,
    addColorGroup,
    updateColorGroup,
    deleteColorGroup,
    toggleSignboardInColorGroup,
    addEraSnapshot,
    updateEraSnapshot,
    deleteEraSnapshot,
    setActiveFilter,
    resetActiveFilter,
    filterSignboards
  } = useResearchLab();

  const [activeTab, setActiveTab] = useState<TabKey>('era');

  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);
  const [noteForm, setNoteForm] = useState<{
    title: string;
    content: string;
    tags: string;
    category: NoteCategory;
    relatedSignboardIds: string[];
  }>({
    title: '',
    content: '',
    tags: '',
    category: '综合研究',
    relatedSignboardIds: []
  });

  const [colorGroupEditorOpen, setColorGroupEditorOpen] = useState(false);
  const [editingColorGroup, setEditingColorGroup] = useState<ColorComparisonGroup | null>(null);
  const [colorGroupForm, setColorGroupForm] = useState({ name: '', description: '' });
  const [activeColorGroupId, setActiveColorGroupId] = useState<string | null>(null);

  const [snapshotEditorOpen, setSnapshotEditorOpen] = useState(false);
  const [editingSnapshot, setEditingSnapshot] = useState<EraAnalysisSnapshot | null>(null);
  const [snapshotForm, setSnapshotForm] = useState({
    name: '',
    eraStageId: eraStages[0].id,
    description: '',
    observations: '',
    signboardIds: [] as string[]
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [noteCategoryFilter, setNoteCategoryFilter] = useState<string>('全部');

  const allEras = useMemo(() => getAllEras(), [getAllEras]);
  const allFontStyles = useMemo(() => getAllFontStyles(), [getAllFontStyles]);
  const allTags = useMemo(() => getAllTags(), [getAllTags]);
  const allColorPresets = useMemo(() => getAllColorPresets(), [getAllColorPresets]);
  const allBuildingTypes = useMemo(() => {
    const set = new Set(signboards.map(s => s.buildingType));
    return Array.from(set);
  }, [signboards]);
  const allLocations = useMemo(() => {
    const set = new Set(signboards.map(s => s.location.split(/[市区县]/)[0] + (s.location.includes('上海') ? '上海' : s.location.includes('广州') ? '广州' : s.location.includes('北京') ? '北京' : s.location.includes('杭州') ? '杭州' : s.location.includes('香港') ? '香港' : '')));
    return Array.from(set).filter(Boolean);
  }, [signboards]);

  const eraDistribution = useMemo(() => {
    const dist: Record<string, Signboard[]> = {};
    eraStages.forEach(stage => { dist[stage.id] = []; });
    signboards.forEach(sb => {
      const stage = getEraStageByYear(sb.year);
      if (stage) dist[stage.id].push(sb);
    });
    return dist;
  }, [signboards]);

  const filteredSignboards = useMemo(() => filterSignboards(signboards, activeFilter), [signboards, activeFilter, filterSignboards]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilter.yearRange) count++;
    if (activeFilter.eras.length) count++;
    if (activeFilter.fontStyles.length) count++;
    if (activeFilter.conditions.length) count++;
    if (activeFilter.colors.length) count++;
    if (activeFilter.tags.length) count++;
    if (activeFilter.locations.length) count++;
    if (activeFilter.hasRestoration !== null) count++;
    if (activeFilter.buildingTypes.length) count++;
    return count;
  }, [activeFilter]);

  const activeColorGroup = useMemo(() =>
    colorGroups.find(g => g.id === activeColorGroupId) || null,
    [colorGroups, activeColorGroupId]);

  const activeColorGroupSignboards = useMemo(() => {
    if (!activeColorGroup) return [];
    return signboards.filter(s => activeColorGroup.signboardIds.includes(s.id));
  }, [signboards, activeColorGroup]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (noteCategoryFilter !== '全部') {
      result = result.filter(n => n.category === noteCategoryFilter);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(kw) ||
        n.content.toLowerCase().includes(kw) ||
        n.tags.some(t => t.toLowerCase().includes(kw))
      );
    }
    return result;
  }, [notes, noteCategoryFilter, searchKeyword]);

  const openNewNote = (presetCategory?: NoteCategory) => {
    setEditingNote(null);
    setNoteForm({
      title: '',
      content: '',
      tags: '',
      category: presetCategory || '综合研究',
      relatedSignboardIds: []
    });
    setNoteEditorOpen(true);
  };

  const openEditNote = (note: ResearchNote) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join('、'),
      category: note.category,
      relatedSignboardIds: note.relatedSignboardIds
    });
    setNoteEditorOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteForm.title.trim()) return;
    const tags = noteForm.tags.split(/[、,，]/).map(t => t.trim()).filter(Boolean);
    if (editingNote) {
      updateNote(editingNote.id, { ...noteForm, tags, relatedSignboardIds: noteForm.relatedSignboardIds });
    } else {
      addNote({ ...noteForm, tags, relatedSignboardIds: noteForm.relatedSignboardIds });
    }
    setNoteEditorOpen(false);
  };

  const openNewColorGroup = () => {
    setEditingColorGroup(null);
    setColorGroupForm({ name: '', description: '' });
    setColorGroupEditorOpen(true);
  };

  const openEditColorGroup = (group: ColorComparisonGroup) => {
    setEditingColorGroup(group);
    setColorGroupForm({ name: group.name, description: group.description });
    setColorGroupEditorOpen(true);
  };

  const handleSaveColorGroup = () => {
    if (!colorGroupForm.name.trim()) return;
    if (editingColorGroup) {
      updateColorGroup(editingColorGroup.id, colorGroupForm);
    } else {
      addColorGroup({ ...colorGroupForm, signboardIds: [] });
    }
    setColorGroupEditorOpen(false);
  };

  const openNewSnapshot = (eraStageId?: string) => {
    setEditingSnapshot(null);
    setSnapshotForm({
      name: '',
      eraStageId: eraStageId || eraStages[0].id,
      description: '',
      observations: '',
      signboardIds: []
    });
    setSnapshotEditorOpen(true);
  };

  const openEditSnapshot = (snap: EraAnalysisSnapshot) => {
    setEditingSnapshot(snap);
    setSnapshotForm({
      name: snap.name,
      eraStageId: snap.eraStageId,
      description: snap.description,
      observations: snap.observations,
      signboardIds: snap.signboardIds
    });
    setSnapshotEditorOpen(true);
  };

  const handleSaveSnapshot = () => {
    if (!snapshotForm.name.trim()) return;
    if (editingSnapshot) {
      updateEraSnapshot(editingSnapshot.id, snapshotForm);
    } else {
      addEraSnapshot(snapshotForm);
    }
    setSnapshotEditorOpen(false);
  };

  const toggleArrayFilter = (field: 'eras' | 'fontStyles' | 'conditions' | 'colors' | 'tags' | 'locations' | 'buildingTypes', value: string) => {
    const current = activeFilter[field] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setActiveFilter({ [field]: updated } as any);
  };

  const ColorSwatches = ({ colors, size = 'md' }: { colors: string[]; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeMap = { sm: 'w-4 h-4 -space-x-1', md: 'w-6 h-6 -space-x-1.5', lg: 'w-8 h-8 -space-x-2' };
    return (
      <div className={`color-swatches ${sizeMap[size]}`}>
        {colors.map((c, i) => (
          <span
            key={`${c}-${i}`}
            className="swatch-dot"
            style={{ backgroundColor: c }}
            title={allColorPresets.find(p => p.color === c)?.name || c}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="research-lab-page animate-fade-in">
      <div className="lab-page-header">
        <div className="lab-header-inner">
          <div className="lab-title-wrap">
            <div className="lab-icon-badge">🔬</div>
            <div>
              <h1 className="lab-page-title">老店招牌研究室</h1>
              <p className="lab-page-subtitle">
                系统化研究工具 · 从年代、色彩到样本、笔记，形成独立研究闭环
              </p>
            </div>
          </div>
          <div className="lab-stats-bar">
            <div className="lab-stat-chip">
              <span className="stat-icon">📊</span>
              <span className="stat-num">{signboards.length}</span>
              <span className="stat-label">样本总数</span>
            </div>
            <div className="lab-stat-chip">
              <span className="stat-icon">📓</span>
              <span className="stat-num">{notes.length}</span>
              <span className="stat-label">研究笔记</span>
            </div>
            <div className="lab-stat-chip">
              <span className="stat-icon">🎨</span>
              <span className="stat-num">{colorGroups.length}</span>
              <span className="stat-label">色彩对照</span>
            </div>
            <div className="lab-stat-chip">
              <span className="stat-icon">🕰️</span>
              <span className="stat-num">{eraSnapshots.length}</span>
              <span className="stat-label">年代快照</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lab-tabs-nav">
        {tabConfig.map(tab => (
          <button
            key={tab.key}
            className={`lab-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <div className="tab-text">
              <span className="tab-label">{tab.label}</span>
              <span className="tab-desc">{tab.desc}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="lab-tab-content">
        {activeTab === 'era' && (
          <div className="era-analysis-panel">
            <div className="panel-toolbar">
              <h2 className="panel-title">🕰️ 年代演变分析</h2>
              <div className="panel-actions">
                <button className="btn-secondary" onClick={() => openNewSnapshot()}>
                  ➕ 新建年代快照
                </button>
              </div>
            </div>

            <div className="era-distribution-chart">
              {eraStages.map(stage => {
                const items = eraDistribution[stage.id] || [];
                const pct = signboards.length > 0 ? (items.length / signboards.length) * 100 : 0;
                return (
                  <div key={stage.id} className="era-dist-row">
                    <div className="era-dist-label">
                      <span className="era-dot" style={{ backgroundColor: stage.color }} />
                      <span className="era-name">{stage.label}</span>
                      <span className="era-years">{stage.startYear}-{stage.endYear}</span>
                    </div>
                    <div className="era-dist-bar-wrap">
                      <div
                        className="era-dist-bar"
                        style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: stage.color }}
                      />
                    </div>
                    <div className="era-dist-count">
                      {items.length > 0 ? (
                        <button
                          className="link-btn"
                          onClick={() => openNewSnapshot(stage.id)}
                        >
                          {items.length} 块 →
                        </button>
                      ) : (
                        <span className="dim-text">0</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {eraSnapshots.length > 0 && (
              <div className="snapshots-section">
                <h3 className="section-subtitle">📸 已保存的年代快照</h3>
                <div className="snapshots-grid">
                  {eraSnapshots.map(snap => {
                    const stage = eraStages.find(s => s.id === snap.eraStageId);
                    const snapSignboards = signboards.filter(s => snap.signboardIds.includes(s.id));
                    return (
                      <div key={snap.id} className="snapshot-card" style={{ borderColor: stage?.color }}>
                        <div className="snapshot-card-header">
                          <div>
                            <h4 className="snapshot-title">{snap.name}</h4>
                            <span
                              className="snapshot-era-tag"
                              style={{ backgroundColor: stage?.color + '22', color: stage?.color }}
                            >
                              {stage?.label}
                            </span>
                          </div>
                          <div className="snapshot-actions">
                            <button className="icon-btn" onClick={() => openEditSnapshot(snap)} title="编辑">✏️</button>
                            <button
                              className="icon-btn danger"
                              onClick={() => {
                                if (window.confirm(`确定删除快照「${snap.name}」？`)) deleteEraSnapshot(snap.id);
                              }}
                              title="删除"
                            >🗑️</button>
                          </div>
                        </div>
                        {snap.description && <p className="snapshot-desc">{snap.description}</p>}
                        {snap.observations && (
                          <div className="snapshot-obs">
                            <span className="obs-label">观察：</span>
                            <p>{snap.observations}</p>
                          </div>
                        )}
                        <div className="snapshot-mini-grid">
                          {snapSignboards.slice(0, 4).map(sb => (
                            <Link to={`/signboard/${sb.id}`} key={sb.id} className="snapshot-mini-thumb">
                              <img src={sb.image} alt={sb.name} />
                              <span className="snapshot-mini-name">{sb.name}</span>
                            </Link>
                          ))}
                          {snap.signboardIds.length > 4 && (
                            <div className="snapshot-more">+{snap.signboardIds.length - 4}</div>
                          )}
                        </div>
                        <div className="snapshot-footer">
                          <button
                            className="btn-link-small"
                            onClick={() => {
                              setActiveTab('notes');
                              openNewNote('年代分析');
                            }}
                          >
                            📓 基于此快照写笔记
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="era-detail-section">
              <h3 className="section-subtitle">📚 各年代招牌详情</h3>
              {eraStages.map(stage => {
                const items = eraDistribution[stage.id] || [];
                if (items.length === 0) return null;
                return (
                  <div key={stage.id} className="era-detail-group">
                    <div className="era-detail-header" style={{ borderColor: stage.color }}>
                      <h4 style={{ color: stage.color }}>◆ {stage.label}</h4>
                      <span className="era-detail-years">{stage.startYear} - {stage.endYear}</span>
                      <span className="era-detail-desc">{stage.description}</span>
                      <span className="era-detail-count">{items.length} 块</span>
                    </div>
                    <div className="masonry-grid">
                      {items.map(sb => <SignboardCard key={sb.id} signboard={sb} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'color' && (
          <div className="color-analysis-panel">
            <div className="panel-toolbar">
              <h2 className="panel-title">🎨 色彩对照研究</h2>
              <div className="panel-actions">
                <button className="btn-secondary" onClick={openNewColorGroup}>
                  ➕ 新建色彩对照
                </button>
              </div>
            </div>

            {colorGroups.length === 0 ? (
              <div className="empty-lab-state">
                <div className="empty-icon">🎨</div>
                <h3>还没有色彩对照组</h3>
                <p>创建色彩对照组，把不同招牌放在一起比对配色方案</p>
                <button className="go-btn" onClick={openNewColorGroup}>创建第一个对照组</button>
              </div>
            ) : (
              <div className="color-groups-layout">
                <div className="color-groups-sidebar">
                  {colorGroups.map(group => (
                    <button
                      key={group.id}
                      className={`color-group-sidebar-item ${activeColorGroupId === group.id ? 'active' : ''}`}
                      onClick={() => setActiveColorGroupId(group.id)}
                    >
                      <span className="group-name">{group.name}</span>
                      <span className="group-count">{group.signboardIds.length} 块</span>
                    </button>
                  ))}
                </div>

                <div className="color-compare-main">
                  {activeColorGroup ? (
                    <>
                      <div className="compare-group-header">
                        <div>
                          <h3 className="compare-group-title">{activeColorGroup.name}</h3>
                          {activeColorGroup.description && (
                            <p className="compare-group-desc">{activeColorGroup.description}</p>
                          )}
                        </div>
                        <div className="compare-group-actions">
                          <button className="icon-btn" onClick={() => openEditColorGroup(activeColorGroup)} title="编辑">✏️</button>
                          <button
                            className="icon-btn danger"
                            onClick={() => {
                              if (window.confirm(`确定删除对照组「${activeColorGroup.name}」？`)) {
                                deleteColorGroup(activeColorGroup.id);
                                setActiveColorGroupId(null);
                              }
                            }}
                            title="删除"
                          >🗑️</button>
                        </div>
                      </div>

                      {activeColorGroupSignboards.length === 0 ? (
                        <div className="empty-lab-state small">
                          <div className="empty-icon">🖼️</div>
                          <p>从下方候选招牌中点击 ➕ 添加到对照组</p>
                        </div>
                      ) : (
                        <>
                          <div className="color-compare-grid">
                            {activeColorGroupSignboards.map(sb => (
                              <div key={sb.id} className="color-compare-card">
                                <Link to={`/signboard/${sb.id}`} className="compare-thumb">
                                  <img src={sb.image} alt={sb.name} />
                                </Link>
                                <div className="compare-info">
                                  <Link to={`/signboard/${sb.id}`} className="compare-name">{sb.name}</Link>
                                  <div className="compare-meta">
                                    <span>{sb.era} · {sb.year}</span>
                                    <ColorSwatches colors={sb.colors} size="md" />
                                  </div>
                                  <div className="compare-color-detail">
                                    {sb.colors.map((c, i) => {
                                      const preset = allColorPresets.find(p => p.color === c);
                                      return (
                                        <div key={`${c}-${i}`} className="compare-color-row">
                                          <span className="color-block" style={{ backgroundColor: c }} />
                                          <span className="color-name">{preset?.name || c}</span>
                                          <span className="color-code">{c}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                <button
                                  className="remove-btn"
                                  onClick={() => toggleSignboardInColorGroup(activeColorGroup.id, sb.id)}
                                  title="从对照组移除"
                                >✕</button>
                              </div>
                            ))}
                          </div>

                          {activeColorGroupSignboards.length >= 2 && (
                            <div className="color-cross-section">
                              <h4 className="cross-section-title">📊 色彩交叉比对</h4>
                              <div className="shared-colors">
                                <span className="cross-label">共通色彩：</span>
                                {(() => {
                                  const colorCounts: Record<string, number> = {};
                                  activeColorGroupSignboards.forEach(sb => {
                                    sb.colors.forEach(c => {
                                      colorCounts[c] = (colorCounts[c] || 0) + 1;
                                    });
                                  });
                                  const shared = Object.entries(colorCounts).filter(
                                    ([, count]) => count >= 2
                                  );
                                  if (shared.length === 0) return <span className="dim-text">无共通色</span>;
                                  return shared.map(([color, count]) => (
                                    <span key={color} className="shared-color-tag">
                                      <span className="color-block sm" style={{ backgroundColor: color }} />
                                      <span>{allColorPresets.find(p => p.color === color)?.name || color}</span>
                                      <span className="shared-count">{count}/{activeColorGroupSignboards.length}</span>
                                    </span>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="candidate-signboards">
                        <h4 className="candidates-title">🖼️ 候选招牌（点击添加到对照组）</h4>
                        <div className="candidates-scroll">
                          {signboards.filter(s => !activeColorGroup.signboardIds.includes(s.id)).map(sb => (
                            <div key={sb.id} className="candidate-card">
                              <img src={sb.image} alt={sb.name} />
                              <div className="candidate-info">
                                <span className="candidate-name">{sb.name}</span>
                                <ColorSwatches colors={sb.colors} size="sm" />
                              </div>
                              <button
                                className="add-btn"
                                onClick={() => toggleSignboardInColorGroup(activeColorGroup.id, sb.id)}
                              >➕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty-lab-state">
                      <div className="empty-icon">👈</div>
                      <p>请从左侧选择一个色彩对照组，或新建一个</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'screen' && (
          <div className="screening-panel">
            <div className="panel-toolbar">
              <h2 className="panel-title">🔬 样本多维度筛查</h2>
              <div className="panel-actions">
                <span className="result-count-badge">
                  命中 <strong>{filteredSignboards.length}</strong> / {signboards.length}
                </span>
                {activeFilterCount > 0 && (
                  <button className="btn-secondary" onClick={resetActiveFilter}>
                    ↺ 清空筛选（{activeFilterCount}）
                  </button>
                )}
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveTab('notes');
                    openNewNote('样本筛查');
                  }}
                  disabled={filteredSignboards.length === 0}
                >
                  📓 基于结果写笔记
                </button>
              </div>
            </div>

            <div className="screening-layout">
              <div className="screening-filters-panel">
                <div className="filter-section">
                  <h4 className="filter-section-title">📅 年代范围</h4>
                  <div className="year-range-inputs">
                    <input
                      type="number"
                      placeholder="起始年"
                      value={activeFilter.yearRange?.[0] || ''}
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) {
                          setActiveFilter({ yearRange: null });
                        } else {
                          const end = activeFilter.yearRange?.[1] || 2030;
                          setActiveFilter({ yearRange: [parseInt(val), end] });
                        }
                      }}
                      className="form-input small"
                    />
                    <span className="range-sep">—</span>
                    <input
                      type="number"
                      placeholder="结束年"
                      value={activeFilter.yearRange?.[1] || ''}
                      onChange={e => {
                        const val = e.target.value;
                        const start = activeFilter.yearRange?.[0] || 1644;
                        setActiveFilter({ yearRange: [start, val ? parseInt(val) : 2030] });
                      }}
                      className="form-input small"
                    />
                  </div>
                </div>

                <div className="filter-section">
                  <h4 className="filter-section-title">🗂️ 年代标签</h4>
                  <div className="chip-group">
                    {allEras.map(era => (
                      <button
                        key={era}
                        className={`chip ${activeFilter.eras.includes(era) ? 'active' : ''}`}
                        onClick={() => toggleArrayFilter('eras', era)}
                      >
                        {era}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h4 className="filter-section-title">✍️ 字体风格</h4>
                  <div className="chip-group">
                    {allFontStyles.map(fs => (
                      <button
                        key={fs}
                        className={`chip ${activeFilter.fontStyles.includes(fs) ? 'active' : ''}`}
                        onClick={() => toggleArrayFilter('fontStyles', fs)}
                      >
                        {fs}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h4 className="filter-section-title">📋 保存状态</h4>
                  <div className="chip-group">
                    {Object.entries(conditionStatusLabels).map(([key, info]) => (
                      <button
                        key={key}
                        className={`chip ${activeFilter.conditions.includes(key as any) ? 'active' : ''}`}
                        onClick={() => toggleArrayFilter('conditions', key)}
                      >
                        {info.icon} {info.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h4 className="filter-section-title">🎨 色彩筛选</h4>
                  <div className="color-picker-grid">
                    {allColorPresets.slice(0, 18).map(cp => (
                      <button
                        key={cp.id}
                        className={`color-picker-btn ${activeFilter.colors.includes(cp.color) ? 'active' : ''}`}
                        onClick={() => toggleArrayFilter('colors', cp.color)}
                        title={cp.name}
                        style={{ backgroundColor: cp.color }}
                      >
                        {activeFilter.colors.includes(cp.color) && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h4 className="filter-section-title">🏷️ 标签</h4>
                  <div className="chip-group">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        className={`chip ${activeFilter.tags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleArrayFilter('tags', tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h4 className="filter-section-title">📍 地域</h4>
                  <div className="chip-group">
                    {allLocations.map(loc => (
                      <button
                        key={loc}
                        className={`chip ${activeFilter.locations.includes(loc) ? 'active' : ''}`}
                        onClick={() => toggleArrayFilter('locations', loc)}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h4 className="filter-section-title">🏛️ 建筑类型</h4>
                  <div className="chip-group">
                    {allBuildingTypes.map(bt => (
                      <button
                        key={bt}
                        className={`chip ${activeFilter.buildingTypes.includes(bt) ? 'active' : ''}`}
                        onClick={() => toggleArrayFilter('buildingTypes', bt)}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h4 className="filter-section-title">🔧 修缮历史</h4>
                  <div className="chip-group">
                    <button
                      className={`chip ${activeFilter.hasRestoration === true ? 'active' : ''}`}
                      onClick={() => setActiveFilter({
                        hasRestoration: activeFilter.hasRestoration === true ? null : true
                      })}
                    >
                      ✅ 有多次修缮
                    </button>
                    <button
                      className={`chip ${activeFilter.hasRestoration === false ? 'active' : ''}`}
                      onClick={() => setActiveFilter({
                        hasRestoration: activeFilter.hasRestoration === false ? null : false
                      })}
                    >
                      ❌ 保持原状
                    </button>
                  </div>
                </div>
              </div>

              <div className="screening-results-panel">
                {filteredSignboards.length === 0 ? (
                  <div className="empty-lab-state">
                    <div className="empty-icon">🔍</div>
                    <h3>没有匹配的招牌</h3>
                    <p>尝试放宽筛选条件，或点击清空重新开始</p>
                  </div>
                ) : (
                  <div className="masonry-grid">
                    {filteredSignboards.map(sb => <SignboardCard key={sb.id} signboard={sb} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-panel">
            <div className="panel-toolbar">
              <h2 className="panel-title">📓 个人收藏笔记</h2>
              <div className="panel-actions">
                <div className="notes-search">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="搜索笔记标题、内容、标签..."
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    className="form-input small"
                  />
                </div>
                <div className="category-filter-group">
                  <button
                    className={`chip ${noteCategoryFilter === '全部' ? 'active' : ''}`}
                    onClick={() => setNoteCategoryFilter('全部')}
                  >
                    全部
                  </button>
                  {(Object.keys(categoryLabels) as NoteCategory[]).map(cat => (
                    <button
                      key={cat}
                      className={`chip ${noteCategoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setNoteCategoryFilter(cat)}
                      style={noteCategoryFilter === cat ? { backgroundColor: categoryLabels[cat].color + '22', color: categoryLabels[cat].color, borderColor: categoryLabels[cat].color } : {}}
                    >
                      {categoryLabels[cat].icon} {cat}
                    </button>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => openNewNote()}>
                  ✍️ 新建笔记
                </button>
              </div>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="empty-lab-state">
                <div className="empty-icon">📓</div>
                <h3>还没有研究笔记</h3>
                <p>记录你的发现、观察和灵感，形成系统化的研究档案</p>
                <button className="go-btn" onClick={() => openNewNote()}>写第一篇笔记</button>
              </div>
            ) : (
              <div className="notes-grid">
                {filteredNotes.map(note => {
                  const catInfo = categoryLabels[note.category];
                  const relatedSignboards = signboards.filter(s =>
                    note.signboardId === s.id || note.relatedSignboardIds.includes(s.id)
                  );
                  return (
                    <div key={note.id} className="note-card">
                      <div className="note-card-header">
                        <span
                          className="note-category-tag"
                          style={{ backgroundColor: catInfo.color + '22', color: catInfo.color, borderColor: catInfo.color }}
                        >
                          {catInfo.icon} {catInfo.label}
                        </span>
                        <div className="note-card-actions">
                          <button className="icon-btn" onClick={() => openEditNote(note)} title="编辑">✏️</button>
                          <button
                            className="icon-btn danger"
                            onClick={() => {
                              if (window.confirm(`确定删除笔记「${note.title}」？`)) deleteNote(note.id);
                            }}
                            title="删除"
                          >🗑️</button>
                        </div>
                      </div>
                      <h4 className="note-title">{note.title}</h4>
                      <div className="note-content-preview">
                        {note.content.length > 200
                          ? note.content.slice(0, 200) + '...'
                          : note.content.split('\n').slice(0, 4).map((line, i) => <p key={i}>{line}</p>)
                        }
                      </div>
                      {note.tags.length > 0 && (
                        <div className="note-tags">
                          {note.tags.map(tag => (
                            <span key={tag} className="note-tag">#{tag}</span>
                          ))}
                        </div>
                      )}
                      {relatedSignboards.length > 0 && (
                        <div className="note-related">
                          <span className="note-related-label">相关招牌 ({relatedSignboards.length})：</span>
                          <div className="note-related-thumbs">
                            {relatedSignboards.slice(0, 4).map(sb => (
                              <Link to={`/signboard/${sb.id}`} key={sb.id} className="note-related-thumb">
                                <img src={sb.image} alt={sb.name} />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="note-footer">
                        <span className="note-date">
                          {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                          {note.updatedAt !== note.createdAt && ' (已编辑)'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {noteEditorOpen && (
        <div className="modal-overlay" onClick={() => setNoteEditorOpen(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingNote ? '编辑笔记' : '新建研究笔记'}</h3>
              <button className="icon-btn" onClick={() => setNoteEditorOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group three-quarter">
                  <label className="form-label">标题 *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="给你的笔记起个标题..."
                    value={noteForm.title}
                    onChange={e => setNoteForm(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="form-group quarter">
                  <label className="form-label">分类</label>
                  <select
                    className="form-input"
                    value={noteForm.category}
                    onChange={e => setNoteForm(p => ({ ...p, category: e.target.value as NoteCategory }))}
                  >
                    {(Object.keys(categoryLabels) as NoteCategory[]).map(cat => (
                      <option key={cat} value={cat}>{categoryLabels[cat].icon} {cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">标签（用「、」或逗号分隔）</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="如：民国、楷书、海派风格"
                  value={noteForm.tags}
                  onChange={e => setNoteForm(p => ({ ...p, tags: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">内容</label>
                <textarea
                  className="form-textarea"
                  rows={10}
                  placeholder="记录你的观察、分析、发现..."
                  value={noteForm.content}
                  onChange={e => setNoteForm(p => ({ ...p, content: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">关联招牌（可选）</label>
                <div className="associate-signboards-grid">
                  {signboards.slice(0, 12).map(sb => (
                    <button
                      key={sb.id}
                      className={`associate-thumb ${noteForm.relatedSignboardIds.includes(sb.id) ? 'selected' : ''}`}
                      onClick={() => {
                        const ids = noteForm.relatedSignboardIds.includes(sb.id)
                          ? noteForm.relatedSignboardIds.filter(id => id !== sb.id)
                          : [...noteForm.relatedSignboardIds, sb.id];
                        setNoteForm(p => ({ ...p, relatedSignboardIds: ids }));
                      }}
                    >
                      <img src={sb.image} alt={sb.name} />
                      <span>{sb.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setNoteEditorOpen(false)}>取消</button>
              <button className="btn-primary" onClick={handleSaveNote} disabled={!noteForm.title.trim()}>
                {editingNote ? '💾 保存修改' : '✨ 创建笔记'}
              </button>
            </div>
          </div>
        </div>
      )}

      {colorGroupEditorOpen && (
        <div className="modal-overlay" onClick={() => setColorGroupEditorOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingColorGroup ? '编辑色彩对照' : '新建色彩对照组'}</h3>
              <button className="icon-btn" onClick={() => setColorGroupEditorOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">组名 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="如：民国海派配色"
                  value={colorGroupForm.name}
                  onChange={e => setColorGroupForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">描述</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="说明这组对照的研究目的..."
                  value={colorGroupForm.description}
                  onChange={e => setColorGroupForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setColorGroupEditorOpen(false)}>取消</button>
              <button className="btn-primary" onClick={handleSaveColorGroup} disabled={!colorGroupForm.name.trim()}>
                {editingColorGroup ? '💾 保存' : '✨ 创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {snapshotEditorOpen && (
        <div className="modal-overlay" onClick={() => setSnapshotEditorOpen(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSnapshot ? '编辑年代快照' : '新建年代快照'}</h3>
              <button className="icon-btn" onClick={() => setSnapshotEditorOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group three-quarter">
                  <label className="form-label">快照名称 *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：民国中期招牌特点研究"
                    value={snapshotForm.name}
                    onChange={e => setSnapshotForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="form-group quarter">
                  <label className="form-label">年代阶段</label>
                  <select
                    className="form-input"
                    value={snapshotForm.eraStageId}
                    onChange={e => setSnapshotForm(p => ({ ...p, eraStageId: e.target.value }))}
                  >
                    {eraStages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.label} ({stage.startYear}-{stage.endYear})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">简要描述</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="一句话概括这个快照..."
                  value={snapshotForm.description}
                  onChange={e => setSnapshotForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">观察记录</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="记录你对这个年代招牌风格的观察..."
                  value={snapshotForm.observations}
                  onChange={e => setSnapshotForm(p => ({ ...p, observations: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">包含招牌（可选）</label>
                <div className="associate-signboards-grid">
                  {signboards.filter(s => {
                    const stage = eraStages.find(st => st.id === snapshotForm.eraStageId);
                    if (!stage) return true;
                    return s.year >= stage.startYear && s.year <= stage.endYear;
                  }).slice(0, 16).map(sb => (
                    <button
                      key={sb.id}
                      className={`associate-thumb ${snapshotForm.signboardIds.includes(sb.id) ? 'selected' : ''}`}
                      onClick={() => {
                        const ids = snapshotForm.signboardIds.includes(sb.id)
                          ? snapshotForm.signboardIds.filter(id => id !== sb.id)
                          : [...snapshotForm.signboardIds, sb.id];
                        setSnapshotForm(p => ({ ...p, signboardIds: ids }));
                      }}
                    >
                      <img src={sb.image} alt={sb.name} />
                      <span>{sb.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSnapshotEditorOpen(false)}>取消</button>
              <button className="btn-primary" onClick={handleSaveSnapshot} disabled={!snapshotForm.name.trim()}>
                {editingSnapshot ? '💾 保存' : '✨ 创建快照'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignboardResearchLab;
