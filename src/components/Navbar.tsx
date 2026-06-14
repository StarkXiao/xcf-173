import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCollections } from '../context/CollectionsContext';
import { useResearchLab } from '../context/ResearchLabContext';
import { useStreetCorner } from '../context/StreetCornerContext';
import type { ThemeMode } from '../types';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { theme, setTheme, autoTheme, setAutoTheme, activeSignboardId } = useTheme();
  const { compareList, reportList } = useFavorites();
  const { collections } = useCollections();
  const { notes } = useResearchLab();
  const { favoriteRankingLists, favoriteStreetCorners } = useStreetCorner();
  const totalInCollections = collections.reduce((sum, c) => sum + c.items.length, 0);
  const totalFavStreetCorner = favoriteRankingLists.length + favoriteStreetCorners.length;

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'sepia', label: '怀旧棕', icon: '📜' },
    { value: 'light', label: '日常白', icon: '☀️' },
    { value: 'dark', label: '夜间黑', icon: '🌙' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏛️</span>
          <div className="brand-text">
            <h1>街角招牌考古册</h1>
            <p>Signboard Archaeology</p>
          </div>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🖼️</span>
            <span>全部招牌</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📅</span>
            <span>专题月历</span>
          </NavLink>
          <NavLink to="/roaming" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🚶</span>
            <span>城市漫游</span>
          </NavLink>
          <NavLink to="/exhibition" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🏛️</span>
            <span>招牌展陈馆</span>
          </NavLink>
          <NavLink to="/map-atlas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🗺️</span>
            <span>地图册</span>
          </NavLink>
          <NavLink to="/streetcorner" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🏆</span>
            <span>街角发现榜</span>
            {totalFavStreetCorner > 0 && <span className="nav-badge">{totalFavStreetCorner}</span>}
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📚</span>
            <span>我的藏册</span>
            {totalInCollections > 0 && <span className="nav-badge">{totalInCollections}</span>}
          </NavLink>
          <NavLink to="/font-evolution" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">✍️</span>
            <span>字体流变</span>
          </NavLink>
          <NavLink to="/city-memory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📜</span>
            <span>城市记忆</span>
          </NavLink>
          <NavLink to="/research-lab" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🔬</span>
            <span>研究室</span>
            {notes.length > 0 && <span className="nav-badge">{notes.length}</span>}
          </NavLink>
          <NavLink to="/compare" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">⚖️</span>
            <span>对比分析</span>
            {compareList.length > 0 && <span className="nav-badge">{compareList.length}</span>}
          </NavLink>
          <NavLink to="/compare-report" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📋</span>
            <span>对比报告</span>
            {reportList.length > 0 && <span className="nav-badge">{reportList.length}</span>}
          </NavLink>
          <NavLink to="/restoration-archive" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🏛️</span>
            <span>修复档案馆</span>
          </NavLink>
          <NavLink to="/editor" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">✏️</span>
            <span>图鉴编辑台</span>
          </NavLink>
        </div>

        <div className="navbar-theme">
          <span className="theme-label">主题</span>
          <div className="theme-switcher">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`theme-btn ${theme === opt.value ? 'active' : ''}`}
                title={opt.label}
              >
                {opt.icon}
              </button>
            ))}
          </div>
          <button
            className={`auto-theme-toggle ${autoTheme ? 'enabled' : ''} ${activeSignboardId ? 'active' : ''}`}
            onClick={() => setAutoTheme(!autoTheme)}
            title={autoTheme ? '关闭随内容切换' : '开启随内容切换'}
          >
            <span className="auto-theme-icon">🎨</span>
            <span className="auto-theme-text">{autoTheme ? '随内容' : '固定'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
