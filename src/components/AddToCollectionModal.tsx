import React, { useState } from 'react';
import { useCollections } from '../context/CollectionsContext';
import CollectionEditorModal from './CollectionEditorModal';
import './CollectionEditorModal.css';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  signboardId: string;
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  isOpen,
  onClose,
  signboardId
}) => {
  const { collections, isSignboardInCollection, addToCollection, removeFromCollection } = useCollections();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleToggle = (collectionId: string) => {
    if (isSignboardInCollection(collectionId, signboardId)) {
      removeFromCollection(collectionId, signboardId);
    } else {
      addToCollection(collectionId, signboardId);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">添加到藏册</h2>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="collection-list">
              {collections.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  还没有藏册，点击下方创建一个吧
                </p>
              ) : (
                collections.map(collection => {
                  const isIn = isSignboardInCollection(collection.id, signboardId);
                  return (
                    <div
                      key={collection.id}
                      className={`collection-list-item ${isIn ? 'selected' : ''}`}
                      onClick={() => handleToggle(collection.id)}
                    >
                      <div className="collection-list-item-info">
                        <span className="collection-list-item-name">{collection.name}</span>
                        <span className="collection-list-item-count">
                          {collection.items.length} 块招牌
                        </span>
                      </div>
                      {isIn && <span className="collection-list-item-check">✓</span>}
                    </div>
                  );
                })
              )}
            </div>
            <button
              className="add-collection-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <span>➕</span>
              <span>创建新藏册</span>
            </button>
          </div>
          <div className="modal-footer">
            <button className="modal-btn modal-btn-primary" onClick={onClose}>
              完成
            </button>
          </div>
        </div>
      </div>
      {showCreateModal && (
        <CollectionEditorModal
          key="new-collection"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
};

export default AddToCollectionModal;
