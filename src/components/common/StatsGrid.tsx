import React from 'react';
import './CommonStyles.css';

export interface StatCard {
  icon: string;
  value: string | number;
  label: string;
}

interface StatsGridProps {
  title?: string;
  stats: StatCard[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ title, stats }) => {
  return (
    <div className="font-stats-section">
      {title && <h2 className="common-section-title">{title}</h2>}
      <div className="common-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="common-stat-card">
            <div className="common-stat-card-icon">{stat.icon}</div>
            <div className="common-stat-card-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsGrid;
