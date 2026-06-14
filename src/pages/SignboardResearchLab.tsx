import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSignboards } from '../context/SignboardsContext';
import { useResearchLab } from '../context/ResearchLabContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCollections } from '../context/CollectionsContext';
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
type NoteScope = 'all' | 'favorites' | 'collections';

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

const sourceLabels: Record<ResearchNote['source'], { label: string; icon: string; color: string }> = {
  'manual': { label: '手动创建', icon: '✍️', color: '#6b7280' },
  'favorite': { label: '从收藏招牌创建', icon: '❤️', color: '#dc2626' },
  'collection': { label: '从藏册创建', icon: '📚', color: '#0891b2' },
  'snapshot': { label: '从年代快照创建', icon: '📸', color: '#7c3aed' },
  'color-group': { label: '从色彩对照创建', icon: '🎨', color: '#db2777' },
  'screening': { label: '从筛查结果创建', icon: '🔬', color: '#059669' }
};

const SignboardResearchLab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { openCollectionNote?: string; focusFavorites?: boolean } };
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
    filterSignboards,
    getNotesForSignboard,
    getFavoriteResearchStats
  } = useResearchLab();
  const { favorites, isFavorite } = useFavorites();
  const { collections } = useCollections();

  const [activeTab, setActiveTab] = useState<TabKey>('notes');

  const [noteScope, setNoteScope] = useState<NoteScope>('all');
  const [scopeCollectionId, setScopeCollectionId] = useState<string>('all');

  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);
  const [noteForm, setNoteForm] = useState<{
    title: string;
    content: string;
    tags: string;
    category: NoteCategory;
    relatedSignboardIds: string[];
    relatedCollectionIds: string[];
    source: ResearchNote['source'];
  }>({
    title: '',
    content: '',
    tags: '',
    category: '综合研究',
    relatedSignboardIds: [],
    relatedCollectionIds: [],
    source: 'manual'
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
    const cities = ['上海', '广州', '北京', '杭州', '香港'];
    const set = new Set<string>();
    signboards.forEach(s => {
      cities.forEach(city => {
        if (s.location.includes(city)) set.add(city);
      });
    });
    return Array.from(set);
  }, [signboards]);

  const collectionSignboardMap = useMemo(() => {
    const map = new Map<string, string[]>();
    collections.forEach(col => {
      map.set(col.id, col.items.map(i => i.signboardId));
    });
    return map;
  }, [collections]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const researchStats = useMemo(() =>
    getFavoriteResearchStats(signboards, favorites, collections),
    [getFavoriteResearchStats, signboards, favorites, collections]);

  useEffect(() => {
    const state = location.state;
    if (!state) return;

    if (state.openCollectionNote) {
      const colId = state.openCollectionNote;
      setActiveTab('notes');
      setNoteScope('collections');
      setScopeCollectionId(colId);
      setTimeout(() => {
        openNoteForCollection(colId);
      }, 100);
    } else if (state.focusFavorites) {
      setActiveTab('notes');
      setNoteScope('favorites');
    }

    window.history.replaceState({}, document.title);
  }, [location.state, collections.length, signboards.length]);

  const eraDistribution = useMemo(() => {
    const dist: Record<string, Signboard[]> = {};
    eraStages.forEach(stage => { dist[stage.id] = []; });
    signboards.forEach(sb => {
      const stage = getEraStageByYear(sb.year);
      if (stage) dist[stage.id].push(sb);
    });
    return dist;
  }, [signboards]);

  const filteredSignboards = useMemo(() =>
    filterSignboards(signboards, activeFilter, favorites, collectionSignboardMap),
    [signboards, activeFilter, favorites, collectionSignboardMap, filterSignboards]);

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
    if (activeFilter.onlyFavorites) count++;
    if (activeFilter.onlyInCollections.length) count++;
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

    if (noteScope === 'favorites') {
      result = result.filter(n =>
        (n.signboardId && favoriteSet.has(n.signboardId)) ||
        n.relatedSignboardIds.some(id => favoriteSet.has(id))
      );
    } else if (noteScope === 'collections') {
      if (scopeCollectionId !== 'all') {
        result = result.filter(n =>
          n.relatedCollectionIds.includes(scopeCollectionId) ||
          (() => {
            const colSignboards = collectionSignboardMap.get(scopeCollectionId) || [];
            const colSet = new Set(colSignboards);
            return (n.signboardId && colSet.has(n.signboardId)) ||
              n.relatedSignboardIds.some(id => colSet.has(id));
          })()
        );
      } else {
        result = result.filter(n =>
          n.relatedCollectionIds.length > 0 ||
          collections.some(col => {
            const colIds = new Set(col.items.map(i => i.signboardId));
            return (n.signboardId && colIds.has(n.signboardId)) ||
              n.relatedSignboardIds.some(id => colIds.has(id));
          })
        );
      }
    }

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
  }, [notes, noteScope, scopeCollectionId, noteCategoryFilter, searchKeyword, favoriteSet, collections, collectionSignboardMap]);

  const openNewNote = (
    presetCategory?: NoteCategory,
    options?: {
      source?: ResearchNote['source'];
      signboardIds?: string[];
      collectionIds?: string[];
      title?: string;
      content?: string;
    }
  ) => {
    setEditingNote(null);
    setNoteForm({
      title: options?.title || '',
      content: options?.content || '',
      tags: '',
      category: presetCategory || '综合研究',
      relatedSignboardIds: options?.signboardIds || [],
      relatedCollectionIds: options?.collectionIds || [],
      source: options?.source || 'manual'
    });
    setActiveTab('notes');
    setNoteEditorOpen(true);
  };

  const openNoteForSignboard = (signboardId: string) => {
    const sb = signboards.find(s => s.id === signboardId);
    const presetContent = sb ? `## ${sb.name}\n\n- **年代**：${sb.era} · ${sb.year}年\n- **地点**：${sb.location}\n- **字体**：${sb.fontStyle}\n\n` : '';
    openNewNote('综合研究', {
      source: isFavorite(signboardId) ? 'favorite' : 'manual',
      signboardIds: [signboardId],
      title: sb ? `${sb.name}研究笔记` : '',
      content: presetContent
    });
  };

  const openNoteForCollection = (collectionId: string) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;
    const colSignboards = col.items
      .map(i => signboards.find(s => s.id === i.signboardId))
      .filter(Boolean) as Signboard[];
    const signboardList = colSignboards.map(sb => `- ${sb.name}（${sb.era}·${sb.year}）`).join('\n');
    openNewNote('综合研究', {
      source: 'collection',
      signboardIds: colSignboards.map(s => s.id),
      collectionIds: [collectionId],
      title: `藏册《${col.name}》研究笔记`,
      content: `## 藏册概览\n${col.description ? col.description + '\n\n' : ''}**包含招牌**：\n${signboardList}\n\n---\n\n`
    });
  };

  const openEditNote = (note: ResearchNote) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join('、'),
      category: note.category,
      relatedSignboardIds: note.relatedSignboardIds,
      relatedCollectionIds: note.relatedCollectionIds,
      source: note.source
    });
    setNoteEditorOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteForm.title.trim()) return;
    const tags = noteForm.tags.split(/[、,，]/).map(t => t.trim()).filter(Boolean);
    if (editingNote) {
      updateNote(editingNote.id, { ...noteForm, tags });
    } else {
      addNote({ ...noteForm, tags });
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
      const g = addColorGroup({ ...colorGroupForm, signboardIds: [] });
      setActiveColorGroupId(g.id);
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

  const handleCreateNoteFromSnapshot = (snap: EraAnalysisSnapshot) => {
    const stage = eraStages.find(s => s.id === snap.eraStageId);
    openNewNote('年代分析', {
      source: 'snapshot',
      signboardIds: snap.signboardIds,
      title: `${snap.name} - 深度研究笔记`,
      content: `## 年代快照：${snap.name}\n\n**年代阶段**：${stage?.label}（${stage?.startYear}-${stage?.endYear}）\n\n${snap.description ? `**快照描述**：${snap.description}\n\n` : ''}${snap.observations ? `**初步观察**：${snap.observations}\n\n` : ''}---\n\n## 深入分析\n\n`
    });
  };

  const handleCreateNoteFromColorGroup = (group: ColorComparisonGroup) => {
    openNewNote('色彩对照', {
      source: 'color-group',
      signboardIds: group.signboardIds,
      title: `${group.name} - 色彩分析笔记`,
      content: `## 色彩对照组：${group.name}\n\n${group.description ? `**研究目的**：${group.description}\n\n` : ''}**包含招牌**：${group.signboardIds.length}块\n\n---\n\n## 色彩比对分析\n\n`
    });
  };

  const toggleArrayFilter = (field: 'eras' | 'fontStyles' | 'conditions' | 'colors' | 'tags' | 'locations' | 'buildingTypes', value: string) => {
    const current = activeFilter[field] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setActiveFilter({ [field]: updated } as any);
  };

  const toggleCollectionFilter = (collectionId: string) => {
    const current = activeFilter.onlyInCollections;
    const updated = current.includes(collectionId)
      ? current.filter(v => v !== collectionId)
      : [...current, collectionId];
    setActiveFilter({ onlyInCollections: updated });
  };

  const FavoriteBadge = ({ signboardId, compact = false }: { signboardId: string; compact?: boolean }) => {
    const fav = isFavorite(signboardId);
    const colCount = collections.filter(c => c.items.some(i => i.signboardId === signboardId)).length;
    const noteCount = getNotesForSignboard(signboardId).length;
    if (!fav && colCount === 0 && noteCount === 0) return null;
    return (
      <div className={`signboard-badges ${compact ? 'compact' : ''}`}>
        {fav && <span className="badge-favorite" title="已收藏">❤️</span>}
        {colCount > 0 && <span className="badge-collection" title={`在${colCount}个藏册中`}>📚{colCount}</span>}
        {noteCount > 0 && <span className="badge-note" title={`${noteCount}篇笔记`}>📓{noteCount}</span>}
      </div>
    );
  };

  const QuickNoteButton = ({ signboardId }: { signboardId: string }) => (
    <button
      className="quick-note-btn"
      onClick={(e) => { e.stopPropagation(); openNoteForSignboard(signboardId); }}
      title="围绕此招牌写研究笔记"
    >
      📓 记笔记
    </button>
  );

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
                围绕收藏与藏册形成独立研究闭环 · 从招牌到笔记的全链路
              </p>
            </div>
          </div>
          <div className="lab-stats-bar">
            <div className="lab-stat-chip">
              <span className="stat-icon">📊</span>
              <span className="stat-num">{signboards.length}</span>
              <span className="stat-label">样本总数</span>
            </div>
            <div className="lab-stat-chip highlight">
              <span className="stat-icon">❤️</span>
              <span className="stat-num">{favorites.length}</span>
              <span className="stat-label">
                收藏 · <b style={{ color: '#dc2626' }}>{researchStats.totalFavoritesWithNotes}</b> 有笔记
              </span>
            </div>
            <div className="lab-stat-chip highlight">
              <span className="stat-icon">📚</span>
              <span className="stat-num">{collections.length}</span>
              <span className="stat-label">
                藏册 · <b style={{ color: '#0891b2' }}>{researchStats.totalCollectionsWithNotes}</b> 有研究
              </span>
            </div>
            <div className="lab-stat-chip">
              <span className="stat-icon">📓</span>
              <span className="stat-num">{notes.length}</span>
              <span className="stat-label">研究笔记</span>
            </div>
          </div>
        </div>
        <div className="lab-shortcuts">
          <button className="shortcut-btn" onClick={() => openNewNote()}>
            <span>✍️</span> 新建笔记
          </button>
          {favorites.length > 0 && (
            <button
              className="shortcut-btn favorite"
              onClick={() => openNewNote('综合研究', {
                source: 'favorite',
                signboardIds: favorites,
                title: '我的收藏招牌综合研究',
                content: `## 收藏研究总览\n\n共收藏 **${favorites.length}** 块招牌：\n\n${favorites.map(id => {
                  const sb = signboards.find(s => s.id === id);
                  return sb ? `- ${sb.name}（${sb.era}·${sb.year}·${sb.location.split('区')[0]}区）` : '';
                }).filter(Boolean).join('\n')}\n\n---\n\n## 跨招牌分析\n\n`
              })}
            >
              <span>❤️</span> 围绕收藏写笔记
            </button>
          )}
          {collections.length > 0 && (
            <select
              className="shortcut-select"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  openNoteForCollection(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">📚 选择藏册做研究...</option>
              {collections.map(col => (
                <option key={col.id} value={col.id}>
                  {col.name}（{col.items.length}块）
                </option>
              ))}
            </select>
          )}
          <button
            className="shortcut-btn outline"
            onClick={() => navigate('/favorites')}
          >
            <span>📖</span> 去藏册页看看
          </button>
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
                const favCount = items.filter(s => favoriteSet.has(s.id)).length;
                const pct = signboards.length > 0 ? (items.length / signboards.length) * 100 : 0;
                const favPct = items.length > 0 ? (favCount / items.length) * 100 : 0;
                return (
                  <div key={stage.id} className="era-dist-row">
                    <div className="era-dist-label">
                      <span className="era-dot" style={{ backgroundColor: stage.color }} />
                      <span className="era-name">{stage.label}</span>
                      <span className="era-years">{stage.startYear}-{stage.endYear}</span>
                      {favCount > 0 && (
                        <span className="era-fav-chip" title={`收藏${favCount}块`}>
                          ❤️ {favCount}
                        </span>
                      )}
                    </div>
                    <div className="era-dist-bar-wrap">
                      <div
                        className="era-dist-bar"
                        style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: stage.color }}
                      />
                      {favCount > 0 && (
                        <div
                          className="era-dist-bar fav-overlay"
                          style={{
                            width: `${Math.max(pct * (favPct / 100), 2)}%`,
                            backgroundColor: '#dc2626'
                          }}
                        />
                      )}
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
                    const snapFavCount = snapSignboards.filter(s => favoriteSet.has(s.id)).length;
                    return (
                      <div key={snap.id} className="snapshot-card" style={{ borderColor: stage?.color }}>
                        <div className="snapshot-card-header">
                          <div>
                            <h4 className="snapshot-title">{snap.name}</h4>
                            <div className="snapshot-tags-row">
                              <span
                                className="snapshot-era-tag"
                                style={{ backgroundColor: stage?.color + '22', color: stage?.color }}
                              >
                                {stage?.label}
                              </span>
                              {snapFavCount > 0 && (
                                <span className="snapshot-fav-tag">❤️ {snapFavCount}块已收藏</span>
                              )}
                            </div>
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
                            <div key={sb.id} className="snapshot-mini-thumb-wrap">
                              <Link to={`/signboard/${sb.id}`} className="snapshot-mini-thumb">
                                <img src={sb.image} alt={sb.name} />
                                <span className="snapshot-mini-name">{sb.name}</span>
                              </Link>
                              {favoriteSet.has(sb.id) && <span className="thumb-corner-badge">❤️</span>}
                            </div>
                          ))}
                          {snap.signboardIds.length > 4 && (
                            <div className="snapshot-more">+{snap.signboardIds.length - 4}</div>
                          )}
                        </div>
                        <div className="snapshot-footer">
                          <button
                            className="btn-link-small"
                            onClick={() => handleCreateNoteFromSnapshot(snap)}
                          >
                            📓 基于快照写笔记
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
                      {items.some(i => favoriteSet.has(i.id)) && (
                        <span className="era-detail-fav">
                          ❤️ {items.filter(i => favoriteSet.has(i.id)).length} 已收藏
                        </span>
                      )}
                    </div>
                    <div className="masonry-grid signboard-grid-with-badges">
                      {items.map(sb => (
                        <div key={sb.id} className="signboard-card-wrap">
                          <SignboardCard signboard={sb} />
                          <div className="card-badges-row">
                            <FavoriteBadge signboardId={sb.id} />
                            <QuickNoteButton signboardId={sb.id} />
                          </div>
                        </div>
                      ))}
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
                <p>创建色彩对照组，把收藏的招牌放在一起比对配色方案</p>
                <button className="go-btn" onClick={openNewColorGroup}>创建第一个对照组</button>
              </div>
            ) : (
              <div className="color-groups-layout">
                <div className="color-groups-sidebar">
                  {colorGroups.map(group => {
                    const favCount = group.signboardIds.filter(id => favoriteSet.has(id)).length;
                    return (
                      <button
                        key={group.id}
                        className={`color-group-sidebar-item ${activeColorGroupId === group.id ? 'active' : ''}`}
                        onClick={() => setActiveColorGroupId(group.id)}
                      >
                        <div className="group-sidebar-left">
                          <span className="group-name">{group.name}</span>
                          {favCount > 0 && <span className="group-fav-dot" title="含收藏招牌">❤️</span>}
                        </div>
                        <span className="group-count">{group.signboardIds.length} 块</span>
                      </button>
                    );
                  })}
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
                          <div className="compare-group-meta">
                            <span>共 {activeColorGroupSignboards.length} 块招牌</span>
                            {activeColorGroupSignboards.filter(s => favoriteSet.has(s.id)).length > 0 && (
                              <span className="meta-chip-fav">
                                ❤️ {activeColorGroupSignboards.filter(s => favoriteSet.has(s.id)).length} 块已收藏
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="compare-group-actions">
                          <button className="icon-btn" onClick={() => openEditColorGroup(activeColorGroup)} title="编辑">✏️</button>
                          <button
                            className="btn-link-small"
                            onClick={() => handleCreateNoteFromColorGroup(activeColorGroup)}
                          >
                            📓 写色彩笔记
                          </button>
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
                          <p>从下方候选招牌中点击 ➕ 添加到对照组（优先显示收藏招牌）</p>
                        </div>
                      ) : (
                        <>
                          <div className="color-compare-grid">
                            {activeColorGroupSignboards.map(sb => (
                              <div key={sb.id} className="color-compare-card">
                                <div className="compare-top-row">
                                  <Link to={`/signboard/${sb.id}`} className="compare-thumb">
                                    <img src={sb.image} alt={sb.name} />
                                  </Link>
                                  <div className="compare-side-badges">
                                    <FavoriteBadge signboardId={sb.id} compact />
                                  </div>
                                </div>
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
                                  <button
                                    className="quick-note-btn small"
                                    onClick={() => openNoteForSignboard(sb.id)}
                                  >
                                    📓 围绕此招牌记笔记
                                  </button>
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
                        <div className="candidates-header-row">
                          <h4 className="candidates-title">🖼️ 候选招牌（收藏优先）</h4>
                          <label className="candidate-toggle">
                            <input
                              type="checkbox"
                              defaultChecked={false}
                              onChange={(e) => {
                                // 这里用DOM方式过滤最简单
                                const onlyFav = e.target.checked;
                                document.querySelectorAll('.candidate-card').forEach((card) => {
                                  const el = card as HTMLElement;
                                  const isFav = el.dataset.fav === 'true';
                                  el.style.display = (!onlyFav || isFav) ? '' : 'none';
                                });
                              }}
                            />
                            <span>仅看收藏</span>
                          </label>
                        </div>
                        <div className="candidates-scroll">
                          {signboards
                            .filter(s => !activeColorGroup.signboardIds.includes(s.id))
                            .sort((a, b) => (favoriteSet.has(b.id) ? 1 : 0) - (favoriteSet.has(a.id) ? 1 : 0))
                            .map(sb => (
                              <div
                                key={sb.id}
                                className="candidate-card"
                                data-fav={favoriteSet.has(sb.id)}
                              >
                                {favoriteSet.has(sb.id) && <span className="candidate-corner">❤️</span>}
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
                  {filteredSignboards.filter(s => favoriteSet.has(s.id)).length > 0 && (
                    <span className="inline-fav-chip">
                      ❤️ {filteredSignboards.filter(s => favoriteSet.has(s.id)).length}
                    </span>
                  )}
                </span>
                {activeFilterCount > 0 && (
                  <button className="btn-secondary" onClick={resetActiveFilter}>
                    ↺ 清空筛选（{activeFilterCount}）
                  </button>
                )}
                <button
                  className="btn-primary"
                  onClick={() => {
                    const matchedIds = filteredSignboards.map(s => s.id);
                    openNewNote('样本筛查', {
                      source: 'screening',
                      signboardIds: matchedIds,
                      title: '筛查结果研究笔记',
                      content: `## 筛查结果分析\n\n**命中招牌数量**：${filteredSignboards.length}块\n\n**筛选条件**：\n- ${activeFilter.yearRange ? `年份范围：${activeFilter.yearRange[0]}-${activeFilter.yearRange[1]}` : ''}\n- ${activeFilter.eras.length ? `年代：${activeFilter.eras.join('、')}` : ''}\n- ${activeFilter.fontStyles.length ? `字体：${activeFilter.fontStyles.join('、')}` : ''}\n- ${activeFilter.onlyFavorites ? '仅看已收藏招牌' : ''}\n\n---\n\n## 样本分析\n\n`
                    });
                  }}
                  disabled={filteredSignboards.length === 0}
                >
                  📓 基于结果写笔记
                </button>
              </div>
            </div>

            <div className="screening-layout">
              <div className="screening-filters-panel">
                <div className="filter-section special">
                  <h4 className="filter-section-title">⭐ 收藏范围快速限定</h4>
                  <div className="chip-group">
                    <button
                      className={`chip special ${activeFilter.onlyFavorites ? 'active' : ''}`}
                      onClick={() => setActiveFilter({ onlyFavorites: !activeFilter.onlyFavorites })}
                      style={activeFilter.onlyFavorites ? { backgroundColor: '#dc2626', color: 'white', borderColor: '#dc2626' } : {}}
                    >
                      ❤️ 仅看收藏（{favorites.length}块）
                    </button>
                  </div>
                  {collections.length > 0 && (
                    <div className="filter-sub-section">
                      <div className="sub-section-title">或选择藏册：</div>
                      <div className="chip-group">
                        {collections.map(col => (
                          <button
                            key={col.id}
                            className={`chip ${activeFilter.onlyInCollections.includes(col.id) ? 'active' : ''}`}
                            onClick={() => toggleCollectionFilter(col.id)}
                            style={activeFilter.onlyInCollections.includes(col.id) ? { backgroundColor: '#0891b2', color: 'white', borderColor: '#0891b2' } : {}}
                          >
                            📚 {col.name}（{col.items.length}）
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

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
                  <div className="screening-results-summary">
                    <div className="results-summary-bar">
                      <span>命中 {filteredSignboards.length} 块招牌</span>
                      <span className="summary-fav">
                        ❤️ 其中 {filteredSignboards.filter(s => favoriteSet.has(s.id)).length} 块在收藏中
                      </span>
                      {filteredSignboards.filter(s => collections.some(c => c.items.some(i => i.signboardId === s.id))).length > 0 && (
                        <span className="summary-col">
                          📚 {filteredSignboards.filter(s => collections.some(c => c.items.some(i => i.signboardId === s.id))).length} 块在藏册中
                        </span>
                      )}
                    </div>
                    <div className="masonry-grid signboard-grid-with-badges">
                      {filteredSignboards.map(sb => (
                        <div key={sb.id} className="signboard-card-wrap">
                          <SignboardCard signboard={sb} />
                          <div className="card-badges-row">
                            <FavoriteBadge signboardId={sb.id} />
                            <QuickNoteButton signboardId={sb.id} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-panel">
            <div className="panel-toolbar notes-toolbar">
              <h2 className="panel-title">📓 个人收藏笔记</h2>
              <div className="panel-actions notes-actions">
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
                <div className="scope-switcher-group">
                  <span className="scope-label">笔记范围：</span>
                  <button
                    className={`chip scope ${noteScope === 'all' ? 'active' : ''}`}
                    onClick={() => { setNoteScope('all'); setScopeCollectionId('all'); }}
                  >
                    全部笔记 ({notes.length})
                  </button>
                  <button
                    className={`chip scope ${noteScope === 'favorites' ? 'active' : ''}`}
                    onClick={() => setNoteScope('favorites')}
                    style={noteScope === 'favorites' ? { backgroundColor: '#dc2626', color: 'white', borderColor: '#dc2626' } : {}}
                  >
                    ❤️ 围绕收藏 ({getFavoriteResearchStats(signboards, favorites, collections).totalFavoritesWithNotes})
                  </button>
                  <button
                    className={`chip scope ${noteScope === 'collections' ? 'active' : ''}`}
                    onClick={() => setNoteScope('collections')}
                    style={noteScope === 'collections' ? { backgroundColor: '#0891b2', color: 'white', borderColor: '#0891b2' } : {}}
                  >
                    📚 围绕藏册 ({getFavoriteResearchStats(signboards, favorites, collections).totalCollectionsWithNotes})
                  </button>
                </div>
                {noteScope === 'collections' && collections.length > 0 && (
                  <select
                    className="form-input small scope-select"
                    value={scopeCollectionId}
                    onChange={e => setScopeCollectionId(e.target.value)}
                  >
                    <option value="all">全部藏册</option>
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>
                        {col.name}（{col.items.length}块）
                      </option>
                    ))}
                  </select>
                )}
                <div className="category-filter-group">
                  <button
                    className={`chip ${noteCategoryFilter === '全部' ? 'active' : ''}`}
                    onClick={() => setNoteCategoryFilter('全部')}
                  >
                    全部分类
                  </button>
                  {(Object.keys(categoryLabels) as NoteCategory[]).map(cat => {
                    const count = notes.filter(n => n.category === cat).length;
                    return (
                      <button
                        key={cat}
                        className={`chip ${noteCategoryFilter === cat ? 'active' : ''}`}
                        onClick={() => setNoteCategoryFilter(cat)}
                        style={noteCategoryFilter === cat ? { backgroundColor: categoryLabels[cat].color + '22', color: categoryLabels[cat].color, borderColor: categoryLabels[cat].color } : {}}
                      >
                        {categoryLabels[cat].icon} {cat} ({count})
                      </button>
                    );
                  })}
                </div>
                <button className="btn-primary" onClick={() => openNewNote()}>
                  ✍️ 新建笔记
                </button>
              </div>
            </div>

            {(noteScope === 'favorites' || noteScope === 'collections') && (
              <div className="notes-scope-banner">
                {noteScope === 'favorites' ? (
                  <>
                    <span className="banner-icon">❤️</span>
                    <div>
                      <b>收藏范围笔记视图</b> — 显示围绕你收藏的 {favorites.length} 块招牌撰写的研究笔记
                      {researchStats.totalFavoritesWithNotes < favorites.length && (
                        <span className="banner-tip">
                          （还有 {favorites.length - researchStats.totalFavoritesWithNotes} 块收藏招牌尚未写笔记）
                        </span>
                      )}
                    </div>
                    <button
                      className="banner-action"
                      onClick={() => openNewNote('综合研究', {
                        source: 'favorite',
                        signboardIds: favorites,
                        title: '我的收藏招牌综合研究',
                        content: `## 收藏研究总览\n\n共收藏 **${favorites.length}** 块招牌：\n\n`
                      })}
                    >
                      ✍️ 写一篇整体研究
                    </button>
                  </>
                ) : (
                  <>
                    <span className="banner-icon">📚</span>
                    <div>
                      <b>藏册范围笔记视图</b> — {scopeCollectionId !== 'all'
                        ? `藏册「${collections.find(c => c.id === scopeCollectionId)?.name}」相关笔记`
                        : `所有藏册（${collections.length}个）相关笔记`}
                    </div>
                    {scopeCollectionId !== 'all' && (
                      <button
                        className="banner-action"
                        onClick={() => openNoteForCollection(scopeCollectionId)}
                      >
                        ✍️ 为该藏册写笔记
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {filteredNotes.length === 0 ? (
              <div className="empty-lab-state">
                <div className="empty-icon">📓</div>
                <h3>
                  {noteScope === 'favorites' && favorites.length === 0
                    ? '你还没有收藏招牌'
                    : noteScope === 'collections' && collections.length === 0
                    ? '还没有创建藏册'
                    : noteScope !== 'all'
                    ? '当前范围内还没有研究笔记'
                    : '还没有研究笔记'}
                </h3>
                <p>
                  {noteScope === 'favorites' && favorites.length === 0
                    ? '先去首页收藏一些喜欢的招牌吧'
                    : '围绕收藏的招牌和藏册，记录你的发现、观察和灵感'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="go-btn" onClick={() => openNewNote()}>写第一篇笔记</button>
                  {favorites.length > 0 && (
                    <button
                      className="go-btn"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #f87171)' }}
                      onClick={() => openNewNote('综合研究', {
                        source: 'favorite',
                        signboardIds: favorites,
                        title: '我的收藏招牌研究'
                      })}
                    >
                      ❤️ 围绕收藏写
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="notes-summary-bar">
                  <span>显示 {filteredNotes.length} 篇笔记</span>
                  {searchKeyword && <span>匹配关键词「{searchKeyword}」</span>}
                  <span className="notes-summary-right">
                    共 {filteredNotes.reduce((sum, n) => sum + n.relatedSignboardIds.length + (n.signboardId ? 1 : 0), 0)} 次招牌引用
                    · {filteredNotes.reduce((sum, n) => sum + n.relatedCollectionIds.length, 0)} 次藏册引用
                  </span>
                </div>
                <div className="notes-grid">
                  {filteredNotes.map(note => {
                    const catInfo = categoryLabels[note.category];
                    const srcInfo = sourceLabels[note.source];
                    const relatedSignboards = signboards.filter(s =>
                      (note.signboardId === s.id) || note.relatedSignboardIds.includes(s.id)
                    );
                    const relatedCollections = collections.filter(c =>
                      note.relatedCollectionIds.includes(c.id) ||
                      relatedSignboards.some(sb => c.items.some(i => i.signboardId === sb.id))
                    );
                    const relatedFavCount = relatedSignboards.filter(s => favoriteSet.has(s.id)).length;
                    return (
                      <div key={note.id} className="note-card">
                        <div className="note-card-header">
                          <div className="note-tags-row">
                            <span
                              className="note-category-tag"
                              style={{ backgroundColor: catInfo.color + '22', color: catInfo.color, borderColor: catInfo.color }}
                            >
                              {catInfo.icon} {catInfo.label}
                            </span>
                            <span
                              className="note-source-tag"
                              style={{ backgroundColor: srcInfo.color + '15', color: srcInfo.color }}
                              title={`创建来源：${srcInfo.label}`}
                            >
                              {srcInfo.icon}
                            </span>
                            {relatedFavCount > 0 && (
                              <span className="note-fav-tag" title={`关联${relatedFavCount}块收藏招牌`}>
                                ❤️ {relatedFavCount}
                              </span>
                            )}
                            {relatedCollections.length > 0 && (
                              <span className="note-col-tag" title={`关联${relatedCollections.length}个藏册`}>
                                📚 {relatedCollections.length}
                              </span>
                            )}
                          </div>
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
                          {note.content.length > 240
                            ? note.content.slice(0, 240) + '...'
                            : note.content.split('\n').slice(0, 5).map((line, i) => <p key={i}>{line}</p>)
                          }
                        </div>
                        {note.tags.length > 0 && (
                          <div className="note-tags">
                            {note.tags.map(tag => (
                              <span key={tag} className="note-tag">#{tag}</span>
                            ))}
                          </div>
                        )}
                        {relatedCollections.length > 0 && (
                          <div className="note-collections">
                            <span className="note-collections-label">关联藏册：</span>
                            <div className="note-collections-tags">
                              {relatedCollections.map(col => (
                                <Link
                                  key={col.id}
                                  to={`/collection/${col.id}`}
                                  className="note-collection-link"
                                >
                                  📚 {col.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {relatedSignboards.length > 0 && (
                          <div className="note-related">
                            <span className="note-related-label">相关招牌 ({relatedSignboards.length})：</span>
                            <div className="note-related-thumbs">
                              {relatedSignboards.slice(0, 6).map(sb => (
                                <div key={sb.id} className="note-related-thumb-wrap">
                                  <Link to={`/signboard/${sb.id}`} className="note-related-thumb">
                                    <img src={sb.image} alt={sb.name} />
                                  </Link>
                                  {favoriteSet.has(sb.id) && <span className="thumb-corner-badge sm">❤️</span>}
                                </div>
                              ))}
                              {relatedSignboards.length > 6 && (
                                <div className="note-related-more">+{relatedSignboards.length - 6}</div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="note-footer">
                          <span className="note-date">
                            {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                            {note.updatedAt !== note.createdAt && ' (已编辑)'}
                          </span>
                          {relatedSignboards.length > 0 && (
                            <button
                              className="note-footer-action"
                              onClick={() => openNewNote('综合研究', {
                                signboardIds: relatedSignboards.map(s => s.id),
                                collectionIds: relatedCollections.map(c => c.id),
                                title: `续：${note.title}`,
                                content: `> 承接笔记《${note.title}》\n\n`
                              })}
                            >
                              🔗 续写
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {noteEditorOpen && (
        <div className="modal-overlay" onClick={() => setNoteEditorOpen(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <h3>{editingNote ? '编辑笔记' : '新建研究笔记'}</h3>
                <span
                  className="modal-source-tag"
                  style={{ backgroundColor: sourceLabels[noteForm.source].color + '20', color: sourceLabels[noteForm.source].color }}
                >
                  {sourceLabels[noteForm.source].icon} {sourceLabels[noteForm.source].label}
                </span>
              </div>
              <button className="icon-btn" onClick={() => setNoteEditorOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {noteForm.relatedCollectionIds.length > 0 && (
                <div className="form-highlight-row">
                  <span>📚 关联藏册：</span>
                  {noteForm.relatedCollectionIds.map(cid => {
                    const col = collections.find(c => c.id === cid);
                    return col ? (
                      <span key={cid} className="highlight-chip">{col.name}（{col.items.length}块招牌）</span>
                    ) : null;
                  })}
                </div>
              )}
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
                <label className="form-label">
                  内容
                  {noteForm.relatedSignboardIds.length > 0 && (
                    <span className="form-label-hint">（已预关联 {noteForm.relatedSignboardIds.length} 块招牌）</span>
                  )}
                </label>
                <textarea
                  className="form-textarea"
                  rows={10}
                  placeholder="记录你的观察、分析、发现..."
                  value={noteForm.content}
                  onChange={e => setNoteForm(p => ({ ...p, content: e.target.value }))}
                />
              </div>

              <div className="form-section-divider">
                <span>关联招牌（点击添加/移除）</span>
              </div>

              <div className="associate-controls">
                {favorites.length > 0 && (
                  <button
                    type="button"
                    className="btn-secondary small"
                    onClick={() => {
                      const merged = Array.from(new Set([...noteForm.relatedSignboardIds, ...favorites]));
                      setNoteForm(p => ({ ...p, relatedSignboardIds: merged, source: 'favorite' }));
                    }}
                  >
                    ➕ 添加所有收藏招牌（{favorites.length}）
                  </button>
                )}
                {collections.length > 0 && (
                  <select
                    className="form-input small associate-col-select"
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const colSignboards = collectionSignboardMap.get(e.target.value) || [];
                      const col = collections.find(c => c.id === e.target.value);
                      const mergedIds = Array.from(new Set([...noteForm.relatedSignboardIds, ...colSignboards]));
                      const mergedCols = Array.from(new Set([...noteForm.relatedCollectionIds, e.target.value]));
                      setNoteForm(p => ({
                        ...p,
                        relatedSignboardIds: mergedIds,
                        relatedCollectionIds: mergedCols,
                        source: p.source === 'manual' ? 'collection' : p.source
                      }));
                      if (col) {
                        setNoteForm(p => ({
                          ...p,
                          title: p.title || `${col.name}研究笔记`
                        }));
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="">➕ 从藏册批量添加招牌...</option>
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>
                        {col.name}（{col.items.length}块）
                      </option>
                    ))}
                  </select>
                )}
                {noteForm.relatedSignboardIds.length > 0 && (
                  <button
                    type="button"
                    className="btn-secondary small danger"
                    onClick={() => setNoteForm(p => ({ ...p, relatedSignboardIds: [] }))}
                  >
                    清空关联
                  </button>
                )}
              </div>

              <div className="associate-signboards-grid">
                {signboards
                  .sort((a, b) => {
                    const aScore = (favoriteSet.has(a.id) ? 100 : 0) +
                      (noteForm.relatedSignboardIds.includes(a.id) ? 50 : 0);
                    const bScore = (favoriteSet.has(b.id) ? 100 : 0) +
                      (noteForm.relatedSignboardIds.includes(b.id) ? 50 : 0);
                    return bScore - aScore;
                  })
                  .slice(0, 24)
                  .map(sb => {
                    const selected = noteForm.relatedSignboardIds.includes(sb.id);
                    const isFav = favoriteSet.has(sb.id);
                    return (
                      <button
                        key={sb.id}
                        className={`associate-thumb ${selected ? 'selected' : ''}`}
                        onClick={() => {
                          const ids = selected
                            ? noteForm.relatedSignboardIds.filter(id => id !== sb.id)
                            : [...noteForm.relatedSignboardIds, sb.id];
                          setNoteForm(p => ({
                            ...p,
                            relatedSignboardIds: ids,
                            source: isFav && ids.length > 0 && p.source === 'manual' ? 'favorite' : p.source
                          }));
                        }}
                        title={sb.name + (isFav ? '（已收藏）' : '')}
                      >
                        <div className="associate-thumb-img-wrap">
                          <img src={sb.image} alt={sb.name} />
                          {isFav && <span className="thumb-corner-badge sm">❤️</span>}
                        </div>
                        <span>{sb.name}</span>
                        <span className="associate-thumb-meta">{sb.era}·{sb.year}</span>
                      </button>
                    );
                  })}
              </div>

              {noteForm.relatedSignboardIds.length > 24 && (
                <div className="associate-more-hint">
                  还有 {noteForm.relatedSignboardIds.length - 0} 块关联招牌，可在上方批量管理
                </div>
              )}
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
                <label className="form-label">
                  包含招牌（可选，显示当前年代阶段内招牌）
                  {snapshotForm.signboardIds.length > 0 && (
                    <span className="form-label-hint">（已选 {snapshotForm.signboardIds.length}）</span>
                  )}
                </label>
                <div className="associate-signboards-grid">
                  {(() => {
                    const stage = eraStages.find(s => s.id === snapshotForm.eraStageId);
                    return signboards
                      .filter(s => stage ? s.year >= stage.startYear && s.year <= stage.endYear : true)
                      .sort((a, b) => (favoriteSet.has(b.id) ? 1 : 0) - (favoriteSet.has(a.id) ? 1 : 0))
                      .slice(0, 16)
                      .map(sb => {
                        const selected = snapshotForm.signboardIds.includes(sb.id);
                        return (
                          <button
                            key={sb.id}
                            className={`associate-thumb ${selected ? 'selected' : ''}`}
                            onClick={() => {
                              const ids = selected
                                ? snapshotForm.signboardIds.filter(id => id !== sb.id)
                                : [...snapshotForm.signboardIds, sb.id];
                              setSnapshotForm(p => ({ ...p, signboardIds: ids }));
                            }}
                          >
                            <div className="associate-thumb-img-wrap">
                              <img src={sb.image} alt={sb.name} />
                              {favoriteSet.has(sb.id) && <span className="thumb-corner-badge sm">❤️</span>}
                            </div>
                            <span>{sb.name}</span>
                          </button>
                        );
                      });
                  })()}
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
