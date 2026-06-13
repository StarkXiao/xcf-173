import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { signboards } from '../data/signboards';
import { useFavorites } from '../context/FavoritesContext';
import { useOralArchives } from '../context/OralArchivesContext';
import RestorationTimeline from '../components/RestorationTimeline';
import { getNeighborhoodRecommendations } from '../utils/recommendation';
import type { OralArchive } from '../types';
import './SignboardDetail.css';

const conditionLabels: Record<string, { text: string; className: string }> = {
  'well-preserved': { text: '保存完好', className: 'good' },
  'weathered': { text: '自然风化', className: 'weathered' },
  'damaged': { text: '有所损坏', className: 'damaged' },
  'restored': { text: '经过修复', className: 'restored' }
};

const SignboardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, toggleCompare, addToCompare, maxCompare, isFavorite, isInCompare, compareList } = useFavorites();
  const { saveArchive, deleteArchive, getArchive } = useOralArchives();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const [isEditingArchive, setIsEditingArchive] = useState(false);
  const [archiveForm, setArchiveForm] = useState<Partial<OralArchive>>({
    storySummary: '',
    sourceNote: '',
    informant: '',
    recordingDate: ''
  });

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const signboard = signboards.find(s => s.id === id);
  const existingArchive = id ? getArchive(id) : undefined;

  useEffect(() => {
    if (existingArchive) {
      setArchiveForm({
        storySummary: existingArchive.storySummary,
        sourceNote: existingArchive.sourceNote,
        informant: existingArchive.informant,
        recordingDate: existingArchive.recordingDate
      });
      setIsEditingArchive(false);
    } else {
      setArchiveForm({
        storySummary: '',
        sourceNote: '',
        informant: '',
        recordingDate: ''
      });
    }
  }, [id, existingArchive]);

  const handleSaveArchive = () => {
    if (!id) return;
    if (!archiveForm.storySummary?.trim() && !archiveForm.sourceNote?.trim()) {
      showToast('请至少填写故事摘要或来源备注', 'warning');
      return;
    }
    saveArchive(id, archiveForm);
    setIsEditingArchive(false);
    showToast('口述档案已保存', 'success');
  };

  const handleDeleteArchive = () => {
    if (!id) return;
    if (!window.confirm('确定要删除这份口述档案吗？此操作不可撤销。')) return;
    deleteArchive(id);
    setIsEditingArchive(false);
    showToast('口述档案已删除', 'warning');
  };

  const handleStartEdit = () => {
    if (existingArchive) {
      setArchiveForm({
        storySummary: existingArchive.storySummary,
        sourceNote: existingArchive.sourceNote,
        informant: existingArchive.informant,
        recordingDate: existingArchive.recordingDate
      });
    }
    setIsEditingArchive(true);
  };

  if (!signboard) {
    return (
      <div className="detail-container">
        <div className="not-found">
          <div className="not-found-icon">📜</div>
          <h2>未找到该招牌</h2>
          <p>可能已被归档或不存在</p>
          <Link to="/" className="back-link">← 返回首页</Link>
        </div>
      </div>
    );
  }

  const neighborhoodRecommendations = useMemo(() => {
    return getNeighborhoodRecommendations(signboard, signboards, { limit: 6, minScore: 10 });
  }, [signboard]);

  return (
    <div className="detail-container animate-fade-in">
      {toast && (
        <div className={`detail-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <div className="detail-hero">
        <div className="detail-image-wrap">
          <div className="detail-image">
            <img src={signboard.image} alt={signboard.name} />
            <div className="image-overlay">
              <div className="overlay-decor-left">❖</div>
              <div className="overlay-decor-right">❖</div>
            </div>
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-header">
            <div className="detail-tags">
              <span className="detail-era-tag">{signboard.era}</span>
              <span className={`detail-condition-tag condition-${conditionLabels[signboard.condition].className}`}>
                {conditionLabels[signboard.condition].text}
              </span>
            </div>
            <h1 className="detail-title">{signboard.name}</h1>
            <p className="detail-shop">{signboard.shopName}</p>
          </div>

          <div className="detail-meta">
            <div className="meta-row">
              <span className="meta-icon">📅</span>
              <span className="meta-label">创立年份</span>
              <span className="meta-value">{signboard.year}年</span>
            </div>
            <div className="meta-row">
              <span className="meta-icon">📍</span>
              <span className="meta-label">所在位置</span>
              <span className="meta-value">{signboard.location}</span>
            </div>
            <div className="meta-row">
              <span className="meta-icon">🏠</span>
              <span className="meta-label">建筑类型</span>
              <span className="meta-value">{signboard.buildingType}</span>
            </div>
            <div className="meta-row">
              <span className="meta-icon">✍️</span>
              <span className="meta-label">字体风格</span>
              <span className="meta-value">{signboard.fontStyle}（{signboard.fontFamily}）</span>
            </div>
          </div>

          <div className="detail-colors">
            <h3 className="section-title">🎨 招牌配色</h3>
            <div className="colors-display">
              {signboard.colors.map((color, idx) => (
                <div key={idx} className="color-block">
                  <div className="color-swatch" style={{ backgroundColor: color }} />
                  <span className="color-code">{color}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-tags-section">
            <h3 className="section-title">🏷️ 标签</h3>
            <div className="tags-list">
              {signboard.tags.map(tag => (
                <span key={tag} className="detail-tag">#{tag}</span>
              ))}
            </div>
          </div>

          <div className="detail-actions">
            <button
              className={`detail-action-btn favorite-btn ${isFavorite(signboard.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(signboard.id)}
            >
              <span>{isFavorite(signboard.id) ? '❤️' : '🤍'}</span>
              <span>{isFavorite(signboard.id) ? '取消收藏' : '加入收藏'}</span>
            </button>
            <button
              className={`detail-action-btn compare-btn ${isInCompare(signboard.id) ? 'active' : ''}`}
              onClick={() => {
                if (isInCompare(signboard.id)) {
                  toggleCompare(signboard.id);
                  showToast('已从对比列表移除', 'warning');
                } else {
                  const result = addToCompare(signboard.id);
                  if (result.success) {
                    showToast(`已加入对比（${compareList.length}/${maxCompare}）`, 'success');
                  } else {
                    showToast(result.reason || '添加失败', 'error');
                  }
                }
              }}
            >
              <span>⚖️</span>
              <span>{isInCompare(signboard.id) ? '移出对比' : '加入对比'}</span>
            </button>
            {isInCompare(signboard.id) && (
              <Link to="/compare" className="detail-action-btn goto-compare-btn">
                <span>📊</span>
                <span>前往对比</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="detail-description">
        <h3 className="section-title">📜 招牌故事</h3>
        <div className="description-content">
          <p>{signboard.description}</p>
        </div>
      </div>

      <div className="oral-archive-section">
        <div className="oral-archive-header">
          <div className="oral-archive-title-wrap">
            <h3 className="section-title oral-archive-title">
              🎙️ 招牌口述档案
            </h3>
            <p className="oral-archive-subtitle">
              记录这块招牌背后的口耳相传故事、采访笔记与来源备注
            </p>
          </div>
          {existingArchive && !isEditingArchive && (
            <div className="oral-archive-actions">
              <button className="archive-action-btn edit-btn" onClick={handleStartEdit}>
                ✏️ 编辑档案
              </button>
              <button className="archive-action-btn delete-btn" onClick={handleDeleteArchive}>
                🗑️ 删除
              </button>
            </div>
          )}
          {!existingArchive && !isEditingArchive && (
            <button className="archive-create-btn" onClick={() => setIsEditingArchive(true)}>
              ➕ 建立口述档案
            </button>
          )}
        </div>

        {existingArchive && !isEditingArchive ? (
          <div className="oral-archive-content">
            <div className="archive-meta-row">
              {existingArchive.informant && (
                <div className="archive-meta-item">
                  <span className="archive-meta-icon">👤</span>
                  <span className="archive-meta-label">口述者</span>
                  <span className="archive-meta-value">{existingArchive.informant}</span>
                </div>
              )}
              {existingArchive.recordingDate && (
                <div className="archive-meta-item">
                  <span className="archive-meta-icon">📅</span>
                  <span className="archive-meta-label">记录日期</span>
                  <span className="archive-meta-value">{existingArchive.recordingDate}</span>
                </div>
              )}
              <div className="archive-meta-item">
                <span className="archive-meta-icon">🕐</span>
                <span className="archive-meta-label">建档时间</span>
                <span className="archive-meta-value">
                  {new Date(existingArchive.recordedAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              {existingArchive.updatedAt !== existingArchive.recordedAt && (
                <div className="archive-meta-item">
                  <span className="archive-meta-icon">✏️</span>
                  <span className="archive-meta-label">最近更新</span>
                  <span className="archive-meta-value">
                    {new Date(existingArchive.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </div>

            {existingArchive.storySummary && (
              <div className="archive-field">
                <div className="archive-field-label">
                  <span className="field-icon">📖</span> 故事摘要
                </div>
                <div className="archive-field-text story-text">
                  {existingArchive.storySummary.split('\n').map((line, idx) => (
                    <p key={idx}>{line || <br />}</p>
                  ))}
                </div>
              </div>
            )}

            {existingArchive.sourceNote && (
              <div className="archive-field">
                <div className="archive-field-label">
                  <span className="field-icon">📝</span> 来源备注
                </div>
                <div className="archive-field-text source-text">
                  {existingArchive.sourceNote.split('\n').map((line, idx) => (
                    <p key={idx}>{line || <br />}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isEditingArchive ? (
          <div className="oral-archive-form">
            <div className="archive-form-row">
              <div className="archive-form-group half">
                <label className="form-label">
                  <span className="label-icon">👤</span> 口述者（可选）
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="如：王老第三代传人王老先生"
                  value={archiveForm.informant || ''}
                  onChange={e => setArchiveForm(prev => ({ ...prev, informant: e.target.value }))}
                />
              </div>
              <div className="archive-form-group half">
                <label className="form-label">
                  <span className="label-icon">📅</span> 记录日期（可选）
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
                <span className="label-hint">记录招牌背后流传的故事、趣闻、历史典故等</span>
              </label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="例如：据王老口述，这块招牌是他的爷爷在1935年请当地著名书法家题写，当时花了三块大洋..."
                value={archiveForm.storySummary || ''}
                onChange={e => setArchiveForm(prev => ({ ...prev, storySummary: e.target.value }))}
              />
              <div className="char-count">{archiveForm.storySummary?.length || 0} / 2000</div>
            </div>

            <div className="archive-form-group">
              <label className="form-label">
                <span className="label-icon">📝</span> 来源备注
                <span className="label-hint">记录资料来源、采访地点、参考文献等</span>
              </label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="例如：2024年3月15日采访于上海静安区南京西路老店；参考《上海老字号史料汇编》第142页"
                value={archiveForm.sourceNote || ''}
                onChange={e => setArchiveForm(prev => ({ ...prev, sourceNote: e.target.value }))}
              />
              <div className="char-count">{archiveForm.sourceNote?.length || 0} / 1000</div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="form-btn cancel-btn"
                onClick={() => {
                  setIsEditingArchive(false);
                  if (existingArchive) {
                    setArchiveForm({
                      storySummary: existingArchive.storySummary,
                      sourceNote: existingArchive.sourceNote,
                      informant: existingArchive.informant,
                      recordingDate: existingArchive.recordingDate
                    });
                  } else {
                    setArchiveForm({
                      storySummary: '',
                      sourceNote: '',
                      informant: '',
                      recordingDate: ''
                    });
                  }
                }}
              >
                取消
              </button>
              <button
                type="button"
                className="form-btn save-btn"
                onClick={handleSaveArchive}
              >
                💾 保存档案
              </button>
            </div>
          </div>
        ) : (
          <div className="oral-archive-empty">
            <div className="empty-archive-icon">🎙️</div>
            <p className="empty-archive-text">
              还没有为这块招牌建立口述档案
            </p>
            <p className="empty-archive-hint">
              记录口述历史，让招牌的故事不被遗忘
            </p>
          </div>
        )}
      </div>

      <RestorationTimeline history={signboard.restorationHistory} />

      {neighborhoodRecommendations.length > 0 && (
        <div className="neighborhood-section">
          <div className="neighborhood-section-header">
            <div className="neighborhood-title-wrap">
              <h3 className="section-title neighborhood-title">🏘️ 同街区发现</h3>
              <p className="neighborhood-subtitle">
                基于位置、年代和风格智能推荐，发现更多相似的招牌故事
              </p>
            </div>
            <div className="neighborhood-actions">
              <button
                className="batch-compare-btn"
                onClick={() => {
                  let added = 0;
                  let skipped = 0;
                  let failed = 0;
                  neighborhoodRecommendations.forEach(r => {
                    const result = addToCompare(r.signboard.id);
                    if (result.success) added++;
                    else if (result.alreadyIn) skipped++;
                    else failed++;
                  });
                  if (added > 0 && failed === 0) {
                    showToast(`成功加入 ${added} 块招牌（${compareList.length}/${maxCompare}）`, 'success');
                  } else if (added > 0 && failed > 0) {
                    showToast(`加入 ${added} 块，${skipped} 块已在列表，${failed} 块因列表已满未能加入`, 'warning');
                  } else if (added === 0 && failed > 0) {
                    showToast(`对比列表已满（最多 ${maxCompare} 块），请先移除部分招牌`, 'error');
                  } else if (skipped > 0) {
                    showToast(`${skipped} 块招牌已在对比列表中`, 'warning');
                  }
                }}
                title="将所有推荐招牌加入对比"
              >
                ⚖️ 全部加入对比
              </button>
              <Link to="/" className="back-home-link">
                🏠 返回首页 →
              </Link>
            </div>
          </div>

          <div className="neighborhood-grid">
            {neighborhoodRecommendations.map((result, index) => (
              <div key={result.signboard.id} className="neighborhood-card-wrapper" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="neighborhood-card">
                  <Link to={`/signboard/${result.signboard.id}`} className="neighborhood-card-link">
                    <div className="neighborhood-card-image">
                      <img src={result.signboard.image} alt={result.signboard.name} loading="lazy" />
                      <div className="neighborhood-card-overlay">
                        <span className="neighborhood-card-era">{result.signboard.era}</span>
                        <span className="neighborhood-score-badge">
                          匹配度 {result.score}%
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="neighborhood-card-content">
                    <Link to={`/signboard/${result.signboard.id}`} className="neighborhood-card-title-link">
                      <h4 className="neighborhood-card-title">{result.signboard.name}</h4>
                    </Link>
                    <p className="neighborhood-card-shop">{result.signboard.shopName}</p>

                    <div className="neighborhood-match-info">
                      <div className="match-item">
                        <span className="match-icon">📍</span>
                        <span className="match-text">{result.matchDetails.locationMatch}</span>
                      </div>
                      <div className="match-item">
                        <span className="match-icon">🕰️</span>
                        <span className="match-text">{result.matchDetails.eraMatch}</span>
                      </div>
                      <div className="match-item">
                        <span className="match-icon">🎨</span>
                        <span className="match-text">{result.matchDetails.styleMatch}</span>
                      </div>
                    </div>

                    <div className="neighborhood-score-bar">
                      <div className="score-label">综合匹配度</div>
                      <div className="score-track">
                        <div
                          className="score-fill"
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                      <div className="score-value">{result.score}%</div>
                    </div>

                    <div className="neighborhood-score-breakdown">
                      <div className="score-breakdown-item">
                        <span className="breakdown-label">位置</span>
                        <div className="breakdown-bar">
                          <div className="breakdown-fill location-fill" style={{ width: `${result.matchDetails.locationScore}%` }} />
                        </div>
                        <span className="breakdown-value">{result.matchDetails.locationScore}</span>
                      </div>
                      <div className="score-breakdown-item">
                        <span className="breakdown-label">年代</span>
                        <div className="breakdown-bar">
                          <div className="breakdown-fill era-fill" style={{ width: `${result.matchDetails.eraScore}%` }} />
                        </div>
                        <span className="breakdown-value">{result.matchDetails.eraScore}</span>
                      </div>
                      <div className="score-breakdown-item">
                        <span className="breakdown-label">风格</span>
                        <div className="breakdown-bar">
                          <div className="breakdown-fill style-fill" style={{ width: `${result.matchDetails.styleScore}%` }} />
                        </div>
                        <span className="breakdown-value">{result.matchDetails.styleScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignboardDetail;
