import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSignboards } from '../context/SignboardsContext';
import type { Signboard, ColorPreset } from '../types';
import { conditionStatusLabels, eraStages, getEraStageByYear } from '../types';
import { conditions } from '../data/signboards';
import './EditorPage.css';

type EditorTab = 'signboards' | 'tags' | 'colors' | 'eras' | 'fonts' | 'data';
type FormMode = 'add' | 'edit' | null;

const conditionOptions = conditions.filter(c => c.value !== '全部');

const buildingTypes = [
  '石库门', '骑楼', '中式传统', '洋楼', '四合院', '百货大楼',
  '唐楼', '江南民居', '现代建筑', '其他'
];

const EditorPage: React.FC = () => {
  const {
    signboards,
    tags,
    eras,
    fontStyles,
    colorPresets,
    addSignboard,
    updateSignboard,
    deleteSignboard,
    getAllTags,
    getAllEras,
    getAllFontStyles,
    getAllColorPresets,
    addTag,
    deleteTag,
    renameTag,
    addEra,
    deleteEra,
    renameEra,
    addFontStyle,
    deleteFontStyle,
    renameFontStyle,
    addColorPreset,
    deleteColorPreset,
    updateColorPreset,
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
  const [newFont, setNewFont] = useState('');
  const [customColor, setCustomColor] = useState('#8B4513');
  const [newColorName, setNewColorName] = useState('');
  const [newColorInput, setNewColorInput] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingEra, setEditingEra] = useState<string | null>(null);
  const [editingEraName, setEditingEraName] = useState('');
  const [editingFont, setEditingFont] = useState<string | null>(null);
  const [editingFontName, setEditingFontName] = useState('');
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [editingColorData, setEditingColorData] = useState<{ color: string; name: string }>({ color: '', name: '' });
  const [deleteEraReplace, setDeleteEraReplace] = useState<Record<string, string>>({});
  const [deleteFontReplace, setDeleteFontReplace] = useState<Record<string, string>>({});
  const [deleteTagRemoveFromSignboards, setDeleteTagRemoveFromSignboards] = useState<Record<string, boolean>>({});

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  const allTagsList = getAllTags();
  const allErasList = getAllEras();
  const allFontStylesList = getAllFontStyles();
  const allColorPresetsList = getAllColorPresets();

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

  const getSignboardCountForTag = (tag: string) => signboards.filter(s => s.tags.includes(tag)).length;
  const getSignboardCountForEra = (era: string) => signboards.filter(s => s.era === era).length;
  const getSignboardCountForFont = (font: string) => signboards.filter(s => s.fontStyle === font).length;
  const getSignboardCountForColor = (color: string) => signboards.filter(s => s.colors.includes(color)).length;

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

  const handleDeleteSignboard = (id: string, name: string) => {
    if (!window.confirm(`确定要删除招牌「${name}」吗？此操作不可撤销。`)) return;
    deleteSignboard(id);
    showToast(`已删除招牌「${name}」`, 'warning');
  };

  const handleToggleTag = (tag: string) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      return {
        ...prev,
        tags: currentTags.includes(tag)
          ? currentTags.filter(t => t !== tag)
          : [...currentTags, tag]
      };
    });
  };

  const handleAddNewTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (!allTagsList.includes(trimmed)) {
      addTag(trimmed);
    }
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), trimmed]
    }));
    showToast(`已添加标签「${trimmed}」`, 'success');
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
    if (!allErasList.includes(trimmed)) {
      addEra(trimmed);
      showToast(`已添加年代「${trimmed}」`, 'success');
    }
    setFormData(prev => ({ ...prev, era: trimmed }));
    setNewEra('');
  };

  const handleAddNewFontStyle = () => {
    const trimmed = newFont.trim();
    if (!trimmed) return;
    if (!allFontStylesList.includes(trimmed)) {
      addFontStyle(trimmed);
      showToast(`已添加字体风格「${trimmed}」`, 'success');
    }
    setFormData(prev => ({ ...prev, fontStyle: trimmed }));
    setNewFont('');
  };

  const handleReset = () => {
    if (!window.confirm('确定要重置所有数据吗？这将恢复到默认的招牌数据和元数据，所有自定义修改将丢失。')) return;
    resetToDefault();
    showToast('已重置为默认数据', 'warning');
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (addTag(trimmed)) {
      showToast(`已添加标签「${trimmed}」`, 'success');
    } else {
      showToast(`标签「${trimmed}」已存在`, 'warning');
    }
    setNewTag('');
  };

  const handleDeleteTag = (tag: string) => {
    const count = getSignboardCountForTag(tag);
    const removeFromSignboards = deleteTagRemoveFromSignboards[tag] ?? false;
    let confirmMsg = `确定要删除标签「${tag}」吗？`;
    if (count > 0) {
      confirmMsg = `标签「${tag}」被 ${count} 块招牌使用。`;
      confirmMsg += removeFromSignboards ? '将同时从这些招牌中移除此标签。' : '将仅从标签库删除，招牌上的标签不受影响。';
    }
    if (!window.confirm(confirmMsg)) return;
    deleteTag(tag, removeFromSignboards);
    showToast(`已删除标签「${tag}」`, 'warning');
  };

  const handleStartRenameTag = (tag: string) => {
    setEditingTag(tag);
    setEditingTagName(tag);
  };

  const handleConfirmRenameTag = () => {
    if (!editingTag || !editingTagName.trim()) return;
    if (editingTag === editingTagName.trim()) {
      setEditingTag(null);
      return;
    }
    if (allTagsList.includes(editingTagName.trim())) {
      showToast(`标签「${editingTagName.trim()}」已存在`, 'warning');
      return;
    }
    renameTag(editingTag, editingTagName.trim());
    showToast(`标签已重命名为「${editingTagName.trim()}」并同步到所有招牌`, 'success');
    setEditingTag(null);
  };

  const handleAddEraStandalone = () => {
    const trimmed = newEra.trim();
    if (!trimmed) return;
    if (addEra(trimmed)) {
      showToast(`已添加年代「${trimmed}」`, 'success');
    } else {
      showToast(`年代「${trimmed}」已存在`, 'warning');
    }
    setNewEra('');
  };

  const handleDeleteEra = (era: string) => {
    const count = getSignboardCountForEra(era);
    const replaceWith = deleteEraReplace[era];
    let confirmMsg = `确定要删除年代「${era}」吗？`;
    if (count > 0) {
      confirmMsg = `年代「${era}」被 ${count} 块招牌使用。`;
      if (replaceWith) {
        confirmMsg += `这些招牌的年代将被替换为「${replaceWith}」。`;
      } else {
        confirmMsg += '请选择替换年代或取消删除。';
        showToast('请为被使用的年代选择一个替换值', 'warning');
        return;
      }
    }
    if (!window.confirm(confirmMsg)) return;
    deleteEra(era, replaceWith);
    showToast(`已删除年代「${era}」`, 'warning');
  };

  const handleStartRenameEra = (era: string) => {
    setEditingEra(era);
    setEditingEraName(era);
  };

  const handleConfirmRenameEra = () => {
    if (!editingEra || !editingEraName.trim()) return;
    if (editingEra === editingEraName.trim()) {
      setEditingEra(null);
      return;
    }
    if (allErasList.includes(editingEraName.trim())) {
      showToast(`年代「${editingEraName.trim()}」已存在`, 'warning');
      return;
    }
    renameEra(editingEra, editingEraName.trim());
    showToast(`年代已重命名为「${editingEraName.trim()}」并同步到所有招牌`, 'success');
    setEditingEra(null);
  };

  const handleAddFontStandalone = () => {
    const trimmed = newFont.trim();
    if (!trimmed) return;
    if (addFontStyle(trimmed)) {
      showToast(`已添加字体「${trimmed}」`, 'success');
    } else {
      showToast(`字体「${trimmed}」已存在`, 'warning');
    }
    setNewFont('');
  };

  const handleDeleteFont = (font: string) => {
    const count = getSignboardCountForFont(font);
    const replaceWith = deleteFontReplace[font];
    let confirmMsg = `确定要删除字体「${font}」吗？`;
    if (count > 0) {
      confirmMsg = `字体「${font}」被 ${count} 块招牌使用。`;
      if (replaceWith) {
        confirmMsg += `这些招牌的字体将被替换为「${replaceWith}」。`;
      } else {
        showToast('请为被使用的字体选择一个替换值', 'warning');
        return;
      }
    }
    if (!window.confirm(confirmMsg)) return;
    deleteFontStyle(font, replaceWith);
    showToast(`已删除字体「${font}」`, 'warning');
  };

  const handleStartRenameFont = (font: string) => {
    setEditingFont(font);
    setEditingFontName(font);
  };

  const handleConfirmRenameFont = () => {
    if (!editingFont || !editingFontName.trim()) return;
    if (editingFont === editingFontName.trim()) {
      setEditingFont(null);
      return;
    }
    if (allFontStylesList.includes(editingFontName.trim())) {
      showToast(`字体「${editingFontName.trim()}」已存在`, 'warning');
      return;
    }
    renameFontStyle(editingFont, editingFontName.trim());
    showToast(`字体已重命名为「${editingFontName.trim()}」并同步到所有招牌`, 'success');
    setEditingFont(null);
  };

  const handleAddColorPreset = () => {
    const trimmedColor = newColorInput.trim();
    const trimmedName = newColorName.trim();
    if (!trimmedColor || !trimmedName) {
      showToast('请输入颜色值和名称', 'warning');
      return;
    }
    if (addColorPreset(trimmedColor, trimmedName)) {
      showToast(`已添加颜色「${trimmedName} ${trimmedColor.toUpperCase()}」`, 'success');
      setNewColorInput('');
      setNewColorName('');
    } else {
      showToast('该颜色值已存在或格式不正确', 'warning');
    }
  };

  const handleDeleteColorPreset = (cp: ColorPreset) => {
    const count = getSignboardCountForColor(cp.color);
    let confirmMsg = `确定要删除颜色「${cp.name} (${cp.color})」吗？`;
    if (count > 0) {
      confirmMsg += ` 该颜色被 ${count} 块招牌使用，删除仅影响颜色选择库，不会移除招牌上的颜色。`;
    }
    if (!window.confirm(confirmMsg)) return;
    deleteColorPreset(cp.id);
    showToast(`已删除颜色「${cp.name}」`, 'warning');
  };

  const handleStartEditColor = (cp: ColorPreset) => {
    setEditingColor(cp.id);
    setEditingColorData({ color: cp.color, name: cp.name });
  };

  const handleConfirmEditColor = () => {
    if (!editingColor || !editingColorData.color.trim() || !editingColorData.name.trim()) return;
    updateColorPreset(editingColor, {
      color: editingColorData.color.trim().toUpperCase(),
      name: editingColorData.name.trim()
    });
    showToast('颜色预设已更新', 'success');
    setEditingColor(null);
  };

  const editingSignboard = editingId ? signboards.find(s => s.id === editingId) : null;

  const tabs: { id: EditorTab; label: string; icon: string }[] = [
    { id: 'signboards', label: '招牌管理', icon: '🪧' },
    { id: 'tags', label: '标签库', icon: '🏷️' },
    { id: 'colors', label: '颜色库', icon: '🎨' },
    { id: 'eras', label: '年代库', icon: '📅' },
    { id: 'fonts', label: '字体库', icon: '✍️' },
    { id: 'data', label: '数据管理', icon: '💾' }
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
            <p className="editor-subtitle">录入招牌资料、维护标签颜色年代字体信息，改动立即同步到详情页与筛选体系</p>
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
                          onClick={() => handleDeleteSignboard(signboard.id, signboard.name)}
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
                    {allErasList.map(era => (
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
                    {allFontStylesList.map(fs => (
                      <option key={fs} value={fs}>{fs}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="add-input"
                    placeholder="新增字体"
                    value={newFont}
                    onChange={(e) => setNewFont(e.target.value)}
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
                    <p className="picker-subtitle">颜色库（共 {allColorPresetsList.length} 个，可在「颜色库」标签页维护）：</p>
                    <div className="colors-grid">
                      {allColorPresetsList.map(cp => (
                        <button
                          key={cp.id}
                          className={`color-swatch-btn ${(formData.colors || []).includes(cp.color) ? 'selected' : ''}`}
                          style={{ backgroundColor: cp.color }}
                          onClick={() => handleToggleColor(cp.color)}
                          title={`${cp.name} (${cp.color})`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="colors-custom">
                    <p className="picker-subtitle">自定义颜色（临时使用，不入库）：</p>
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
                        临时选用
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
                    <p className="picker-subtitle">标签库（共 {allTagsList.length} 个，可在「标签库」标签页维护）：</p>
                    <div className="tags-cloud">
                      {allTagsList.map(tag => (
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
                    <p className="picker-subtitle">新增标签（将自动入库）：</p>
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
                <span className="count-badge">{tags.length} 个标签</span>
              </div>
              <p className="section-desc">
                标签是招牌分类与筛选的核心。新增的标签会立即出现在首页筛选器和招牌编辑表单中。
                重命名标签会自动同步到所有使用该标签的招牌。
              </p>

              <div className="maintenance-add-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="输入新标签名称，如：百年老字号"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button className="btn-primary" onClick={handleAddTag}>
                  ➕ 添加标签
                </button>
              </div>

              <div className="maintenance-grid">
                {tags.map(tag => {
                  const count = getSignboardCountForTag(tag);
                  const isEditing = editingTag === tag;
                  return (
                    <div key={tag} className="maintenance-item editable-item">
                      {isEditing ? (
                        <>
                          <input
                            className="form-input inline-edit-input"
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRenameTag();
                              if (e.key === 'Escape') setEditingTag(null);
                            }}
                            autoFocus
                          />
                          <button className="mini-btn confirm-btn" onClick={handleConfirmRenameTag}>✓</button>
                          <button className="mini-btn cancel-btn" onClick={() => setEditingTag(null)}>✕</button>
                        </>
                      ) : (
                        <>
                          <span className="item-tag">#{tag}</span>
                          <span className="item-count">{count} 块招牌</span>
                          <div className="item-actions">
                            <button className="mini-btn edit-btn" onClick={() => handleStartRenameTag(tag)} title="重命名">✏️</button>
                            <button
                              className="mini-btn delete-btn"
                              onClick={() => handleDeleteTag(tag)}
                              title={count > 0 ? `该标签被 ${count} 块招牌使用` : '删除标签'}
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                      {!isEditing && count > 0 && (
                        <div className="item-sub-options">
                          <label className="inline-checkbox">
                            <input
                              type="checkbox"
                              checked={deleteTagRemoveFromSignboards[tag] ?? false}
                              onChange={(e) => setDeleteTagRemoveFromSignboards(prev => ({
                                ...prev,
                                [tag]: e.target.checked
                              }))}
                            />
                            <span>删除时同步从招牌中移除</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {tags.length === 0 && (
                <p className="empty-hint">暂无标签，请在上方添加</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="maintenance-section">
            <div className="section-card">
              <div className="card-header-row">
                <h2>🎨 颜色预设库</h2>
                <span className="count-badge">{colorPresets.length} 个颜色</span>
              </div>
              <p className="section-desc">
                颜色预设库管理招牌编辑时可选的配色方案。新增的颜色会立即出现在招牌编辑表单中。
              </p>

              <div className="color-add-row">
                <input
                  type="color"
                  className="color-picker-input large-picker"
                  value={newColorInput || '#8B4513'}
                  onChange={(e) => {
                    setNewColorInput(e.target.value.toUpperCase());
                    setCustomColor(e.target.value);
                  }}
                />
                <input
                  type="text"
                  className="form-input short-input"
                  placeholder="#RRGGBB"
                  value={newColorInput}
                  onChange={(e) => {
                    setNewColorInput(e.target.value);
                    if (/^#([A-Fa-f0-9]{6})$/.test(e.target.value)) {
                      setCustomColor(e.target.value);
                    }
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="颜色名称，如：深木棕"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                />
                <button className="btn-primary" onClick={handleAddColorPreset}>
                  ➕ 添加颜色
                </button>
              </div>

              <div className="colors-library-grid">
                {colorPresets.map(cp => {
                  const count = getSignboardCountForColor(cp.color);
                  const isEditing = editingColor === cp.id;
                  return (
                    <div key={cp.id} className="color-library-item">
                      {isEditing ? (
                        <div className="color-edit-form">
                          <input
                            type="color"
                            className="color-picker-input"
                            value={editingColorData.color}
                            onChange={(e) => setEditingColorData(prev => ({
                              ...prev,
                              color: e.target.value.toUpperCase()
                            }))}
                          />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="颜色名称"
                            value={editingColorData.name}
                            onChange={(e) => setEditingColorData(prev => ({
                              ...prev,
                              name: e.target.value
                            }))}
                          />
                          <button className="mini-btn confirm-btn" onClick={handleConfirmEditColor}>✓</button>
                          <button className="mini-btn cancel-btn" onClick={() => setEditingColor(null)}>✕</button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="color-library-swatch"
                            style={{ backgroundColor: cp.color }}
                          />
                          <div className="color-library-info">
                            <div className="color-library-name">{cp.name}</div>
                            <div className="color-library-code">{cp.color}</div>
                            <div className="color-library-count">{count} 块招牌使用</div>
                          </div>
                          <div className="item-actions">
                            <button className="mini-btn edit-btn" onClick={() => handleStartEditColor(cp)} title="编辑">✏️</button>
                            <button className="mini-btn delete-btn" onClick={() => handleDeleteColorPreset(cp)} title="删除">🗑️</button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {colorPresets.length === 0 && (
                <p className="empty-hint">暂无颜色预设，请在上方添加</p>
              )}
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
                <span className="count-badge">{eras.length} 个年代</span>
              </div>
              <p className="section-desc">
                自定义年代标签是招牌筛选和展示的重要分类。新增年代会立即出现在首页筛选器中。
                重命名年代会自动同步到所有使用该年代的招牌。删除被使用的年代必须选择一个替换值。
              </p>

              <div className="maintenance-add-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="输入新年代，如：明末清初"
                  value={newEra}
                  onChange={(e) => setNewEra(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEraStandalone()}
                />
                <button className="btn-primary" onClick={handleAddEraStandalone}>
                  ➕ 添加年代
                </button>
              </div>

              <div className="maintenance-list">
                {eras.map(era => {
                  const count = getSignboardCountForEra(era);
                  const isEditing = editingEra === era;
                  const otherEras = eras.filter(e => e !== era);
                  return (
                    <div key={era} className="maintenance-list-item editable-item">
                      {isEditing ? (
                        <>
                          <input
                            className="form-input inline-edit-input"
                            value={editingEraName}
                            onChange={(e) => setEditingEraName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRenameEra();
                              if (e.key === 'Escape') setEditingEra(null);
                            }}
                            autoFocus
                          />
                          <button className="mini-btn confirm-btn" onClick={handleConfirmRenameEra}>✓</button>
                          <button className="mini-btn cancel-btn" onClick={() => setEditingEra(null)}>✕</button>
                        </>
                      ) : (
                        <>
                          <div className="main-item-info">
                            <span className="item-era">{era}</span>
                            <span className="item-count">{count} 块招牌</span>
                          </div>
                          <div className="item-actions">
                            <button className="mini-btn edit-btn" onClick={() => handleStartRenameEra(era)} title="重命名">✏️</button>
                            {count > 0 && otherEras.length > 0 && (
                              <select
                                className="replace-select"
                                value={deleteEraReplace[era] || ''}
                                onChange={(e) => setDeleteEraReplace(prev => ({
                                  ...prev,
                                  [era]: e.target.value
                                }))}
                              >
                                <option value="">替换年代</option>
                                {otherEras.map(e => (
                                  <option key={e} value={e}>{e}</option>
                                ))}
                              </select>
                            )}
                            <button
                              className="mini-btn delete-btn"
                              onClick={() => handleDeleteEra(era)}
                              title="删除"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fonts' && (
          <div className="maintenance-section">
            <div className="section-card">
              <div className="card-header-row">
                <h2>✍️ 字体风格库</h2>
                <span className="count-badge">{fontStyles.length} 种字体</span>
              </div>
              <p className="section-desc">
                字体风格是招牌美学的核心元素。新增字体会立即出现在首页筛选器和招牌编辑表单中。
                重命名字体会自动同步到所有使用该字体的招牌。删除被使用的字体必须选择一个替换值。
              </p>

              <div className="maintenance-add-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="输入新字体风格，如：瘦金体"
                  value={newFont}
                  onChange={(e) => setNewFont(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFontStandalone()}
                />
                <button className="btn-primary" onClick={handleAddFontStandalone}>
                  ➕ 添加字体
                </button>
              </div>

              <div className="maintenance-grid">
                {fontStyles.map(font => {
                  const count = getSignboardCountForFont(font);
                  const isEditing = editingFont === font;
                  const otherFonts = fontStyles.filter(f => f !== font);
                  return (
                    <div key={font} className="maintenance-item editable-item">
                      {isEditing ? (
                        <>
                          <input
                            className="form-input inline-edit-input"
                            value={editingFontName}
                            onChange={(e) => setEditingFontName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRenameFont();
                              if (e.key === 'Escape') setEditingFont(null);
                            }}
                            autoFocus
                          />
                          <button className="mini-btn confirm-btn" onClick={handleConfirmRenameFont}>✓</button>
                          <button className="mini-btn cancel-btn" onClick={() => setEditingFont(null)}>✕</button>
                        </>
                      ) : (
                        <>
                          <span className="item-font" style={{ fontFamily: 'serif' }}>{font}</span>
                          <span className="item-count">{count} 块招牌</span>
                          <div className="item-actions">
                            <button className="mini-btn edit-btn" onClick={() => handleStartRenameFont(font)} title="重命名">✏️</button>
                          </div>
                        </>
                      )}
                      {!isEditing && count > 0 && otherFonts.length > 0 && (
                        <div className="item-sub-options">
                          <select
                            className="replace-select"
                            value={deleteFontReplace[font] || ''}
                            onChange={(e) => setDeleteFontReplace(prev => ({
                              ...prev,
                              [font]: e.target.value
                            }))}
                          >
                            <option value="">删除时替换为…</option>
                            {otherFonts.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          <button
                            className="mini-btn delete-btn"
                            onClick={() => handleDeleteFont(font)}
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      )}
                      {!isEditing && count === 0 && (
                        <div className="item-sub-options">
                          <button
                            className="mini-btn delete-btn"
                            onClick={() => handleDeleteFont(font)}
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
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
                  <div className="stat-number">{tags.length}</div>
                  <div className="stat-label">标签数量</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎨</div>
                  <div className="stat-number">{colorPresets.length}</div>
                  <div className="stat-label">颜色预设</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-number">{eras.length}</div>
                  <div className="stat-label">年代分类</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✍️</div>
                  <div className="stat-number">{fontStyles.length}</div>
                  <div className="stat-label">字体风格</div>
                </div>
              </div>
            </div>

            <div className="section-card danger-zone">
              <h2>⚠️ 危险操作</h2>
              <p className="section-desc">
                重置数据将恢复到系统默认的招牌数据和元数据（标签、颜色、年代、字体），所有您添加、修改的内容都将丢失。此操作不可撤销。
              </p>
              <button className="btn-danger" onClick={handleReset}>
                🔄 重置为默认数据
              </button>
            </div>

            <div className="section-card">
              <h2>💡 使用提示</h2>
              <div className="tips-list">
                <div className="tip-item">
                  <span className="tip-icon">🔄</span>
                  <div>
                    <h4>实时同步</h4>
                    <p>所有标签、颜色、年代、字体的改动会<strong>立即同步</strong>到首页筛选器、详情页和编辑表单。切换到首页即可看到变化。</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🏷️</span>
                  <div>
                    <h4>标签库管理</h4>
                    <p>建议为招牌添加多个分类标签（如行业、年代特征、地域特色等）。重命名标签时，所有使用该标签的招牌会自动更新。</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🎨</span>
                  <div>
                    <h4>颜色库使用</h4>
                    <p>颜色库中的配色预设可以在编辑招牌时直接选用。也可以在编辑招牌时临时使用自定义颜色（不会入库）。</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">📅</span>
                  <div>
                    <h4>年代与字体</h4>
                    <p>删除被招牌使用的年代或字体时，必须选择一个替换值，以避免数据缺失。重命名会自动同步到所有招牌。</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">💾</span>
                  <div>
                    <h4>数据持久化</h4>
                    <p>所有数据（招牌 + 元数据）都保存在浏览器本地存储中。切换页面、刷新浏览器数据不会丢失。</p>
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
