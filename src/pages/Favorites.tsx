import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import { useCollections } from '../context/CollectionsContext';
import { useOralArchives } from '../context/OralArchivesContext';
import SignboardCard from '../components/SignboardCard';
import CollectionCard from '../components/CollectionCard';
import CollectionEditorModal from '../components/CollectionEditorModal';
import RestorationTimeline from '../components/RestorationTimeline';
import { eraStages, getSignboardEraStages, getEventsInEraStage } from '../types';
import type { Signboard, RestorationEvent, Collection, OralArchive } from '../types';
import './Favorites.css';

type ViewMode = 'grid' | 'timeline' | 'grouped' | 'collections' | 'oral-archives';

const Favorites: React.FC = () => {
  const { getFavoriteSignboards, favorites } = useFavorites();
  const { collections, deleteCollection } = useCollections();
  const { archives, saveArchive, deleteArchive, getArchive } = useOralArchives();
  const [viewMode, setViewMode] = useState<ViewMode>('collections');
  const [showEditor, setShowEditor] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);
  const [archiveForm, setArchiveForm] = useState<Partial<OralArchive>>({
    storySummary: '',
    sourceNote: '',
    informant: '',
    recordingDate: ''
  });
  const [archiveSearchKeyword, setArchiveSearchKeyword] = useState('');
  const favoriteSignboards = getFavoriteSignboards(signboards);

  const groupedByEraStage = useMemo(() => {
    const groups: Record<string, Signboard[]> = {};
    favoriteSignboards.forEach(s => {
      const stages = getSignboardEraStages(s);
      stages.forEach(stage => {
        if (!groups[stage.id]) groups[stage.id] = [];
        groups[stage.id].push(s);
      });
    });
    return groups;
  }, [favoriteSignboards]);

  interface TimelineEntry {
    signboard: Signboard;
    events: RestorationEvent[];
    stageId: string;
  }

  const timelineEntries = useMemo((): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];
    favoriteSignboards.forEach(s => {
      const stages = getSignboardEraStages(s);
      stages.forEach(stage => {
        entries.push({
          signboard: s,
          events: getEventsInEraStage(s, stage.id),
          stageId: stage.id
        });
      });
    });
    return entries.sort((a, b) => {
      const aMin = Math.min(...a.events.map(e => e.year));
      const bMin = Math.min(...b.events.map(e => e.year));
      return aMin - bMin;
    });
  }, [favoriteSignboards]);

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setShowEditor(true);
  };

  const handleDeleteCollection = (collection: Collection) => {
    if (window.confirm(`确定要删除藏册「${collection.name}」吗？此操作不可撤销。`)) {
      deleteCollection(collection.id);
    }
  };

  const handleCreateCollection = () => {
    setEditingCollection(null);
    setShowEditor(true);
  };

  const archiveSignboards = useMemo(() => {
    const archiveMap = new Map(archives.map(a => [a.signboardId, a]));
    return signboards
      .filter(s => archiveMap.has(s.id))
      .map(s => ({
        signboard: s,
        archive: archiveMap.get(s.id)!
      }));
  }, [archives]);

  const filteredArchiveSignboards = useMemo(() => {
    if (!archiveSearchKeyword.trim()) return archiveSignboards;
    const kw = archiveSearchKeyword.toLowerCase();
    return archiveSignboards.filter(({ signboard, archive }) =>
      signboard.name.toLowerCase().includes(kw) ||
      signboard.shopName.toLowerCase().includes(kw) ||
      signboard.location.toLowerCase().includes(kw) ||
      archive.storySummary.toLowerCase().includes(kw) ||
      archive.sourceNote.toLowerCase().includes(kw) ||
      (archive.informant && archive.informant.toLowerCase().includes(kw))
    );
  }, [archiveSignboards, archiveSearchKeyword]);

  const handleStartEditArchive = (signboardId: string) => {
    const archive = getArchive(signboardId);
    if (archive) {
      setArchiveForm({
        storySummary: archive.storySummary,
        sourceNote: archive.sourceNote,
        informant: archive.informant,
        recordingDate: archive.recordingDate
      });
    } else {
      setArchiveForm({
        storySummary: '',
        sourceNote: '',
        informant: '',
        recordingDate: ''
      });
    }
    setEditingArchiveId(signboardId);
  };

  const handleSaveArchive = () => {
    if (!editingArchiveId) return;
    if (!archiveForm.storySummary?.trim() && !archiveForm.sourceNote?.trim()) {
      return;
    }
    saveArchive(editingArchiveId, archiveForm);
    setEditingArchiveId(null);
  };

  const handleDeleteArchive = (signboardId: string, signboardName: string) => {
    if (!window.confirm(`确定要删除「${signboardName}」的口述档案吗？此操作不可撤销。`)) return;
    deleteArchive(signboardId);
    if (editingArchiveId === signboardId) {
      setEditingArchiveId(null);
    }
  };

  return (
    <div className="favorites-page animate-fade-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">❤️ 我的收藏</h1>
          <p className="page-subtitle">
            已收藏 <strong>{favorites.length}</strong> 块珍贵招牌 ·
            共 <strong>{collections.length}</strong> 个藏册 ·
            口述档案 <strong>{archives.length}</strong> 份
          </p>
        </div>
        <div className="header-actions-row">
          {(favoriteSignboards.length > 0 || archives.length > 0) && (
            <div className="view-switcher">
              <button
                className={`view-btn ${viewMode === 'collections' ? 'active' : ''}`}
                onClick={() => setViewMode('collections')}
                title="藏册视图"
              >
                📚 藏册
              </button>
              <button
                className={`view-btn ${viewMode === 'oral-archives' ? 'active' : ''}`}
                onClick={() => setViewMode('oral-archives')}
                title="口述档案"
              >
                🎙️ 口述档案
              </button>
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="网格视图"
              >
                🔲 网格
              </button>
              <button
                className={`view-btn ${viewMode === 'grouped' ? 'active' : ''}`}
                onClick={() => setViewMode('grouped')}
                title="按年代分组"
              >
                📚 年代分组
              </button>
              <button
                className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                onClick={() => setViewMode('timeline')}
                title="年代阶段"
              >
                🕰️ 年代轴
              </button>
            </div>
          )}
          {viewMode === 'collections' && (
            <button className="browse-btn" onClick={handleCreateCollection}>
              ➕ 新建藏册
            </button>
          )}
          <Link to="/" className="browse-btn">
            继续浏览 →
          </Link>
        </div>
      </div>

      {(favoriteSignboards.length === 0 && archives.length === 0) && (viewMode !== 'collections' && viewMode !== 'oral-archives') ? (
        <div className="empty-favorites">
          <div className="empty-icon">📚</div>
          <h2>收藏夹还是空的</h2>
          <p>去首页看看那些承载着城市记忆的老招牌吧</p>
          <Link to="/" className="go-btn">去发现招牌</Link>
        </div>
      ) : viewMode === 'collections' ? (
        <div>
          {collections.length === 0 ? (
            <div className="empty-favorites">
              <div className="empty-icon">📚</div>
              <h2>还没有创建藏册</h2>
              <p>创建藏册来整理和分组你喜欢的招牌吧</p>
              <button className="go-btn" onClick={handleCreateCollection}>创建第一个藏册</button>
            </div>
          ) : (
            <div className="masonry-grid">
              {collections.map(collection => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onEdit={handleEditCollection}
                  onDelete={handleDeleteCollection}
                />
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'oral-archives' ? (
        <div className="oral-archives-view">
          <div className="archives-toolbar">
            <div className="archives-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="搜索招牌名称、内容、口述者..."
                value={archiveSearchKeyword}
                onChange={e => setArchiveSearchKeyword(e.target.value)}
              />
              {archiveSearchKeyword && (
                <button
                  className="clear-search-btn"
                  onClick={() => setArchiveSearchKeyword('')}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="archives-stats">
              <span className="stat-item">
                📋 共 <strong>{archiveSignboards.length}</strong> 份档案
                {archiveSearchKeyword && ` · 匹配 ${filteredArchiveSignboards.length} 份`}
              </span>
            </div>
          </div>

          {archiveSignboards.length === 0 ? (
            <div className="empty-favorites">
              <div className="empty-icon">🎙️</div>
              <h2>还没有口述档案</h2>
              <p>去招牌详情页，为每块珍贵的招牌记录背后的故事吧</p>
              <Link to="/" className="go-btn">去浏览招牌 →</Link>
            </div>
          ) : filteredArchiveSignboards.length === 0 ? (
            <div className="empty-favorites">
              <div className="empty-icon">🔍</div>
              <h2>没有匹配的档案</h2>
              <p>试试更换搜索关键词</p>
              <button className="go-btn" onClick={() => setArchiveSearchKeyword('')}>清除搜索</button>
            </div>
          ) : (
            <div className="archives-list">
              {filteredArchiveSignboards.map(({ signboard, archive }) => (
                <div
                  key={signboard.id}
                  className={`archive-card ${editingArchiveId === signboard.id ? 'editing' : ''}`}
                >
                  <div className="archive-card-header">
                    <Link to={`/signboard/${signboard.id}`} className="archive-card-thumb">
                      <img src={signboard.image} alt={signboard.name} />
                    </Link>
                    <div className="archive-card-info">
                      <Link to={`/signboard/${signboard.id}`} className="archive-card-title-link">
                        <h3 className="archive-card-title">{signboard.name}</h3>
                      </Link>
                      <p className="archive-card-shop">{signboard.shopName}</p>
                      <div className="archive-card-meta">
                        <span className="archive-meta-chip">📅 {signboard.era} · {signboard.year}年</span>
                        <span className="archive-meta-chip">📍 {signboard.location}</span>
                        {archive.informant && (
                          <span className="archive-meta-chip">👤 {archive.informant}</span>
                        )}
                      </div>
                      <div className="archive-card-dates">
                        <span>建档: {new Date(archive.recordedAt).toLocaleDateString('zh-CN')}</span>
                        {archive.updatedAt !== archive.recordedAt && (
                          <span> · 更新: {new Date(archive.updatedAt).toLocaleDateString('zh-CN')}</span>
                        )}
                      </div>
                    </div>
                    <div className="archive-card-actions">
                      {editingArchiveId === signboard.id ? (
                        <>
                          <button
                            className="archive-action-btn cancel-btn"
                            onClick={() => setEditingArchiveId(null)}
                          >
                            取消
                          </button>
                          <button
                            className="archive-action-btn save-btn"
                            onClick={handleSaveArchive}
                          >
                            💾 保存
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="archive-action-btn edit-btn"
                            onClick={() => handleStartEditArchive(signboard.id)}
                          >
                            ✏️ 编辑
                          </button>
                          <button
                            className="archive-action-btn delete-btn"
                            onClick={() => handleDeleteArchive(signboard.id, signboard.name)}
                          >
                            🗑️ 删除
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingArchiveId === signboard.id ? (
                    <div className="archive-edit-form">
                      <div className="archive-form-row">
                        <div className="archive-form-group half">
                          <label className="form-label">
                            <span className="label-icon">👤</span> 口述者
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="口述者姓名/身份"
                            value={archiveForm.informant || ''}
                            onChange={e => setArchiveForm(prev => ({ ...prev, informant: e.target.value }))}
                          />
                        </div>
                        <div className="archive-form-group half">
                          <label className="form-label">
                            <span className="label-icon">📅</span> 记录日期
                          </label>
                          <input
                            type="date"
                            className="form-input"
                            value={archiveForm.recordingDate || ''}
                            onChange={e => setArchiveForm(prev => ({ ...prev, recordingDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="archive-form-group">
                        <label className="form-label">
                          <span className="label-icon">📖</span> 故事摘要
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={5}
                          placeholder="记录招牌背后的故事..."
                          value={archiveForm.storySummary || ''}
                          onChange={e => setArchiveForm(prev => ({ ...prev, storySummary: e.target.value }))}
                        />
                      </div>
                      <div className="archive-form-group">
                        <label className="form-label">
                          <span className="label-icon">📝</span> 来源备注
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={3}
                          placeholder="记录资料来源、参考文献等..."
                          value={archiveForm.sourceNote || ''}
                          onChange={e => setArchiveForm(prev => ({ ...prev, sourceNote: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="archive-card-content">
                      {archive.storySummary && (
                        <div className="archive-content-field">
                          <div className="content-field-label">
                            <span className="field-icon">📖</span> 故事摘要
                          </div>
                          <div className="content-field-text">
                            {archive.storySummary.length > 200
                              ? archive.storySummary.slice(0, 200) + '...'
                              : archive.storySummary.split('\n').map((line, idx) => (
                                  <p key={idx}>{line}</p>
                                ))
                            }
                          </div>
                        </div>
                      )}
                      {archive.sourceNote && (
                        <div className="archive-content-field">
                          <div className="content-field-label">
                            <span className="field-icon">📝</span> 来源备注
                          </div>
                          <div className="content-field-text source">
                            {archive.sourceNote.length > 150
                              ? archive.sourceNote.slice(0, 150) + '...'
                              : archive.sourceNote.split('\n').map((line, idx) => (
                                  <p key={idx}>{line}</p>
                                ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="masonry-grid">
          {favoriteSignboards.map(signboard => (
            <SignboardCard key={signboard.id} signboard={signboard} />
          ))}
        </div>
      ) : viewMode === 'grouped' ? (
        <div className="grouped-view">
          {Object.entries(groupedByEraStage)
            .sort(([a], [b]) => {
              const stageA = eraStages.find(s => s.id === a);
              const stageB = eraStages.find(s => s.id === b);
              return (stageA?.startYear ?? 9999) - (stageB?.startYear ?? 9999);
            })
            .map(([stageId, items]) => {
              const stage = eraStages.find(s => s.id === stageId);
              return (
                <div key={stageId} className="era-group">
                  <div className="era-group-header" style={stage ? { borderColor: stage.color } : undefined}>
                    <h3 className="era-group-title" style={stage ? { color: stage.color } : undefined}>
                      ◆ {stage?.label ?? '其他年代'}
                    </h3>
                    {stage && (
                      <span className="era-group-years">
                        {stage.startYear} - {stage.endYear}
                      </span>
                    )}
                    <span className="era-group-count">{items.length} 块招牌（含跨阶段）</span>
                  </div>
                  <div className="masonry-grid">
                    {items.map(signboard => {
                      const stageEvents = getEventsInEraStage(signboard, stageId);
                      return (
                        <div key={signboard.id} className="grouped-card-wrapper">
                          <SignboardCard signboard={signboard} />
                          <div className="stage-events-panel">
                            <div className="stage-events-title">
                              {stage?.label ?? ''} · {stageEvents.length} 件事
                            </div>
                            <RestorationTimeline history={stageEvents} compact />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="timeline-view">
          <div className="era-stage-section">
            <h3 className="era-stage-title">🕰️ 收藏招牌年代分布</h3>
            <RestorationTimeline
              history={[]}
              showEraStages
              signboards={favoriteSignboards}
            />
          </div>
          <div className="timeline-cards-list">
            {timelineEntries.map((entry, idx) => {
              const stage = eraStages.find(s => s.id === entry.stageId);
              const minYear = Math.min(...entry.events.map(e => e.year));
              return (
                <div key={`${entry.signboard.id}-${entry.stageId}-${idx}`} className="timeline-card-item">
                  <div className="timeline-card-year" style={stage ? { borderColor: stage.color, color: stage.color } : undefined}>
                    {minYear}
                    <div className="year-stage-tag">{stage?.label}</div>
                  </div>
                  <div className="timeline-card-content">
                    <SignboardCard signboard={entry.signboard} />
                    <div className="stage-events-panel">
                      <div className="stage-events-title">
                        本阶段修缮事件
                      </div>
                      <RestorationTimeline history={entry.events} compact />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showEditor && (
        <CollectionEditorModal
          key={editingCollection?.id ?? 'new'}
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingCollection(null);
          }}
          editingCollection={editingCollection}
        />
      )}
    </div>
  );
};

export default Favorites;
