import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import type { ThemeMode } from '../types';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { favorites, compareList } = useFavorites();

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
          <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">❤️</span>
            <span>我的收藏</span>
            {favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}
          </NavLink>
          <NavLink to="/compare" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">⚖️</span>
            <span>对比分析</span>
            {compareList.length > 0 && <span className="nav-badge">{compareList.length}</span>}
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
