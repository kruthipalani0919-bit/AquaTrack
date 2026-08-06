import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable Empty State component.
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data available',
  description = 'There are no records to display at the moment.',
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl bg-surface border border-dashed border-border/80 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-primary-light/60 text-primary flex items-center justify-center mb-4 shadow-sm">
        {React.isValidElement(Icon) ? Icon : <Icon className="w-7 h-7" />}
      </div>

      <h3 className="text-base md:text-lg font-semibold text-text-primary mb-1">
        {title}
      </h3>

      <p className="text-xs md:text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default EmptyState;
