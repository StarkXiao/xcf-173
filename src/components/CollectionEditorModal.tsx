import React, { useState } from 'react';
import type { Collection } from '../types';
import { useCollections } from '../context/CollectionsContext';
import './CollectionEditorModal.css';

interface CollectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCollection?: Collection | null;
}

const CollectionEditorModal: React.FC<CollectionEditorModalProps> = ({
  isOpen,
  onClose,
  editingCollection
}) => {
  const { createCollection, updateCollection } = useCollections();
  const initialName = editingCollection?.name ?? '';
  const initialDescription = editingCollection?.description ?? '';
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCollection) {
      updateCollection(editingCollection.id, {
        name: name.trim(),
        description: description.trim()
      });
    } else {
      createCollection(name.trim(), description.trim());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingCollection ? '编辑藏册' : '新建藏册'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">藏册名称</label>
              <input
                type="text"
                className="form-input"
                placeholder="给藏册起个名字，如「清代老字号」"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">备注说明</label>
              <textarea
                className="form-textarea"
                placeholder="简单描述一下这个藏册的主题（可选）"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-btn modal-btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="modal-btn modal-btn-primary" disabled={!name.trim()}>
              {editingCollection ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionEditorModal;
