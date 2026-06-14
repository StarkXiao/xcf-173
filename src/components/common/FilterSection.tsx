import React from 'react';
import './CommonStyles.css';

interface FilterSectionProps {
  title: string;
  icon?: string;
  special?: boolean;
  children: React.ReactNode;
  subtitle?: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  special = false,
  children,
  subtitle
}) => {
  return (
    <div className={`common-filter-section ${special ? 'special' : ''}`}>
      <h4 className="common-filter-title">
        {icon && <span style={{ marginRight: '0.3rem' }}>{icon}</span>}
        {title}
      </h4>
      {subtitle && (
        <div className="common-filter-subtitle">{subtitle}</div>
      )}
      {children}
    </div>
  );
};

export const FilterSubsection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="common-filter-subsection">
    <div className="common-filter-subtitle">{title}</div>
    {children}
  </div>
);

export default FilterSection;
