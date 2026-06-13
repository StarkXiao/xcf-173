import React, { useState } from 'react';
import type { StatusRecord, ConditionStatus } from '../types';
import { conditionStatusLabels } from '../types';
import { useStatusTracking } from '../context/StatusTrackingContext';
import './StatusTracking.css';

interface StatusTrackingProps {
  signboardId: string;
  signboardCondition: ConditionStatus;
}

const StatusTracking: React.FC<StatusTrackingProps> = ({ signboardId, signboardCondition }) => {
  const { getRecordsForSignboard, addRecord, updateRecord, deleteRecord, getLatestStatus } = useStatusTracking();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    condition: 'well-preserved' as ConditionStatus,
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const records = getRecordsForSignboard(signboardId);
  const latestUserStatus = getLatestStatus(signboardId);
  const displayStatus = latestUserStatus || signboardCondition;

  const handleStartAdd = () => {
    setFormData({
      condition: displayStatus,
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleStartEdit = (record: StatusRecord) => {
    setFormData({
      condition: record.condition,
      date: record.date,
      note: record.note || ''
    });
    setEditingId(record.id);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (isAdding) {
      addRecord(signboardId, formData);
    } else if (editingId) {
      updateRecord(editingId, formData);
    }
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条状态记录吗？此操作不可撤销。')) {
      deleteRecord(id);
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const allStatusOptions: { value: ConditionStatus; label: string; icon: string }[] = [
    { value: 'well-preserved', label: '保存完好', icon: '✨' },
    { value: 'weathered', label: '自然风化', icon: '🍂' },
    { value: 'damaged', label: '有所损坏', icon: '⚠️' },
    { value: 'restored', label: '经过修复', icon: '🏛️' }
  ];

  return (
    <div className="status-tracking-section">
      <div className="status-tracking-header">
        <div className="status-tracking-title-wrap">
          <h3 className="section-title status-tracking-title">
            📋 招牌状态追踪
          </h3>
          <p className="status-tracking-subtitle">
            记录招牌的保存状况变化，追踪修复与保养历史
          </p>
        </div>
        <div className="status-current-badge" style={{ borderColor: conditionStatusLabels[displayStatus].color }}>
          <span className="current-status-icon">{conditionStatusLabels[displayStatus].icon}</span>
          <span className="current-status-label">当前状态：</span>
          <span className="current-status-text" style={{ color: conditionStatusLabels[displayStatus].color }}>
            {conditionStatusLabels[displayStatus].text}
          </span>
          {latestUserStatus && (
            <span className="status-source-tag">用户记录</span>
          )}
        </div>
      </div>

      <div className="status-tracking-toolbar">
        <div className="status-stats-row">
          {allStatusOptions.map(status => {
            const count = records.filter(r => r.condition === status.value).length;
            return (
              <div key={status.value} className="status-stat-item">
                <span className="stat-icon">{status.icon}</span>
                <span className="stat-count">{count}</span>
                <span className="stat-label">{status.label}</span>
              </div>
            );
          })}
        </div>
        <button className="add-status-btn" onClick={handleStartAdd}>
          ➕ 记录新状态
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="status-form-panel">
          <div className="status-form-header">
            <h4>{isAdding ? '📝 记录新状态' : '✏️ 编辑状态记录'}</h4>
          </div>
          <div className="status-form-body">
            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">
                  <span className="label-icon">📅</span> 记录日期
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="form-group half">
                <label className="form-label">
                  <span className="label-icon">📋</span> 状态类型
                </label>
                <select
                  className="form-select"
                  value={formData.condition}
                  onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value as ConditionStatus }))}
                >
                  {allStatusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📝</span> 备注说明
                <span className="label-hint">记录状态变化的原因、修复内容等</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="例如：招牌漆面出现剥落，需要进行修复保养..."
                value={formData.note}
                onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>
            <div className="form-actions">
              <button className="form-btn cancel-btn" onClick={handleCancel}>
                取消
              </button>
              <button className="form-btn save-btn" onClick={handleSave}>
                💾 保存记录
              </button>
            </div>
          </div>
        </div>
      )}

      {records.length > 0 ? (
        <div className="status-timeline">
          <div className="timeline-track">
            {records.map((record, idx) => {
              const statusInfo = conditionStatusLabels[record.condition];
              const isEditing = editingId === record.id;
              const isLast = idx === 0;

              return (
                <div key={record.id} className={`timeline-item ${isLast ? 'latest' : ''}`}>
                  <div className="timeline-left">
                    <div
                      className={`timeline-dot ${statusInfo.className}`}
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      <span className="dot-icon">{statusInfo.icon}</span>
                    </div>
                    {idx < records.length - 1 && <div className="timeline-connector" />}
                  </div>

                  <div className={`timeline-card ${statusInfo.className} ${isEditing ? 'editing' : ''}`}>
                    <div className="card-header">
                      <div className="card-date-badge">
                        <span className="date-icon">📅</span>
                        <span className="date-text">{record.date}</span>
                        {isLast && <span className="latest-tag">最新</span>}
                      </div>
                      <span
                        className={`card-status-badge ${statusInfo.className}`}
                        style={{ borderColor: statusInfo.color, color: statusInfo.color }}
                      >
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    </div>

                    {record.note && (
                      <div className="card-note">
                        <span className="note-label">📝 备注：</span>
                        <span className="note-text">{record.note}</span>
                      </div>
                    )}

                    <div className="card-meta-row">
                      <span className="record-time">
                        记录于 {new Date(record.recordedAt).toLocaleDateString('zh-CN')}
                      </span>
                      {record.updatedAt !== record.recordedAt && (
                        <span className="update-time">
                          · 更新于 {new Date(record.updatedAt).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="card-actions">
                        <button
                          className="card-action-btn edit-btn"
                          onClick={() => handleStartEdit(record)}
                        >
                          ✏️ 编辑
                        </button>
                        <button
                          className="card-action-btn delete-btn"
                          onClick={() => handleDelete(record.id)}
                        >
                          🗑️ 删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="status-empty">
          <div className="empty-icon">📋</div>
          <p className="empty-text">还没有状态追踪记录</p>
          <p className="empty-hint">
            记录招牌的保存状态变化，追踪每一次修复和保养
          </p>
          {!isAdding && (
            <button className="empty-action-btn" onClick={handleStartAdd}>
              ➕ 添加第一条记录
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusTracking;
