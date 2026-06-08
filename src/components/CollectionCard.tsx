import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Collection } from '../types';
import { signboards } from '../data/signboards';
import './CollectionCard.css';

interface CollectionCardProps {
  collection: Collection;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const coverSignboards = collection.items
    .map(item => signboards.find(s => s.id === item.signboardId))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const coverSignboard = collection.coverSignboardId
    ? signboards.find(s => s.id === collection.coverSignboardId)
    : coverSignboards[0];

  const otherCovers = coverSignboards.filter(s => s.id !== coverSignboard?.id).slice(0, 3);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.collection-actions')) return;
    navigate(`/collection/${collection.id}`);
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
      </div>
    </div>
  );
};

export default CollectionCard;
