import './CommonStyles.css';

export interface TabConfig<T extends string = string> {
  key: T;
  label: string;
  icon: string;
  desc?: string;
}

interface TabNavigationProps<T extends string = string> {
  tabs: TabConfig<T>[];
  activeTab: T;
  onTabChange: (key: T) => void;
}

function TabNavigation<T extends string = string>({
  tabs,
  activeTab,
  onTabChange
}: TabNavigationProps<T>) {
  return (
    <div className="common-tabs-nav">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`common-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="common-tab-icon">{tab.icon}</span>
          <div className="common-tab-text">
            <span className="common-tab-label">{tab.label}</span>
            {tab.desc && <span className="common-tab-desc">{tab.desc}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;
