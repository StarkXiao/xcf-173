import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCityMemory } from '../context/CityMemoryContext';
import { useSignboards } from '../context/SignboardsContext';
import { useCollections } from '../context/CollectionsContext';
import type { SignboardSubmission, SubmissionStatus, StoryInfo } from '../types';
import { submissionStatusLabels, getEraStageByYear } from '../types';
import './CityMemory.css';

type PageTab = 'submit' | 'my-submissions' | 'review' | 'display';
type FormMode = 'add' | 'story' | 'review' | 'publish' | null;

const buildingTypes = [
  '石库门', '骑楼', '中式传统', '洋楼', '四合院', '百货大楼',
  '唐楼', '江南民居', '现代建筑', '其他'
];

const CityMemory: React.FC = () => {
  const {
    submissions,
    submitClue,
    addStory,
    reviewSubmission,
    publishToCollection,
    getSubmissionsByStatus,
    deleteSubmission
  } = useCityMemory();

  const { getAllEras, getAllFontStyles, getAllTags } = useSignboards();
  const { collections } = useCollections();

  const [activeTab, setActiveTab] = useState<PageTab>('submit');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SignboardSubmission | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');

  const allErasList = getAllEras();
  const allFontStylesList = getAllFontStyles();
  const allTagsList = getAllTags();

  const [clueForm, setClueForm] = useState({
    shopName: '',
    location: '',
    era: '',
    year: new Date().getFullYear(),
    description: '',
    fontStyle: '',
    buildingType: '',
    photos: '',
    contributorName: '',
    contactInfo: '',
    selectedTags: [] as string[],
    selectedColors: [] as string[]
  });

  const [storyForm, setStoryForm] = useState<Omit<StoryInfo, 'id'>>({
    title: '',
    content: '',
    author: '',
    relationship: '',
    year: new Date().getFullYear()
  });

  const [reviewNote, setReviewNote] = useState('');
  const [publishCollectionId, setPublishCollectionId] = useState('');
  const [publishNote, setPublishNote] = useState('');
  const [customColor, setCustomColor] = useState('#8B4513');
  const [customColorInput, setCustomColorInput] = useState('');

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  const stats = useMemo(() => ({
    total: submissions.length,
    pending: getSubmissionsByStatus('pending').length,
    approved: getSubmissionsByStatus('approved').length,
    rejected: getSubmissionsByStatus('rejected').length,
    published: getSubmissionsByStatus('published').length
  }), [submissions, getSubmissionsByStatus]);

  const filteredSubmissions = useMemo(() => {
    let result = submissions;
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter(s =>
        s.shopName.toLowerCase().includes(keyword) ||
        s.location.toLowerCase().includes(keyword) ||
        s.contributorName.toLowerCase().includes(keyword) ||
        s.description.toLowerCase().includes(keyword) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(keyword)))
      );
    }
    return result;
  }, [submissions, statusFilter, searchKeyword]);

  const handleStartAddStory = (submission: SignboardSubmission) => {
    setSelectedSubmission(submission);
    setFormMode('story');
    setStoryForm({
      title: '',
      content: '',
      author: '',
      relationship: '',
      year: new Date().getFullYear()
    });
  };

  const handleStartReview = (submission: SignboardSubmission) => {
    setSelectedSubmission(submission);
    setFormMode('review');
    setReviewNote('');
  };

  const handleStartPublish = (submission: SignboardSubmission) => {
    if (collections.length === 0) {
      showToast('请先创建至少一个收藏册', 'warning');
      return;
    }
    setSelectedSubmission(submission);
    setFormMode('publish');
    setPublishCollectionId(collections[0].id);
    setPublishNote('');
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setSelectedSubmission(null);
  };

  const handleSubmitClue = () => {
    if (!clueForm.shopName.trim()) {
      showToast('请输入店铺名称', 'warning');
      return;
    }
    if (!clueForm.location.trim()) {
      showToast('请输入店铺位置', 'warning');
      return;
    }
    if (!clueForm.era.trim()) {
      showToast('请选择年代', 'warning');
      return;
    }
    if (!clueForm.description.trim()) {
      showToast('请输入招牌描述', 'warning');
      return;
    }
    if (!clueForm.contributorName.trim()) {
      showToast('请输入您的姓名', 'warning');
      return;
    }

    const photos = clueForm.photos
      .split(',')
      .map(p => p.trim())
      .filter(p => p);

    if (photos.length === 0) {
      photos.push(`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`vintage chinese ${clueForm.shopName} signboard traditional calligraphy`)}&image_size=square`);
    }

    const colors = clueForm.selectedColors.length > 0
      ? clueForm.selectedColors
      : ['#8B4513', '#FFD700'];

    submitClue({
      shopName: clueForm.shopName.trim(),
      location: clueForm.location.trim(),
      era: clueForm.era.trim(),
      year: clueForm.year,
      description: clueForm.description.trim(),
      fontStyle: clueForm.fontStyle.trim() || undefined,
      buildingType: clueForm.buildingType || undefined,
      colors,
      photos,
      contributorName: clueForm.contributorName.trim(),
      contactInfo: clueForm.contactInfo.trim() || undefined,
      tags: clueForm.selectedTags.length > 0 ? clueForm.selectedTags : undefined
    });

    showToast(`线索提交成功！感谢您的参与，审核结果将尽快通知您。`, 'success');
    setClueForm({
      shopName: '',
      location: '',
      era: '',
      year: new Date().getFullYear(),
      description: '',
      fontStyle: '',
      buildingType: '',
      photos: '',
      contributorName: '',
      contactInfo: '',
      selectedTags: [],
      selectedColors: []
    });
    setFormMode(null);
  };

  const handleAddStory = () => {
    if (!selectedSubmission) return;
    if (!storyForm.title.trim()) {
      showToast('请输入故事标题', 'warning');
      return;
    }
    if (!storyForm.content.trim()) {
      showToast('请输入故事内容', 'warning');
      return;
    }

    addStory(selectedSubmission.id, {
      title: storyForm.title.trim(),
      content: storyForm.content.trim(),
      author: storyForm.author?.trim() || undefined,
      relationship: storyForm.relationship?.trim() || undefined,
      year: storyForm.year
    });

    showToast('故事添加成功！', 'success');
    handleCancelForm();
  };

  const handleReview = (status: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;
    reviewSubmission(selectedSubmission.id, status, reviewNote.trim() || undefined);
    showToast(`已${status === 'approved' ? '通过' : '拒绝'}该线索`, 'success');
    handleCancelForm();
  };

  const handlePublish = () => {
    if (!selectedSubmission) return;
    if (!publishCollectionId) {
      showToast('请选择要加入的收藏册', 'warning');
      return;
    }

    const newSignboard = publishToCollection(
      selectedSubmission.id,
      publishCollectionId,
      publishNote.trim() || undefined
    );

    if (newSignboard) {
      showToast(`已成功发布到图鉴！新招牌：${newSignboard.name}`, 'success');
    } else {
      showToast('发布失败，请检查线索状态', 'error');
    }
    handleCancelForm();
  };

  const handleToggleTag = (tag: string) => {
    setClueForm(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const handleToggleColor = (color: string) => {
    setClueForm(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(color)
        ? prev.selectedColors.filter(c => c !== color)
        : [...prev.selectedColors, color]
    }));
  };

  const handleAddCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(trimmed)) {
      showToast('请输入有效的十六进制颜色值', 'warning');
      return;
    }
    const upperColor = trimmed.toUpperCase();
    if (!clueForm.selectedColors.includes(upperColor)) {
      setClueForm(prev => ({
        ...prev,
        selectedColors: [...prev.selectedColors, upperColor]
      }));
    }
    setCustomColorInput('');
  };

  const handleDeleteSubmission = (id: string, shopName: string) => {
    if (!window.confirm(`确定要删除「${shopName}」的线索吗？此操作不可撤销。`)) return;
    deleteSubmission(id);
    showToast(`已删除线索「${shopName}」`, 'warning');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs: { id: PageTab; label: string; icon: string }[] = [
    { id: 'submit', label: '提交线索', icon: '📝' },
    { id: 'my-submissions', label: '我的提交', icon: '📋' },
    { id: 'review', label: '审核管理', icon: '🔍' },
    { id: 'display', label: '展示结果', icon: '🖼️' }
  ];

  return (
    <div className="city-memory-page">
      {toast && (
        <div className={`memory-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      <div className="memory-header">
        <div className="memory-header-content">
          <div>
            <h1 className="memory-title">📜 城市记忆征集</h1>
            <p className="memory-subtitle">
              记录城市的温度，分享您与老招牌的故事。每一块招牌都是城市的记忆，每一个故事都是时代的见证。
            </p>
          </div>
          <div className="memory-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">总征集</span>
            </div>
            <div className="stat-item stat-pending">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">待审核</span>
            </div>
            <div className="stat-item stat-approved">
              <span className="stat-number">{stats.approved}</span>
              <span className="stat-label">已通过</span>
            </div>
            <div className="stat-item stat-published">
              <span className="stat-number">{stats.published}</span>
              <span className="stat-label">已入册</span>
            </div>
          </div>
        </div>
      </div>

      <div className="memory-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`memory-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setFormMode(null);
              setSelectedSubmission(null);
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="memory-content">
        {/* 提交线索 Tab */}
        {activeTab === 'submit' && formMode !== 'story' && formMode !== 'review' && formMode !== 'publish' && (
          <div className="submit-section">
            <div className="section-card">
              <div className="card-header-row">
                <h2>📝 提交招牌线索</h2>
              </div>
              <p className="section-desc">
                请填写以下信息，帮助我们记录更多城市记忆。您提交的信息将经过审核，优质内容将被收录进招牌图鉴。
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🏪</span> 店铺名称 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：德兴茶庄"
                    value={clueForm.shopName}
                    onChange={(e) => setClueForm(prev => ({ ...prev, shopName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📍</span> 所在位置 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：上海静安区南京西路"
                    value={clueForm.location}
                    onChange={(e) => setClueForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📅</span> 年代 <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={clueForm.era}
                    onChange={(e) => setClueForm(prev => ({ ...prev, era: e.target.value }))}
                  >
                    <option value="">请选择年代</option>
                    {allErasList.map(era => (
                      <option key={era} value={era}>{era}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🕐</span> 大约年份
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="如：1935"
                    value={clueForm.year}
                    onChange={(e) => setClueForm(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                  />
                  {clueForm.year && getEraStageByYear(clueForm.year) && (
                    <p className="form-hint">
                      属于：{getEraStageByYear(clueForm.year)?.label}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">✍️</span> 字体风格
                  </label>
                  <select
                    className="form-input"
                    value={clueForm.fontStyle}
                    onChange={(e) => setClueForm(prev => ({ ...prev, fontStyle: e.target.value }))}
                  >
                    <option value="">请选择字体</option>
                    {allFontStylesList.map(fs => (
                      <option key={fs} value={fs}>{fs}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🏠</span> 建筑类型
                  </label>
                  <select
                    className="form-input"
                    value={clueForm.buildingType}
                    onChange={(e) => setClueForm(prev => ({ ...prev, buildingType: e.target.value }))}
                  >
                    <option value="">请选择建筑类型</option>
                    {buildingTypes.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span className="label-icon">📜</span> 招牌描述 <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="请详细描述这块招牌的外观、历史背景、您与它的故事..."
                    value={clueForm.description}
                    onChange={(e) => setClueForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span className="label-icon">🏷️</span> 标签
                  </label>
                  <div className="tags-cloud">
                    {allTagsList.map(tag => (
                      <button
                        key={tag}
                        className={`tag-btn ${clueForm.selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => handleToggleTag(tag)}
                        type="button"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span className="label-icon">🎨</span> 招牌配色
                  </label>
                  <div className="colors-picker">
                    <div className="colors-grid">
                      {['#8B4513', '#A0522D', '#CD853F', '#DAA520', '#1E3A8A', '#DC143C',
                        '#8B0000', '#FFD700', '#000000', '#2F4F4F', '#F5F5DC', '#FF6347',
                        '#FFFFF0', '#228B22', '#556B2F', '#FFF8DC', '#4A4A4A', '#FAEBD7',
                        '#800080', '#FF4500', '#191970', '#FFC0CB', '#FF6B6B', '#E8D5B7',
                        '#2C3E50', '#6B8E23', '#4682B4', '#B8860B', '#8B7355', '#FFE4B5'
                      ].map(color => (
                        <button
                          key={color}
                          className={`color-swatch-btn ${clueForm.selectedColors.includes(color) ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleToggleColor(color)}
                          type="button"
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="custom-color-row">
                      <input
                        type="color"
                        className="color-picker-input"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setCustomColorInput(e.target.value.toUpperCase());
                        }}
                      />
                      <input
                        type="text"
                        className="form-input short-input"
                        placeholder="#RRGGBB"
                        value={customColorInput}
                        onChange={(e) => {
                          setCustomColorInput(e.target.value);
                          if (/^#([A-Fa-f0-9]{6})$/.test(e.target.value)) {
                            setCustomColor(e.target.value);
                          }
                        }}
                      />
                      <button className="btn-secondary" onClick={handleAddCustomColor} type="button">
                        添加
                      </button>
                    </div>
                    <div className="selected-colors-list">
                      {clueForm.selectedColors.map((color, idx) => (
                        <div key={idx} className="selected-color-item">
                          <div
                            className="selected-color-swatch"
                            style={{ backgroundColor: color }}
                          />
                          <span className="selected-color-code">{color}</span>
                          <button
                            className="remove-color-btn"
                            onClick={() => handleToggleColor(color)}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span className="label-icon">🖼️</span> 图片链接
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="多个图片用逗号分隔，留空将自动生成"
                    value={clueForm.photos}
                    onChange={(e) => setClueForm(prev => ({ ...prev, photos: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">👤</span> 您的姓名 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="请输入您的姓名或昵称"
                    value={clueForm.contributorName}
                    onChange={(e) => setClueForm(prev => ({ ...prev, contributorName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📞</span> 联系方式
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="手机号或邮箱（选填，用于审核通知）"
                    value={clueForm.contactInfo}
                    onChange={(e) => setClueForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button className="btn-secondary" onClick={() => setClueForm({
                  shopName: '',
                  location: '',
                  era: '',
                  year: new Date().getFullYear(),
                  description: '',
                  fontStyle: '',
                  buildingType: '',
                  photos: '',
                  contributorName: '',
                  contactInfo: '',
                  selectedTags: [],
                  selectedColors: []
                })} type="button">
                  重置表单
                </button>
                <button className="btn-primary" onClick={handleSubmitClue} type="button">
                  📤 提交线索
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 我的提交 Tab */}
        {activeTab === 'my-submissions' && formMode !== 'story' && formMode !== 'review' && formMode !== 'publish' && (
          <div className="submissions-list-section">
            <div className="list-toolbar">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 搜索店铺名称、位置或投稿人..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | 'all')}
              >
                <option value="all">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
                <option value="published">已入册</option>
              </select>
              <div className="list-stats">
                共 <strong>{filteredSubmissions.length}</strong> 条线索
              </div>
            </div>

            <div className="submissions-grid">
              {filteredSubmissions.map((submission, idx) => {
                const eraStage = submission.year ? getEraStageByYear(submission.year) : null;
                return (
                  <div key={submission.id} className="submission-card" style={{ animationDelay: `${idx * 0.03}s` }}>
                    <div className="card-image">
                      <img src={submission.photos[0]} alt={submission.shopName} loading="lazy" />
                      <div className="card-overlay">
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: submissionStatusLabels[submission.status].color + '20',
                            borderColor: submissionStatusLabels[submission.status].color,
                            color: submissionStatusLabels[submission.status].color
                          }}
                        >
                          {submissionStatusLabels[submission.status].icon} {submissionStatusLabels[submission.status].text}
                        </span>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-header">
                        <h3 className="card-name">{submission.shopName}</h3>
                        {eraStage && (
                          <span className="era-badge" style={{ backgroundColor: eraStage.color }}>
                            {submission.era}
                          </span>
                        )}
                      </div>
                      <p className="card-location">📍 {submission.location}</p>
                      <p className="card-description">{submission.description}</p>

                      {submission.colors && submission.colors.length > 0 && (
                        <div className="card-colors">
                          {submission.colors.map((color, i) => (
                            <div
                              key={i}
                              className="color-dot"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}

                      {submission.tags && submission.tags.length > 0 && (
                        <div className="card-tags">
                          {submission.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="card-tag">#{tag}</span>
                          ))}
                        </div>
                      )}

                      <div className="card-stories">
                        <span className="stories-count">
                          📖 {submission.stories.length} 个故事
                        </span>
                      </div>

                      <div className="card-meta">
                        <span>投稿人：{submission.contributorName}</span>
                        <span>{formatDate(submission.submitTime)}</span>
                      </div>

                      {submission.reviewerNote && (
                        <div className="reviewer-note">
                          <span className="note-label">审核意见：</span>
                          <span className="note-content">{submission.reviewerNote}</span>
                        </div>
                      )}

                      <div className="card-actions">
                        {submission.status === 'pending' && (
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleStartAddStory(submission)}
                          >
                            ✍️ 补充故事
                          </button>
                        )}
                        {submission.status === 'approved' && !submission.signboardId && (
                          <>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleStartAddStory(submission)}
                            >
                              ✍️ 补充故事
                            </button>
                            <button
                              className="btn-action btn-publish"
                              onClick={() => handleStartPublish(submission)}
                            >
                              📖 发布到图鉴
                            </button>
                          </>
                        )}
                        {submission.signboardId && (
                          <Link
                            to={`/signboard/${submission.signboardId}`}
                            className="btn-action btn-view"
                          >
                            👁️ 查看图鉴
                          </Link>
                        )}
                        {submission.status === 'pending' && (
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteSubmission(submission.id, submission.shopName)}
                          >
                            🗑️ 删除
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredSubmissions.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p className="empty-text">没有找到符合条件的线索</p>
              </div>
            )}
          </div>
        )}

        {/* 审核管理 Tab */}
        {activeTab === 'review' && formMode !== 'story' && formMode !== 'review' && formMode !== 'publish' && (
          <div className="review-section">
            <div className="section-card">
              <div className="card-header-row">
                <h2>🔍 审核管理</h2>
              </div>
              <p className="section-desc">
                审核市民提交的招牌线索，优质内容将被收录进招牌图鉴。
              </p>

              <div className="list-toolbar">
                <select
                  className="filter-select"
                  value={statusFilter === 'all' ? 'pending' : statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus)}
                >
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
                <div className="list-stats">
                  待审核：<strong>{getSubmissionsByStatus('pending').length}</strong> 条
                </div>
              </div>

              <div className="submissions-grid">
                {getSubmissionsByStatus(statusFilter === 'all' ? 'pending' : statusFilter as SubmissionStatus).map((submission, idx) => {
                  const eraStage = submission.year ? getEraStageByYear(submission.year) : null;
                  return (
                    <div key={submission.id} className="submission-card" style={{ animationDelay: `${idx * 0.03}s` }}>
                      <div className="card-image">
                        <img src={submission.photos[0]} alt={submission.shopName} loading="lazy" />
                      </div>
                      <div className="card-content">
                        <div className="card-header">
                          <h3 className="card-name">{submission.shopName}</h3>
                          {eraStage && (
                            <span className="era-badge" style={{ backgroundColor: eraStage.color }}>
                              {submission.era}
                            </span>
                          )}
                        </div>
                        <p className="card-location">📍 {submission.location}</p>
                        <p className="card-description">{submission.description}</p>

                        {submission.stories.length > 0 && (
                          <div className="stories-preview">
                            <h4>📖 征集故事</h4>
                            {submission.stories.map((story, i) => (
                              <div key={i} className="story-item">
                                <div className="story-header">
                                  <strong>{story.title}</strong>
                                  {story.author && <span> — {story.author}</span>}
                                  {story.relationship && <span className="story-relationship">({story.relationship})</span>}
                                </div>
                                <p className="story-content">{story.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="card-meta">
                          <span>投稿人：{submission.contributorName}</span>
                          <span>{formatDate(submission.submitTime)}</span>
                        </div>

                        <div className="card-actions">
                          {submission.status === 'pending' && (
                            <>
                              <button
                                className="btn-action btn-approve"
                                onClick={() => handleStartReview(submission)}
                              >
                                ✅ 审核
                              </button>
                            </>
                          )}
                          {submission.status === 'approved' && !submission.signboardId && (
                            <button
                              className="btn-action btn-publish"
                              onClick={() => handleStartPublish(submission)}
                            >
                              📖 发布到图鉴
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {getSubmissionsByStatus(statusFilter === 'all' ? 'pending' : statusFilter as SubmissionStatus).length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🎉</div>
                  <p className="empty-text">暂无待审核内容</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 展示结果 Tab */}
        {activeTab === 'display' && formMode !== 'story' && formMode !== 'review' && formMode !== 'publish' && (
          <div className="display-section">
            <div className="section-card">
              <div className="card-header-row">
                <h2>🖼️ 已入册展示</h2>
              </div>
              <p className="section-desc">
                展示已通过审核并入册的招牌线索，这些内容已成为城市记忆的一部分。
              </p>

              <div className="published-stats">
                <div className="stat-card">
                  <span className="stat-icon">📚</span>
                  <div>
                    <div className="stat-number-large">{stats.published}</div>
                    <div className="stat-label">已入册</div>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">✅</span>
                  <div>
                    <div className="stat-number-large">{stats.approved}</div>
                    <div className="stat-label">已通过</div>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📖</span>
                  <div>
                    <div className="stat-number-large">
                      {submissions.reduce((sum, s) => sum + s.stories.length, 0)}
                    </div>
                    <div className="stat-label">征集故事</div>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">👥</span>
                  <div>
                    <div className="stat-number-large">
                      {new Set(submissions.map(s => s.contributorName)).size}
                    </div>
                    <div className="stat-label">热心市民</div>
                  </div>
                </div>
              </div>

              <div className="submissions-grid">
                {getSubmissionsByStatus('published').map((submission, idx) => {
                  const eraStage = submission.year ? getEraStageByYear(submission.year) : null;
                  return (
                    <div key={submission.id} className="submission-card published-card" style={{ animationDelay: `${idx * 0.03}s` }}>
                      <div className="card-image">
                        <img src={submission.photos[0]} alt={submission.shopName} loading="lazy" />
                        <div className="card-overlay">
                          <span className="published-badge">📖 已入册</span>
                        </div>
                      </div>
                      <div className="card-content">
                        <div className="card-header">
                          <h3 className="card-name">{submission.shopName}</h3>
                          {eraStage && (
                            <span className="era-badge" style={{ backgroundColor: eraStage.color }}>
                              {submission.era}
                            </span>
                          )}
                        </div>
                        <p className="card-location">📍 {submission.location}</p>
                        <p className="card-description">{submission.description}</p>

                        {submission.stories.length > 0 && (
                          <div className="stories-preview">
                            <h4>📖 征集故事</h4>
                            {submission.stories.map((story, i) => (
                              <div key={i} className="story-item">
                                <div className="story-header">
                                  <strong>{story.title}</strong>
                                  {story.author && <span> — {story.author}</span>}
                                </div>
                                <p className="story-content">{story.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="card-meta">
                          <span>投稿人：{submission.contributorName}</span>
                        </div>

                        <div className="card-actions">
                          {submission.signboardId && (
                            <Link
                              to={`/signboard/${submission.signboardId}`}
                              className="btn-action btn-view"
                            >
                              👁️ 查看图鉴详情
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {getSubmissionsByStatus('published').length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🌱</div>
                  <p className="empty-text">暂无已入册内容，快去审核发布吧！</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 补充故事弹窗 */}
        {formMode === 'story' && selectedSubmission && (
          <div className="modal-overlay" onClick={handleCancelForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✍️ 补充故事信息</h2>
                <button className="modal-close" onClick={handleCancelForm}>×</button>
              </div>
              <div className="modal-body">
                <div className="submission-preview">
                  <h3>为「{selectedSubmission.shopName}」补充故事</h3>
                  <p className="preview-location">📍 {selectedSubmission.location}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📌</span> 故事标题 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：我与这块招牌的童年记忆"
                    value={storyForm.title}
                    onChange={(e) => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📜</span> 故事内容 <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    placeholder="请详细讲述您与这块招牌的故事..."
                    value={storyForm.content}
                    onChange={(e) => setStoryForm(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👤</span> 讲述人
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="选填"
                      value={storyForm.author}
                      onChange={(e) => setStoryForm(prev => ({ ...prev, author: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👨‍👩‍👧</span> 与店铺关系
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="如：老顾客、传人、邻居等"
                      value={storyForm.relationship}
                      onChange={(e) => setStoryForm(prev => ({ ...prev, relationship: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📅</span> 故事发生年份
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="如：1985"
                      value={storyForm.year}
                      onChange={(e) => setStoryForm(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={handleCancelForm}>取消</button>
                <button className="btn-primary" onClick={handleAddStory}>💾 保存故事</button>
              </div>
            </div>
          </div>
        )}

        {/* 审核弹窗 */}
        {formMode === 'review' && selectedSubmission && (
          <div className="modal-overlay" onClick={handleCancelForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔍 审核线索</h2>
                <button className="modal-close" onClick={handleCancelForm}>×</button>
              </div>
              <div className="modal-body">
                <div className="submission-preview">
                  <img src={selectedSubmission.photos[0]} alt={selectedSubmission.shopName} />
                  <div className="preview-info">
                    <h3>{selectedSubmission.shopName}</h3>
                    <p className="preview-location">📍 {selectedSubmission.location}</p>
                    <p className="preview-era">📅 {selectedSubmission.era}</p>
                    <p className="preview-description">{selectedSubmission.description}</p>
                    <p className="preview-contributor">👤 投稿人：{selectedSubmission.contributorName}</p>
                  </div>
                </div>

                {selectedSubmission.stories.length > 0 && (
                  <div className="stories-preview">
                    <h4>📖 征集故事</h4>
                    {selectedSubmission.stories.map((story, i) => (
                      <div key={i} className="story-item">
                        <div className="story-header">
                          <strong>{story.title}</strong>
                          {story.author && <span> — {story.author}</span>}
                        </div>
                        <p className="story-content">{story.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📝</span> 审核意见
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="请输入审核意见（选填）"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={handleCancelForm}>取消</button>
                <button className="btn-danger" onClick={() => handleReview('rejected')}>❌ 拒绝</button>
                <button className="btn-success" onClick={() => handleReview('approved')}>✅ 通过</button>
              </div>
            </div>
          </div>
        )}

        {/* 发布弹窗 */}
        {formMode === 'publish' && selectedSubmission && (
          <div className="modal-overlay" onClick={handleCancelForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📖 发布到图鉴</h2>
                <button className="modal-close" onClick={handleCancelForm}>×</button>
              </div>
              <div className="modal-body">
                <div className="submission-preview">
                  <img src={selectedSubmission.photos[0]} alt={selectedSubmission.shopName} />
                  <div className="preview-info">
                    <h3>{selectedSubmission.shopName}</h3>
                    <p className="preview-location">📍 {selectedSubmission.location}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📚</span> 选择收藏册 <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={publishCollectionId}
                    onChange={(e) => setPublishCollectionId(e.target.value)}
                  >
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>{col.name} ({col.items.length} 个招牌)</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📝</span> 备注
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="选填，将作为收藏册备注"
                    value={publishNote}
                    onChange={(e) => setPublishNote(e.target.value)}
                  />
                </div>

                <div className="publish-preview">
                  <h4>📋 发布后将自动：</h4>
                  <ul>
                    <li>创建新的招牌条目并加入图鉴</li>
                    <li>将征集故事合并到招牌描述中</li>
                    <li>自动添加「市民征集」标签</li>
                    <li>加入您选择的收藏册</li>
                    <li>更新线索状态为「已入册」</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={handleCancelForm}>取消</button>
                <button className="btn-primary" onClick={handlePublish}>📖 确认发布</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityMemory;
