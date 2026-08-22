import React, { forwardRef } from 'react';

/**
 * Reusable Input Field component following AquaTrack design system.
 */
export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  id,
  type = 'text',
  placeholder = 'Enter value...',
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} flex flex-col gap-1.5`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-text-primary tracking-wide flex items-center gap-1 select-none"
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 text-text-secondary pointer-events-none shrink-0">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full bg-surface text-text-primary placeholder:text-text-secondary/60 text-sm rounded-lg border
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-background
            disabled:cursor-not-allowed disabled:opacity-60
            ${icon && iconPosition === 'left' ? 'pl-10' : 'pl-3.5'}
            ${icon && iconPosition === 'right' ? 'pr-10' : 'pr-3.5'}
            py-2.5
            ${error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary/40'
            }
            ${className}
          `}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 text-text-secondary pointer-events-none shrink-0">
            {icon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
