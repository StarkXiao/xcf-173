import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSignboards } from '../context/SignboardsContext';
import type { Signboard } from '../types';
import { conditionStatusLabels, eraStages, getEraStageByYear } from '../types';
import { conditions } from '../data/signboards';
import './EditorPage.css';

type EditorTab = 'signboards' | 'tags' | 'eras' | 'import';
type FormMode = 'add' | 'edit' | null;

const conditionOptions = conditions.filter(c => c.value !== '全部');

const buildingTypes = [
  '石库门', '骑楼', '中式传统', '洋楼', '四合院', '百货大楼',
  '唐楼', '江南民居', '现代建筑', '其他'
];

const colorPresets = [
  '#8B4513', '#A0522D', '#CD853F', '#DAA520', '#B8860B',
  '#8B7355', '#6B8E23', '#4682B4', '#1E3A8A', '#DC143C',
  '#8B0000', '#DAA520', '#000000', '#FFD700', '#2F4F4F',
  '#F5F5DC', '#FF6347', '#FFFFF0', '#228B22', '#556B2F',
  '#FFF8DC', '#4A4A4A', '#FAEBD7', '#800080', '#FF4500',
  '#191970', '#FFC0CB', '#FF6B6B', '#FFE4B5', '#E8D5B7'
];

const EditorPage: React.FC = () => {
  const {
    signboards,
    addSignboard,
    updateSignboard,
    deleteSignboard,
    getAllTags,
    getAllEras,
    getAllFontStyles,
    resetToDefault
  } = useSignboards();

  const [activeTab, setActiveTab] = useState<EditorTab>('signboards');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [formData, setFormData] = useState<Partial<Signboard>>({
    name: '',
    shopName: '',
    era: '',
    year: new Date().getFullYear(),
    location: '',
    fontStyle: '',
    fontFamily: '',
    colors: [],
    description: '',
    image: '',
    tags: [],
    condition: 'well-preserved',
    buildingType: '',
    restorationHistory: []
  });

  const [newTag, setNewTag] = useState('');
  const [newEra, setNewEra] = useState('');
  const [newFontStyle, setNewFontStyle] = useState('');
  const [customColor, setCustomColor] = useState('#8B4513');
  const [newColorInput, setNewColorInput] = useState('');

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  const allTags = getAllTags();
  const allEras = getAllEras();
  const allFontStyles = getAllFontStyles();

  const filteredSignboards = useMemo(() => {
    if (!searchKeyword.trim()) return signboards;
    const keyword = searchKeyword.trim().toLowerCase();
    return signboards.filter(s =>
      s.name.toLowerCase().includes(keyword) ||
      s.shopName.toLowerCase().includes(keyword) ||
      s.location.toLowerCase().includes(keyword) ||
      s.tags.some(t => t.toLowerCase().includes(keyword))
    );
  }, [signboards, searchKeyword]);

  const handleStartAdd = () => {
    setFormMode('add');
    setEditingId(null);
    setFormData({
      name: '',
      shopName: '',
      era: '',
      year: new Date().getFullYear(),
      location: '',
      fontStyle: '',
      fontFamily: '',
      colors: [],
      description: '',
      image: '',
      tags: [],
      condition: 'well-preserved',
      buildingType: '',
      restorationHistory: []
    });
  };

  const handleStartEdit = (signboard: Signboard) => {
    setFormMode('edit');
    setEditingId(signboard.id);
    setFormData({ ...signboard });
  };

  const handleCancel = () => {
    setFormMode(null);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.name?.trim()) {
      showToast('请输入招牌名称', 'warning');
      return;
    }
    if (!formData.shopName?.trim()) {
      showToast('请输入店铺名称', 'warning');
      return;
    }
    if (!formData.era?.trim()) {
      showToast('请选择年代', 'warning');
      return;
    }
    if (!formData.year) {
      showToast('请输入年份', 'warning');
      return;
    }
    if ((formData.colors || []).length === 0) {
      showToast('请至少选择一个颜色', 'warning');
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      shopName: formData.shopName.trim(),
      era: formData.era.trim(),
      year: formData.year!,
      location: formData.location?.trim() || '',
      fontStyle: formData.fontStyle?.trim() || '楷书',
      fontFamily: formData.fontFamily?.trim() || 'Kai Shu',
      colors: formData.colors!,
      description: formData.description?.trim() || '',
      image: formData.image?.trim() || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`vintage chinese ${formData.shopName} signboard traditional calligraphy`)}&image_size=square`,
      tags: formData.tags || [],
      condition: formData.condition as Signboard['condition'] || 'well-preserved',
      buildingType: formData.buildingType?.trim() || '其他',
      restorationHistory: formData.restorationHistory && formData.restorationHistory.length > 0
        ? formData.restorationHistory
        : [{
            year: formData.year!,
            era: formData.era.trim(),
            type: 'creation' as const,
            title: '创立初制',
            description: `${formData.name}招牌创立`,
            changes: {
              colors: formData.colors!,
              condition: formData.condition as Signboard['condition'] || 'well-preserved'
            }
          }]
    };

    if (formMode === 'add') {
      const newSb = addSignboard(submitData);
      showToast(`已添加招牌「${newSb.name}」`, 'success');
    } else if (formMode === 'edit' && editingId) {
      updateSignboard(editingId, submitData);
      showToast(`已更新招牌「${submitData.name}」`, 'success');
    }

    setFormMode(null);
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`确定要删除招牌「${name}」吗？此操作不可撤销。`)) return;
    deleteSignboard(id);
    showToast(`已删除招牌「${name}」`, 'warning');
  };

  const handleToggleTag = (tag: string) => {
    setFormData(prev => {
      const tags = prev.tags || [];
      return {
        ...prev,
        tags: tags.includes(tag)
          ? tags.filter(t => t !== tag)
          : [...tags, tag]
      };
    });
  };

  const handleAddNewTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (!allTags.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmed]
      }));
      showToast(`已添加新标签「${trimmed}」`, 'success');
    } else {
      handleToggleTag(trimmed);
    }
    setNewTag('');
  };

  const handleToggleColor = (color: string) => {
    setFormData(prev => {
      const colors = prev.colors || [];
      return {
        ...prev,
        colors: colors.includes(color)
          ? colors.filter(c => c !== color)
          : [...colors, color]
      };
    });
  };

  const handleAddCustomColor = () => {
    const trimmed = newColorInput.trim();
    if (!trimmed) return;
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(trimmed)) {
      showToast('请输入有效的十六进制颜色值（如 #FF6B6B）', 'warning');
      return;
    }
    const upperColor = trimmed.toUpperCase();
    if (!(formData.colors || []).includes(upperColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...(prev.colors || []), upperColor]
      }));
    }
    setNewColorInput('');
  };

  const handleAddNewEra = () => {
    const trimmed = newEra.trim();
    if (!trimmed) return;
    if (!allEras.includes(trimmed)) {
      setFormData(prev => ({ ...prev, era: trimmed }));
      showToast(`已添加新年代「${trimmed}」`, 'success');
    } else {
      setFormData(prev => ({ ...prev, era: trimmed }));
    }
    setNewEra('');
  };

  const handleAddNewFontStyle = () => {
    const trimmed = newFontStyle.trim();
    if (!trimmed) return;
    if (!allFontStyles.includes(trimmed)) {
      setFormData(prev => ({ ...prev, fontStyle: trimmed }));
      showToast(`已添加新字体风格「${trimmed}」`, 'success');
    } else {
      setFormData(prev => ({ ...prev, fontStyle: trimmed }));
    }
    setNewFontStyle('');
  };

  const handleReset = () => {
    if (!window.confirm('确定要重置所有数据吗？这将恢复到默认的招牌数据，所有自定义修改将丢失。')) return;
    resetToDefault();
    showToast('已重置为默认数据', 'warning');
  };

  const editingSignboard = editingId ? signboards.find(s => s.id === editingId) : null;

  const tabs: { id: EditorTab; label: string; icon: string }[] = [
    { id: 'signboards', label: '招牌管理', icon: '🪧' },
    { id: 'tags', label: '标签维护', icon: '🏷️' },
    { id: 'eras', label: '年代与字体', icon: '📅' },
    { id: 'import', label: '数据管理', icon: '💾' }
  ];

  return (
    <div className="editor-page">
      {toast && (
        <div className={`editor-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      <div className="editor-header">
        <div className="editor-header-content">
          <div>
            <h1 className="editor-title">🪧 招牌图鉴编辑台</h1>
            <p className="editor-subtitle">录入招牌资料、维护标签颜色年代信息，同步详情页与筛选体系</p>
          </div>
          <div className="editor-header-actions">
            {activeTab === 'signboards' && !formMode && (
              <button className="btn-primary" onClick={handleStartAdd}>
                ➕ 新增招牌
              </button>
            )}
            <Link to="/" className="btn-secondary">
              🏠 返回首页
            </Link>
          </div>
        </div>
      </div>

      <div className="editor-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`editor-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setFormMode(null);
              setEditingId(null);
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="editor-content">
        {activeTab === 'signboards' && !formMode && (
          <div className="signboards-list-section">
            <div className="list-toolbar">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 搜索招牌名称、店铺、位置或标签..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <div className="list-stats">
                共 <strong>{filteredSignboards.length}</strong> / {signboards.length} 块招牌
              </div>
            </div>

            <div className="signboards-grid">
              {filteredSignboards.map((signboard, idx) => {
                const eraStage = getEraStageByYear(signboard.year);
                return (
                  <div key={signboard.id} className="signboard-editor-card" style={{ animationDelay: `${idx * 0.03}s` }}>
                    <div className="card-image">
                      <img src={signboard.image} alt={signboard.name} loading="lazy" />
                      <div className="card-overlay">
                        <span className="card-era-badge" style={{ backgroundColor: eraStage?.color || '#8B4513' }}>
                          {signboard.era}
                        </span>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-header">
                        <h3 className="card-name">{signboard.name}</h3>
                        <span
                          className={`condition-badge condition-${signboard.condition}`}
                          style={{
                            borderColor: conditionStatusLabels[signboard.condition].color,
                            color: conditionStatusLabels[signboard.condition].color
                          }}
                        >
                          {conditionStatusLabels[signboard.condition].icon} {conditionStatusLabels[signboard.condition].text}
                        </span>
                      </div>
                      <p className="card-shop">{signboard.shopName}</p>
                      <p className="card-location">📍 {signboard.location}</p>
                      <div className="card-colors">
                        {signboard.colors.map((color, i) => (
                          <div
                            key={i}
                            className="color-dot"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="card-tags">
                        {signboard.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="card-tag">#{tag}</span>
                        ))}
                        {signboard.tags.length > 4 && (
                          <span className="card-tag-more">+{signboard.tags.length - 4}</span>
                        )}
                      </div>
                      <div className="card-actions">
                        <Link
                          to={`/signboard/${signboard.id}`}
                          className="btn-action btn-view"
                          target="_blank"
                        >
                          👁️ 查看
                        </Link>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleStartEdit(signboard)}
                        >
                          ✏️ 编辑
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(signboard.id, signboard.name)}
                        >
                          🗑️ 删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredSignboards.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p className="empty-text">没有找到符合条件的招牌</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'signboards' && formMode && (
          <div className="form-section">
            <div className="form-header">
              <h2>{formMode === 'add' ? '➕ 新增招牌' : `✏️ 编辑：${editingSignboard?.name}`}</h2>
              <div className="form-header-actions">
                <button className="btn-secondary" onClick={handleCancel}>
                  取消
                </button>
                <button className="btn-primary" onClick={handleSubmit}>
                  💾 {formMode === 'add' ? '保存新增' : '保存修改'}
                </button>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏷️</span> 招牌名称 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="如：德兴茶庄"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏪</span> 店铺全称 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="如：德兴茶庄有限公司"
                  value={formData.shopName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📅</span> 年代 <span className="required">*</span>
                </label>
                <div className="input-with-add">
                  <select
                    className="form-input"
                    value={formData.era || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, era: e.target.value }))}
                  >
                    <option value="">请选择年代</option>
                    {allEras.map(era => (
                      <option key={era} value={era}>{era}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="add-input"
                    placeholder="新增年代"
                    value={newEra}
                    onChange={(e) => setNewEra(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewEra()}
                  />
                  <button className="add-btn" onClick={handleAddNewEra}>+</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🕐</span> 年份 <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="如：1935"
                  value={formData.year || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                />
                {formData.year && getEraStageByYear(formData.year) && (
                  <p className="form-hint">
                    属于：{getEraStageByYear(formData.year)?.label}（{getEraStageByYear(formData.year)?.startYear}-{getEraStageByYear(formData.year)?.endYear}）
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📍</span> 所在位置
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="如：上海静安区南京西路"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏠</span> 建筑类型
                </label>
                <select
                  className="form-input"
                  value={formData.buildingType || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, buildingType: e.target.value }))}
                >
                  <option value="">请选择建筑类型</option>
                  {buildingTypes.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">✍️</span> 字体风格
                </label>
                <div className="input-with-add">
                  <select
                    className="form-input"
                    value={formData.fontStyle || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fontStyle: e.target.value }))}
                  >
                    <option value="">请选择字体</option>
                    {allFontStyles.map(fs => (
                      <option key={fs} value={fs}>{fs}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="add-input"
                    placeholder="新增字体"
                    value={newFontStyle}
                    onChange={(e) => setNewFontStyle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewFontStyle()}
                  />
                  <button className="add-btn" onClick={handleAddNewFontStyle}>+</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🔤</span> 字体系列
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="如：Kai Shu、Song Ti"
                  value={formData.fontFamily || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fontFamily: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🖼️</span> 图片URL
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="留空将自动生成"
                  value={formData.image || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📊</span> 保存状态
                </label>
                <select
                  className="form-input"
                  value={formData.condition || 'well-preserved'}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as Signboard['condition'] }))}
                >
                  {conditionOptions.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <span className="label-icon">🎨</span> 招牌配色 <span className="required">*</span>
                </label>
                <div className="colors-picker">
                  <div className="colors-presets">
                    <p className="picker-subtitle">预设颜色：</p>
                    <div className="colors-grid">
                      {colorPresets.map(color => (
                        <button
                          key={color}
                          className={`color-swatch-btn ${(formData.colors || []).includes(color) ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleToggleColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="colors-custom">
                    <p className="picker-subtitle">自定义颜色：</p>
                    <div className="custom-color-row">
                      <input
                        type="color"
                        className="color-picker-input"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setNewColorInput(e.target.value.toUpperCase());
                        }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="#RRGGBB"
                        value={newColorInput}
                        onChange={(e) => {
                          setNewColorInput(e.target.value);
                          if (/^#([A-Fa-f0-9]{6})$/.test(e.target.value)) {
                            setCustomColor(e.target.value);
                          }
                        }}
                      />
                      <button className="btn-secondary" onClick={handleAddCustomColor}>
                        添加颜色
                      </button>
                    </div>
                  </div>
                  <div className="colors-selected">
                    <p className="picker-subtitle">已选颜色 ({(formData.colors || []).length})：</p>
                    <div className="selected-colors-list">
                      {(formData.colors || []).length === 0 ? (
                        <span className="no-colors-hint">请至少选择一个颜色</span>
                      ) : (
                        (formData.colors || []).map((color, idx) => (
                          <div key={idx} className="selected-color-item">
                            <div
                              className="selected-color-swatch"
                              style={{ backgroundColor: color }}
                            />
                            <span className="selected-color-code">{color}</span>
                            <button
                              className="remove-color-btn"
                              onClick={() => handleToggleColor(color)}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <span className="label-icon">🏷️</span> 标签
                </label>
                <div className="tags-picker">
                  <div className="tags-presets">
                    <p className="picker-subtitle">现有标签：</p>
                    <div className="tags-cloud">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          className={`tag-btn ${(formData.tags || []).includes(tag) ? 'active' : ''}`}
                          onClick={() => handleToggleTag(tag)}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="tags-add">
                    <p className="picker-subtitle">新增标签：</p>
                    <div className="add-tag-row">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="输入新标签，按回车添加"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
                      />
                      <button className="btn-secondary" onClick={handleAddNewTag}>
                        添加
                      </button>
                    </div>
                  </div>
                  <div className="tags-selected">
                    <p className="picker-subtitle">已选标签 ({(formData.tags || []).length})：</p>
                    <div className="selected-tags-list">
                      {(formData.tags || []).length === 0 ? (
                        <span className="no-tags-hint">暂无标签，可从上方选择或新增</span>
                      ) : (
                        (formData.tags || []).map(tag => (
                          <span key={tag} className="selected-tag">
                            #{tag}
                            <button
                              className="remove-tag-btn"
                              onClick={() => handleToggleTag(tag)}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <span className="label-icon">📜</span> 招牌描述
                </label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="详细描述这块招牌的历史背景、字体特点、配色风格、历史故事等..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-footer">
              <button className="btn-secondary" onClick={handleCancel}>
                取消
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                💾 {formMode === 'add' ? '保存新增' : '保存修改'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="maintenance-section">
            <div className="section-card">
              <div className="card-header-row">
                <h2>🏷️ 标签库管理</h2>
                <span className="count-badge">{allTags.length} 个标签</span>
              </div>
              <p className="section-desc">
                标签用于招牌的分类和筛选。新增标签后，可在编辑招牌时直接选用，也会自动同步到首页的筛选体系中。
              </p>
              <div className="tags-maintenance">
                {allTags.length === 0 ? (
                  <p className="empty-hint">暂无标签，请先添加招牌时创建标签</p>
                ) : (
                  <div className="maintenance-grid">
                    {allTags.map(tag => {
                      const count = signboards.filter(s => s.tags.includes(tag)).length;
                      return (
                        <div key={tag} className="maintenance-item">
                          <span className="item-tag">#{tag}</span>
                          <span className="item-count">{count} 块招牌</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eras' && (
          <div className="maintenance-section">
            <div className="section-card">
              <div className="card-header-row">
                <h2>📅 年代阶段体系</h2>
              </div>
              <p className="section-desc">
                系统内置的年代阶段划分，用于招牌的时间轴展示和筛选。年代阶段根据招牌年份自动匹配。
              </p>
              <div className="era-stages-list">
                {eraStages.map(stage => (
                  <div key={stage.id} className="era-stage-item">
                    <div className="era-stage-color" style={{ backgroundColor: stage.color }} />
                    <div className="era-stage-info">
                      <h4>{stage.label}</h4>
                      <p className="era-stage-years">{stage.startYear} - {stage.endYear}</p>
                      <p className="era-stage-desc">{stage.description}</p>
                    </div>
                    <div className="era-stage-count">
                      {signboards.filter(s => {
                        const sbStage = getEraStageByYear(s.year);
                        return sbStage?.id === stage.id;
                      }).length} 块
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="card-header-row">
                <h2>🕰️ 自定义年代标签</h2>
                <span className="count-badge">{allEras.length} 个年代</span>
              </div>
              <p className="section-desc">
                除了系统内置的年代阶段，招牌还可以有自定义的年代标签（如"民国"、"1930s"等）。
              </p>
              <div className="maintenance-grid">
                {allEras.map(era => {
                  const count = signboards.filter(s => s.era === era).length;
                  return (
                    <div key={era} className="maintenance-item">
                      <span className="item-era">{era}</span>
                      <span className="item-count">{count} 块招牌</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="section-card">
              <div className="card-header-row">
                <h2>✍️ 字体风格库</h2>
                <span className="count-badge">{allFontStyles.length} 种字体</span>
              </div>
              <p className="section-desc">
                字体风格是招牌美学的核心元素。管理字体风格库，便于统一分类和筛选。
              </p>
              <div className="maintenance-grid">
                {allFontStyles.map(fs => {
                  const count = signboards.filter(s => s.fontStyle === fs).length;
                  return (
                    <div key={fs} className="maintenance-item">
                      <span className="item-font">{fs}</span>
                      <span className="item-count">{count} 块招牌</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="maintenance-section">
            <div className="section-card">
              <h2>📊 数据概览</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🪧</div>
                  <div className="stat-number">{signboards.length}</div>
                  <div className="stat-label">招牌总数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏷️</div>
                  <div className="stat-number">{allTags.length}</div>
                  <div className="stat-label">标签数量</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-number">{allEras.length}</div>
                  <div className="stat-label">年代分类</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✍️</div>
                  <div className="stat-number">{allFontStyles.length}</div>
                  <div className="stat-label">字体风格</div>
                </div>
              </div>
            </div>

            <div className="section-card danger-zone">
              <h2>⚠️ 危险操作</h2>
              <p className="section-desc">
                重置数据将恢复到系统默认的招牌数据，所有您添加、修改的招牌数据都将丢失。此操作不可撤销。
              </p>
              <button className="btn-danger" onClick={handleReset}>
                🔄 重置为默认数据
              </button>
            </div>

            <div className="section-card">
              <h2>💡 使用提示</h2>
              <div className="tips-list">
                <div className="tip-item">
                  <span className="tip-icon">📝</span>
                  <div>
                    <h4>新增招牌</h4>
                    <p>点击「招牌管理」标签页的「新增招牌」按钮，填写完整信息后保存。新招牌会自动出现在首页和筛选体系中。</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🎨</span>
                  <div>
                    <h4>颜色管理</h4>
                    <p>每块招牌至少选择一种配色。可以从预设色板选择，也可以输入十六进制颜色值自定义。颜色会展示在详情页和卡片上。</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🏷️</span>
                  <div>
                    <h4>标签体系</h4>
                    <p>标签是筛选和发现的核心。建议为每块招牌添加多个标签，如行业（茶庄、布行）、年代特征、特色属性等。</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🔄</span>
                  <div>
                    <h4>数据同步</h4>
                    <p>所有编辑操作都会自动保存到本地存储，并实时同步到首页列表、详情页和筛选体系。刷新页面数据不会丢失。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;
