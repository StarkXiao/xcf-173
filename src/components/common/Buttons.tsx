import React from 'react';
import './CommonStyles.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'link' | 'icon';
  size?: 'default' | 'small';
  danger?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'default',
  danger = false,
  className = '',
  children,
  ...props
}) => {
  const baseClass =
    variant === 'primary' ? 'common-btn-primary' :
    variant === 'link' ? 'common-btn-link' :
    variant === 'icon' ? 'common-btn-icon' :
    'common-btn-secondary';

  const sizeClass = size === 'small' ? ' small' : '';
  const dangerClass = danger ? ' danger' : '';

  return (
    <button
      className={`${baseClass}${sizeClass}${dangerClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface ResultBadgeProps {
  current: number;
  total: number;
  favCount?: number;
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({
  current,
  total,
  favCount
}) => {
  return (
    <span className="common-result-badge">
      命中 <strong>{current}</strong> / {total}
      {favCount !== undefined && favCount > 0 && (
        <span className="common-inline-fav">❤️ {favCount}</span>
      )}
    </span>
  );
};

interface LinkButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ onClick, children }) => (
  <button className="common-link-btn" onClick={onClick}>
    {children}
  </button>
);

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  danger = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`common-btn-icon ${danger ? 'danger' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface ResetButtonProps {
  onClick: () => void;
  label?: string;
}

export const ResetButton: React.FC<ResetButtonProps> = ({
  onClick,
  label = '重置筛选'
}) => (
  <button className="common-reset-btn" onClick={onClick}>
    {label}
  </button>
);

export default Button;
