import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Signboard, EraStage } from '../types';
import { eraStages, getEraStageByYear } from '../types';
import SignboardCard from './SignboardCard';
import './EraExplorer.css';

interface EraExplorerProps {
  signboards: Signboard[];
  onEraStageSelect?: (stageId: string) => void;
  selectedEraStage?: string;
}

interface EraGroup {
  stage: EraStage;
  signboards: Signboard[];
}

const EraExplorer: React.FC<EraExplorerProps> = ({
  signboards,
  onEraStageSelect,
  selectedEraStage
}) => {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set(eraStages.map(s => s.id))
  );
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const navRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<string>('');
  const [isNavSticky, setIsNavSticky] = useState(false);

  const eraGroups = useMemo<EraGroup[]>(() => {
    const groups = new Map<string, Signboard[]>();
    
    signboards.forEach(signboard => {
      const stage = getEraStageByYear(signboard.year);
      if (stage) {
        if (!groups.has(stage.id)) {
          groups.set(stage.id, []);
        }
        groups.get(stage.id)!.push(signboard);
      }
    });

    return eraStages
      .map(stage => ({
        stage,
        signboards: groups.get(stage.id) || []
      }))
      .filter(group => group.signboards.length > 0);
  }, [signboards]);

  useEffect(() => {
    if (selectedEraStage && sectionRefs.current.has(selectedEraStage)) {
      const element = sectionRefs.current.get(selectedEraStage);
      if (element) {
        const navHeight = navRef.current?.offsetHeight || 0;
        const elementTop = element.offsetTop - navHeight - 20;
        window.scrollTo({ top: elementTop, behavior: 'smooth' });
      }
    }
  }, [selectedEraStage]);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const navTop = navRef.current.getBoundingClientRect().top;
        setIsNavSticky(navTop <= 0);
      }

      let currentStage = '';
      const navHeight = navRef.current?.offsetHeight || 0;
      
      for (const [stageId, element] of sectionRefs.current.entries()) {
        const rect = element.getBoundingClientRect();
        if (rect.top - navHeight - 100 <= 0) {
          currentStage = stageId;
        }
      }
      
      if (currentStage !== activeStage) {
        setActiveStage(currentStage);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeStage]);

  const toggleStage = (stageId: string) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedStages(new Set(eraGroups.map(g => g.stage.id)));
  };

  const collapseAll = () => {
    setExpandedStages(new Set());
  };

  const scrollToStage = (stageId: string) => {
    onEraStageSelect?.(stageId);
  };

  const getTotalSignboards = () => {
    return eraGroups.reduce((sum, g) => sum + g.signboards.length, 0);
  };

  return (
    <div className="era-explorer">
      <div className="era-explorer-header">
        <div className="era-explorer-title-wrap">
          <h3 className="era-explorer-title">📜 年代展开浏览</h3>
          <p className="era-explorer-subtitle">
            按历史时期分段呈现，共 {eraGroups.length} 个时期，{getTotalSignboards()} 块招牌
          </p>
        </div>
        <div className="era-explorer-controls">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              title="时间轴视图"
            >
              📅 时间轴
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="网格视图"
            >
              🔲 网格
            </button>
          </div>
          <div className="expand-collapse-btns">
            <button className="expand-btn" onClick={expandAll}>
              ➕ 全部展开
            </button>
            <button className="collapse-btn" onClick={collapseAll}>
              ➖ 全部折叠
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`era-nav-container ${isNavSticky ? 'sticky' : ''}`}
        ref={navRef}
      >
        <div className="era-nav-scroll">
          {eraGroups.map(group => (
            <button
              key={group.stage.id}
              className={`era-nav-item ${activeStage === group.stage.id ? 'active' : ''} ${selectedEraStage === group.stage.id ? 'selected' : ''}`}
              style={{ '--stage-color': group.stage.color } as React.CSSProperties}
              onClick={() => scrollToStage(group.stage.id)}
            >
              <span className="era-nav-dot" />
              <span className="era-nav-label">{group.stage.label}</span>
              <span className="era-nav-count">{group.signboards.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="era-sections">
        {eraGroups.map((group, groupIndex) => {
          const isExpanded = expandedStages.has(group.stage.id);
          const isSelected = selectedEraStage === group.stage.id;
          
          return (
            <div
              key={group.stage.id}
              className={`era-section ${isSelected ? 'highlighted' : ''}`}
              ref={el => {
                if (el) sectionRefs.current.set(group.stage.id, el);
              }}
              id={`era-section-${group.stage.id}`}
            >
              <div
                className={`era-section-header ${isExpanded ? 'expanded' : ''}`}
                style={{ '--stage-color': group.stage.color } as React.CSSProperties}
                onClick={() => toggleStage(group.stage.id)}
              >
                <div className="era-section-left">
                  <div className="era-section-indicator">
                    <div className="era-section-line" />
                    <div className="era-section-dot" />
                  </div>
                  <div className="era-section-info">
                    <div className="era-section-years">
                      {group.stage.startYear} - {group.stage.endYear}
                    </div>
                    <h4 className="era-section-title">{group.stage.label}</h4>
                    <p className="era-section-description">{group.stage.description}</p>
                  </div>
                </div>
                <div className="era-section-right">
                  <div className="era-section-stat">
                    <span className="stat-value">{group.signboards.length}</span>
                    <span className="stat-label">块招牌</span>
                  </div>
                  <button 
                    className="expand-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStage(group.stage.id);
                    }}
                  >
                    <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div 
                  className="era-section-content"
                  style={{ animationDelay: `${groupIndex * 0.05}s` }}
                >
                  {viewMode === 'timeline' ? (
                    <div className="era-timeline-view">
                      {group.signboards.map((signboard, idx) => (
                        <div 
                          key={signboard.id}
                          className="timeline-card-item"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className="timeline-card-connector">
                            <div className="connector-dot" />
                            <div className="connector-line" />
                          </div>
                          <div className="timeline-card-content">
                            <div className="timeline-card-year" style={{ borderColor: group.stage.color }}>
                              {signboard.year}
                            </div>
                            <SignboardCard signboard={signboard} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="era-grid-view masonry-grid">
                      {group.signboards.map((signboard, idx) => (
                        <div 
                          key={signboard.id}
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <SignboardCard signboard={signboard} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {eraGroups.length === 0 && (
        <div className="empty-era-explorer">
          <div className="empty-icon">📜</div>
          <p className="empty-text">当前筛选条件下没有找到招牌</p>
        </div>
      )}
    </div>
  );
};

export default EraExplorer;
