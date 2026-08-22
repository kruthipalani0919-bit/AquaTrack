import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

/**
 * Reusable Password Input with visibility toggle.
 */
export const PasswordInput = forwardRef(({
  label = 'Password',
  error,
  helperText,
  fullWidth = true,
  placeholder = '••••••••',
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || 'password-input';

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
        <div className="absolute left-3 text-text-secondary pointer-events-none shrink-0">
          <Lock className="w-4 h-4" />
        </div>

        <input
          ref={ref}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={`
            w-full bg-surface text-text-primary placeholder:text-text-secondary/60 text-sm rounded-lg border
            pl-10 pr-10 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-background disabled:cursor-not-allowed disabled:opacity-60
            ${error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary/40'
            }
            ${className}
          `}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 text-text-secondary hover:text-text-primary focus:outline-none transition-colors p-1 rounded-md"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {error ? (
        <p className="text-xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
