import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
  negative?: boolean;
  icon?: React.ReactNode;
  large?: boolean;
}

export function MetricCard({
  label,
  value,
  subValue,
  positive,
  negative,
  icon,
  large = false,
}: MetricCardProps) {
  const colorClass = positive ? 'metric-positive' : negative ? 'metric-negative' : '';
  return (
    <div className={`metric-card ${colorClass}`}>
      {icon && <div className="metric-icon">{icon}</div>}
      <div className="metric-content">
        <div className={`metric-value ${large ? 'metric-value-large' : ''}`}>
          {value}
        </div>
        <div className="metric-label">{label}</div>
        {subValue && <div className="metric-sub">{subValue}</div>}
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  placeholder,
}: NumberInputProps) {
  return (
    <div className="input-wrapper">
      {prefix && <span className="input-adornment input-adornment-left">{prefix}</span>}
      <input
        type="number"
        className={`form-input ${prefix ? 'input-has-left' : ''} ${suffix ? 'input-has-right' : ''}`}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
      {suffix && <span className="input-adornment input-adornment-right">{suffix}</span>}
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function Select({ value, onChange, options, className = '' }: SelectProps) {
  return (
    <select
      className={`form-select ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple';
}

export function Badge({ children, color = 'blue' }: BadgeProps) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="toggle-label">
      <div
        className={`toggle ${checked ? 'toggle-on' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') onChange(!checked);
        }}
      >
        <div className="toggle-thumb" />
      </div>
      {label && <span className="toggle-text">{label}</span>}
    </label>
  );
}
