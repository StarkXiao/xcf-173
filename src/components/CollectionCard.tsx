import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Collection } from '../types';
import { useSignboards } from '../context/SignboardsContext';
import { useResearchLab } from '../context/ResearchLabContext';
import './CollectionCard.css';

interface CollectionCardProps {
  collection: Collection;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { getSignboard } = useSignboards();
  const { getNotesForCollection } = useResearchLab();

  const coverSignboards = collection.items
    .map(item => getSignboard(item.signboardId))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const coverSignboard = collection.coverSignboardId
    ? getSignboard(collection.coverSignboardId)
    : coverSignboards[0];

  const otherCovers = coverSignboards.filter(s => s.id !== coverSignboard?.id).slice(0, 3);
  const noteCount = getNotesForCollection(collection.id).length;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.collection-actions') || target.closest('.collection-research-btn')) return;
    navigate(`/collection/${collection.id}`);
  };

  const handleResearchNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/research-lab', {
      state: {
        openCollectionNote: collection.id
      }
    });
  };

  return (
    <div className="collection-card animate-fade-in" onClick={handleClick}>
      <div className="collection-cover">
        {coverSignboards.length > 0 ? (
          <div className="collection-cover-images">
            {coverSignboard && (
              <img src={coverSignboard.image} alt={coverSignboard.name} className="main-cover" />
            )}
            {otherCovers.slice(0, 3).map(s => (
              <img key={s.id} src={s.image} alt={s.name} />
            ))}
          </div>
        ) : (
          <div className="collection-cover-placeholder">📚</div>
        )}
        <div className="collection-cover-overlay">
          <span className="collection-count-badge">{collection.items.length} 块招牌</span>
        </div>
      </div>

      <div className="collection-info">
        <h3 className="collection-name">{collection.name}</h3>
        {collection.description && (
          <p className="collection-description">{collection.description}</p>
        )}
        <div className="collection-meta">
          <span className="collection-date">创建于 {formatDate(collection.createdAt)}</span>
          {(onEdit || onDelete) && (
            <div className="collection-actions" onClick={e => e.stopPropagation()}>
              {onEdit && (
                <button className="collection-action-btn" onClick={() => onEdit(collection)} title="编辑">
                  ✏️
                </button>
              )}
              {onDelete && (
                <button className="collection-action-btn danger" onClick={() => onDelete(collection)} title="删除">
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
        <div className="collection-research-row">
          <button
            className="collection-research-btn"
            onClick={handleResearchNote}
            title={noteCount > 0 ? `查看${noteCount}篇研究笔记或写新笔记` : '围绕藏册写研究笔记'}
          >
            🔬 {noteCount > 0 ? `研究笔记 (${noteCount})` : '写研究笔记'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
