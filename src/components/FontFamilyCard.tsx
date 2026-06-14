import React from 'react';
import { Link } from 'react-router-dom';
import type { FontFamily } from '../types';
import './FontFamilyCard.css';

interface FontFamilyCardProps {
  fontFamily: FontFamily;
  signboardCount: number;
}

const difficultyLabels: Record<string, { text: string; className: string }> = {
  basic: { text: '入门级', className: 'difficulty-basic' },
  intermediate: { text: '进阶级', className: 'difficulty-intermediate' },
  advanced: { text: '专家级', className: 'difficulty-advanced' }
};

const FontFamilyCard: React.FC<FontFamilyCardProps> = ({ fontFamily, signboardCount }) => {
  return (
    <Link to={`/font-evolution/${fontFamily.id}`} className="font-family-card">
      <div className="font-card-header" style={{ borderLeftColor: fontFamily.color }}>
        <div className="font-icon" style={{ color: fontFamily.color }}>
          {fontFamily.icon}
        </div>
        <div className="font-card-title">
          <h3 className="font-name">{fontFamily.name}</h3>
          <p className="font-english-name">{fontFamily.englishName}</p>
        </div>
      </div>

      <div className="font-card-body">
        <p className="font-description">{fontFamily.description}</p>

        <div className="font-features">
          {fontFamily.features.features.slice(0, 3).map((feature, idx) => (
            <span key={idx} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>

        <div className="font-stats">
          <div className="stat-item">
            <span className="stat-label">起源</span>
            <span className="stat-value">{fontFamily.originEra}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">招牌样本</span>
            <span className="stat-value">{signboardCount} 块</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">难度</span>
            <span className={`stat-value ${difficultyLabels[fontFamily.difficulty].className}`}>
              {difficultyLabels[fontFamily.difficulty].text}
            </span>
          </div>
        </div>

        <div className="font-metrics">
          <div className="metric-row">
            <span className="metric-label">易读性</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${fontFamily.readability}%`, backgroundColor: fontFamily.color }}
              />
            </div>
            <span className="metric-value">{fontFamily.readability}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">艺术性</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${fontFamily.artisticValue}%`, backgroundColor: fontFamily.color }}
              />
            </div>
            <span className="metric-value">{fontFamily.artisticValue}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">历史性</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${fontFamily.historicalSignificance}%`, backgroundColor: fontFamily.color }}
              />
            </div>
            <span className="metric-value">{fontFamily.historicalSignificance}</span>
          </div>
        </div>
      </div>

      <div className="font-card-footer">
        <span className="view-details">查看详情 →</span>
      </div>
    </Link>
  );
};

export default FontFamilyCard;
