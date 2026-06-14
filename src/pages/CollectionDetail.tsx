import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCollections } from '../context/CollectionsContext';
import { useSignboards } from '../context/SignboardsContext';
import type { Signboard } from '../types';
import CollectionEditorModal from '../components/CollectionEditorModal';
import type { Collection } from '../types';
import './CollectionDetail.css';

const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSignboard } = useSignboards();
  const {
    collections,
    deleteCollection,
    removeFromCollection,
    updateItemNote,
    reorderItems,
    setCollectionCover
  } = useCollections();

  const [showEditor, setShowEditor] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const collection = collections.find(c => c.id === id);

  const collectionSignboards = collection?.items
    .map(item => ({
      signboard: getSignboard(item.signboardId),
      item
    }))
    .filter((x): x is { signboard: Signboard; item: typeof collection.items[0] } => x.signboard !== undefined) ?? [];

  const coverSignboard = collection?.coverSignboardId
    ? getSignboard(collection.coverSignboardId)
    : collectionSignboards[0]?.signboard;

  const otherCovers = collectionSignboards
    .filter(x => x.signboard.id !== coverSignboard?.id)
    .slice(0, 4)
    .map(x => x.signboard);

  const handleEdit = () => {
    if (collection) {
      setEditingCollection(collection);
      setShowEditor(true);
    }
  };

  const handleDelete = () => {
    if (!collection) return;
    if (window.confirm(`确定要删除藏册「${collection.name}」吗？此操作不可撤销。`)) {
      deleteCollection(collection.id);
      navigate('/favorites');
    }
  };

  const handleDragStart = (e: React.DragEvent, signboardId: string) => {
    setDraggedId(signboardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, signboardId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== signboardId) {
      setDragOverId(signboardId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !collection) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentOrder = collection.items.map(i => i.signboardId);
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    reorderItems(collection.id, newOrder);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  if (!collection) {
    return (
      <div className="collection-detail-page">
        <div className="empty-collection">
          <div className="empty-icon">📚</div>
          <h3>藏册不存在</h3>
          <p>这个藏册可能已被删除</p>
          <Link to="/favorites" className="go-btn">返回我的收藏</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-detail-page animate-fade-in">
      <div className="collection-header">
        <div className="collection-header-top">
          <div className="collection-header-info">
            <h1>📚 {collection.name}</h1>
            {collection.description && <p>{collection.description}</p>}
          </div>
          <div className="collection-header-actions">
            <Link to="/favorites" className="browse-btn">← 返回</Link>
            <button className="browse-btn" onClick={handleEdit}>✏️ 编辑</button>
            <button
              className="browse-btn"
              onClick={handleDelete}
              style={{ color: '#C62828' }}
            >
              🗑️ 删除
            </button>
          </div>
        </div>

        <div className="collection-hero">
          {collectionSignboards.length > 0 ? (
            <div className="collection-hero-images">
              {coverSignboard && (
                <img src={coverSignboard.image} alt={coverSignboard.name} className="hero-main" />
              )}
              {otherCovers.map(s => (
                <img key={s.id} src={s.image} alt={s.name} />
              ))}
            </div>
          ) : (
            <div className="collection-hero-placeholder">📚</div>
          )}
        </div>

        <div className="collection-stats">
          <div className="stat-item">
            <span className="stat-number">{collection.items.length}</span>
            <span className="stat-label">块招牌</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{new Set(collectionSignboards.map(x => x.signboard.era)).size}</span>
            <span className="stat-label">个年代</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{new Set(collectionSignboards.map(x => x.signboard.fontStyle)).size}</span>
            <span className="stat-label">种字体</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{collection.items.filter(i => i.note).length}</span>
            <span className="stat-label">条备注</span>
          </div>
        </div>
      </div>

      <div className="items-section">
        <div className="items-section-header">
          <h2 className="items-section-title">招牌列表</h2>
          <span className="sort-hint">
            <span>⋮⋮</span> 拖拽排序，点击 ⭐ 设置封面
          </span>
        </div>

        {collectionSignboards.length === 0 ? (
          <div className="empty-collection">
            <div className="empty-icon">🖼️</div>
            <h3>藏册还是空的</h3>
            <p>去首页把喜欢的招牌加入这个藏册吧</p>
            <Link to="/" className="go-btn">去浏览招牌</Link>
          </div>
        ) : (
          <div className="sortable-list">
            {collectionSignboards.map(({ signboard, item }) => (
              <div
                key={signboard.id}
                className={`sortable-item ${draggedId === signboard.id ? 'dragging' : ''} ${dragOverId === signboard.id ? 'drag-over' : ''}`}
                draggable
                onDragStart={e => handleDragStart(e, signboard.id)}
                onDragOver={e => handleDragOver(e, signboard.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, signboard.id)}
                onDragEnd={handleDragEnd}
              >
                <span className="drag-handle">⋮⋮</span>
                <Link to={`/signboard/${signboard.id}`} className="item-thumb">
                  <img src={signboard.image} alt={signboard.name} />
                </Link>
                <div className="item-info">
                  <Link to={`/signboard/${signboard.id}`} className="item-name">{signboard.name}</Link>
                  <div className="item-meta">{signboard.era} · {signboard.year}年 · {signboard.fontStyle}</div>
                </div>
                <div className="item-note">
                  <input
                    type="text"
                    className="note-input"
                    placeholder="添加备注..."
                    value={item.note || ''}
                    onChange={e => updateItemNote(collection.id, signboard.id, e.target.value)}
                  />
                </div>
                <div className="item-actions">
                  <button
                    className={`item-action-btn ${collection.coverSignboardId === signboard.id ? 'active' : ''}`}
                    onClick={() => setCollectionCover(
                      collection.id,
                      collection.coverSignboardId === signboard.id ? undefined : signboard.id
                    )}
                    title={collection.coverSignboardId === signboard.id ? '取消封面' : '设为封面'}
                  >
                    {collection.coverSignboardId === signboard.id ? '⭐' : '☆'}
                  </button>
                  <button
                    className="item-action-btn danger"
                    onClick={() => removeFromCollection(collection.id, signboard.id)}
                    title="从藏册移除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default CollectionDetail;
