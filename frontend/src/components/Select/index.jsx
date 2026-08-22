import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable Dropdown Select component.
 */
export const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  fullWidth = true,
  placeholder = 'Select an option...',
  className = '',
  id,
  disabled = false,
  required = false,
  value,
  onChange,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} flex flex-col gap-1.5`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-text-primary tracking-wide flex items-center gap-1 select-none"
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full bg-surface text-text-primary text-sm rounded-lg border appearance-none
            pl-3.5 pr-10 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-background disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer
            ${error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary/40'
            }
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => {
            const optValue = typeof option === 'object' ? option.value : option;
            const optLabel = typeof option === 'object' ? option.label : option;
            return (
              <option key={index} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3 text-text-secondary pointer-events-none shrink-0">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
