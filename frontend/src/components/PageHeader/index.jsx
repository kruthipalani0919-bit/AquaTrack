import React from 'react';

/**
 * Reusable Page Header component.
 */
export const PageHeader = ({
  title,
  subtitle,
  children,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div className={`mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border/60 ${className}`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {subtitle && (
          <p className="text-sm text-text-secondary">
            {subtitle}
          </p>
        )}

        {children}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
