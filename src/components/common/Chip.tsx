import React from 'react';
import './CommonStyles.css';

interface ChipProps {
  active?: boolean;
  special?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Chip: React.FC<ChipProps> = ({
  active = false,
  special = false,
  onClick,
  children,
  style
}) => {
  const className = `common-chip ${active ? 'active' : ''} ${special ? 'special' : ''}`;
  return (
    <button className={className} onClick={onClick} style={style}>
      {children}
    </button>
  );
};

export interface ChipGroupProps {
  children: React.ReactNode;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({ children }) => (
  <div className="common-chip-group">{children}</div>
);

export default Chip;
