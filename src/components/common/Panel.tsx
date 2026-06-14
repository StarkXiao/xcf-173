import React from 'react';
import './CommonStyles.css';

interface PanelProps {
  title?: string;
  icon?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Panel: React.FC<PanelProps> = ({
  title,
  icon,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`common-panel ${className}`}>
      {(title || actions) && (
        <div className="common-panel-toolbar">
          {title && (
            <h2 className="common-panel-title">
              {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
              {title}
            </h2>
          )}
          {actions && (
            <div className="common-panel-actions">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Panel;
