import './CommonStyles.css';

export interface ViewOption<T extends string = string> {
  key: T;
  label: string;
  icon?: string;
}

interface ViewToggleProps<T extends string = string> {
  views: ViewOption<T>[];
  activeView: T;
  onViewChange: (view: T) => void;
}

function ViewToggle<T extends string = string>({
  views,
  activeView,
  onViewChange
}: ViewToggleProps<T>) {
  return (
    <div className="common-view-toggle">
      {views.map(view => (
        <button
          key={view.key}
          className={`common-view-btn ${activeView === view.key ? 'active' : ''}`}
          onClick={() => onViewChange(view.key)}
        >
          {view.icon && <span style={{ marginRight: '0.3rem' }}>{view.icon}</span>}
          {view.label}
        </button>
      ))}
    </div>
  );
}

export default ViewToggle;
