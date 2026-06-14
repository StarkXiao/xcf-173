import React from 'react';
import './CommonStyles.css';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'default' | 'small';
}

export const FormInput: React.FC<FormInputProps> = ({
  size = 'default',
  className = '',
  ...props
}) => {
  const sizeClass = size === 'small' ? ' small' : '';
  return (
    <input
      className={`common-form-input${sizeClass} ${className}`}
      {...props}
    />
  );
};

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  className = '',
  ...props
}) => {
  return (
    <textarea
      className={`common-form-textarea ${className}`}
      {...props}
    />
  );
};

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const FormSelect: React.FC<FormSelectProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <select
      className={`common-form-select ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

interface FormLabelProps {
  children: React.ReactNode;
  hint?: string;
  icon?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, hint, icon }) => {
  return (
    <label className="common-form-label">
      {icon && <span className="label-icon">{icon}</span>}
      {children}
      {hint && <span className="form-label-hint">{hint}</span>}
    </label>
  );
};

interface YearRangeInputProps {
  start: number | '';
  end: number | '';
  onStartChange: (value: number | '') => void;
  onEndChange: (value: number | '') => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

export const YearRangeInput: React.FC<YearRangeInputProps> = ({
  start,
  end,
  onStartChange,
  onEndChange,
  startPlaceholder = '起始年',
  endPlaceholder = '结束年'
}) => {
  return (
    <div className="common-year-range">
      <FormInput
        type="number"
        size="small"
        placeholder={startPlaceholder}
        value={start}
        onChange={e => onStartChange(e.target.value ? parseInt(e.target.value) : '')}
      />
      <span className="common-range-sep">—</span>
      <FormInput
        type="number"
        size="small"
        placeholder={endPlaceholder}
        value={end}
        onChange={e => onEndChange(e.target.value ? parseInt(e.target.value) : '')}
      />
    </div>
  );
};

interface ColorPickerProps {
  colors: { id: string; color: string; name: string }[];
  activeColors: string[];
  onToggle: (color: string) => void;
  limit?: number;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  activeColors,
  onToggle,
  limit = 18
}) => {
  return (
    <div className="common-color-picker-grid">
      {colors.slice(0, limit).map(cp => (
        <button
          key={cp.id}
          className={`common-color-picker-btn ${activeColors.includes(cp.color) ? 'active' : ''}`}
          onClick={() => onToggle(cp.color)}
          title={cp.name}
          style={{ backgroundColor: cp.color }}
        >
          {activeColors.includes(cp.color) && <span>✓</span>}
        </button>
      ))}
    </div>
  );
};

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ label, children }) => (
  <div className="common-filter-group">
    <label className="common-form-label">{label}</label>
    {children}
  </div>
);

interface FilterGridProps {
  children: React.ReactNode;
}

export const FilterGrid: React.FC<FilterGridProps> = ({ children }) => (
  <div className="common-filter-grid">{children}</div>
);

interface FilterFooterProps {
  children: React.ReactNode;
}

export const FilterFooter: React.FC<FilterFooterProps> = ({ children }) => (
  <div className="common-filter-footer">{children}</div>
);
