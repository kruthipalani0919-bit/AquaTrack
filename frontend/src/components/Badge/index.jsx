import React from 'react';

/**
 * Reusable Badge component.
 */
export const Badge = ({
  children,
  variant = 'primary', // primary, secondary, accent, success, warning, danger, neutral, outline
  size = 'md', // sm, md
  dot = false,
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    primary: 'bg-primary-light text-primary font-medium border border-primary/20',
    secondary: 'bg-secondary-light text-secondary-hover font-medium border border-secondary/20',
    accent: 'bg-accent-light text-accent-hover font-medium border border-accent/20',
    success: 'bg-success-light text-green-700 font-medium border border-success/20',
    warning: 'bg-warning-light text-amber-800 font-medium border border-warning/20',
    danger: 'bg-danger-light text-red-700 font-medium border border-danger/20',
    neutral: 'bg-gray-100 text-text-secondary font-medium border border-gray-200',
    outline: 'bg-transparent text-text-primary border border-border font-medium',
  };

  const dotColors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-gray-400',
    outline: 'bg-text-primary',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full tracking-wide select-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || 'bg-primary'}`} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
