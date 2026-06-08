import React, { useState } from 'react';
import type { RestorationEvent, Signboard } from '../types';
import { eraStages, hasEventInEraStage, getEraStageByYear } from '../types';
import './RestorationTimeline.css';

interface RestorationTimelineProps {
  history: RestorationEvent[];
  compact?: boolean;
  showEraStages?: boolean;
  signboards?: Signboard[];
  onSelectEraStage?: (stageId: string) => void;
  selectedEraStage?: string;
}

const eventTypeLabels: Record<RestorationEvent['type'], { label: string; icon: string; className: string }> = {
  creation: { label: '创立', icon: '✨', className: 'event-creation' },
  renovation: { label: '翻新', icon: '🔧', className: 'event-renovation' },
  restoration: { label: '修缮', icon: '🏛️', className: 'event-restoration' },
  repaint: { label: '重漆', icon: '🎨', className: 'event-repaint' },
  relocation: { label: '迁址', icon: '📍', className: 'event-relocation' },
  damaged: { label: '受损', icon: '⚠️', className: 'event-damaged' },
  weathered: { label: '风化', icon: '🍂', className: 'event-weathered' }
};

const conditionLabels: Record<string, { text: string; className: string }> = {
  'well-preserved': { text: '保存完好', className: 'cond-good' },
  'weathered': { text: '自然风化', className: 'cond-weathered' },
  'damaged': { text: '有所损坏', className: 'cond-damaged' },
  'restored': { text: '经过修复', className: 'cond-restored' }
};

const RestorationTimeline: React.FC<RestorationTimelineProps> = ({
  history,
  compact = false,
  showEraStages = false,
  signboards,
  onSelectEraStage,
  selectedEraStage
}) => {
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);

  const sortedHistory = [...history].sort((a, b) => a.year - b.year);

  if (showEraStages && signboards) {
    return (
      <div className="era-stage-timeline">
        <div className="era-stage-track">
          {eraStages.map(stage => {
            const stageSignboards = signboards.filter(s => hasEventInEraStage(s, stage.id));
            const isSelected = selectedEraStage === stage.id;

            return (
              <button
                key={stage.id}
                className={`era-stage-node ${isSelected ? 'selected' : ''}`}
                style={{ '--stage-color': stage.color } as React.CSSProperties}
                onClick={() => onSelectEraStage?.(isSelected ? '' : stage.id)}
                onMouseEnter={() => setHoveredEvent(eraStages.indexOf(stage))}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                <div className="stage-dot" />
                <div className="stage-content">
                  <div className="stage-years">{stage.startYear}-{stage.endYear}</div>
                  <div className="stage-label">{stage.label}</div>
                  {stageSignboards.length > 0 && (
                    <div className="stage-count">{stageSignboards.length} 块招牌</div>
                  )}
                </div>
                {hoveredEvent === eraStages.indexOf(stage) && (
                  <div className="stage-tooltip">
                    <div className="tooltip-title">{stage.label}</div>
                    <div className="tooltip-years">{stage.startYear} - {stage.endYear} 年</div>
                    <div className="tooltip-desc">{stage.description}</div>
                    {stageSignboards.length > 0 && (
                      <div className="tooltip-signboards">
                        代表：{stageSignboards.slice(0, 3).map(s => s.name).join('、')}
                        {stageSignboards.length > 3 && ` 等${stageSignboards.length}块`}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="era-stage-line" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="timeline-compact">
        {sortedHistory.map((event, idx) => {
          const typeInfo = eventTypeLabels[event.type];
          return (
            <div key={idx} className={`timeline-compact-item ${typeInfo.className}`}>
              <span className="compact-year">{event.year}</span>
              <span className="compact-icon">{typeInfo.icon}</span>
              <span className="compact-title">{event.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h3 className="timeline-title">🕰️ 修缮时间轴</h3>
        <div className="timeline-subtitle">
          共 {sortedHistory.length} 次重要记录，跨越 {sortedHistory.length > 1 ? (sortedHistory[sortedHistory.length - 1].year - sortedHistory[0].year) : 0} 年
        </div>
      </div>

      <div className="timeline-track">
        {sortedHistory.map((event, idx) => {
          const typeInfo = eventTypeLabels[event.type];
          const eraStage = getEraStageByYear(event.year);
          const isLast = idx === sortedHistory.length - 1;

          return (
            <div key={idx} className="timeline-item">
              <div className="timeline-left">
                <div
                  className={`timeline-dot ${typeInfo.className}`}
                  onMouseEnter={() => setHoveredEvent(idx)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  <span className="dot-icon">{typeInfo.icon}</span>
                </div>
                {!isLast && <div className="timeline-connector" />}
              </div>

              <div className={`timeline-card ${typeInfo.className} ${hoveredEvent === idx ? 'hovered' : ''}`}>
                <div className="card-header">
                  <div className="card-year-badge" style={eraStage ? { borderColor: eraStage.color } : undefined}>
                    <span className="year">{event.year}年</span>
                    <span className="era-tag">{event.era}</span>
                  </div>
                  <span className={`card-type-badge ${typeInfo.className}`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                </div>

                <h4 className="card-event-title">{event.title}</h4>
                <p className="card-desc">{event.description}</p>

                {event.changes && (
                  <div className="card-changes">
                    {event.changes.colors && (
                      <div className="change-row">
                        <span className="change-label">🎨 配色变化</span>
                        <div className="colors-change">
                          {event.changes.colors.map((c, i) => (
                            <div
                              key={i}
                              className="change-color"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {event.changes.fontStyle && (
                      <div className="change-row">
                        <span className="change-label">✍️ 字体风格</span>
                        <span className="change-value">{event.changes.fontStyle}</span>
                      </div>
                    )}
                    {event.changes.material && (
                      <div className="change-row">
                        <span className="change-label">🪵 材质</span>
                        <span className="change-value">{event.changes.material}</span>
                      </div>
                    )}
                    {event.changes.condition && (
                      <div className="change-row">
                        <span className="change-label">📋 状态</span>
                        <span className={`cond-badge ${conditionLabels[event.changes.condition]?.className}`}>
                          {conditionLabels[event.changes.condition]?.text}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {eraStage && (
                  <div className="card-era-stage" style={{ color: eraStage.color }}>
                    ◆ {eraStage.label}（{eraStage.startYear}-{eraStage.endYear}）
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="timeline-legend">
        <span className="legend-title">图例：</span>
        {Object.entries(eventTypeLabels).map(([key, info]) => (
          <span key={key} className={`legend-item ${info.className}`}>
            {info.icon} {info.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RestorationTimeline;
