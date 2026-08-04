import React, { forwardRef } from 'react';

/**
 * Reusable Textarea component.
 */
export const Textarea = forwardRef(({
  label,
  error,
  helperText,
  rows = 4,
  fullWidth = true,
  className = '',
  id,
  placeholder = 'Enter description...',
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

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full bg-surface text-text-primary placeholder:text-text-secondary/60 text-sm rounded-lg border
          p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-background
          disabled:cursor-not-allowed disabled:opacity-60 resize-y min-h-[80px]
          ${error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary/40'
          }
          ${className}
        `}
        {...props}
      />

      {error ? (
        <p className="text-xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
