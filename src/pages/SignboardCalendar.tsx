import React, { useState, useMemo } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useSignboards } from '../context/SignboardsContext';
import type { DailySign } from '../types';
import { monthNames, weekDayNames, themeTypeLabels } from '../data/calendar';
import DailySignCard from '../components/DailySignCard';
import SignboardCard from '../components/SignboardCard';
import './SignboardCalendar.css';

type ViewMode = 'calendar' | 'theme' | 'saved';

const SignboardCalendar: React.FC = () => {
  const {
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    getMonthlyTheme,
    getDailySignsForMonth,
    isDailySignSaved,
    getSavedDailySigns,
    saveMonthlyNote,
    getMonthlyNote
  } = useCalendar();
  const { signboards, getSignboard } = useSignboards();

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const monthlyTheme = getMonthlyTheme(currentYear, currentMonth);
  const dailySigns = getDailySignsForMonth(currentYear, currentMonth);
  const savedSigns = getSavedDailySigns();

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null; date: string | null; sign: DailySign | null }> = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, date: null, sign: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const sign = dailySigns.find(s => s.date === date) || null;
      cells.push({ day, date, sign });
    }

    return cells;
  }, [currentYear, currentMonth, dailySigns]);

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const selectedSign = selectedDate ? dailySigns.find(s => s.date === selectedDate) || null : null;

  const featuredSignboards = useMemo(() => {
    if (!monthlyTheme) return [];
    return monthlyTheme.featuredSignboardIds
      .map(id => getSignboard(id))
      .filter(Boolean) as typeof signboards;
  }, [monthlyTheme, getSignboard]);

  const handleNoteSave = () => {
    saveMonthlyNote(currentYear, currentMonth, noteInput);
  };

  React.useEffect(() => {
    setNoteInput(getMonthlyNote(currentYear, currentMonth));
  }, [currentYear, currentMonth, getMonthlyNote]);

  return (
    <div className="calendar-page">
      <div className="cal-hero" style={{ '--theme-accent': monthlyTheme?.accentColor || '#8B4513' } as React.CSSProperties}>
        <div className="cal-hero-bg" style={{ backgroundImage: monthlyTheme ? `url(${monthlyTheme.coverImage})` : undefined }} />
        <div className="cal-hero-overlay" />
        <div className="cal-hero-content">
          <div className="cal-hero-badge" style={{ backgroundColor: themeTypeLabels[monthlyTheme?.themeType || 'season'].color }}>
            <span>{themeTypeLabels[monthlyTheme?.themeType || 'season'].icon}</span>
            <span>{themeTypeLabels[monthlyTheme?.themeType || 'season'].text}</span>
          </div>
          <h1 className="cal-hero-title">{monthlyTheme?.title || `${currentYear}年${monthNames[currentMonth]}`}</h1>
          <p className="cal-hero-subtitle">{monthlyTheme?.subtitle || '招牌专题月历'}</p>
          <p className="cal-hero-desc">{monthlyTheme?.description}</p>
          {monthlyTheme && (
            <div className="cal-hero-tags">
              {monthlyTheme.tags.map(tag => (
                <span key={tag} className="cal-hero-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cal-toolbar">
        <div className="cal-view-switcher">
          <button className={`cal-view-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>
            📅 日历视图
          </button>
          <button className={`cal-view-btn ${viewMode === 'theme' ? 'active' : ''}`} onClick={() => setViewMode('theme')}>
            🎨 本月专题
          </button>
          <button className={`cal-view-btn ${viewMode === 'saved' ? 'active' : ''}`} onClick={() => setViewMode('saved')}>
            ⭐ 我的收藏 ({savedSigns.length})
          </button>
        </div>

        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => navigateMonth(-1)}>◀ 上月</button>
          <button className="cal-nav-today" onClick={goToToday}>今天</button>
          <button className="cal-nav-btn" onClick={() => navigateMonth(1)}>下月 ▶</button>
        </div>
      </div>

      <div className="cal-content">
        {viewMode === 'calendar' && (
          <div className="cal-calendar-section">
            <div className="cal-calendar-wrap">
              <div className="cal-month-header">
                <h2 className="cal-month-title">{currentYear}年 {monthNames[currentMonth]}</h2>
                <div className="cal-month-stats">
                  <span>📜 {dailySigns.length} 个日签</span>
                  <span>⭐ {dailySigns.filter(s => isDailySignSaved(s.date)).length} 已收藏</span>
                </div>
              </div>

              <div className="cal-weekdays">
                {weekDayNames.map(day => (
                  <div key={day} className={`cal-weekday ${day === '日' || day === '六' ? 'weekend' : ''}`}>
                    {day}
                  </div>
                ))}
              </div>

              <div className="cal-grid">
                {calendarGrid.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`cal-cell ${cell.day ? '' : 'empty'} ${cell.date === today ? 'today' : ''} ${cell.date === selectedDate ? 'selected' : ''} ${cell.sign && isDailySignSaved(cell.sign.date) ? 'saved' : ''}`}
                    onClick={() => cell.sign && setSelectedDate(cell.date)}
                  >
                    {cell.day && cell.sign && (
                      <>
                        <div className="cal-cell-day">{cell.day}</div>
                        {(() => {
                          const sb = getSignboard(cell.sign.signboardId);
                          return sb ? (
                            <div className="cal-cell-preview" style={{ borderLeftColor: sb.colors[0] }}>
                              <img src={sb.image} alt="" loading="lazy" />
                              <div className="cal-cell-info">
                                <span className="cal-cell-name">{sb.name}</span>
                                <span className="cal-cell-quote">{cell.sign.quote.slice(0, 12)}...</span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                        {isDailySignSaved(cell.sign.date) && <span className="cal-cell-saved">⭐</span>}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="cal-notes-section">
                <h3 className="cal-notes-title">📝 本月手记</h3>
                <textarea
                  className="cal-notes-input"
                  placeholder="记录这个月探访老字号的心得..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onBlur={handleNoteSave}
                  rows={4}
                />
                <button className="cal-notes-save" onClick={handleNoteSave}>保存手记</button>
              </div>
            </div>

            {selectedSign && (
              <div className="cal-sign-detail">
                <DailySignCard
                  dailySign={selectedSign}
                  theme={monthlyTheme}
                  showFull
                  onClose={() => setSelectedDate(null)}
                />
              </div>
            )}

            {!selectedSign && (
              <div className="cal-today-sign">
                <h3 className="cal-today-title">🎯 今日推荐</h3>
                {(() => {
                  const todaySign = dailySigns.find(s => s.date === today) || dailySigns[0];
                  return todaySign ? (
                    <DailySignCard dailySign={todaySign} theme={monthlyTheme} showFull />
                  ) : (
                    <div className="cal-empty">暂无日签内容</div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {viewMode === 'theme' && monthlyTheme && (
          <div className="cal-theme-section">
            <div className="cal-theme-intro">
              <div className="cal-theme-cover">
                <img src={monthlyTheme.coverImage} alt={monthlyTheme.title} />
                <div className="cal-theme-cover-overlay">
                  <h2>{monthlyTheme.title}</h2>
                  <p>{monthlyTheme.subtitle}</p>
                </div>
              </div>
              <div className="cal-theme-desc">
                <p>{monthlyTheme.description}</p>
              </div>
            </div>

            <div className="cal-featured-section">
              <h3 className="cal-section-title">🌟 本月精选招牌</h3>
              <div className="masonry-grid">
                {featuredSignboards.map(sb => (
                  <div key={sb.id}>
                    <SignboardCard signboard={sb} />
                  </div>
                ))}
              </div>
            </div>

            <div className="cal-daily-signs-section">
              <h3 className="cal-section-title">📅 本月全部日签 ({dailySigns.length})</h3>
              <div className="cal-signs-grid">
                {dailySigns.map(sign => (
                  <div key={sign.id} onClick={() => { setViewMode('calendar'); setSelectedDate(sign.date); }}>
                    <DailySignCard dailySign={sign} theme={monthlyTheme} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'saved' && (
          <div className="cal-saved-section">
            <div className="cal-saved-header">
              <h3 className="cal-section-title">⭐ 我收藏的日签</h3>
              <span className="cal-saved-count">共 {savedSigns.length} 个日签</span>
            </div>
            {savedSigns.length === 0 ? (
              <div className="cal-empty">
                <div className="cal-empty-icon">⭐</div>
                <p>还没有收藏任何日签哦</p>
                <p className="cal-empty-sub">在日历中点击任意日期，收藏喜欢的日签吧</p>
                <button className="cal-empty-btn" onClick={() => setViewMode('calendar')}>去日历看看</button>
              </div>
            ) : (
              <div className="cal-signs-grid">
                {savedSigns.map(sign => {
                  const theme = sign.date ? getMonthlyTheme(parseInt(sign.date.split('-')[0]), parseInt(sign.date.split('-')[1]) - 1) : undefined;
                  return (
                    <DailySignCard key={sign.id} dailySign={sign} theme={theme} showFull />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignboardCalendar;
