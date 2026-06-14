import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { DailySign, MonthlyTheme } from '../types';
import { useSignboards } from '../context/SignboardsContext';
import { useCalendar } from '../context/CalendarContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCollections } from '../context/CollectionsContext';
import AddToCollectionModal from './AddToCollectionModal';
import './DailySignCard.css';

interface DailySignCardProps {
  dailySign: DailySign;
  theme?: MonthlyTheme;
  showFull?: boolean;
  onClose?: () => void;
}

const formatDisplayDate = (dateStr: string): { year: string; month: string; day: string; weekday: string } => {
  const date = new Date(dateStr);
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期三', '星期四', '星期五', '星期六'];
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
    weekday: weekdays[date.getDay()]
  };
};

const DailySignCard: React.FC<DailySignCardProps> = ({ dailySign, theme, showFull = false, onClose }) => {
  const { getSignboard } = useSignboards();
  const { toggleSaveDailySign, isDailySignSaved } = useCalendar();
  const favoritesCtx = useFavorites();
  const { getCollectionsContainingSignboard } = useCollections();
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const signboard = getSignboard(dailySign.signboardId);
  const displayDate = formatDisplayDate(dailySign.date);
  const isSaved = isDailySignSaved(dailySign.date);
  const inCollections = signboard ? getCollectionsContainingSignboard(signboard.id) : [];

  const showToastMsg = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
  };

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!signboard) return null;

  const accentColor = theme?.accentColor || signboard.colors[0] || '#8B4513';

  return (
    <div className={`daily-sign-card ${showFull ? 'full-view' : ''}`} style={{ '--accent-color': accentColor } as React.CSSProperties}>
      {toast && (
        <div className={`dsc-toast dsc-toast-${toast.type}`}>
          <span className="dsc-toast-msg">{toast.message}</span>
        </div>
      )}

      <div className="dsc-header">
        <div className="dsc-date-block">
          <div className="dsc-date-main">
            <span className="dsc-day">{displayDate.day}</span>
            <div className="dsc-date-sub">
              <span className="dsc-month">{displayDate.year}年{displayDate.month}月</span>
              <span className="dsc-weekday">{displayDate.weekday}</span>
            </div>
          </div>
          <div className="dsc-theme-tag">
            <span className="dsc-theme-label">{dailySign.theme}</span>
          </div>
        </div>
        {onClose && (
          <button className="dsc-close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="dsc-quote">
        <span className="dsc-quote-mark">「</span>
        <span className="dsc-quote-text">{dailySign.quote}</span>
        <span className="dsc-quote-mark">」</span>
      </div>

      <div className="dsc-signboard-preview">
        <Link to={`/signboard/${signboard.id}`} className="dsc-signboard-link">
          <div className="dsc-signboard-image">
          <img src={signboard.image} alt={signboard.name} />
          <div className="dsc-signboard-overlay">
            <span className="dsc-signboard-era">{signboard.era}</span>
          </div>
        </div>
        <div className="dsc-signboard-info">
          <h4 className="dsc-signboard-name">{signboard.name}</h4>
          <p className="dsc-signboard-shop">{signboard.shopName}</p>
          <div className="dsc-signboard-meta">
            <span>📅 {signboard.year}年</span>
            <span>✍️ {signboard.fontStyle}</span>
            <span>📍 {signboard.location.split('区')[0]}区</span>
          </div>
        </div>
        </Link>
      </div>

      {showFull && (
        <div className="dsc-details">
          <div className="dsc-detail-section">
            <div className="dsc-detail-icon">📖</div>
            <div className="dsc-detail-content">
              <h5 className="dsc-detail-title">招牌故事</h5>
              <p className="dsc-detail-text">{dailySign.story}</p>
            </div>
          </div>
          <div className="dsc-detail-section">
            <div className="dsc-detail-icon">💡</div>
            <div className="dsc-detail-content">
              <h5 className="dsc-detail-title">招牌小知识</h5>
              <p className="dsc-detail-text">{dailySign.knowledge}</p>
            </div>
          </div>
          <div className="dsc-detail-section">
            <div className="dsc-detail-icon">🎯</div>
            <div className="dsc-detail-content">
              <h5 className="dsc-detail-title">趣闻轶事</h5>
              <p className="dsc-detail-text">{dailySign.trivia}</p>
            </div>
          </div>
          <div className="dsc-detail-section">
            <div className="dsc-detail-icon">🎨</div>
            <div className="dsc-detail-content">
              <h5 className="dsc-detail-title">招牌描述</h5>
              <p className="dsc-detail-text">{signboard.description}</p>
            </div>
          </div>
          <div className="dsc-colors">
              <span className="dsc-colors-label">招牌配色：</span>
              {signboard.colors.map((color, idx) => (
                <div key={idx} className="dsc-color-dot" style={{ backgroundColor: color }} title={color} />
              ))}
            </div>
        </div>
      )}

      <div className="dsc-actions">
        <button
          className={`dsc-action-btn ${isSaved ? 'active' : ''}`}
          onClick={() => {
            toggleSaveDailySign(dailySign.date);
            showToastMsg(isSaved ? '已取消收藏日签' : '已收藏今日日签', isSaved ? 'warning' : 'success');
          }}
          title={isSaved ? '取消收藏日签' : '收藏日签'}
        >
          <span className="dsc-action-icon">{isSaved ? '⭐' : '☆'}</span>
          <span>{isSaved ? '已收藏日签' : '收藏日签'}</span>
        </button>

        <button
          className={`dsc-action-btn ${favoritesCtx.isFavorite(signboard.id) ? 'active' : ''}`}
          onClick={() => {
            favoritesCtx.toggleFavorite(signboard.id);
            showToastMsg(favoritesCtx.isFavorite(signboard.id) ? '已取消收藏招牌' : '已收藏招牌', favoritesCtx.isFavorite(signboard.id) ? 'warning' : 'success');
          }}
          title={favoritesCtx.isFavorite(signboard.id) ? '取消收藏招牌' : '收藏招牌'}
        >
          <span className="dsc-action-icon">{favoritesCtx.isFavorite(signboard.id) ? '❤️' : '🤍'}</span>
          <span>{favoritesCtx.isFavorite(signboard.id) ? '已收藏招牌' : '收藏招牌'}</span>
        </button>

        <button
          className="dsc-action-btn"
          onClick={() => setShowAddModal(true)}
          title="加入藏册"
        >
          <span className="dsc-action-icon">📚</span>
          <span>加入藏册</span>
        </button>

        <button
          className={`dsc-action-btn ${favoritesCtx.isInCompare(signboard.id) ? 'active' : ''}`}
          onClick={() => {
            if (favoritesCtx.isInCompare(signboard.id)) {
              favoritesCtx.toggleCompare(signboard.id);
              showToastMsg('已从对比列表移除', 'warning');
            } else {
              const result = favoritesCtx.addToCompare(signboard.id);
              if (result.success) {
                showToastMsg(`已加入对比（${favoritesCtx.compareList.length}/${favoritesCtx.maxCompare}）`, 'success');
              } else {
                showToastMsg(result.reason || '添加失败', 'error');
              }
            }
          }}
          title={favoritesCtx.isInCompare(signboard.id) ? '移出对比' : '加入对比'}
        >
          <span className="dsc-action-icon">⚖️</span>
          <span>{favoritesCtx.isInCompare(signboard.id) ? '已对比' : '对比'}</span>
        </button>
      </div>

      {inCollections.length > 0 && (
        <div className="dsc-in-collections">
          <span className="dsc-collections-label">已在藏册：</span>
          {inCollections.map(col => (
            <Link key={col.id} to={`/collection/${col.id}`} className="dsc-collection-tag">
              📚 {col.name}
            </Link>
          ))}
        </div>
      )}

      <AddToCollectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        signboardId={signboard.id}
      />
    </div>
  );
};

export default DailySignCard;
