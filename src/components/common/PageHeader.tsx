import React from 'react';
import './CommonStyles.css';

export interface StatChip {
  icon: string;
  value: string | number;
  label: React.ReactNode;
  highlight?: boolean;
}

export interface ShortcutButton {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'outline';
  disabled?: boolean;
}

export interface ShortcutSelectOption {
  value: string;
  label: string;
}

export interface ShortcutSelect {
  placeholder: string;
  options: ShortcutSelectOption[];
  onChange: (value: string) => void;
}

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  stats?: StatChip[];
  shortcuts?: ShortcutButton[];
  shortcutSelect?: ShortcutSelect;
  rightActions?: React.ReactNode;
  maxWidth?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  stats = [],
  shortcuts = [],
  shortcutSelect,
  rightActions,
  maxWidth = '1600px'
}) => {
  const getShortcutClass = (variant?: string) => {
    const base = 'common-shortcut-btn';
    switch (variant) {
      case 'primary': return `${base} primary`;
      case 'danger': return `${base} danger`;
      case 'outline': return `${base} outline`;
      default: return base;
    }
  };

  return (
    <div className="common-page-header" style={{ maxWidth }}>
      <div className="common-header-inner">
        <div className="common-title-wrap">
          <div className="common-icon-badge">{icon}</div>
          <div>
            <h1 className="common-page-title">{title}</h1>
            <p className="common-page-subtitle">{subtitle}</p>
          </div>
        </div>
        {rightActions && (
          <div className="common-header-actions">
            {rightActions}
          </div>
        )}
      </div>

      {stats.length > 0 && (
        <div className="common-stats-bar">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`common-stat-chip ${stat.highlight ? 'highlight' : ''}`}
            >
              <span className="common-stat-icon">{stat.icon}</span>
              <span className="common-stat-num">{stat.value}</span>
              <span className="common-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {(shortcuts.length > 0 || shortcutSelect) && (
        <div className="common-shortcuts">
          {shortcuts.map((shortcut, index) => (
            <button
              key={index}
              className={getShortcutClass(shortcut.variant)}
              onClick={shortcut.onClick}
              disabled={shortcut.disabled}
            >
              <span>{shortcut.icon}</span> {shortcut.label}
            </button>
          ))}
          {shortcutSelect && (
            <select
              className="common-shortcut-select"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  shortcutSelect.onChange(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">{shortcutSelect.placeholder}</option>
              {shortcutSelect.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
